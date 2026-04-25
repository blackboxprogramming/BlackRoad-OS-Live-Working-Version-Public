#!/bin/bash
# BlackRoad OS - App Store Credentials Setup

set -e

echo "🏭 BlackRoad OS App Factory - Credentials Setup"
echo "================================================"

# Create config directory
mkdir -p config

# Apple Developer Setup
echo ""
echo "📱 APPLE DEVELOPER ACCOUNT SETUP"
echo "--------------------------------"
echo "1. Go to: https://developer.apple.com/account"
echo "2. Sign up for Apple Developer Program (\$99/year)"
echo "3. Create an App Store Connect API Key:"
echo "   - Go to: https://appstoreconnect.apple.com/access/api"
echo "   - Click 'Generate API Key'"
echo "   - Download the .p8 file"
echo ""
read -p "Enter your Apple Developer Team ID: " APPLE_TEAM_ID
read -p "Enter your API Key ID: " APPLE_KEY_ID
read -p "Enter path to .p8 file: " APPLE_KEY_PATH

# Save Apple credentials
cat > config/apple-credentials.json <<EOF
{
  "team_id": "$APPLE_TEAM_ID",
  "api_key_id": "$APPLE_KEY_ID",
  "api_key_path": "$APPLE_KEY_PATH",
  "bundle_id_prefix": "com.blackroados"
}
EOF

echo "✅ Apple credentials saved to config/apple-credentials.json"

# Google Play Setup
echo ""
echo "🤖 GOOGLE PLAY DEVELOPER ACCOUNT SETUP"
echo "---------------------------------------"
echo "1. Go to: https://play.google.com/console"
echo "2. Pay one-time \$25 registration fee"
echo "3. Create a Service Account:"
echo "   - Go to: https://console.cloud.google.com/iam-admin/serviceaccounts"
echo "   - Create new service account"
echo "   - Grant 'Service Account User' role"
echo "   - Download JSON key file"
echo ""
read -p "Enter path to Google Play service account JSON: " GOOGLE_JSON_PATH

# Save Google credentials
cat > config/google-play-credentials.json <<EOF
{
  "service_account_json": "$GOOGLE_JSON_PATH",
  "package_name_prefix": "com.blackroados"
}
EOF

echo "✅ Google Play credentials saved to config/google-play-credentials.json"

# GitHub Setup
echo ""
echo "🔧 GITHUB SECRETS SETUP"
echo "-----------------------"
echo "Add these secrets to your GitHub repository:"
echo ""
echo "APPLE_DEVELOPER_TEAM_ID=$APPLE_TEAM_ID"
echo "APPLE_API_KEY_ID=$APPLE_KEY_ID"
echo "APPLE_API_KEY_CONTENT=<paste contents of $APPLE_KEY_PATH>"
echo "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=<paste contents of $GOOGLE_JSON_PATH>"
echo ""
echo "Go to: https://github.com/<your-org>/<your-repo>/settings/secrets/actions"

# Create .env file
cat > .env <<EOF
APPLE_DEVELOPER_TEAM_ID=$APPLE_TEAM_ID
APPLE_API_KEY_ID=$APPLE_KEY_ID
APPLE_API_KEY_PATH=$APPLE_KEY_PATH
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=$GOOGLE_JSON_PATH
BLACKROAD_BUNDLE_ID_PREFIX=com.blackroados
EOF

echo ""
echo "✅ Environment variables saved to .env"
echo ""
echo "🎉 Setup complete! Ready to create apps."
echo ""
echo "Next steps:"
echo "  1. Run: ./generate-app.sh \"MyFirstApp\" react-native"
echo "  2. Deploy: ./deploy-app.sh MyFirstApp ios"
