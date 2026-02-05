FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1         PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends         build-essential         libpq-dev         && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml /app/pyproject.toml
RUN pip install --no-cache-dir -U pip && pip install --no-cache-dir .

COPY . /app

EXPOSE 8000

CMD ["bash", "-lc", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
