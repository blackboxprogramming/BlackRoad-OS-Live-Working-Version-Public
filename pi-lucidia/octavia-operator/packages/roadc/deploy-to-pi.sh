#!/bin/bash
# BlackRoad Language - Minimal Pi Deployment Script
# Transfers only essential files and compiles on Pi

set -e

PI_HOST="${1:-alice}"
echo "🥧 Deploying BlackRoad Language to $PI_HOST..."

# Check if Pi is accessible
if ! ssh "$PI_HOST" "echo '✅ Connected'" 2>/dev/null; then
    echo "❌ Error: Cannot connect to $PI_HOST"
    echo "   Try: ssh $PI_HOST"
    exit 1
fi

# Check disk space
echo "📊 Checking disk space..."
DISK_AVAIL=$(ssh "$PI_HOST" "df / | tail -1 | awk '{print \$4}'")
if [ "$DISK_AVAIL" -lt 1000 ]; then
    echo "⚠️  Warning: Low disk space on $PI_HOST!"
    echo "   Available: $DISK_AVAIL KB"
    echo ""
    echo "💡 To free space, run on Pi:"
    echo "   sudo apt clean"
    echo "   sudo apt autoremove"
    echo "   rm -rf ~/.cache/*"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create temp directory
echo "📁 Creating deployment directory..."
ssh "$PI_HOST" "mkdir -p /tmp/blackroad"

# Transfer essential files only
echo "📤 Transferring source code..."
scp roadc.c "$PI_HOST:/tmp/blackroad/" || {
    echo "❌ Transfer failed - trying compressed..."
    cat roadc.c | ssh "$PI_HOST" "cat > /tmp/blackroad/roadc.c"
}

echo "📤 Transferring test file..."
cat > /tmp/test_minimal.road << 'EOF'
# Minimal BlackRoad test
let x: int = 42
let name = "BlackRoad"

fun main():
    print("Hello from BlackRoad on Pi! 🖤🛣️")
EOF

scp /tmp/test_minimal.road "$PI_HOST:/tmp/blackroad/test.road" || {
    cat /tmp/test_minimal.road | ssh "$PI_HOST" "cat > /tmp/blackroad/test.road"
}

# Compile on Pi
echo "🔧 Compiling on $PI_HOST..."
ssh "$PI_HOST" "cd /tmp/blackroad && gcc --version && echo '---' && gcc -std=c99 -O2 -o roadc roadc.c && ls -lh roadc"

# Test
echo "🧪 Testing compiler..."
ssh "$PI_HOST" "cd /tmp/blackroad && ./roadc test.road"

# Success!
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   ✅ BlackRoad Language on $PI_HOST! ✅   ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "📍 Location: /tmp/blackroad/ on $PI_HOST"
echo ""
echo "🚀 To use:"
echo "   ssh $PI_HOST"
echo "   cd /tmp/blackroad"
echo "   ./roadc test.road"
echo ""
echo "💡 To install permanently:"
echo "   sudo cp /tmp/blackroad/roadc /usr/local/bin/"
echo ""
