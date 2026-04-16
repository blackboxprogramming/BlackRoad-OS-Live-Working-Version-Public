#!/bin/bash
# Check Canonical item metadata against actual workflow locations
# Usage: ./check-integrity.sh

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)

python3 - "$ROOT_DIR" <<'PY'
from pathlib import Path
import sys

root = Path(sys.argv[1])
problems = []
checked = 0

def field_value(lines, prefix):
    for line in lines:
        if line.startswith(prefix):
            return line[len(prefix):].strip()
    return None

for item in root.rglob("*.item.txt"):
    if item.name == "TEMPLATE-ITEM.txt":
        continue
    parts = item.parts
    if "Workflow" not in parts:
        continue
    idx = parts.index("Workflow")
    if idx == 0 or idx + 1 >= len(parts):
        continue

    checked += 1
    layer_name = parts[idx - 1]
    step_name = parts[idx + 1]
    expected_path = f"Workflow/{step_name}/"

    lines = item.read_text(encoding="utf-8").splitlines()
    item_layer = field_value(lines, "Layer:")
    item_step = field_value(lines, "Current Step:")
    item_path = field_value(lines, "Current Path:")

    item_problems = []
    if item_layer != layer_name:
        item_problems.append(f"Layer expected '{layer_name}' but found '{item_layer}'")
    if item_step != step_name:
        item_problems.append(f"Current Step expected '{step_name}' but found '{item_step}'")
    if item_path != expected_path:
        item_problems.append(f"Current Path expected '{expected_path}' but found '{item_path}'")

    if item_problems:
        problems.append((item.relative_to(root), item_problems))

print("Canonical integrity check")
print("=========================")
print()
print(f"Checked items: {checked}")
print(f"Items with problems: {len(problems)}")
print()

if problems:
    print("Problems")
    print("--------")
    for rel, item_problems in problems:
        print(rel)
        for problem in item_problems:
            print(f"  - {problem}")
else:
    print("No metadata drift detected.")
PY
