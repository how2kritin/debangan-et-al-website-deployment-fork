import re
import json
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

torch.random.manual_seed(0)


bnb_config = {
    "load_in_4bit": True,
    "bnb_4bit_quant_type": "nf4",
    "bnb_4bit_compute_dtype": torch.float16,
    "bnb_4bit_use_double_quant": True,
}
model = AutoModelForCausalLM.from_pretrained(
    "microsoft/Phi-3.5-mini-instruct",
    device_map="cuda",
    torch_dtype="auto",
    trust_remote_code=True,
    quantization_config=bnb_config,
)
tokenizer = AutoTokenizer.from_pretrained("microsoft/Phi-3.5-mini-instruct")
pipe = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
)
generation_args = {
    "max_new_tokens": 500,
    "return_full_text": False,
    "temperature": 1.0,
    "top_p": 0.8,
    "do_sample": False,
}


def return_array(text):
    boolean_array = re.search(r"\[(.*?)\]", text).group(1)
    boolean_array = [
        item.strip().lower() == "true" for item in boolean_array.split(",")
    ]
    return boolean_array


def prompt_llm(catgegory, user_prompt):
    final_prompt = loaded_data[catgegory] + f'\nSentence to Evaluate: "{user_prompt}"'
    messages = [
        {"role": "system", "content": "You are a helpful AI assistant."},
        {"role": "user", "content": final_prompt},
    ]
    output = pipe(messages, **generation_args)
    return_text = output[0]["generated_text"]
    bool_array = return_array(return_text)
    return bool_array


if __name__ == "__main__":
    with open("./prompts.txt", "r") as f:
        loaded_data = json.load(f)

    user_prompt = "I am feeling anxious, fidgety and restless"
    arr = prompt_llm("anxiety", user_prompt)
    print(arr)
    arr = prompt_llm("depression", user_prompt)
    print(arr)
