from transformers import AutoModelForSequenceClassification, BitsAndBytesConfig
from transformers import AutoTokenizer, AutoConfig
import numpy as np
from scipy.special import softmax
import requests
import torch
import bitsandbytes as bnb
import socket

_MODEL_NAME = "cardiffnlp/twitter-roberta-base-sentiment-latest"
_tokenizer = None
_model = None
_config = None


def _load_model():
    global _tokenizer, _model, _config

    quantization_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_use_double_quant=True,
    )

    if _tokenizer is None:
        _tokenizer = AutoTokenizer.from_pretrained(_MODEL_NAME)
        _model = AutoModelForSequenceClassification.from_pretrained(
            _MODEL_NAME,
            quantization_config=quantization_config,
            device_map="auto"
        )
        _config = AutoConfig.from_pretrained(_MODEL_NAME)
        _model.eval()


def get_polarity(input_text: str) -> str:
    if _tokenizer is None:
        _load_model()

    if '@' in input_text or 'http' in input_text:
        text = ' '.join('@user' if word.startswith('@') else
                        'http' if word.startswith('http') else word
                        for word in input_text.split())
    else:
        text = input_text

    inputs = _tokenizer(text, return_tensors='pt', truncation=True, max_length=128)
    inputs = {k: v.to(_model.device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = _model(**inputs)
        scores = outputs.logits[0].cpu().numpy()

    label_id = np.argmax(softmax(scores))
    return _config.id2label[label_id]


def get_polarity_inference_API(input_text: str) -> str:
    API_URL = "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest"
    headers = {"Authorization": "Bearer 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"}
    payload = {"inputs": input_text}

    def query(json_payload):
        response = requests.post(API_URL, headers=headers, json=json_payload)
        return response.json()

    output = query(json_payload=payload)

    return output[0][0]['label']


def get_polarity_handler(input_text: str) -> str:
    local = False

    def is_connected():
        try:
            socket.create_connection(("1.1.1.1", 53))
            print("Connected to Internet")
        except OSError:
            local = True
            print("Not Connected to Internet")

    is_connected()

    if local:
        get_polarity_usage = get_polarity
    else:
        get_polarity_usage = get_polarity_inference_API
    return get_polarity_usage(input_text)


if __name__ == "__main__":
    text = "I am depressed."
    # print(get_polarity(text))
    print(get_polarity_inference_API(text))
