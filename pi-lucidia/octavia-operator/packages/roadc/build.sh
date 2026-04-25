#!/bin/bash
# BlackRoad Language - Build Script
# Compiles the native C compiler

set -e  # Exit on error

echo "╔════════════════════════════════════════════╗"
echo "║  🛣️  BlackRoad OS Language Builder  🛣️   ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Check for gcc
if ! command -v gcc &> /dev/null; then
    echo "❌ Error: gcc not found"
    echo "   Install with: brew install gcc (Mac) or apt install gcc (Linux)"
    exit 1
fi

echo "🔧 Compiling roadc compiler..."
gcc -std=c99 -O2 -o roadc roadc.c

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📚 Quick start:"
    echo "   ./roadc test.road          # Run test file"
    echo "   ./roadc                     # Start REPL"
    echo "   ./roadc examples/*.road     # Run examples"
    echo ""
    echo "📖 Documentation:"
    echo "   cat README.md               # Project overview"
    echo "   cat QUICKSTART.md           # Quick start guide"
    echo ""
    echo "🚀 Ready to write BlackRoad code! 🖤🛣️"
else
    echo "❌ Build failed"
    exit 1
fi
