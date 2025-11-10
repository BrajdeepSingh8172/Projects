"""
Flask API to serve churn prediction.
POST /predict with JSON body containing customer fields (same names as dataset columns except Churn).
Returns JSON: {prediction: 0/1, label: 'Customer will stay' / 'Customer likely to churn', probability: 0.xx}
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from pathlib import Path

app = Flask(__name__)
# Allow cross-origin requests from the frontend during development
CORS(app)
ROOT = Path(__file__).resolve().parent
MODELS_DIR = ROOT / 'models'

# Load models
LOG_MODEL_PATH = MODELS_DIR / 'logistic_pipeline.joblib'
TREE_MODEL_PATH = MODELS_DIR / 'tree_pipeline.joblib'
META_PATH = MODELS_DIR / 'preprocessor_meta.joblib'

if not LOG_MODEL_PATH.exists() or not TREE_MODEL_PATH.exists() or not META_PATH.exists():
    app.logger.warning('Models not found. Please run train.py to create models in models/ folder.')

log_pipe = joblib.load(LOG_MODEL_PATH) if LOG_MODEL_PATH.exists() else None
tree_pipe = joblib.load(TREE_MODEL_PATH) if TREE_MODEL_PATH.exists() else None
meta = joblib.load(META_PATH) if META_PATH.exists() else {}

DEFAULT_MODEL = 'logistic'  # default if both available


def _prepare_input(json_data):
    # Build DataFrame from incoming JSON. Assume keys correspond to dataset columns.
    # Use meta to order columns
    # If meta not available, just create df from json
    if meta and 'numeric_cols' in meta and 'cat_cols' in meta:
        cols = meta['numeric_cols'] + meta['cat_cols']
        # Make sure all expected columns exist in json_data
        row = {c: json_data.get(c, None) for c in cols}
        return pd.DataFrame([row])
    else:
        return pd.DataFrame([json_data])


@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON body provided'}), 400

    model_name = data.get('_model', DEFAULT_MODEL)
    if model_name not in ('logistic', 'tree'):
        return jsonify({'error': 'model must be "logistic" or "tree" or omitted'}), 400

    df = _prepare_input(data)

    model = log_pipe if model_name == 'logistic' else tree_pipe
    if model is None:
        return jsonify({'error': 'Requested model not available on server'}), 500

    try:
        proba = model.predict_proba(df)[:, 1][0]
        pred = int(proba >= 0.5)
        label = 'Customer likely to churn' if pred == 1 else 'Customer will stay'
        return jsonify({'prediction': pred, 'label': label, 'probability': float(proba)})
    except Exception as e:
        app.logger.exception('Prediction failed')
        return jsonify({'error': str(e)}), 500


@app.route('/')
def index():
    return jsonify({'status': 'ok', 'models_loaded': {'logistic': log_pipe is not None, 'tree': tree_pipe is not None}})


if __name__ == '__main__':
    # Run without the reloader/debugger so the process is a single, stable PID
    app.run(host='0.0.0.0', port=5000, debug=False)
