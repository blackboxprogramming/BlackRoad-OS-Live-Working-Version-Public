#!/usr/bin/env python3
"""
apply_domains.py

Reads ops/domains.yaml and ensures that each domain’s DNS/forwarding
Reads ops/domains.yaml and ensures that each domain's DNS/forwarding
settings are correctly applied via GoDaddy and Cloudflare APIs.
This script is designed to be idempotent: re-running it will not create
duplicate records.

Requirements:
    - PyYAML (for parsing YAML)
    - requests (for HTTP calls)

Environment variables:
    GODADDY_API_KEY, GODADDY_API_SECRET  -- GoDaddy API credentials
    CLOUDFLARE_TOKEN                     -- Cloudflare API token with DNS write permission
    CLOUDFLARE_ACCOUNT_ID (optional)    -- Cloudflare account ID if needed
"""

import os
import sys
import yaml
import requests
from urllib.parse import urlparse

CONFIG_PATH = os.path.join("ops", "domains.yaml")

# Helpers for GoDaddy
GODADDY_BASE_URL = "https://api.godaddy.com/v1"

def godaddy_headers():
    key = os.getenv("GODADDY_API_KEY")
    secret = os.getenv("GODADDY_API_SECRET")
    if not key or not secret:
        raise EnvironmentError("Missing GoDaddy API credentials. Set GODADDY_API_KEY and GODADDY_API_SECRET.")
    return {
        "Authorization": f"sso-key {key}:{secret}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

def parse_domain_name(domain):
    """
    Return (root_domain, subdomain) tuple.
    For root domains, subdomain is '@'.
    """
    parts = domain.split(".")
    if len(parts) <= 2:
        return domain, "@"
    # e.g. 'os.blackroad.systems' => root 'blackroad.systems', sub 'os'
    root = ".".join(parts[-2:])
    sub = ".".join(parts[:-2])
    return root, sub

def update_godaddy_forward(domain_entry):
    """Apply forwarding for a domain using GoDaddy API."""
    name = domain_entry["name"]
    forward_to = domain_entry["forward_to"]
    status_code = domain_entry.get("forwarding_type", 301)

    root_domain, sub = parse_domain_name(name)
    url = f"{GODADDY_BASE_URL}/domains/{root_domain}/forwarding"
    headers = godaddy_headers()

    # Build forwarding payload
    payload = {"forwarding": {}}
    if sub == "@":
        payload["forwarding"]["domain"] = {
            "forwardTo": forward_to,
            "redirectType": "permanent" if status_code == 301 else "temporary",
            "allowSubdomains": True
        }
    else:
        payload["forwarding"]["subdomain"] = [
            {
                "subdomain": sub,
                "forwardTo": forward_to,
                "redirectType": "permanent" if status_code == 301 else "temporary"
            }
        ]

    # Check existing forwarding settings
    try:
        resp = requests.get(url, headers=headers)
        resp.raise_for_status()
        current = resp.json()
    except requests.HTTPError as e:
        print(f"Failed to fetch current forwarding for {name}: {e}")
        current = {}

    def forwarding_needs_update():
        # Compare desired vs. current
        if sub == "@":
            desired = payload["forwarding"].get("domain")
            current_domain = current.get("domain", {})
            return not current_domain or current_domain.get("forwardTo") != desired["forwardTo"]
        else:
            desired = payload["forwarding"]["subdomain"][0]
            sub_list = current.get("subdomain", [])
            for item in sub_list:
                if item.get("subdomain") == sub and item.get("forwardTo") == desired["forwardTo"]:
                    return False
            return True

    if forwarding_needs_update():
        print(f"Updating forwarding for {name} -> {forward_to}")
        try:
            resp = requests.put(url, headers=headers, json=payload)
            resp.raise_for_status()
        except requests.HTTPError as e:
            print(f"Error updating forwarding for {name}: {e}")
    else:
        print(f"No forwarding changes needed for {name}")

def update_godaddy_dns_record(domain_entry):
    """Ensure DNS record exists for GoDaddy domain."""
    full_name = domain_entry["name"]
    record = domain_entry["record"]
    record_type = record["type"].upper()
    record_value = record["value"]

    root_domain, sub = parse_domain_name(full_name)
    headers = godaddy_headers()

    # Get current records
    get_url = f"{GODADDY_BASE_URL}/domains/{root_domain}/records/{record_type}/{sub}"
    try:
        resp = requests.get(get_url, headers=headers)
        resp.raise_for_status()
        current_records = resp.json() or []
    except requests.HTTPError as e:
        print(f"Error fetching current records for {full_name}: {e}")
        current_records = []

    current_data = [rec.get("data") for rec in current_records]
    if record_value in current_data:
        print(f"{full_name}: DNS record already set to {record_value}")
        return

    # Prepare new record payload
    payload = [{"data": record_value, "ttl": 600}]
    put_url = f"{GODADDY_BASE_URL}/domains/{root_domain}/records/{record_type}/{sub}"

    print(f"Updating DNS record for {full_name}: {record_type} -> {record_value}")
    try:
        resp = requests.put(put_url, headers=headers, json=payload)
        resp.raise_for_status()
    except requests.HTTPError as e:
        print(f"Error updating DNS record for {full_name}: {e}")

# Helpers for Cloudflare
CLOUDFLARE_API = "https://api.cloudflare.com/client/v4"

def cf_headers():
    token = os.getenv("CLOUDFLARE_TOKEN")
    if not token:
        raise EnvironmentError("Missing Cloudflare API token. Set CLOUDFLARE_TOKEN.")
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

def get_cf_zone_id(root_domain):
    """Return zone_id for a domain via Cloudflare API."""
    params = {"name": root_domain, "status": "active"}
    try:
        resp = requests.get(f"{CLOUDFLARE_API}/zones", headers=cf_headers(), params=params)
        resp.raise_for_status()
        data = resp.json()
    except requests.HTTPError as e:
        print(f"Error retrieving Cloudflare zone for {root_domain}: {e}")
        return None
    result = data.get("result", [])
    if not result:
        print(f"No active Cloudflare zone found for {root_domain}")
        return None
    return result[0]["id"]

def update_cloudflare_dns_record(domain_entry):
    """Create or update a DNS record on Cloudflare."""
    full_name = domain_entry["name"]
    record = domain_entry["record"]
    record_type = record["type"].upper()
    record_value = record["value"]

    root_domain, sub = parse_domain_name(full_name)
    zone_id = get_cf_zone_id(root_domain)
    if not zone_id:
        return

    # Determine the record name field expected by CF (full domain)
    record_name = full_name

    # List existing records to find match
    try:
        resp = requests.get(f"{CLOUDFLARE_API}/zones/{zone_id}/dns_records",
                            headers=cf_headers(),
                            params={"type": record_type, "name": record_name})
        resp.raise_for_status()
        results = resp.json().get("result", [])
    except requests.HTTPError as e:
        print(f"Error listing Cloudflare records for {full_name}: {e}")
        results = []

    if results:
        # update existing record if value differs
        record_id = results[0]["id"]
        current_value = results[0]["content"]
        if current_value == record_value:
            print(f"{full_name}: Cloudflare record already set to {record_value}")
            return
        payload = {"type": record_type, "name": record_name, "content": record_value, "ttl": 300, "proxied": False}
        print(f"Updating Cloudflare record for {full_name}: {record_type} -> {record_value}")
        try:
            resp = requests.put(f"{CLOUDFLARE_API}/zones/{zone_id}/dns_records/{record_id}",
                                headers=cf_headers(), json=payload)
            resp.raise_for_status()
        except requests.HTTPError as e:
            print(f"Error updating Cloudflare record for {full_name}: {e}")
    else:
        # create new record
        payload = {"type": record_type, "name": record_name, "content": record_value, "ttl": 300, "proxied": False}
        print(f"Creating Cloudflare record for {full_name}: {record_type} -> {record_value}")
        try:
            resp = requests.post(f"{CLOUDFLARE_API}/zones/{zone_id}/dns_records",
                                 headers=cf_headers(), json=payload)
            resp.raise_for_status()
        except requests.HTTPError as e:
            print(f"Error creating Cloudflare record for {full_name}: {e}")

def apply_domains():
    """Main entry point: read config and process each domain."""
    try:
        with open(CONFIG_PATH, "r") as f:
            config = yaml.safe_load(f)
    except FileNotFoundError:
        print(f"Config file not found: {CONFIG_PATH}")
        sys.exit(1)

    domains = config.get("domains", [])
    for entry in domains:
        provider = entry.get("provider", "").lower()
        mode = entry.get("mode")
        if provider == "godaddy":
            if mode == "forward":
                update_godaddy_forward(entry)
            elif mode == "dns":
                update_godaddy_dns_record(entry)
            else:
                print(f"Unsupported mode '{mode}' for GoDaddy: {entry['name']}")
        elif provider == "cloudflare":
            if mode == "dns":
                update_cloudflare_dns_record(entry)
            elif mode == "forward":
                print(f"Forwarding via Cloudflare API is not implemented in this script. Skipping {entry['name']}.")
            else:
                print(f"Unsupported mode '{mode}' for Cloudflare: {entry['name']}")
        else:
            print(f"Unknown provider '{provider}' for {entry['name']}")

if __name__ == "__main__":
    apply_domains()
