import random

def process_data(input_text: str):
    polarity = random.choice(["positive", "neutral", "negative"])
    features = f"Features of {input_text}"
    concerns = f"Concerns about {input_text}"
    score = round(random.uniform(0, 10), 2)
    change_in_state = round(random.uniform(-5, 5), 2)
    
    return {
        "polarity": polarity,
        "features": features,
        "concerns": concerns,
        "score": score,
        "changeInState": change_in_state
    }
