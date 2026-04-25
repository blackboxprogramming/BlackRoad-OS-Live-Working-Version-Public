#!/usr/bin/env python3
"""
Cloudflare DNS Sync Script
===========================

Syncs DNS records from records.yaml to Cloudflare via API.
This script is idempotent - safe to run multiple times.

How to run:
-----------
1. Get your Cloudflare API token:
   - Go to Cloudflare dashboard → My Profile → API Tokens
   - Create token with "Zone.DNS" edit permissions
   - Copy the token

2. Get your zone IDs:
   - Go to each domain in Cloudflare dashboard
   - Copy the Zone ID from the Overview page (right sidebar)
   - Update records.yaml with the zone IDs

3. Set environment variables:
   export CF_API_TOKEN="your-cloudflare-api-token"

4. Run the script:
   python infra/cloudflare/cloudflare_dns_sync.py

Optional flags:
--------------
  --dry-run       Show what would change without making changes
  --domain NAME   Only sync specific domain (e.g., blackroad.systems)
  --phase N       Only sync domains in specific phase (1, 2, etc.)
  --delete-extra  Delete DNS records not in records.yaml (use carefully!)

Examples:
---------
  # Dry run (safe - shows changes without applying)
  python infra/cloudflare/cloudflare_dns_sync.py --dry-run

  # Sync only blackroad.systems
  python infra/cloudflare/cloudflare_dns_sync.py --domain blackroad.systems

  # Sync only Phase 1 domains
  python infra/cloudflare/cloudflare_dns_sync.py --phase 1

  # Sync and delete extra records (DANGEROUS - be careful!)
  python infra/cloudflare/cloudflare_dns_sync.py --delete-extra

Requirements:
------------
  pip install pyyaml requests

Author: BlackRoad OS Infrastructure Team
Version: 1.0
Date: 2025-11-18
"""

import os
import sys
import argparse
import logging
from typing import Dict, List, Tuple
from pathlib import Path

try:
    import yaml
except ImportError:
    print("Error: pyyaml is not installed. Run: pip install pyyaml")
    sys.exit(1)

try:
    import requests
except ImportError:
    print("Error: requests is not installed. Run: pip install requests")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Cloudflare API configuration
CF_API_BASE = "https://api.cloudflare.com/client/v4"
CF_API_TOKEN = os.getenv("CF_API_TOKEN")


class CloudflareAPI:
    """Simple wrapper for Cloudflare API calls."""

    def __init__(self, api_token: str):
        if not api_token:
            raise ValueError("CF_API_TOKEN environment variable not set")

        self.api_token = api_token
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        })

    def _request(self, method: str, endpoint: str, **kwargs) -> Dict:
        """Make a request to Cloudflare API."""
        url = f"{CF_API_BASE}{endpoint}"
        response = self.session.request(method, url, **kwargs)

        # Parse JSON response
        try:
            data = response.json()
        except ValueError:
            logger.error(f"Invalid JSON response from {url}")
            response.raise_for_status()
            return {}

        # Check for API errors
        if not data.get("success", False):
            errors = data.get("errors", [])
            error_msg = ", ".join([e.get("message", "Unknown error") for e in errors])
            logger.error(f"Cloudflare API error: {error_msg}")
            raise Exception(f"Cloudflare API error: {error_msg}")

        return data.get("result", {})

    def get_dns_records(self, zone_id: str) -> List[Dict]:
        """Get all DNS records for a zone."""
        logger.info(f"Fetching DNS records for zone {zone_id}")

        records = []
        page = 1
        per_page = 100

        while True:
            result = self._request(
                "GET",
                f"/zones/{zone_id}/dns_records",
                params={"page": page, "per_page": per_page}
            )

            if isinstance(result, list):
                records.extend(result)
                if len(result) < per_page:
                    break
                page += 1
            elif isinstance(result, dict):
                # Newer API returns paginated result
                records.extend(result.get("result", []))
                info = result.get("result_info", {})
                if info.get("page", 1) >= info.get("total_pages", 1):
                    break
                page += 1
            else:
                break

        logger.info(f"Found {len(records)} existing DNS records")
        return records

    def create_dns_record(self, zone_id: str, record: Dict) -> Dict:
        """Create a new DNS record."""
        logger.info(f"Creating {record['type']} record: {record['name']} → {record['content']}")
        return self._request("POST", f"/zones/{zone_id}/dns_records", json=record)

    def update_dns_record(self, zone_id: str, record_id: str, record: Dict) -> Dict:
        """Update an existing DNS record."""
        logger.info(f"Updating {record['type']} record: {record['name']} → {record['content']}")
        return self._request("PUT", f"/zones/{zone_id}/dns_records/{record_id}", json=record)

    def delete_dns_record(self, zone_id: str, record_id: str) -> Dict:
        """Delete a DNS record."""
        logger.warning(f"Deleting DNS record: {record_id}")
        return self._request("DELETE", f"/zones/{zone_id}/dns_records/{record_id}")


