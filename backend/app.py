from flask import Flask, request, jsonify
from flask_cors import CORS
from data_processor import process_data
import os
from gevent import monkey
monkey.patch_all()

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

@app.errorhandler(TimeoutError)
def handle_timeout_error(error):
    return jsonify({"error": "The request timed out"}), 504

@app.errorhandler(Exception)
def handle_general_error(error):
    return jsonify({"error": str(error)}), 500


if __name__ == '__main__':
    try:
        os.remove("./scores.pkl")
        print("Deleted")
    except:
        print("Not deleted")
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
