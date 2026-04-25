# BlackRoad OS Backend Makefile

PORT ?= 8000

.PHONY: help install dev run test clean docker-build docker-up docker-down

help:
	@echo "BlackRoad OS Backend - Available Commands:"
	@echo ""
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Run development server"
	@echo "  make test         - Run tests"
	@echo "  make clean        - Clean cache and temp files"
	@echo "  make docker-build - Build Docker images"
	@echo "  make docker-up    - Start Docker containers"
	@echo "  make docker-down  - Stop Docker containers"
	@echo "  make migrate      - Run database migrations"
	@echo "  make lint         - Run code linters"
	@echo ""

install:
	pip install -r requirements.txt

dev:
	python run.py

run:
	uvicorn app.main:app --host 0.0.0.0 --port $(PORT)

test:
	pytest -v

test-cov:
	pytest --cov=app --cov-report=html --cov-report=term

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	rm -rf .pytest_cache
	rm -rf htmlcov
	rm -rf .coverage

docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f backend

migrate:
	alembic upgrade head

lint:
	black app/
	flake8 app/
	mypy app/

format:
	black app/
	isort app/
