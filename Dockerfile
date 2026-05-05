FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (cached layer)
COPY women-safety-app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY women-safety-app/ .

# Create instance directory for SQLite fallback
RUN mkdir -p instance app/uploads/evidence app/uploads/sos/logs

ENV FLASK_ENV=production

EXPOSE 8080

CMD gunicorn app:app --bind 0.0.0.0:${PORT:-8080} --workers 2 --timeout 120
