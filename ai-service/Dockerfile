FROM python:3.11-slim

WORKDIR /app

COPY ai-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ai-service/ ./
COPY data/ /app/data/

RUN python3 train_model.py 2>/dev/null || true

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
