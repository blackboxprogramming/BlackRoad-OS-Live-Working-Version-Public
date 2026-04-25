#!/bin/bash
# BlackRoad OS - App Deployment Script

set -e

APP_NAME=$1
PLATFORM=${2:-both}

if [ -z "$APP_NAME" ]; then
  echo "Usage: ./deploy-app.sh <AppName> [ios|android|both]"
  exit 1
fi

APP_DIR="apps/$APP_NAME"

if [ ! -d "$APP_DIR" ]; then
  echo "❌ App not found: $APP_NAME"
  echo "Available apps:"
  ls -1 apps/ 2>/dev/null || echo "  (none)"
  exit 1
fi

echo "🚀 BlackRoad OS App Factory - Deployment"
echo "========================================="
echo "App: $APP_NAME"
echo "Platform: $PLATFORM"
echo ""

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | xargs)
fi

cd "$APP_DIR"

# Install dependencies if needed
if [ -f package.json ] && [ ! -d node_modules ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Deploy iOS
if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "both" ]; then
  echo ""
  echo "📱 Deploying to TestFlight..."
  
  if command -v fastlane &> /dev/null; then
    export APP_NAME="$APP_NAME"
    fastlane ios beta
    echo "✅ iOS deployment complete!"
  else
    echo "⚠️  Fastlane not installed. Installing..."
    gem install fastlane
    export APP_NAME="$APP_NAME"
    fastlane ios beta
  fi
fi

# Deploy Android
if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "both" ]; then
  echo ""
  echo "🤖 Deploying to Google Play Beta..."
  
  if command -v fastlane &> /dev/null; then
    fastlane android beta
    echo "✅ Android deployment complete!"
  else
    echo "⚠️  Fastlane not installed. Installing..."
    gem install fastlane
    fastlane android beta
  fi
fi

# Update metadata
cd ../..
if command -v jq &> /dev/null; then
  jq '.status = "deployed" | .last_deployed = "'$(date -Iseconds)'"' \
    "$APP_DIR/metadata.json" > "$APP_DIR/metadata.json.tmp"
  mv "$APP_DIR/metadata.json.tmp" "$APP_DIR/metadata.json"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📊 Check status:"
echo "  iOS: https://appstoreconnect.apple.com"
echo "  Android: https://play.google.com/console"
echo ""
