from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
import cv2
import io
import base64

app = FastAPI()

# Allow CORS from the browser extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["chrome-extension://nfiemlfpkjcjfioljgijplejgpomamki"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your deepfake detection model once at startup
model = tf.keras.models.load_model("model/my_model.h5") # 'my_model.h5' to be replaced with the real model's name

@app.post("/api/detect")
async def detect_deepfake(file: UploadFile = File(...)):
    try:
        # Read the uploaded video file
        contents = await file.read()
        video = io.BytesIO(contents)

        # Extract frames (implement your frame extraction logic)
        frames = extract_frames(video)

        # Preprocess frames for the model
        processed_frames = preprocess_frames(frames)

        # Make predictions
        predictions = model.predict(processed_frames)
        probability = float(np.mean(predictions) * 100)

        return {"probability": probability}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def extract_frames(video_io):
    import cv2
    import tempfile

    # Save video to a temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp:
        temp.write(video_io.read())
        temp_path = temp.name

    vidcap = cv2.VideoCapture(temp_path)
    frames = []
    success, image = vidcap.read()
    while success:
        frames.append(image)
        success, image = vidcap.read()
    vidcap.release()
    return frames

def preprocess_frames(frames):
    processed = []
    for frame in frames:
        img = cv2.resize(frame, (224, 224))  # Adjust size as per your model
        img = img / 255.0  # Normalize
        processed.append(img)
    return np.array(processed)
