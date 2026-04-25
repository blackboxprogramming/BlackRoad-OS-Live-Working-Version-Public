#!/bin/bash
# Refresh Cloudflare OAuth token and update stats-proxy service
# Runs on Mac, pushes fresh token to all Pis

CLIENT_ID="54d11594-84e4-41aa-b438-e81b8fa78ee7"
TOKEN_URL="https://dash.cloudflare.com/oauth2/token"
WRANGLER_CONFIG="$HOME/.wrangler/config/default.toml"

# Get current refresh token
REFRESH_TOKEN=$(grep 'refresh_token' "$WRANGLER_CONFIG" | cut -d'"' -f2)

if [ -z "$REFRESH_TOKEN" ]; then
    echo "ERROR: No refresh token found"
    exit 1
fi

# Refresh the token
RESPONSE=$(curl -s -X POST "$TOKEN_URL" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=refresh_token&refresh_token=$REFRESH_TOKEN&client_id=$CLIENT_ID" 2>/dev/null)

NEW_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)
NEW_REFRESH=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('refresh_token',''))" 2>/dev/null)

if [ -z "$NEW_TOKEN" ]; then
    echo "ERROR: Token refresh failed"
    echo "$RESPONSE"
    exit 1
fi

echo "Token refreshed: ${NEW_TOKEN:0:20}..."

# Update wrangler config
python3 -c "
import re
with open('$WRANGLER_CONFIG') as f: c = f.read()
c = re.sub(r'oauth_token = \"[^\"]+\"', 'oauth_token = \"$NEW_TOKEN\"', c)
c = re.sub(r'refresh_token = \"[^\"]+\"', 'refresh_token = \"$NEW_REFRESH\"', c)
with open('$WRANGLER_CONFIG', 'w') as f: f.write(c)
"

# Push to all Pis
for node in "blackroad@192.168.4.96" "pi@192.168.4.97" "pi@192.168.4.49"; do
    ip=$(echo $node | cut -d@ -f2)
    ssh -o ConnectTimeout=5 $node "sudo sed -i 's|CF_API_TOKEN=.*|CF_API_TOKEN=$NEW_TOKEN|' /etc/systemd/system/stats-proxy.service && sudo systemctl daemon-reload && sudo systemctl restart stats-proxy" 2>/dev/null && \
        echo "  Updated $ip" || echo "  Failed $ip"
done

echo "$(date -u '+%Y-%m-%dT%H:%M:%SZ') Token refreshed and distributed"
