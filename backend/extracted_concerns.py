from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import bitsandbytes as bnb  # for 8-bit quantization


def extract_concerns(input_text: str) -> list[str]:
    model = AutoModelForCausalLM.from_pretrained(
        "microsoft/Phi-3.5-mini-instruct",
        load_in_8bit=True,
        device_map="auto",
        torch_dtype="auto",
        trust_remote_code=True,
    )
    tokenizer = AutoTokenizer.from_pretrained("microsoft/Phi-3.5-mini-instruct")

    prompt = f"""
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

    Input: '{input_text}'
    Output:
    """

    pipe = pipeline(
        "text-generation",
        model=model,
        tokenizer=tokenizer,
    )

    generation_args = {
        "max_new_tokens": 50,  # reduced max tokens for shorter output
        "return_full_text": False,
        "temperature": 0.0,
        "do_sample": False,
    }

    output = pipe(prompt, **generation_args)

    output_phrases = output[0]['generated_text'].strip().split('\n')
    return output_phrases


def extract_concerns_inference_API(input_text: str) -> list[str]:
    from huggingface_hub import InferenceClient

    client = InferenceClient(api_key="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")

    messages = [
        {"role": "system", "content": """
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
            """},
        {"role": "user", "content": input_text},
    ]

    stitched_response = ""
    stream = client.chat.completions.create(
        model="microsoft/Phi-3.5-mini-instruct",
        messages=messages,
        max_tokens=500,
        stream=True
    )

    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            stitched_response += chunk.choices[0].delta.content

    phrases = [phrase.strip().strip("'\"") for phrase in stitched_response.split('\n')]
    phrases = list(dict.fromkeys(phrase for phrase in phrases if phrase))

    return phrases

if __name__ == "__main__":
    text = "Samyak's mother is worrying him and his father."
    print(extract_concerns(text))
    # print(extract_concerns_inference_API(text))