#!/usr/bin/env bash
set -euo pipefail

# Automated helper to install backend test dependencies and execute pytest
# using a lightweight SQLite database. This is intended for local development
# and CI smoke checks.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
VENV_DIR="$BACKEND_DIR/.venv-tests"

cd "$BACKEND_DIR"

if [[ ! -d "$VENV_DIR" ]]; then
  python -m venv "$VENV_DIR"
fi

source "$VENV_DIR/bin/activate"

pip install --upgrade pip
pip install -r requirements.txt

# Unset potentially conflicting variables and set proper test values
unset DATABASE_URL DATABASE_ASYNC_URL
export TEST_DATABASE_URL="${TEST_DATABASE_URL:-sqlite+aiosqlite:///./test.db}"
export DATABASE_URL="sqlite:///./test.db"
export DATABASE_ASYNC_URL="sqlite+aiosqlite:///./test.db"
export ENVIRONMENT="${ENVIRONMENT:-testing}"
export ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-http://localhost:3000,http://localhost:8000}"
export SECRET_KEY="test-secret-key-for-local-tests"
export WALLET_MASTER_KEY="test-wallet-master-key-32chars-000"

pytest -v --maxfail=1
