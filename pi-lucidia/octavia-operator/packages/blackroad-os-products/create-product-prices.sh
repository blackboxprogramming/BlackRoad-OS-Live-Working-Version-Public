#!/bin/bash

echo "🎯 Creating Stripe Prices for BlackRoad Products..."
echo ""

# RoadWork - $9/month (using devops_suite product for now)
echo "1. RoadWork - $9/month"
stripe prices create \
  --product prod_devops_suite \
  --unit-amount 900 \
  --currency usd \
  --recurring interval=month \
  --lookup-key roadwork_monthly \
  --nickname "RoadWork Monthly - AI Tutoring"

# PitStop - $29/month
echo "2. PitStop Starter - $29/month"
stripe prices create \
  --product prod_devops_suite \
  --unit-amount 2900 \
  --currency usd \
  --recurring interval=month \
  --lookup-key pitstop_starter \
  --nickname "PitStop Starter - DevOps Dashboard"

# PitStop Pro - $99/month
echo "3. PitStop Pro - $99/month"
stripe prices create \
  --product prod_devops_suite \
  --unit-amount 9900 \
  --currency usd \
  --recurring interval=month \
  --lookup-key pitstop_pro \
  --nickname "PitStop Pro - Enterprise DevOps"

# Lucidia - $29/month
echo "4. Lucidia - $29/month"
stripe prices create \
  --product prod_ai_studio \
  --unit-amount 2900 \
  --currency usd \
  --recurring interval=month \
  --lookup-key lucidia_monthly \
  --nickname "Lucidia - Personal AI Companion"

echo ""
echo "✅ All prices created!"
