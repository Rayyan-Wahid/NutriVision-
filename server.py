# server.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from vision import get_nutrivision
from nutrition import get_nutrition, calculate_health_score
from llm import generate_recipe
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import werkzeug
import sqlite3

app = Flask(__name__)
CORS(app)

# Security Config
app.config["JWT_SECRET_KEY"] = "super-secret-key-change-this-in-production" 
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=30)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

DB_PATH = 'nutrivision.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    # Create users table
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )''')
    # Create meals table with user_id
    c.execute('''CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        food_name TEXT,
        calories REAL,
        protein REAL,
        carbs REAL,
        fat REAL,
        advice TEXT,
        date TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )''')
    # Create profile table with user_id
    c.execute('''CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT,
        goal TEXT,
        daily_goal INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )''')
    conn.commit()
    conn.close()

def save_meal(user_id, data):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''INSERT INTO meals (user_id, food_name, calories, protein, carbs, fat, advice, date)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)''', (
        user_id,
        data['prediction']['food'],
        data['nutrition'].get('calories', 0),
        data['nutrition'].get('protein', 0),
        data['nutrition'].get('carbs', 0),
        data['nutrition'].get('fat', 0),
        data['advice'],
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))
    conn.commit()
    conn.close()

# --- Auth Routes ---

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users (email, password) VALUES (?, ?)", (email, password))
        user_id = c.lastrowid
        # Create initial profile for user
        c.execute("INSERT INTO profile (user_id, name, goal, daily_goal) VALUES (?, ?, ?, ?)",
                  (user_id, email.split('@')[0], 'balanced', 2000))
        conn.commit()
        return jsonify({"success": True, "message": "User created"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already exists"}), 400
    finally:
        conn.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = c.fetchone()
    conn.close()
    
    if user and bcrypt.check_password_hash(user[2], password):
        access_token = create_access_token(identity=str(user[0]))
        return jsonify(access_token=access_token)
    
    return jsonify({"error": "Invalid credentials"}), 401

# --- Protected Data Routes ---

# Initialize the model once when the server starts
print("🚀 Initializing AI Models...")
nv = None

def load_model():
    global nv
    if nv is None:
        nv = get_nutrivision()

UPLOAD_FOLDER = 'temp_uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/api/analyze', methods=['POST'])
@jwt_required()
def analyze_meal():
    user_id = get_jwt_identity()
    
    # Get user goal from profile
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT goal FROM profile WHERE user_id = ?", (user_id,))
    row = c.fetchone()
    user_goal = row[0] if row else 'balanced'
    conn.close()
    
    load_model()
    
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    goal = request.form.get('goal', user_goal)
    
    # Save image temporarily
    filename = werkzeug.utils.secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    
    try:
        # 1. Vision Prediction
        predictions = nv.predict(filepath, top_k=1)
        top_food = predictions[0]["food"]
        confidence = predictions[0]["confidence"]
        
        # 2. Nutrition Lookup
        nutrition = get_nutrition(top_food)
        health_score = calculate_health_score(nutrition, goal)
        
        # 3. LLM Advice
        advice = generate_recipe(top_food, nutrition, goal)
        
        # Clean up
        if os.path.exists(filepath):
            os.remove(filepath)
        
        data = {
            "success": True,
            "prediction": {
                "food": top_food,
                "confidence": round(confidence * 100, 1)
            },
            "nutrition": nutrition,
            "health_score": health_score,
            "advice": advice
        }
        
        return jsonify(data)
        
    except Exception as e:
        print(f"Error: {e}")
        if os.path.exists(filepath): 
            os.remove(filepath)
        return jsonify({"error": str(e)}), 500

@app.route('/api/meals', methods=['POST'])
@jwt_required()
def log_meal():
    user_id = get_jwt_identity()
    data = request.json
    save_meal(user_id, data)
    return jsonify({"success": True, "message": "Meal logged"})

@app.route('/api/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM meals WHERE user_id = ? ORDER BY date DESC", (user_id,))
    rows = c.fetchall()
    history = [dict(r) for r in rows]
    conn.close()
    return jsonify(history)

@app.route('/api/profile', methods=['GET', 'POST'])
@jwt_required()
def handle_profile():
    user_id = get_jwt_identity()
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    if request.method == 'POST':
        data = request.json
        c.execute("UPDATE profile SET goal = ?, daily_goal = ? WHERE user_id = ?", 
                  (data.get('goal'), data.get('daily_goal'), user_id))
        conn.commit()
        conn.close()
        return jsonify({"success": True})
    
    c.execute("SELECT * FROM profile WHERE user_id = ?", (user_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Profile not found"}), 404
        
    profile = dict(sqlite3.Row(c, row))
    conn.close()
    return jsonify(profile)

if __name__ == '__main__':
    # Initialize DB
    init_db()
    # Pre-load model so first request is fast
    load_model()
    app.run(host='127.0.0.1', port=5000, debug=True)