def load_records_config() -> List[Dict]:
    """Load DNS records from records.yaml."""
    config_path = Path(__file__).parent / "records.yaml"

    if not config_path.exists():
        logger.error(f"Config file not found: {config_path}")
        sys.exit(1)

    logger.info(f"Loading DNS configuration from {config_path}")

    with open(config_path, 'r') as f:
        data = yaml.safe_load(f)

    if not isinstance(data, list):
        logger.error("Invalid records.yaml format - expected list of domains")
        sys.exit(1)

    return data


def normalize_record_name(name: str, domain: str) -> str:
    """Normalize record name for comparison."""
    if name == '@':
        return domain
    elif name.endswith(f'.{domain}'):
        return name
    else:
        return f"{name}.{domain}"


def records_equal(r1: Dict, r2: Dict) -> bool:
    """Check if two DNS records are functionally equal."""
    # Compare essential fields
    if r1.get('type') != r2.get('type'):
        return False
    if r1.get('content') != r2.get('content'):
        return False
    if r1.get('proxied', False) != r2.get('proxied', False):
        return False

    # For MX records, also compare priority
    if r1.get('type') == 'MX':
        if r1.get('priority') != r2.get('priority'):
            return False

    return True


def build_cloudflare_record(record: Dict, domain: str) -> Dict:
    """Build a Cloudflare API record payload from our config format."""
    cf_record = {
        'type': record['type'],
        'name': normalize_record_name(record['name'], domain),
        'content': record['content'],
        'ttl': record.get('ttl', 1),
    }

    # Add proxied flag (not for MX, TXT, some others)
    if record['type'] in ['A', 'AAAA', 'CNAME']:
        cf_record['proxied'] = record.get('proxied', False)

    # Add priority for MX records
    if record['type'] == 'MX':
        cf_record['priority'] = record.get('priority', 10)

    # Add comment if supported (newer Cloudflare API)
    if 'comment' in record:
        cf_record['comment'] = record['comment']

    return cf_record


