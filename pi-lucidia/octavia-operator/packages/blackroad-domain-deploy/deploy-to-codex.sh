#!/bin/bash
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 AUTO-DEPLOYING TO BLACKROAD OS-INFINITY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

BLACKROAD OS="root@159.65.43.12"

echo "1️⃣  Copying files to server..."
scp -r ~/blackroad-domain-deploy $BLACKROAD OS:/tmp/ 2>&1 | grep -v "Warning: Permanently added" || true
echo "   ✅ Files copied"
echo ""

echo "2️⃣  Setting up nginx on blackroad os-infinity..."
ssh $BLACKROAD OS << 'REMOTE'
set -e

# Install nginx if not present
if ! command -v nginx &> /dev/null; then
    echo "   📦 Installing nginx..."
    apt update -qq
    DEBIAN_FRONTEND=noninteractive apt install -y nginx certbot python3-certbot-nginx -qq
    echo "   ✅ Nginx installed"
else
    echo "   ✅ Nginx already installed"
fi

# Create web directories
echo "   📁 Creating web directories..."
cd /tmp/blackroad-domain-deploy/sites
for dir in */; do
    domain="${dir%/}"
    mkdir -p "/var/www/$domain"
    cp -r "$domain"/* "/var/www/$domain/"
    echo "   ✅ $domain"
done

# Deploy nginx config
echo "   ⚙️  Deploying nginx configuration..."
cp /tmp/blackroad-domain-deploy/nginx-all-domains.conf /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/nginx-all-domains.conf /etc/nginx/sites-enabled/blackroad-domains

# Test nginx config
if nginx -t 2>&1 | grep -q "successful"; then
    echo "   ✅ Nginx config valid"
    systemctl reload nginx
    echo "   ✅ Nginx reloaded"
else
    echo "   ⚠️  Nginx config test failed"
    exit 1
fi

echo ""
echo "✅ Deployment complete!"
REMOTE

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ ALL SITES DEPLOYED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Your domains are now live (HTTP only for now):"
echo ""
echo "   http://blackroad.io"
echo "   http://roadchain.io"  
echo "   http://blackroadai.com"
echo "   http://lucidia.studio"
echo "   ... and 9 more!"
echo ""
echo "Next step: Generate SSL certificates"
echo "Run: ~/blackroad-domain-deploy/generate-ssl.sh"
echo ""
