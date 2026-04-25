#!/bin/bash

# BlackRoad Metaverse - Quick Deploy Script
# Deploys to Cloudflare Pages with cohesive design

echo "🚀 BlackRoad Metaverse - Quick Deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create clean deploy directory
echo "📦 Creating clean deployment..."
cd /tmp
rm -rf blackroad-metaverse-deploy
mkdir -p blackroad-metaverse-deploy
cd blackroad-metaverse-deploy

# Copy essential files
echo "📋 Copying files..."
cp /Users/alexa/blackroad-metaverse/index.html .
cp /Users/alexa/blackroad-metaverse/*.js . 2>/dev/null

# Rename index.html if universe.html exists
if [ -f "/Users/alexa/blackroad-metaverse/universe.html" ]; then
    cp /Users/alexa/blackroad-metaverse/universe.html ./universe.html
fi

echo "✨ Files ready:"
ls -lh | grep -E "\.html|\.js" | wc -l | xargs echo "  -" "files"

# Deploy
echo "🌍 Deploying to Cloudflare Pages..."
wrangler pages deploy . --project-name=blackroad-metaverse --commit-dirty=true

# Cleanup
echo "🧹 Cleaning up..."
cd /tmp
rm -rf blackroad-metaverse-deploy

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment complete!"
