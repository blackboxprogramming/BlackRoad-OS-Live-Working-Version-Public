#!/usr/bin/env bash
set -e

OUTDIR="$HOME/blackroad-sites"
TMP="$(mktemp)"

ollama run blackroad-web > "$TMP"

# Expect first line to be a file path
FILE="$(head -n 1 "$TMP")"
CONTENT="$(tail -n +2 "$TMP")"

FULL="$OUTDIR/$FILE"
mkdir -p "$(dirname "$FULL")"
echo "$CONTENT" > "$FULL"

echo "✔ wrote $FULL"
