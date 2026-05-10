# nutrivision_cli.py
from vision import get_nutrivision
from nutrition import get_nutrition, calculate_health_score
from llm import generate_recipe
import json

def main():
    # Set your parameters directly here
    image_path = "images/steak.jpg" 
    user_goal = "balanced"

    print("🔄 Loading NutriVision...")
    nv = get_nutrivision()

    print("🔍 Analyzing image...")
    predictions = nv.predict(image_path, top_k=3)

    top_food = predictions[0]["food"]
    confidence = predictions[0]["confidence"]

    print(f"\n🍽️  Top Prediction: {top_food} ({confidence:.1%} confidence)")

    nutrition = get_nutrition(top_food)
    health_score = calculate_health_score(nutrition, user_goal)

    print(f"\n📊 Nutrition Info:")
    print(json.dumps(nutrition, indent=2))
    print(f"\n❤️  Health Score: {health_score}")

    print("\n🤖 Generating personalized advice...")
    advice = generate_recipe(top_food, nutrition, user_goal)
    print("\n" + advice)

if __name__ == "__main__":
    main()