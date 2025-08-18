FROM python:3.9-slim

RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Upgrade pip
RUN pip install --upgrade pip

COPY requirements.txt .
RUN pip install -r requirements.txt --timeout=120 --retries=10
COPY ./weights/resnet50-11ad3fa6.pth /root/.cache/torch/hub/checkpoints/resnet50-11ad3fa6.pth
COPY . .

EXPOSE 9000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "9000", "--reload"]