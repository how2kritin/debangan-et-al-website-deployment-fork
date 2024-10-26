import re
import json
from huggingface_hub import InferenceClient

client = InferenceClient(api_key="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")

def return_array(text):
    match = re.search(r"\[(.*?)\]", text)
    if match:
        boolean_array = [
            item.strip().lower() == "true" for item in match.group(1).split(",")
        ]
        return boolean_array

def prompt_llm(category, user_prompt):
    with open("./prompts.txt", "r") as f:
        loaded_data = json.load(f)

    final_prompt = loaded_data[category] + f'\nSentence to Evaluate: "{user_prompt}"'
    messages = [
        {"role": "user", "content": final_prompt},
    ]

    stream = client.chat.completions.create(
        model="microsoft/Phi-3.5-mini-instruct",
        messages=messages,
        max_tokens=500,
        stream=True,
        temperature=1.0,
        top_p=0.8
    )

    final_output = ""
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            final_output += chunk.choices[0].delta.content

    bool_array = return_array(final_output)
    return bool_array

if __name__ == "__main__":
    user_prompt = "I am feeling anxious, fidgety and restless"
    arr = prompt_llm("anxiety", user_prompt)
    print(arr)
    arr = prompt_llm("depression", user_prompt)
    print(arr)
