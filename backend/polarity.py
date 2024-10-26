from transformers import AutoModelForSequenceClassification
from transformers import AutoTokenizer, AutoConfig
import numpy as np
from scipy.special import softmax
import requests

def get_polarity(input_text: str) -> str:
    def preprocess(text: str) -> str:
        new_text = []
        for t in text.split(" "):
            t = '@user' if t.startswith('@') and len(t) > 1 else t
            t = 'http' if t.startswith('http') else t
            new_text.append(t)
        return " ".join(new_text)
    MODEL = f"cardiffnlp/twitter-roberta-base-sentiment-latest"
    tokenizer = AutoTokenizer.from_pretrained(MODEL)
    config = AutoConfig.from_pretrained(MODEL)

    model = AutoModelForSequenceClassification.from_pretrained(MODEL)

    preprocessed_text = preprocess(input_text)
    encoded_input = tokenizer(preprocessed_text, return_tensors='pt')
    output = model(**encoded_input)
    scores = output[0][0].detach().numpy()
    scores = softmax(scores)
    ranking = np.argsort(scores)
    ranking = ranking[::-1]
    return config.id2label[ranking[0]]


def get_polarity_inference_API(input_text: str) -> str:
    API_URL = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest"
    headers = {"Authorization": "Bearer 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"}
    payload = {"inputs": input_text}

    def query(json_payload):
        response = requests.post(API_URL, headers=headers, json=json_payload)
        return response.json()

    output = query(json_payload=payload)

    return output[0]['label']


if __name__ == "__main__":
    text = "I am depressed."
    print(get_polarity(text))
    print(get_polarity_inference_API(text))