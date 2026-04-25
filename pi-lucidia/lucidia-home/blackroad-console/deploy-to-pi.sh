#!/bin/bash
set -euo pipefail

# BlackRoad Console - Deploy to Lucidia Pi
# Usage: ./deploy-to-pi.sh

PI_HOST="lucidia"
DEPLOY_DIR="/home/lucidia/blackroad-console"
PROJECT_NAME="blackroad-console"

echo "🚀 Deploying BlackRoad Console to Lucidia Pi..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Sync files to Pi
echo "📦 Syncing files to Pi..."
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'backend/data' \
  --exclude '.env' \
  ./ $PI_HOST:$DEPLOY_DIR/

echo ""
echo "✅ Files synced to Pi"

# Step 2: SSH to Pi and run Docker Compose
echo ""
echo "🐳 Starting Docker containers on Pi..."
ssh $PI_HOST << 'ENDSSH'
  cd /home/lucidia/blackroad-console

  # Create .env if it doesn't exist
  if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  WARNING: Update .env with your actual secrets!"
  fi

  # Create data directory
  mkdir -p backend/data

  # Pull latest images
  docker compose pull

  # Build and start containers
  docker compose up -d --build

  # Wait a moment for containers to start
  sleep 3

  # Show status
  echo ""
  echo "📊 Container Status:"
  docker compose ps

  echo ""
  echo "📋 Recent logs:"
  docker compose logs --tail=20

  echo ""
  echo "✅ Deployment complete!"
ENDSSH

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 BlackRoad Console deployed successfully!"
echo ""
echo "Access URLs:"
echo "  • Local:  http://192.168.4.38"
echo "  • API:    http://192.168.4.38/api/ping"
echo ""
echo "Useful commands (run on Pi):"
echo "  • View logs:     docker compose logs -f"
echo "  • Restart:       docker compose restart"
echo "  • Stop:          docker compose down"
echo "  • Rebuild:       docker compose up -d --build"
echo ""
echo "To check status: ssh $PI_HOST 'cd $DEPLOY_DIR && docker compose ps'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
