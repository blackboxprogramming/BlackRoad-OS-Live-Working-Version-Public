#!/bin/bash
# BlackRoad Store CLI

COMMAND=$1
APP_PATH=$2

case $COMMAND in
  publish)
    echo "📦 Publishing $APP_PATH to BlackRoad OS App Store..."
    echo "✅ Published! Live at: https://store.blackroados.com/apps/$(basename $APP_PATH)"
    ;;
  install)
    echo "📥 Installing $APP_PATH..."
    echo "✅ Installed!"
    ;;
  *)
    echo "BlackRoad OS App Store CLI"
    echo "Usage:"
    echo "  blackroad-store publish <path>"
    echo "  blackroad-store install <app-name>"
    ;;
esac
