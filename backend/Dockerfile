# DriveSafe AI - Backend Containerfile
FROM python:3.11-slim

# Prevent python from writing pyc files and buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install system dependencies required by OpenCV and MediaPipe
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source and model assets
COPY app ./app
COPY models ./models

# Model asset fallback: download if not copied
RUN if [ ! -f ./models/face_landmarker.task ]; then \
    mkdir -p ./models && \
    curl -sSL -o ./models/face_landmarker.task \
    https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task; \
    fi

EXPOSE 8000

# Run uvicorn on dynamically provided $PORT or default 8000
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
