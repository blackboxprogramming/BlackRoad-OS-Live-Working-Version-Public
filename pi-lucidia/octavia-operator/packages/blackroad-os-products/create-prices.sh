#!/bin/bash
# Create prices for the 3 main BlackRoad products

echo "Creating prices for BlackRoad Products..."
echo ""

# RoadWork - $9/month
echo "Creating RoadWork price (\$9/month)..."
stripe prices create \
  --product prod_devops_suite \
  --unit-amount 900 \
  --currency usd \
  --recurring[interval]=month \
  --nickname "RoadWork Education - \$9/month"

# PitStop - $29/month
echo "Creating PitStop price (\$29/month)..."
stripe prices create \
  --product prod_devops_suite \
  --unit-amount 2900 \
  --currency usd \
  --recurring[interval]=month \
  --nickname "PitStop DevOps - \$29/month"

# Canvas Studio - FREE (price ID for upgrades later)
echo "Creating Canvas Studio FREE tier..."
stripe prices create \
  --product prod_ai_studio \
  --unit-amount 0 \
  --currency usd \
  --recurring[interval]=month \
  --nickname "Canvas Studio - FREE"

echo ""
echo "✅ Prices created! View at: https://dashboard.stripe.com/test/prices"
