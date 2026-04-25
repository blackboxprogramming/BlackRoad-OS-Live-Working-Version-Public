#!/bin/bash

# Quick fix for Vercel deployment
# The pricing page needed 'use client' directive for form actions

cd ~/services/web

echo "✅ Fixed: Added 'use client' to app/pricing/page.tsx"
echo ""
echo "📦 Committing and pushing..."
git add app/pricing/page.tsx
git commit -m "fix: add 'use client' to pricing page for form actions"
git push

echo ""
echo "🚀 Now redeploy to Vercel:"
echo "   npx vercel --prod"
echo ""
echo "This should fix the build error!"
