# nutrition.py
import requests
import os
from dotenv import load_dotenv
from typing import Dict

load_dotenv()
USDA_API_KEY = os.getenv("USDA_API_KEY")

class NutritionEngine:
    def __init__(self):
        self.base_url = "https://api.nal.usda.gov/fdc/v1"
        self.api_key = USDA_API_KEY
        self.session = requests.Session()

    def search_food(self, food_name: str, page_size: int = 5) -> list:
        if not self.api_key:
            print("⚠️ USDA_API_KEY not found in .env file.")
            return []

        url = f"{self.base_url}/foods/search"
        params = {
            "api_key": self.api_key,
            "query": food_name,
            "pageSize": page_size,
            "dataType": ["Foundation", "SR Legacy", "Branded"],
        }

        try:
            response = self.session.get(url, params=params, timeout=12)
            response.raise_for_status()
            return response.json().get("foods", [])
        except Exception as e:
            print(f"USDA API Error: {e}")
            return []

    def get_nutrition(self, food_name: str) -> Dict:
        """Get nutrition info for a predicted food"""
        foods = self.search_food(food_name)
        
        if not foods:
            print(f"⚠️ No results from USDA for '{food_name}'. Using fallback.")
            return self._fallback_nutrition(food_name)

        # Take the first (best) result
        best_food = foods[0]
        nutrients = {}

        for nutrient in best_food.get("foodNutrients", []):
            name = nutrient.get("nutrientName", "").lower()
            value = nutrient.get("value", 0)

            if "energy" in name:                                   # ← Fixed
                nutrients["calories"] = round(value)
            elif "protein" in name:
                nutrients["protein"] = round(value, 1)
            elif any(x in name for x in ["total lipid", "fat"]):
                nutrients["fat"] = round(value, 1)
            elif "carbohydrate" in name:
                nutrients["carbs"] = round(value, 1)
            elif any(x in name for x in ["sugar", "sugars"]):
                nutrients["sugar"] = round(value, 1)

        # Ensure calories are always present
        if "calories" not in nutrients and nutrients:
            # Sometimes energy is under different key
            for n in best_food.get("foodNutrients", []):
                if n.get("nutrientName", "").lower() == "energy":
                    nutrients["calories"] = round(n.get("value", 0))
                    break

        return nutrients if nutrients else self._fallback_nutrition(food_name)

    def _fallback_nutrition(self, food_name: str) -> Dict:
        fallback = {
            "calories": 280, "protein": 10, "fat": 12, 
            "carbs": 35, "sugar": 6
        }
        return fallback


# Global instance
nutrition_engine = NutritionEngine()

def get_nutrition(food_name: str):
    return nutrition_engine.get_nutrition(food_name)


def calculate_health_score(
    nutrition: Dict,
    goal: str = "balanced"
) -> Dict:

    if not nutrition:
        return {
            "score": 5,
            "rating": "Unknown",
            "reasons": ["Insufficient nutrition data"]
        }

    calories = nutrition.get("calories", 0)
    protein = nutrition.get("protein", 0)
    fat = nutrition.get("fat", 0)
    carbs = nutrition.get("carbs", 0)
    sugar = nutrition.get("sugar", 0)

    reasons = []

    score = 50

    # -------------------------
    # Protein Density
    # -------------------------

    protein_ratio = protein * 4 / max(calories, 1)

    if protein_ratio >= 0.30:
        score += 20
        reasons.append("High protein density")

    elif protein_ratio >= 0.20:
        score += 10
        reasons.append("Moderate protein content")

    else:
        score -= 10
        reasons.append("Low protein content")

    # -------------------------
    # Sugar Penalty
    # -------------------------

    if sugar > 25:
        score -= 20
        reasons.append("High sugar content")

    elif sugar > 12:
        score -= 10
        reasons.append("Moderate sugar content")

    # -------------------------
    # Fat Quality Estimate
    # -------------------------

    fat_ratio = fat * 9 / max(calories, 1)

    if fat_ratio > 0.50:
        score -= 10
        reasons.append("Very high fat ratio")

    elif fat_ratio < 0.15:
        score -= 5
        reasons.append("Very low healthy fats")

    # -------------------------
    # Calorie Density
    # -------------------------

    if calories > 900:
        score -= 15
        reasons.append("Extremely calorie dense")

    elif calories > 700:
        score -= 8
        reasons.append("High calorie meal")

    elif calories < 120:
        score -= 5
        reasons.append("Very low calorie meal")

    # -------------------------
    # Goal-based Adjustments
    # -------------------------

    if goal == "weight_loss":

        if calories < 500:
            score += 10
            reasons.append("Supports weight loss")

        if sugar > 20:
            score -= 10

    elif goal == "muscle_gain":

        if protein >= 25:
            score += 15
            reasons.append("Excellent for muscle gain")

        if calories < 400:
            score -= 10

    elif goal == "balanced":

        if 400 <= calories <= 700:
            score += 10
            reasons.append("Balanced calorie range")

    # -------------------------
    # Clamp Score
    # -------------------------

    score = max(1, min(100, score))

    # -------------------------
    # Rating
    # -------------------------

    if score >= 85:
        rating = "Excellent"

    elif score >= 70:
        rating = "Good"

    elif score >= 50:
        rating = "Moderate"

    elif score >= 30:
        rating = "Poor"

    else:
        rating = "Unhealthy"

    return {
        "score": score,
        "rating": rating,
        "reasons": reasons
    }