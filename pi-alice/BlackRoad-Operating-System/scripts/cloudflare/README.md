# Cloudflare DNS Management Scripts

This directory contains automation scripts for managing BlackRoad domains via the Cloudflare API.

## Scripts

### `sync_dns.py`
Synchronizes DNS records from `ops/domains.yaml` to Cloudflare. Handles creating new records and updating existing ones.

**Features:**
- Automated DNS record synchronization
- Dry-run mode to preview changes
- Colored output for easy scanning
- Support for multiple record types (A, CNAME, MX, TXT)
- Automatic proxying configuration

**Usage:**
```bash
# Set environment variables
export CF_API_TOKEN="your-cloudflare-api-token"
export CF_ZONE_ID="your-zone-id"

# Preview changes (dry run)
python scripts/cloudflare/sync_dns.py --dry-run

# Apply changes
python scripts/cloudflare/sync_dns.py

# Or with command-line arguments
python scripts/cloudflare/sync_dns.py \
  --token "your-token" \
  --zone-id "your-zone-id" \
  --zone-name "blackroad.systems"
```

### `validate_dns.py`
Validates DNS configuration and checks propagation status across the internet.

**Features:**
- DNS resolution verification
- SSL certificate validation
- HTTP/HTTPS accessibility testing
- Redirect verification (www → apex, HTTP → HTTPS)
- Support for checking multiple domains

**Usage:**
```bash
# Check single domain (default: blackroad.systems)
python scripts/cloudflare/validate_dns.py

# Check specific domain
python scripts/cloudflare/validate_dns.py --domain blackroad.ai

# Check all BlackRoad domains
python scripts/cloudflare/validate_dns.py --all

# DNS-only check (skip SSL and HTTP)
python scripts/cloudflare/validate_dns.py --dns-only
```

## Installation

### Prerequisites
- Python 3.8 or higher
- Cloudflare account with API token
- Domain(s) added to Cloudflare

### Install Dependencies

```bash
# Install required packages
pip install -r scripts/cloudflare/requirements.txt

# Or install individually
pip install requests pyyaml dnspython colorama
```

## Configuration

### Getting Cloudflare API Token

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **My Profile** → **API Tokens**
3. Click **Create Token**
4. Use the **Edit zone DNS** template
5. Select the zones you want to manage
6. Create token and copy it

### Getting Zone ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain (e.g., `blackroad.systems`)
3. Scroll down to **API** section on the right sidebar
4. Copy the **Zone ID**

### Environment Variables

```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
export CF_API_TOKEN="your-cloudflare-api-token-here"
export CF_ZONE_ID="your-zone-id-here"

# Or create a .env file (DO NOT COMMIT THIS)
echo "CF_API_TOKEN=your-token" >> .env
echo "CF_ZONE_ID=your-zone-id" >> .env
source .env
```

## Domain Configuration

DNS records are defined in `ops/domains.yaml`. Example:

```yaml
domains:
  - name: "blackroad.systems"
    type: "root"
    provider: "cloudflare"
    mode: "dns"
    record:
      type: "CNAME"
      value: "blackroad-os-production.up.railway.app"
      ttl: 1  # Auto
      proxied: true

  - name: "api.blackroad.systems"
    type: "subdomain"
    provider: "cloudflare"
    mode: "dns"
    record:
      type: "CNAME"
      value: "blackroad-os-production.up.railway.app"
      proxied: true
```

## Workflow

### Initial Migration

1. **Add domain to Cloudflare** (manual step via dashboard)
   ```
   - Go to Cloudflare → Add a site
   - Enter domain name
   - Choose Free plan
   - Follow setup wizard
   ```

2. **Update nameservers at registrar** (GoDaddy, etc.)
   ```
   - Copy nameservers from Cloudflare
   - Update at domain registrar
   - Wait 5-60 minutes for propagation
   ```

3. **Configure DNS records**
   ```bash
   # Update ops/domains.yaml with your records

   # Preview changes
   python scripts/cloudflare/sync_dns.py --dry-run

   # Apply changes
   python scripts/cloudflare/sync_dns.py
   ```

4. **Verify configuration**
   ```bash
   # Check DNS propagation
   python scripts/cloudflare/validate_dns.py

   # Or check specific domain
   python scripts/cloudflare/validate_dns.py --domain blackroad.systems
   ```

### Regular Updates

When updating DNS records:

1. Edit `ops/domains.yaml`
2. Run dry-run to preview: `python scripts/cloudflare/sync_dns.py --dry-run`
3. Apply changes: `python scripts/cloudflare/sync_dns.py`
4. Validate: `python scripts/cloudflare/validate_dns.py`

## Troubleshooting

### DNS Not Resolving

**Problem:** Domain doesn't resolve

**Solutions:**
```bash
# Check DNS with dig
dig blackroad.systems

# Check with validation script
python scripts/cloudflare/validate_dns.py --domain blackroad.systems

# Wait for propagation (5-60 minutes after nameserver change)
```

### API Authentication Errors

**Problem:** `401 Unauthorized` or `403 Forbidden`

**Solutions:**
- Verify API token is correct
- Check token has "Edit DNS" permission for the zone
- Ensure token hasn't expired
- Verify zone ID is correct

### Script Errors

**Problem:** Import errors or missing dependencies

**Solutions:**
```bash
# Install all dependencies
pip install -r scripts/cloudflare/requirements.txt

# Or install missing package
pip install <package-name>
```

### Configuration Drift

**Problem:** Cloudflare records don't match `domains.yaml`

**Solutions:**
```bash
# Run sync to update Cloudflare to match config
python scripts/cloudflare/sync_dns.py

# Or manually update records in Cloudflare dashboard
```

## Security Best Practices

1. **Never commit API tokens**
   - Add `.env` to `.gitignore`
   - Use environment variables
   - Rotate tokens periodically

2. **Use scoped tokens**
   - Create tokens with minimum required permissions
   - Use zone-specific tokens when possible
   - Avoid using Global API Key

3. **Audit regularly**
   - Review DNS records monthly
   - Check token usage in Cloudflare dashboard
   - Remove unused tokens

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Sync DNS Records

on:
  push:
    paths:
      - 'ops/domains.yaml'
    branches:
      - main

jobs:
  sync-dns:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: |
          pip install -r scripts/cloudflare/requirements.txt

      - name: Sync DNS records
        env:
          CF_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
          CF_ZONE_ID: ${{ secrets.CF_ZONE_ID }}
        run: |
          python scripts/cloudflare/sync_dns.py
```

Add secrets to GitHub:
```bash
gh secret set CF_API_TOKEN
gh secret set CF_ZONE_ID
```

## Additional Resources

- [Cloudflare API Documentation](https://developers.cloudflare.com/api/)
- [Cloudflare DNS Documentation](https://developers.cloudflare.com/dns/)
- [DNS Blueprint](../../infra/cloudflare/CLOUDFLARE_DNS_BLUEPRINT.md)
- [Domain Configuration](../../ops/domains.yaml)

## Support

For issues or questions:
- Check the [CLOUDFLARE_DNS_BLUEPRINT.md](../../infra/cloudflare/CLOUDFLARE_DNS_BLUEPRINT.md)
- Review Cloudflare dashboard for zone status
- Check script output for error messages
- Verify API token permissions

---

**Last Updated:** 2025-11-18
**Maintained by:** BlackRoad DevOps Team
