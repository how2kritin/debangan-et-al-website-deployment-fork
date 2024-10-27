from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import torch
from typing import List
import socket

def extract_concerns(input_text: str) -> list[str]:
    bnb_config = {
        "load_in_4bit": True,
        "bnb_4bit_quant_type": "nf4",
        "bnb_4bit_compute_dtype": torch.float16,
        "bnb_4bit_use_double_quant": True,
    }

    model = AutoModelForCausalLM.from_pretrained(
        "microsoft/Phi-3.5-mini-instruct",
        device_map="auto",
        quantization_config=bnb_config,
        trust_remote_code=True,
    )

    tokenizer = AutoTokenizer.from_pretrained(
        "microsoft/Phi-3.5-mini-instruct",
        padding_side="left",
        pad_token="</s>"
    )

    if tokenizer.pad_token_id is None:
        tokenizer.pad_token_id = tokenizer.eos_token_id

    messages = [
        {"role": "system", "content": """
        Extract the mental health phrases present in the following sentences, and the cause of that mental health (if it is present). Here's a few examples.
    Input: 'I can't sleep well and I feel very low.'
    Output: 'can't sleep well', 'feel very low'
    Input: 'Lately, I've been happy and excited.'
    Output: 'happy and excited'
    Input: 'I am worried that Anil will be the cause of my team's disqualification.'
    Output: 'worried'
    Input: 'These past few days, I've been feeling confused about job prospects.'
    Output: "confused about job prospects"

    DO NOT give explanations/causes as to why you are outputting those phrases; simply output the phrases in the same exact format as the above examples.
        """},
        {"role": "user", "content": input_text},
    ]

    pipe = pipeline(
        "text-generation",
        model=model,
        tokenizer=tokenizer,
        torch_dtype=torch.float16,
        device_map="auto",
    )

    generation_args = {
        "max_new_tokens": 500,
        "return_full_text": False,
        "temperature": 0.5,
        "do_sample": False,
        "pad_token_id": tokenizer.pad_token_id,
        "num_beams": 1,
        "use_cache": True,
    }

    with torch.inference_mode():
        output = pipe(messages, **generation_args)

    def _clean_output(text: str) -> str:
        text = text.strip()
        text = text.strip("'\"")
        text = text.strip()
        return text

    raw_outputs = output[0]['generated_text'].strip().split('\n')
    cleaned_outputs = []

    for line in raw_outputs:
        line = _clean_output(line)
        if line:
            cleaned_outputs.append(line)

    return cleaned_outputs


def extract_concerns_inference_API(input_text: str) -> list[str]:
    from huggingface_hub import InferenceClient

    client = InferenceClient(api_key="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")
    base_prompt = """
            Extract the mental health phrases present in the following sentences, and the cause of that mental health (if it is present). Here's a few examples.
        Input: 'I can't sleep well and I feel very low.'
        Output: 'can't sleep well', 'feel very low'
        Input: 'Lately, I've been happy and excited.'
        Output: 'happy and excited'
        Input: 'I am worried that Anil will be the cause of my team's disqualification.'
        Output: 'worried'
        Input: 'These past few days, I’ve been feeling confused about job prospects.'
        Output: "confused about job prospects"

        DO NOT give explanations/causes as to why you are outputting those phrases; simply output the phrases in the same exact format as the above examples.
            """
    final_prompt = base_prompt+"\nInput: "+input_text
    messages = [
        {"role": "user", "content": final_prompt},
    ]

    stitched_response = ""
    stream = client.chat.completions.create(
        model="microsoft/Phi-3.5-mini-instruct",
        messages=messages,
        max_tokens=500,
        temperature=1.0,
        top_p=0.8,
        stream=True
    )
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            stitched_response += chunk.choices[0].delta.content
    phrases = [phrase.strip().strip("'\"") for phrase in stitched_response.split('\n')]
    phrases = list(dict.fromkeys(phrase for phrase in phrases if phrase))

    return phrases

def extract_concerns_handler(input_text: str) -> list[str]:
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
        extract_concerns_usage = extract_concerns
    else:
        extract_concerns_usage = extract_concerns_inference_API
    return extract_concerns_usage(input_text)

if __name__ == "__main__":
    text = "Samyak's mother is worrying him and his father."
    print(extract_concerns_inference_API(text))