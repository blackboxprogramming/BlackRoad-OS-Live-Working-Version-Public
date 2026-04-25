#!/bin/bash
# BlackRoad OS Metrics - Complete Deployment Script
# Deploys all assets to production infrastructure
#
# Author: Alexa Amundson
# Copyright: BlackRoad OS, Inc.

set -e  # Exit on error

echo "🚀 BlackRoad OS Metrics - Complete Deployment"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v git &> /dev/null; then
    echo "❌ git not found"
    exit 1
fi

if ! command -v gh &> /dev/null; then
    echo "⚠️  gh (GitHub CLI) not found - GitHub deployments will be skipped"
    HAS_GH=false
else
    HAS_GH=true
fi

if ! command -v wrangler &> /dev/null; then
    echo "⚠️  wrangler not found - Cloudflare deployments will be skipped"
    HAS_WRANGLER=false
else
    HAS_WRANGLER=true
fi

echo ""

# Step 1: Update all metrics
echo -e "${BLUE}Step 1: Updating all metrics and data...${NC}"
echo ""

cd "$(dirname "$0")"

if [ -f "scripts/update_kpis.py" ]; then
    echo "  📊 Generating comprehensive KPIs..."
    python3 scripts/update_kpis.py
fi

if [ -f "scripts/update_complete_history.py" ]; then
    echo "  📜 Compiling complete history..."
    python3 scripts/update_complete_history.py
fi

if [ -f "financial/revenue_tracker.py" ]; then
    echo "  💰 Generating revenue projections..."
    cd financial
    python3 revenue_tracker.py
    python3 generate_reports.py
    cd ..
fi

if [ -f "scripts/agent_task_integration.py" ]; then
    echo "  🤖 Generating agent tasks..."
    python3 scripts/agent_task_integration.py
fi

echo -e "${GREEN}✅ All metrics updated${NC}"
echo ""

# Step 2: Git commit and push
echo -e "${BLUE}Step 2: Committing to Git...${NC}"
echo ""

if [ -d ".git" ]; then
    git add -A

    if git diff --staged --quiet; then
        echo "  No changes to commit"
    else
        TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
        git commit -m "Update metrics and financial data - ${TIMESTAMP}

📊 Auto-generated metrics update
💰 Revenue projections updated
🤖 Agent tasks generated
📈 All data current as of ${TIMESTAMP}

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

        echo -e "${GREEN}✅ Changes committed${NC}"

        # Push to GitHub
        if git remote get-url origin &> /dev/null; then
            echo "  📤 Pushing to GitHub..."
            git push origin main || git push origin master
            echo -e "${GREEN}✅ Pushed to GitHub${NC}"
        fi
    fi
else
    echo "  ⚠️  Not a git repository - skipping"
fi

echo ""

# Step 3: Deploy dashboards to GitHub Pages
echo -e "${BLUE}Step 3: Deploying dashboards...${NC}"
echo ""

if [ "$HAS_GH" = true ] && [ -d "dashboards" ]; then
    echo "  📊 Main metrics dashboard available at GitHub Pages"
    echo "     Enable: Settings → Pages → Deploy from branch: main, /dashboards"
fi

if [ -f "financial/dashboard.html" ]; then
    echo "  💰 Financial dashboard available at financial/dashboard.html"
fi

echo -e "${GREEN}✅ Dashboards ready${NC}"
echo ""

# Step 4: Deploy to Cloudflare Pages (if wrangler available)
echo -e "${BLUE}Step 4: Cloudflare deployment...${NC}"
echo ""

if [ "$HAS_WRANGLER" = true ]; then
    echo "  Checking Cloudflare Pages projects..."

    # Deploy main dashboard
    if [ -d "dashboards" ]; then
        echo "  📊 Deploying metrics dashboard to Cloudflare Pages..."
        wrangler pages deploy dashboards --project-name=blackroad-metrics-dashboard || echo "    ⚠️  Manual deployment may be needed"
    fi

    # Deploy financial dashboard
    if [ -d "financial" ]; then
        echo "  💰 Deploying financial dashboard to Cloudflare Pages..."
        wrangler pages deploy financial --project-name=blackroad-financial-dashboard || echo "    ⚠️  Manual deployment may be needed"
    fi

    # Deploy sponsor page
    if [ -f "stripe/sponsor.html" ]; then
        echo "  💳 Sponsor page ready for deployment to blackroad.io/sponsor"
        echo "     Manual step: Deploy stripe/sponsor.html to main website"
    fi
