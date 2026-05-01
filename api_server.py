import numpy as np
import cv2
import time
from collections import deque
from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import traceback
import tensorflow as tf
from sign_language_predict import predict_single
import os
from deep_translator import GoogleTranslator
from gtts import gTTS
import io

app = Flask(__name__, static_folder='web-app/dist', static_url_path='/')
CORS(app)

MODEL_TFLITE = 'model.tflite'
interpreter = tf.lite.Interpreter(model_path=MODEL_TFLITE)
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()
print("[API] TFLite model ready.")

# Load Wordlist
word_list = []
try:
    with open('wordlist.txt', 'r') as f:
        word_list = [line.strip().upper() for line in f if line.strip()]
    print(f"[API] Wordlist loaded ({len(word_list)} words).")
except Exception as e:
    print("[API] Failed to load wordlist.txt:", e)

_history_log = deque(maxlen=50)

@app.route('/autocomplete', methods=['GET'])
def autocomplete():
    prefix = request.args.get('prefix', '').upper()
    if not prefix:
        return jsonify([])
    suggestions = [w for w in word_list if w.startswith(prefix)][:5]
    return jsonify(suggestions)



def predict_from_landmarks(raw_pts):
    px = [int((1.0 - p['x']) * 640) for p in raw_pts]
    py = [int(p['y'] * 480) for p in raw_pts]

    x_min, x_max = min(px), max(px)
    y_min, y_max = min(py), max(py)
    w = x_max - x_min
    h = y_max - y_min

    offset = 29
    x1 = x_min - offset
    y1 = y_min - offset
    crop_w = w + 2 * offset
    crop_h = h + 2 * offset

    pts_crop = [[px[i] - x1, py[i] - y1] for i in range(21)]

    white = np.ones((400, 400, 3), np.uint8) * 255
    os_x = (400 - crop_w) // 2
    os_y = (400 - crop_h) // 2

    for t in range(0, 4):
        cv2.line(white, (pts_crop[t][0]+os_x, pts_crop[t][1]+os_y),
                 (pts_crop[t+1][0]+os_x, pts_crop[t+1][1]+os_y), (0,255,0), 3)
    for t in range(5, 8):
        cv2.line(white, (pts_crop[t][0]+os_x, pts_crop[t][1]+os_y),
                 (pts_crop[t+1][0]+os_x, pts_crop[t+1][1]+os_y), (0,255,0), 3)
    for t in range(9, 12):
        cv2.line(white, (pts_crop[t][0]+os_x, pts_crop[t][1]+os_y),
                 (pts_crop[t+1][0]+os_x, pts_crop[t+1][1]+os_y), (0,255,0), 3)
    for t in range(13, 16):
        cv2.line(white, (pts_crop[t][0]+os_x, pts_crop[t][1]+os_y),
                 (pts_crop[t+1][0]+os_x, pts_crop[t+1][1]+os_y), (0,255,0), 3)
    for t in range(17, 20):
        cv2.line(white, (pts_crop[t][0]+os_x, pts_crop[t][1]+os_y),
                 (pts_crop[t+1][0]+os_x, pts_crop[t+1][1]+os_y), (0,255,0), 3)

    cv2.line(white, (pts_crop[5][0]+os_x, pts_crop[5][1]+os_y),
                    (pts_crop[9][0]+os_x, pts_crop[9][1]+os_y), (0,255,0), 3)
    cv2.line(white, (pts_crop[9][0]+os_x, pts_crop[9][1]+os_y),
                    (pts_crop[13][0]+os_x, pts_crop[13][1]+os_y), (0,255,0), 3)
    cv2.line(white, (pts_crop[13][0]+os_x, pts_crop[13][1]+os_y),
                    (pts_crop[17][0]+os_x, pts_crop[17][1]+os_y), (0,255,0), 3)
    cv2.line(white, (pts_crop[0][0]+os_x, pts_crop[0][1]+os_y),
                    (pts_crop[5][0]+os_x, pts_crop[5][1]+os_y), (0,255,0), 3)
    cv2.line(white, (pts_crop[0][0]+os_x, pts_crop[0][1]+os_y),
                    (pts_crop[17][0]+os_x, pts_crop[17][1]+os_y), (0,255,0), 3)

    for i in range(21):
        cv2.circle(white, (pts_crop[i][0]+os_x, pts_crop[i][1]+os_y), 2, (0,0,255), 1)

    result, confidence = predict_single(pts_crop, white, interpreter, input_details=input_details, output_details=output_details, return_confidence=True)
    return result, round(confidence * 100, 1)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model': 'keras h5'})


