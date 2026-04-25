# Cloudflare Bootstrap

This bootstrap configures Cloudflare zones, DNS records, tunnels, and Access apps with least-privilege tokens. It writes secrets (tunnel credentials and Access service tokens) to `.secrets/cloudflare/` and never commits them.

## Security Model

- Separate environments (`dev`, `prod`) with distinct zones or subdomains.
- Read token for audit and discovery; write token for changes.
- Access policies are allowlist-based using `CF_ACCESS_ALLOWED_EMAILS`.
- Service tokens are created for non-interactive access and stored locally.

## Required Tokens and Scopes

Create API tokens in Cloudflare with only the needed permissions:

Read token:
- Zone: Read

Write token:
- Zone: DNS: Edit
- Account: Cloudflare Tunnel: Edit
- Account: Access: Apps and Policies: Edit
- Account: Access: Service Tokens: Edit

## Files

- `cloudflare/dns.dev.json` and `cloudflare/dns.prod.json`: DNS record definitions (JSON array)
- `cloudflare/tunnel.template.yml`: reference layout for cloudflared config
- `cloudflare/tunnel.dev.routes` and `cloudflare/tunnel.prod.routes`: optional hostname-to-service mappings

Routes file format:

```
api.dev.blackroad.io http://localhost:3000
agents.dev.blackroad.io http://localhost:3030
```

If no routes file exists, the script uses `CF_DOMAIN_DEV` or `CF_DOMAIN_PROD` with default ports.

## Run

```bash
cloudflared login
./cloudflare/setup-cloudflare.sh all
```

## Environment Variables

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN` (write)
- `CLOUDFLARE_API_TOKEN_READ` (optional)
- `CF_ZONE_NAME_DEV`, `CF_ZONE_NAME_PROD` or `CF_ZONE_ID_DEV`, `CF_ZONE_ID_PROD`
- `CF_DOMAIN_DEV`, `CF_DOMAIN_PROD`
- `CF_TUNNEL_NAME_DEV`, `CF_TUNNEL_NAME_PROD`
- `CF_ACCESS_ALLOWED_EMAILS`
- `CF_ACCESS_APP_DOMAIN_DEV`, `CF_ACCESS_APP_DOMAIN_PROD`

The script writes `CF_ZONE_ID_*` to `.secrets/cloudflare/zone-ids.env` after successful setup.
