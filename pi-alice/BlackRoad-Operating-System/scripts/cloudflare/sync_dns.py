#!/usr/bin/env python3
"""
Sync DNS records from ops/domains.yaml to Cloudflare

This script automates the migration and synchronization of DNS records
from the domain configuration file to Cloudflare. It handles:
- Creating new DNS records
- Updating existing DNS records
- Detecting and reporting configuration drift

Usage:
  export CF_API_TOKEN="your-cloudflare-api-token"
  export CF_ZONE_ID="your-zone-id"  # For blackroad.systems
  python scripts/cloudflare/sync_dns.py

  Or with command-line arguments:
  python scripts/cloudflare/sync_dns.py --zone-id <zone_id> --token <token>

Requirements:
  pip install requests pyyaml colorama
"""

import os
import sys
import argparse
import yaml
import requests
from typing import Dict, List, Optional
from datetime import datetime

try:
    from colorama import init, Fore, Style
    init()
    HAS_COLOR = True
except ImportError:
    HAS_COLOR = False
    # Fallback to no colors
    class Fore:
        GREEN = RED = YELLOW = CYAN = RESET = ""
    class Style:
        BRIGHT = RESET_ALL = ""

# Configuration
CF_API_BASE = "https://api.cloudflare.com/client/v4"
DOMAINS_FILE = "ops/domains.yaml"


def print_status(message: str, status: str = "info"):
    """Print colored status messages"""
    if status == "success":
        prefix = f"{Fore.GREEN}✓{Fore.RESET}"
    elif status == "error":
        prefix = f"{Fore.RED}✗{Fore.RESET}"
    elif status == "warning":
        prefix = f"{Fore.YELLOW}⚠{Fore.RESET}"
    else:
        prefix = f"{Fore.CYAN}ℹ{Fore.RESET}"

    print(f"{prefix} {message}")


def get_api_headers(api_token: str) -> Dict[str, str]:
    """Get headers for Cloudflare API requests"""
    return {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }


def load_domains() -> Dict:
    """Load domain configuration from ops/domains.yaml"""
    try:
        with open(DOMAINS_FILE) as f:
            return yaml.safe_load(f)
    except FileNotFoundError:
        print_status(f"Error: {DOMAINS_FILE} not found", "error")
        sys.exit(1)
    except yaml.YAMLError as e:
        print_status(f"Error parsing {DOMAINS_FILE}: {e}", "error")
        sys.exit(1)


def get_existing_records(zone_id: str, api_token: str) -> List[Dict]:
    """Fetch all DNS records for a zone"""
    url = f"{CF_API_BASE}/zones/{zone_id}/dns_records"
    headers = get_api_headers(api_token)

    all_records = []
    page = 1
    per_page = 100

    while True:
        params = {"page": page, "per_page": per_page}
        response = requests.get(url, headers=headers, params=params)

        if response.status_code != 200:
            print_status(f"Error fetching DNS records: {response.text}", "error")
            sys.exit(1)

        data = response.json()
        if not data.get("success"):
            print_status(f"API error: {data.get('errors')}", "error")
            sys.exit(1)

        records = data.get("result", [])
        all_records.extend(records)

        # Check if there are more pages
        result_info = data.get("result_info", {})
        if page * per_page >= result_info.get("total_count", 0):
            break

        page += 1

    return all_records


def create_dns_record(zone_id: str, api_token: str, record: Dict) -> Dict:
    """Create a DNS record"""
    url = f"{CF_API_BASE}/zones/{zone_id}/dns_records"
    headers = get_api_headers(api_token)

    response = requests.post(url, headers=headers, json=record)

    if response.status_code not in [200, 201]:
        print_status(f"Error creating DNS record: {response.text}", "error")
        return None

    data = response.json()
    if not data.get("success"):
        print_status(f"API error: {data.get('errors')}", "error")
        return None

    return data.get("result")


def update_dns_record(zone_id: str, api_token: str, record_id: str, record: Dict) -> Dict:
    """Update a DNS record"""
    url = f"{CF_API_BASE}/zones/{zone_id}/dns_records/{record_id}"
    headers = get_api_headers(api_token)

    response = requests.put(url, headers=headers, json=record)

    if response.status_code != 200:
        print_status(f"Error updating DNS record: {response.text}", "error")
        return None

    data = response.json()
    if not data.get("success"):
        print_status(f"API error: {data.get('errors')}", "error")
        return None

    return data.get("result")


def normalize_record_name(name: str, zone_name: str) -> str:
    """Normalize record name for comparison

    Cloudflare returns full domain names (e.g., 'blackroad.systems' or 'www.blackroad.systems')
    while config may use '@' for apex or just subdomain names.
    """
    if name == "@":
        return zone_name
    elif not name.endswith(zone_name):
        return f"{name}.{zone_name}"
    return name


def records_match(config_record: Dict, cf_record: Dict, zone_name: str) -> bool:
    """Check if a config record matches a Cloudflare record"""
    config_name = normalize_record_name(config_record.get("name", ""), zone_name)
    cf_name = cf_record.get("name", "")

    return (
        config_record.get("type") == cf_record.get("type") and
        config_name == cf_name and
        config_record.get("content") == cf_record.get("content")
    )


