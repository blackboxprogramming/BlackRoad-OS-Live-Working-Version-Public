#!/bin/bash
# Quick start script for BlackRoad Pixel City

echo "🎮 BlackRoad Pixel City - Quick Start"
echo "===================================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Check if pygame is installed
if ! python3 -c "import pygame" 2>/dev/null; then
    echo "📦 Installing pygame..."
    pip3 install pygame
else
    echo "✅ Pygame already installed"
fi

echo ""
echo "🚀 Launching BlackRoad Pixel City..."
echo ""
echo "Controls:"
echo "  ESC   - Exit game"
echo "  F     - Toggle FPS counter"
echo "  SPACE - Spawn random Pokemon"
echo ""
echo "Enjoy! 🎨✨"
echo ""

python3 src/pixel_city.py
