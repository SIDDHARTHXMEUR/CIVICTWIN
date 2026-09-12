FROM python:3.11-slim
WORKDIR /app/services/worker
COPY services/api/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt
COPY services/api /app/services/api
COPY services/worker ./
ENV PYTHONPATH=/app/services/api:/app/services/worker
# The API processes reports with FastAPI background tasks in local/demo mode.
# This service remains available as the containerised worker extension point.
CMD ["python", "-c", "import time; print('CivicTwin worker ready'); time.sleep(2147483647)"]
