# backend/Dockerfile

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN SECRET_KEY=dummy \
    DEBUG=False \
    POSTGRES_DB=dummy \
    POSTGRES_USER=dummy \
    POSTGRES_PASSWORD=dummy \
    POSTGRES_HOST=dummy \
    python manage.py collectstatic --noinput

RUN addgroup --system app && adduser --system --group app

RUN mkdir -p /app/media && chown -R app:app /app

USER app

CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"]
