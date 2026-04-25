#!/bin/bash
# BlackRoad OS - App Generator

set -e

APP_NAME=$1
TEMPLATE=${2:-react-native}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

if [ -z "$APP_NAME" ]; then
  echo "Usage: ./generate-app.sh <AppName> [template]"
  echo "Templates: react-native, flutter, native-ios, native-android"
  exit 1
fi

echo "🏭 BlackRoad OS App Factory"
echo "==========================="
echo "Creating: $APP_NAME"
echo "Template: $TEMPLATE"
echo ""

# Create app directory
APP_DIR="apps/$APP_NAME"
mkdir -p "$APP_DIR"

# Load credentials
if [ -f config/apple-credentials.json ]; then
  BUNDLE_PREFIX=$(jq -r '.bundle_id_prefix' config/apple-credentials.json)
  PACKAGE_PREFIX=$(jq -r '.package_name_prefix' config/google-play-credentials.json)
else
  BUNDLE_PREFIX="com.blackroados"
  PACKAGE_PREFIX="com.blackroados"
fi

BUNDLE_ID="${BUNDLE_PREFIX}.$(echo $APP_NAME | tr '[:upper:]' '[:lower:]' | tr ' ' '')"
PACKAGE_NAME="${PACKAGE_PREFIX}.$(echo $APP_NAME | tr '[:upper:]' '[:lower:]' | tr ' ' '')"

echo "📱 Bundle ID: $BUNDLE_ID"
echo "🤖 Package Name: $PACKAGE_NAME"
echo ""

# Generate based on template
case $TEMPLATE in
  react-native)
    echo "🚀 Creating React Native + Expo app..."
    cd "$APP_DIR"
    npx create-expo-app . --template blank
    
    # Update app.json
    cat > app.json <<EOF
{
  "expo": {
    "name": "$APP_NAME",
    "slug": "$(echo $APP_NAME | tr '[:upper:]' '[:lower:]' | tr ' ' '-')",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "ios": {
      "bundleIdentifier": "$BUNDLE_ID",
      "supportsTablet": true,
      "buildNumber": "1"
    },
    "android": {
      "package": "$PACKAGE_NAME",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#000000"
      }
    },
    "extra": {
      "eas": {
        "projectId": "REPLACE_WITH_EAS_PROJECT_ID"
      }
    }
  }
}
EOF
    ;;
    
  flutter)
    echo "🦋 Creating Flutter app..."
    cd apps
    flutter create $APP_NAME \
      --org $PACKAGE_PREFIX \
      --project-name $(echo $APP_NAME | tr '[:upper:]' '[:lower:]' | tr ' ' '_')
    ;;
    
  native-ios)
    echo "🍎 Creating native iOS app (SwiftUI)..."
    # Would use xcodegen or manual Xcode project creation
    echo "⚠️  Native iOS requires Xcode. Create manually or use React Native."
    ;;
    
  native-android)
    echo "🤖 Creating native Android app (Kotlin)..."
    # Would use Android Studio CLI or gradle init
    echo "⚠️  Native Android requires Android Studio. Create manually or use React Native."
    ;;
    
  *)
    echo "❌ Unknown template: $TEMPLATE"
    exit 1
    ;;
esac

cd ../..

# Create Fastlane configuration
mkdir -p "$APP_DIR/fastlane"

cat > "$APP_DIR/fastlane/Fastfile" <<'EOF'
default_platform(:ios)

platform :ios do
  desc "Build and upload to TestFlight"
  lane :beta do
    increment_build_number
    build_app(scheme: ENV["APP_NAME"])
    upload_to_testflight(
      api_key_path: ENV["APPLE_API_KEY_PATH"],
      skip_waiting_for_build_processing: true
    )
  end
end

platform :android do
  desc "Build and upload to Play Store Beta"
  lane :beta do
    increment_version_code
    gradle(task: "bundle")
    upload_to_play_store(
      track: 'beta',
      json_key: ENV["GOOGLE_PLAY_SERVICE_ACCOUNT_JSON"]
    )
  end
end
EOF

# Create GitHub Actions workflow
mkdir -p "$APP_DIR/.github/workflows"

cat > "$APP_DIR/.github/workflows/deploy.yml" <<EOF
name: Deploy to App Stores

on:
  push:
    branches: [main, master]
  workflow_dispatch:

jobs:
  deploy-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm install
        
      - name: Install Fastlane
        run: gem install fastlane
        
      - name: Deploy to TestFlight
        env:
          APPLE_API_KEY_PATH: \${{ secrets.APPLE_API_KEY_PATH }}
          APPLE_DEVELOPER_TEAM_ID: \${{ secrets.APPLE_DEVELOPER_TEAM_ID }}
          APP_NAME: "$APP_NAME"
        run: fastlane ios beta
        
  deploy-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'
          
      - name: Install dependencies
        run: npm install
        
      - name: Install Fastlane
        run: gem install fastlane
        
      - name: Deploy to Play Store Beta
        env:
          GOOGLE_PLAY_SERVICE_ACCOUNT_JSON: \${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON }}
        run: fastlane android beta
EOF

# Create app metadata
cat > "$APP_DIR/metadata.json" <<EOF
{
  "name": "$APP_NAME",
  "bundle_id": "$BUNDLE_ID",
  "package_name": "$PACKAGE_NAME",
  "version": "1.0.0",
  "build_number": 1,
  "template": "$TEMPLATE",
  "created_at": "$TIMESTAMP",
  "status": "generated"
}
EOF

echo ""
echo "✅ App created successfully!"
echo ""
echo "📁 Location: $APP_DIR"
echo ""
echo "Next steps:"
echo "  1. cd $APP_DIR"
echo "  2. npm install (or flutter pub get)"
echo "  3. Test locally: npm start (or flutter run)"
echo "  4. Deploy: ../deploy-app.sh $APP_NAME ios"
echo ""
