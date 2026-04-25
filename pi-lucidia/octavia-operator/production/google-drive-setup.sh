#!/usr/bin/env bash

# BlackRoad OS — Google Drive Setup
# Sets up Google Drive integration for file storage, content pipeline, and assets
#
# Prerequisites:
# 1. Google Cloud project with Drive API enabled
# 2. Service account with Drive API access
# 3. Service account JSON key file
#
# Usage:
#   ./production/google-drive-setup.sh <path-to-service-account-key.json>

set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
AMBER='\033[38;5;214m'
PINK='\033[38;5;205m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

SA_KEY_FILE="${1:-}"
BR_DIR="$HOME/.blackroad"
SA_DEST="$BR_DIR/google-sa.json"

echo -e "${AMBER}${BOLD}BlackRoad OS — Google Drive Setup${NC}"
echo ""

# ─── Step 1: Service Account Key ───
if [[ -z "$SA_KEY_FILE" ]]; then
  echo -e "${PINK}Google Drive Integration Setup${NC}"
  echo ""
  echo "This script configures Google Drive for:"
  echo "  - File storage and asset management"
  echo "  - Photo backgrounds for templates"
  echo "  - Content pipeline (Docs, Sheets extraction)"
  echo "  - n8n/Airbyte/Activepieces automation"
  echo ""
  echo -e "${AMBER}Setup Steps:${NC}"
  echo ""
  echo "1. Go to Google Cloud Console:"
  echo "   https://console.cloud.google.com/"
  echo ""
  echo "2. Create a project (or select existing):"
  echo "   Project name: blackroad-os-production"
  echo ""
  echo "3. Enable APIs:"
  echo "   - Google Drive API"
  echo "   - Google Sheets API"
  echo "   - Google Docs API"
  echo ""
  echo "4. Create a Service Account:"
  echo "   IAM & Admin > Service Accounts > Create"
  echo "   Name: blackroad-drive-service"
  echo "   Role: Editor"
  echo ""
  echo "5. Create a JSON key:"
  echo "   Service Account > Keys > Add Key > JSON"
  echo "   Save the downloaded file"
  echo ""
  echo "6. Share your Google Drive folder:"
  echo "   Right-click folder > Share"
  echo "   Add the service account email (from the JSON key)"
  echo "   Give it Editor access"
  echo ""
  echo "7. Run this script again:"
  echo "   ./production/google-drive-setup.sh path/to/your-key.json"
  echo ""
  exit 0
fi

if [[ ! -f "$SA_KEY_FILE" ]]; then
  echo -e "${RED}File not found: $SA_KEY_FILE${NC}"
  exit 1
fi

# Validate JSON
if ! python3 -c "import json; json.load(open('$SA_KEY_FILE'))" 2>/dev/null; then
  echo -e "${RED}Invalid JSON file: $SA_KEY_FILE${NC}"
  exit 1
fi

# Extract service account email
SA_EMAIL=$(python3 -c "import json; print(json.load(open('$SA_KEY_FILE'))['client_email'])" 2>/dev/null)
PROJECT_ID=$(python3 -c "import json; print(json.load(open('$SA_KEY_FILE'))['project_id'])" 2>/dev/null)

echo -e "${GREEN}Valid service account key:${NC}"
echo -e "  Email:   $SA_EMAIL"
echo -e "  Project: $PROJECT_ID"
echo ""

# ─── Step 2: Install Key ───
mkdir -p "$BR_DIR"
cp "$SA_KEY_FILE" "$SA_DEST"
chmod 600 "$SA_DEST"
echo -e "${GREEN}Key installed to: $SA_DEST${NC}"

# ─── Step 3: Generate Base64 ───
B64=$(base64 -w 0 "$SA_DEST" 2>/dev/null || base64 "$SA_DEST" 2>/dev/null | tr -d '\n')
echo ""
echo -e "${PINK}Base64-encoded key for environment variables:${NC}"
echo ""
echo "GOOGLE_SERVICE_ACCOUNT_KEY_BASE64=$B64"
echo ""

# ─── Step 4: Set in providers ───
echo -e "${PINK}━━━ Set in deployment providers ━━━${NC}"
echo ""
echo "# Railway:"
echo "railway variables set GOOGLE_SERVICE_ACCOUNT_KEY_BASE64='$B64'"
echo ""
echo "# GitHub Actions (org-level):"
echo "gh secret set GOOGLE_SERVICE_ACCOUNT_KEY --body '$B64' --org BlackRoad-OS-Inc"
echo ""
echo "# Cloudflare Workers:"
echo "echo '$B64' | wrangler secret put GOOGLE_SERVICE_ACCOUNT_KEY"
echo ""

# ─── Step 5: Drive folder setup ───
echo -e "${PINK}━━━ Google Drive Folder Structure ━━━${NC}"
echo ""
echo "Create these folders in Google Drive and share with: $SA_EMAIL"
echo ""
echo "BlackRoad-OS-Production/"
echo "  ├── assets/"
echo "  │   ├── logos/"
echo "  │   ├── backgrounds/"
echo "  │   ├── icons/"
echo "  │   └── screenshots/"
echo "  ├── templates/"
echo "  │   ├── email/"
echo "  │   ├── docs/"
echo "  │   └── presentations/"
echo "  ├── content/"
echo "  │   ├── blog-posts/"
echo "  │   ├── documentation/"
echo "  │   └── marketing/"
echo "  ├── exports/"
echo "  │   ├── analytics/"
echo "  │   ├── reports/"
echo "  │   └── backups/"
echo "  └── shared/"
echo "      ├── team/"
echo "      └── public/"
echo ""

echo -e "${GREEN}${BOLD}Google Drive setup complete.${NC}"
echo ""
echo "Next steps:"
echo "  1. Share the Drive folder with: $SA_EMAIL"
echo "  2. Copy the folder ID from the URL"
echo "  3. Set GOOGLE_DRIVE_FOLDER_ID in your .env"
echo "  4. Set the base64 key in Railway/GitHub/Cloudflare"
