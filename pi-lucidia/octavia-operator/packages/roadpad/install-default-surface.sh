#!/usr/bin/env bash
set -euo pipefail

ROADPAD_DIR="${ROADPAD_DIR:-$HOME/roadpad}"
LOCAL_BIN="$HOME/.local/bin"
ZSHRC="$HOME/.zshrc"
SOURCE_LINE='source "$HOME/roadpad/roadpad.env"'

mkdir -p "$LOCAL_BIN"
ln -sf "$ROADPAD_DIR/roadpad" "$LOCAL_BIN/roadpad"
ln -sf "$ROADPAD_DIR/roadpad" "$LOCAL_BIN/blackroad-surface"

if [ -f "$ZSHRC" ]; then
  if ! rg -F "$SOURCE_LINE" "$ZSHRC" >/dev/null 2>&1; then
    {
      echo ""
      echo "# RoadPad default surface"
      echo "$SOURCE_LINE"
    } >> "$ZSHRC"
  fi
else
  {
    echo "# RoadPad default surface"
    echo "$SOURCE_LINE"
  } > "$ZSHRC"
fi

echo "RoadPad default surface configured."
echo "Run: source ~/.zshrc"
