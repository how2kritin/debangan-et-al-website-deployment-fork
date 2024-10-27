from flask import Flask, request, jsonify
from flask_cors import CORS
from data_processor import process_data
import os

app = Flask(__name__)
CORS(app)


@app.route('/api/process', methods=['POST'])
def process_input():
    data = request.json
    input_text = data.get("input", "")

    if not input_text:
        return jsonify({"error": "No input provided"}), 400

    print(f"Received text: {input_text}")

    response_data = process_data(input_text)
    return jsonify(response_data)


if __name__ == '__main__':
    try:
        print("Deleted")
        os.remove("./scores.pkl")
    except:
        print("Not deleted")
    app.run(debug=True)
