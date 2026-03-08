# Use Python 3.11 lightweight image
FROM python:3.11-slim

WORKDIR /app

# Install runtime libraries needed by OpenCV, torch, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgl1 \
    libgomp1 \
    libopenblas-dev \
    liblapack-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt \
    --extra-index-url https://download.pytorch.org/whl/cpu

# Copy project files
COPY . .

# Ensure encoding directory exists
RUN mkdir -p encodings

EXPOSE 5001

# Run backend
CMD ["python", "app.py"]