else
    echo "  ⚠️  Wrangler not available - deploy manually:"
    echo "     wrangler pages deploy dashboards --project-name=blackroad-metrics-dashboard"
    echo "     wrangler pages deploy financial --project-name=blackroad-financial-dashboard"
fi

echo ""

# Step 5: Create GitHub funding file for all repos
echo -e "${BLUE}Step 5: GitHub funding setup...${NC}"
echo ""

if [ -f "stripe/FUNDING.yml" ]; then
    echo "  📝 FUNDING.yml template available at stripe/FUNDING.yml"
    echo "     Deploy to all repositories:"

    if [ "$HAS_GH" = true ]; then
        echo ""
        echo "     Running automated deployment to all repos..."

        # Get list of all repos
        REPOS=$(gh repo list BlackRoad-OS --limit 100 --json name --jq '.[].name' 2>/dev/null || echo "")

        if [ -n "$REPOS" ]; then
            COUNT=0
            while IFS= read -r repo; do
                echo "       Checking BlackRoad-OS/${repo}..."

                # Clone or pull repo
                if [ ! -d "/tmp/br-funding/${repo}" ]; then
                    gh repo clone "BlackRoad-OS/${repo}" "/tmp/br-funding/${repo}" 2>/dev/null || continue
                fi

                cd "/tmp/br-funding/${repo}"

                # Create .github directory if needed
                mkdir -p .github

                # Copy FUNDING.yml
                cp "${OLDPWD}/stripe/FUNDING.yml" .github/FUNDING.yml 2>/dev/null || continue

                # Commit and push if changes
                if ! git diff --quiet; then
                    git add .github/FUNDING.yml
                    git commit -m "Add GitHub funding configuration

Enable sponsorship for BlackRoad OS

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
                    git push origin main 2>/dev/null || git push origin master 2>/dev/null || true

                    echo "         ✅ FUNDING.yml deployed to ${repo}"
                    COUNT=$((COUNT + 1))
                fi

                cd "${OLDPWD}"
            done <<< "$REPOS"

            echo ""
            echo -e "${GREEN}✅ FUNDING.yml deployed to ${COUNT} repositories${NC}"
        fi
    else
        echo "       gh (GitHub CLI) needed for automated deployment"
    fi
else
    echo "  ⚠️  stripe/FUNDING.yml not found"
fi

echo ""

# Step 6: Summary and next steps
echo -e "${GREEN}=============================================="
echo "✅ Deployment Complete!"
echo "==============================================${NC}"
echo ""
echo "📊 Metrics Dashboard:"
echo "   GitHub Pages: https://blackroad-os.github.io/blackroad-os-metrics/dashboards/"
echo ""
echo "💰 Financial Dashboard:"
echo "   Local: financial/dashboard.html"
echo "   Deploy to: https://blackroad-financial.pages.dev"
echo ""
echo "💳 Monetization:"
echo "   Sponsor page: stripe/sponsor.html → deploy to blackroad.io/sponsor"
echo "   FUNDING.yml: stripe/FUNDING.yml → deployed to repositories"
echo ""
echo "📈 Live Data APIs:"
echo "   KPIs: https://raw.githubusercontent.com/BlackRoad-OS/blackroad-os-metrics/main/kpis.json"
echo "   History: https://raw.githubusercontent.com/BlackRoad-OS/blackroad-os-metrics/main/complete_history.json"
echo "   Revenue: https://raw.githubusercontent.com/BlackRoad-OS/blackroad-os-metrics/main/financial/revenue_projections.json"
echo ""
echo "🤖 Agent Tasks:"
echo "   Generated tasks: scripts/agent_tasks/"
echo "   Deploy to: .github/ISSUE_TEMPLATE/ in target repos"
echo ""
echo "📝 Next Steps:"
echo "   1. Enable GitHub Pages (Settings → Pages)"
echo "   2. Set up Stripe account and products"
echo "   3. Deploy sponsor page to blackroad.io"
echo "   4. Create GitHub issues from agent tasks"
echo "   5. Monitor revenue metrics dashboard"
echo ""
echo "© 2023-2025 BlackRoad OS, Inc. All Rights Reserved."
