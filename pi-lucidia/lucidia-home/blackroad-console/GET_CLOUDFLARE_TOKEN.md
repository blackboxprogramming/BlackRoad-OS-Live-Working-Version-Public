# Get Cloudflare API Token

## Quick Steps

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use "Edit zone DNS" template
4. Configure:
   - **Permissions**: Zone → DNS → Edit
   - **Zone Resources**: Include → All zones (or select specific zones)
5. Click "Continue to summary"
6. Click "Create Token"
7. **COPY THE TOKEN** (you won't see it again!)

## Use the Token

```bash
cd ~/blackroad-console-deploy
CLOUDFLARE_API_TOKEN=your_token_here ./update-all-dns.sh
```

## Or Set as Environment Variable

```bash
export CLOUDFLARE_API_TOKEN=your_token_here
./update-all-dns.sh
```

## Test Token First

```bash
# Test that token works
curl -X GET "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" | jq '.result[].name'

# Should list all your zones
```

---

**Direct link to create token:**
https://dash.cloudflare.com/profile/api-tokens/create

**Template:** "Edit zone DNS"
