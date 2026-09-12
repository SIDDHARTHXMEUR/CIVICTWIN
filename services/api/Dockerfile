FROM python:3.11-slim
WORKDIR /app/services/api
COPY services/api/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY services/api ./
COPY services/worker /app/services/worker
ENV PYTHONPATH=/app/services/api:/app/services/worker
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