@app.route('/history', methods=['GET'])
def history():
    return jsonify(list(_history_log))


@app.route('/history', methods=['DELETE'])
def clear_history():
    _history_log.clear()
    return jsonify({'status': 'cleared'})


@app.route('/translate', methods=['POST'])
def translate():
    """Translate English text to Hindi or Kannada."""
    try:
        data = request.json
        text = data.get('text', '').strip()
        target_lang = data.get('lang', 'hi')  # 'hi' for Hindi, 'kn' for Kannada

        if not text:
            return jsonify({'translated': '', 'lang': target_lang})

        # Validate target language
        if target_lang not in ('hi', 'kn', 'en'):
            return jsonify({'error': 'Unsupported language. Use hi, kn, or en'}), 400

        # If English is selected, return as-is
        if target_lang == 'en':
            return jsonify({'translated': text, 'lang': 'en'})

        translated = GoogleTranslator(source='en', target=target_lang).translate(text)
        return jsonify({'translated': translated or text, 'lang': target_lang})

    except Exception as e:
        print('[API] Translation error:', traceback.format_exc())
        return jsonify({'translated': text, 'lang': target_lang, 'error': str(e)})


@app.route('/tts', methods=['POST'])
def tts():
    """Generate TTS audio for the given text and language using gTTS."""
    try:
        data = request.json
        text = data.get('text', '').strip()
        lang = data.get('lang', 'kn')  # 'kn' Kannada, 'hi' Hindi

        if not text:
            return jsonify({'error': 'No text provided'}), 400

        tts_obj = gTTS(text=text, lang=lang, slow=False)
        fp = io.BytesIO()
        tts_obj.write_to_fp(fp)
        fp.seek(0)

        from flask import Response
        return Response(
            fp.read(),
            status=200,
            mimetype='audio/mpeg',
            headers={'Content-Disposition': 'inline', 'Cache-Control': 'no-cache'}
        )

    except Exception as e:
        print('[API] TTS error:', traceback.format_exc())
        return jsonify({'error': str(e)}), 500


@app.route('/speak', methods=['POST'])
def speak():
    """Translate English text and return TTS audio in target language in one step."""
    try:
        data = request.json
        text = data.get('text', '').strip()
        lang = data.get('lang', 'kn')  # 'kn' or 'hi'

        if not text:
            return jsonify({'error': 'No text provided'}), 400

        # Step 1: Translate
        translated = GoogleTranslator(source='en', target=lang).translate(text)
        if not translated:
            translated = text

        # Step 2: Generate audio
        tts_obj = gTTS(text=translated, lang=lang, slow=False)
        fp = io.BytesIO()
        tts_obj.write_to_fp(fp)
        fp.seek(0)

        from flask import Response
        response = Response(
            fp.read(),
            status=200,
            mimetype='audio/mpeg',
            headers={
                'Content-Disposition': 'inline',
                'Cache-Control': 'no-cache',
                'X-Translated-Text': translated.encode('ascii', 'replace').decode('ascii')
            }
        )
        return response

    except Exception as e:
        print('[API] Speak error:', traceback.format_exc())
        return jsonify({'error': str(e)}), 500


@app.route('/predict', methods=['POST'])
def predict():
    t0 = time.perf_counter()
    try:
        data = request.json
        raw_pts = data.get('landmarks')
        if not raw_pts or len(raw_pts) != 21:
            return jsonify({'error': 'Expected exactly 21 landmarks'}), 400

        result, confidence = predict_from_landmarks(raw_pts)
        elapsed_ms = round((time.perf_counter() - t0) * 1000, 1)

        if result and result not in ('Speak', 'next', 'Backspace') and (
           len(_history_log) == 0 or _history_log[-1]['prediction'] != result):
            _history_log.append({
                'prediction': result,
                'confidence': confidence,
                'ts': round(time.time() * 1000),
            })

        return jsonify({
            'prediction': result or '',
            'confidence': confidence,
            'latency_ms': elapsed_ms,
        })

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run(port=5000, debug=False, threaded=True)