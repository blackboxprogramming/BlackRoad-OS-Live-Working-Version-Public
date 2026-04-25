PY=python
PIP=pip

install:
$(PIP) install -r requirements.txt

lint:
ruff check .
eslint agents --ext .ts

fmt:
black .
prettier --write agents workflows lib

test:
$(PY) -m pytest