def sync_domain(
    api: CloudflareAPI,
    domain_config: Dict,
    dry_run: bool = False,
    delete_extra: bool = False
) -> Tuple[int, int, int, int]:
    """
    Sync DNS records for a single domain.
    Returns: (created, updated, deleted, unchanged) counts
    """
    domain = domain_config['domain']
    zone_id = domain_config.get('zone_id', '')
    desired_records = domain_config.get('records', [])

    logger.info(f"\n{'='*60}")
    logger.info(f"Syncing domain: {domain}")
    logger.info(f"Zone ID: {zone_id}")
    logger.info(f"Desired records: {len(desired_records)}")
    logger.info(f"{'='*60}")

    if not zone_id or 'REPLACE' in zone_id:
        logger.error(f"Skipping {domain} - Zone ID not configured in records.yaml")
        return (0, 0, 0, 0)

    # Get existing records from Cloudflare
    try:
        existing_records = api.get_dns_records(zone_id)
    except Exception as e:
        logger.error(f"Failed to fetch DNS records for {domain}: {e}")
        return (0, 0, 0, 0)

    # Build index of existing records
    existing_index = {}
    for record in existing_records:
        key = f"{record['type']}:{record['name']}"
        existing_index[key] = record

    # Track changes
    created = 0
    updated = 0
    deleted = 0
    unchanged = 0

    # Process desired records
    for desired_record in desired_records:
        cf_record = build_cloudflare_record(desired_record, domain)
        record_type = cf_record['type']
        record_name = cf_record['name']
        key = f"{record_type}:{record_name}"

        if key in existing_index:
            # Record exists - check if update needed
            existing = existing_index[key]

            if records_equal(cf_record, existing):
                logger.debug(f"✓ Unchanged: {key}")
                unchanged += 1
            else:
                logger.info(f"↻ Update needed: {key}")
                logger.info(f"  Current: {existing.get('content')}")
                logger.info(f"  Desired: {cf_record.get('content')}")

                if not dry_run:
                    try:
                        api.update_dns_record(zone_id, existing['id'], cf_record)
                        updated += 1
                    except Exception as e:
                        logger.error(f"Failed to update {key}: {e}")
                else:
                    logger.info(f"  [DRY RUN] Would update record")
                    updated += 1

            # Mark as processed
            del existing_index[key]
        else:
            # Record doesn't exist - create it
            logger.info(f"+ Create needed: {key}")

            if not dry_run:
                try:
                    api.create_dns_record(zone_id, cf_record)
                    created += 1
                except Exception as e:
                    logger.error(f"Failed to create {key}: {e}")
            else:
                logger.info(f"  [DRY RUN] Would create record")
                created += 1

    # Handle extra records not in config
    if existing_index:
        logger.info(f"\nFound {len(existing_index)} extra records not in config:")
        for key, record in existing_index.items():
            logger.info(f"  - {key} → {record.get('content')}")

        if delete_extra:
            logger.warning("Deleting extra records (--delete-extra flag set)")
            for key, record in existing_index.items():
                if not dry_run:
                    try:
                        api.delete_dns_record(zone_id, record['id'])
                        deleted += 1
                    except Exception as e:
                        logger.error(f"Failed to delete {key}: {e}")
                else:
                    logger.warning(f"  [DRY RUN] Would delete {key}")
                    deleted += 1
        else:
            logger.info("  (Use --delete-extra to remove these records)")

    # Summary
    logger.info(f"\nSummary for {domain}:")
    logger.info(f"  Created:   {created}")
    logger.info(f"  Updated:   {updated}")
    logger.info(f"  Deleted:   {deleted}")
    logger.info(f"  Unchanged: {unchanged}")

    return (created, updated, deleted, unchanged)


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Sync DNS records from records.yaml to Cloudflare",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would change without making changes"
    )
    parser.add_argument(
        "--domain",
        type=str,
        help="Only sync specific domain (e.g., blackroad.systems)"
    )
    parser.add_argument(
        "--phase",
        type=int,
        choices=[1, 2, 3],
        help="Only sync domains in specific phase"
    )
    parser.add_argument(
        "--delete-extra",
        action="store_true",
        help="Delete DNS records not in records.yaml (use carefully!)"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging"
    )

    args = parser.parse_args()

    if args.verbose:
        logger.setLevel(logging.DEBUG)

    if args.dry_run:
        logger.info("🔍 DRY RUN MODE - No changes will be made\n")

    # Load configuration
    try:
        domains = load_records_config()
    except Exception as e:
        logger.error(f"Failed to load configuration: {e}")
        sys.exit(1)

    # Initialize API client
    try:
        api = CloudflareAPI(CF_API_TOKEN)
    except ValueError as e:
        logger.error(str(e))
        logger.error("\nTo get your Cloudflare API token:")
        logger.error("1. Go to Cloudflare dashboard → My Profile → API Tokens")
        logger.error("2. Create token with 'Zone.DNS' edit permissions")
        logger.error("3. Set environment variable: export CF_API_TOKEN='your-token'")
        sys.exit(1)

    # Filter domains
    filtered_domains = []
    for domain_config in domains:
        # Filter by specific domain
        if args.domain and domain_config['domain'] != args.domain:
            continue

        # Filter by phase
        if args.phase and domain_config.get('phase') != args.phase:
            continue

        filtered_domains.append(domain_config)

    if not filtered_domains:
        logger.warning("No domains matched your filters")
        sys.exit(0)

    logger.info(f"Processing {len(filtered_domains)} domain(s)\n")

    # Sync each domain
    total_created = 0
    total_updated = 0
    total_deleted = 0
    total_unchanged = 0

    for domain_config in filtered_domains:
        created, updated, deleted, unchanged = sync_domain(
            api,
            domain_config,
            dry_run=args.dry_run,
            delete_extra=args.delete_extra
        )

        total_created += created
        total_updated += updated
        total_deleted += deleted
        total_unchanged += unchanged

    # Final summary
    logger.info(f"\n{'='*60}")
    logger.info("OVERALL SUMMARY")
    logger.info(f"{'='*60}")
    logger.info(f"Domains processed: {len(filtered_domains)}")
    logger.info(f"Records created:   {total_created}")
    logger.info(f"Records updated:   {total_updated}")
    logger.info(f"Records deleted:   {total_deleted}")
    logger.info(f"Records unchanged: {total_unchanged}")
    logger.info(f"{'='*60}")

    if args.dry_run:
        logger.info("\n🔍 This was a DRY RUN - no changes were made")
        logger.info("Run without --dry-run to apply changes")
    else:
        logger.info("\n✅ DNS sync complete!")

    sys.exit(0)


if __name__ == "__main__":
    main()
