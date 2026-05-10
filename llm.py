import subprocess

def generate_recipe(food, nutrition, user_goal="healthy eating"):
    # Concise, instruction-heavy prompt
    prompt = f"""
    Act as a nutritionist-chef.
    Food: {food} ({nutrition})
    Goal: {user_goal}

    Output format:
    - **Healthy Twist**: [1 sentence]
    - **Quick Fixes**: [2-3 bullet points]
    - **Swap**: [Alternative meal]
    
    Strictly max 100 words. No intro/outro.
    """

    try:
        result = subprocess.run([
            "ollama", "run", "llama3.2",
            prompt
        ], capture_output=True, text=True, timeout=30)
        return result.stdout.strip()
    except Exception as e:
        return f"LLM unavailable: {e}"