.PHONY: dev test codegen

dev:
	poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port $${PORT:-8000}

test:
poetry run pytest

codegen:
	poetry run fastapi-codegen --input openapi.yaml --output app/generated