def sync_records(zone_id: str, api_token: str, zone_name: str, dry_run: bool = False):
    """Sync DNS records from domains.yaml to Cloudflare"""
    print_status(f"Starting DNS sync for zone: {zone_name}")
    print_status(f"Zone ID: {zone_id}")

    if dry_run:
        print_status("DRY RUN MODE - No changes will be made", "warning")

    # Load configuration
    config = load_domains()

    # Get existing records from Cloudflare
    print_status("Fetching existing DNS records from Cloudflare...")
    existing = get_existing_records(zone_id, api_token)
    print_status(f"Found {len(existing)} existing DNS records")

    # Build index of existing records
    existing_index = {}
    for record in existing:
        key = f"{record['type']}:{record['name']}"
        existing_index[key] = record

    # Process domains from config
    created = 0
    updated = 0
    skipped = 0
    errors = 0

    for domain in config.get("domains", []):
        # Only process domains configured for Cloudflare DNS mode
        if domain.get("provider") != "cloudflare" or domain.get("mode") != "dns":
            continue

        # Skip if no record config
        if "record" not in domain:
            print_status(f"Skipping {domain.get('name')}: No record configuration", "warning")
            continue

        # Extract domain name (handle both root and subdomain)
        domain_name = domain.get("name", "")

        # Build record data
        record_config = domain["record"]
        record_type = record_config.get("type", "CNAME")
        record_value = record_config.get("value", "")

        # Determine record name for Cloudflare
        # For root domains matching zone name, use "@"
        if domain_name == zone_name:
            record_name = "@"
        else:
            record_name = domain_name

        record_data = {
            "type": record_type,
            "name": record_name,
            "content": record_value,
            "ttl": record_config.get("ttl", 1),  # 1 = Auto
            "proxied": record_config.get("proxied", True)
        }

        # For MX records, add priority
        if record_type == "MX":
            record_data["priority"] = record_config.get("priority", 10)

        # Build key for lookup
        full_name = normalize_record_name(record_name, zone_name)
        key = f"{record_type}:{full_name}"

        # Check if record exists
        if key in existing_index:
            existing_record = existing_index[key]

            # Check if update is needed
            needs_update = (
                existing_record.get("content") != record_value or
                existing_record.get("proxied") != record_data.get("proxied")
            )

            if needs_update:
                print_status(f"Updating: {key} -> {record_value}", "warning")
                if not dry_run:
                    result = update_dns_record(zone_id, api_token, existing_record["id"], record_data)
                    if result:
                        updated += 1
                        print_status(f"  Updated successfully", "success")
                    else:
                        errors += 1
                else:
                    print_status(f"  [DRY RUN] Would update", "info")
                    updated += 1
            else:
                print_status(f"Unchanged: {key}", "info")
                skipped += 1
        else:
            # Create new record
            print_status(f"Creating: {key} -> {record_value}", "warning")
            if not dry_run:
                result = create_dns_record(zone_id, api_token, record_data)
                if result:
                    created += 1
                    print_status(f"  Created successfully", "success")
                else:
                    errors += 1
            else:
                print_status(f"  [DRY RUN] Would create", "info")
                created += 1

    # Summary
    print("\n" + "="*60)
    print_status("DNS Sync Complete!", "success")
    print("="*60)
    print(f"  {Fore.GREEN}Created:{Fore.RESET}   {created}")
    print(f"  {Fore.YELLOW}Updated:{Fore.RESET}   {updated}")
    print(f"  {Fore.CYAN}Unchanged:{Fore.RESET} {skipped}")
    print(f"  {Fore.RED}Errors:{Fore.RESET}    {errors}")
    print("="*60)

    if dry_run:
        print_status("This was a DRY RUN - no actual changes were made", "warning")
        print_status("Run without --dry-run to apply changes", "info")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Sync DNS records from ops/domains.yaml to Cloudflare"
    )
    parser.add_argument(
        "--token",
        help="Cloudflare API token (or set CF_API_TOKEN env var)"
    )
    parser.add_argument(
        "--zone-id",
        help="Cloudflare zone ID (or set CF_ZONE_ID env var)"
    )
    parser.add_argument(
        "--zone-name",
        default="blackroad.systems",
        help="Zone name (default: blackroad.systems)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be changed without making actual changes"
    )

    args = parser.parse_args()

    # Get credentials
    api_token = args.token or os.getenv("CF_API_TOKEN")
    zone_id = args.zone_id or os.getenv("CF_ZONE_ID")

    if not api_token:
        print_status("Error: CF_API_TOKEN environment variable or --token argument required", "error")
        print_status("Get your token at: https://dash.cloudflare.com/profile/api-tokens", "info")
        sys.exit(1)

    if not zone_id:
        print_status("Error: CF_ZONE_ID environment variable or --zone-id argument required", "error")
        print_status("Find your zone ID in the Cloudflare dashboard", "info")
        sys.exit(1)

    # Run sync
    try:
        sync_records(zone_id, api_token, args.zone_name, dry_run=args.dry_run)
    except KeyboardInterrupt:
        print("\n")
        print_status("Interrupted by user", "warning")
        sys.exit(1)
    except Exception as e:
        print_status(f"Unexpected error: {e}", "error")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
