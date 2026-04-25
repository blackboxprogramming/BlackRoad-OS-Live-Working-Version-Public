#!/bin/bash
# BlackRoad OS - Batch App Generator

set -e

echo "🏭 BlackRoad OS - Batch App Factory"
echo "===================================="
echo ""

# Example: Create 10 apps at once
APPS=(
  "BlackRoad Dashboard:react-native"
  "BlackRoad Metrics:react-native"
  "BlackRoad Operator:react-native"
  "BlackRoad Agent Hub:react-native"
  "BlackRoad Vault:react-native"
  "BlackRoad Analytics:flutter"
  "BlackRoad Monitor:flutter"
  "BlackRoad Control:react-native"
  "BlackRoad Prism:react-native"
  "BlackRoad Command:react-native"
)

echo "Creating ${#APPS[@]} apps..."
echo ""

for app_config in "${APPS[@]}"; do
  IFS=':' read -r app_name template <<< "$app_config"
  
  echo "📱 Generating: $app_name ($template)"
  ./generate-app.sh "$app_name" "$template"
  echo ""
done

echo "✅ Batch app generation complete!"
echo ""
echo "Generated apps:"
ls -1 apps/
echo ""
echo "Deploy all: ./deploy-all-apps.sh"
