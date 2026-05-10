import subprocess
import re

def generate_recipe(food, nutrition, user_goal="healthy eating"):
    # Concise, instruction-heavy prompt
    prompt = f"""
    Act as a nutritionist-chef.
    Food: {food} ({nutrition})
    Goal: {user_goal}

    IMPORTANT: You MUST include the headers "PART 1: NUTRITION ADVICE" and "PART 2: HEALTHY RECIPE" exactly as shown.

    PART 1: NUTRITION ADVICE
    - **Healthy Twist**: [1 sentence]
    - **Quick Fixes**: [2-3 bullet points]
    
    PART 2: HEALTHY RECIPE
    - **Title**: [Recipe Name]
    - **Ingredients**: [Brief list]
    - **Steps**: [2-3 quick steps]
    
    Strictly max 150 words total. No intro/outro.
    """

    try:
        result = subprocess.run([
            "ollama", "run", "llama3.2",
            prompt
        ], capture_output=True, text=True, encoding="utf-8", timeout=60)
        
        if not result.stdout.strip():
            return "AI was unable to generate a response. Please try scanning again."

        # Strip ANSI escape codes
        clean_text = re.sub(r'\x1b\[[0-9;?]*[a-zA-Z]', '', result.stdout)
        return clean_text.strip()
    except subprocess.TimeoutExpired:
        return "PART 1: NUTRITION ADVICE\nAI response took too long. Your computer might be busy—please try again in a moment."
    except Exception as e:
        print(f"❌ LLM Error: {e}")
        return f"PART 1: NUTRITION ADVICE\nNutritionist offline: {e}"