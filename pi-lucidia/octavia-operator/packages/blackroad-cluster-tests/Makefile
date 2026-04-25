.PHONY: help test test-fast test-dry test-node clean install

help:
	@echo "BlackRoad Cluster Test Suite"
	@echo ""
	@echo "Targets:"
	@echo "  make test          - Run full test suite on all nodes"
	@echo "  make test-fast     - Run fast test suite (skip slow tests)"
	@echo "  make test-dry      - Dry run (show what would be tested)"
	@echo "  make test-node NODE=lucidia - Test single node"
	@echo "  make test-local    - Run tests locally (for validation)"
	@echo "  make install       - Install dependencies on all nodes"
	@echo "  make clean         - Remove old test results"
	@echo ""

test:
	./run-tests.sh

test-fast:
	./run-tests.sh --fast

test-dry:
	./run-tests.sh --dry-run

test-node:
	@if [ -z "$(NODE)" ]; then \
		echo "Error: NODE not specified. Usage: make test-node NODE=lucidia"; \
		exit 1; \
	fi
	./run-tests.sh --node $(NODE)

test-local:
	./test-local.sh

install:
	@echo "Installing dependencies on all nodes..."
	@for node in lucidia alice aria octavia shellfish; do \
		echo "  Installing on $$node..."; \
		ssh $$node "sudo apt-get update -qq && sudo apt-get install -y -qq jq mosquitto-clients i2c-tools smartmontools curl" || true; \
	done
	@echo "Done."

clean:
	@echo "Removing old test results..."
	@find results -type f -name "*.json" -mtime +7 -delete 2>/dev/null || true
	@find results -type f -name "*.txt" -mtime +7 -delete 2>/dev/null || true
	@echo "Done."
