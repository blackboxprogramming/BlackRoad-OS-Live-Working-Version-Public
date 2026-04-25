#!/usr/bin/env bash
INTENT="$1"
[[ -z "$INTENT" ]] && { echo "Usage: cf-dns-to-pr.sh <intent.json>"; exit 1; }

cp "$INTENT" ~/lucidia-phase2/github/intent.md
~/lucidia-phase2/github/gh-intent-pr.sh ~/lucidia-phase2/github/intent.md
