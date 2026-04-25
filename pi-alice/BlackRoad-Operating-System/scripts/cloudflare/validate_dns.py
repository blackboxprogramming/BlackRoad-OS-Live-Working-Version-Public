#!/usr/bin/env python3
"""
Validate DNS configuration and check propagation status

This script helps verify that DNS records have been properly configured
and propagated across the internet. It performs:
- DNS resolution checks
- SSL certificate validation
- HTTP/HTTPS accessibility tests
- Redirect verification

Usage:
  python scripts/cloudflare/validate_dns.py
  python scripts/cloudflare/validate_dns.py --domain blackroad.systems
  python scripts/cloudflare/validate_dns.py --all  # Check all domains

Requirements:
  pip install requests dnspython colorama
"""

import argparse
import socket
import ssl
import sys
from datetime import datetime
from typing import List, Dict, Optional
import requests

try:
    import dns.resolver
    HAS_DNS = True
except ImportError:
    HAS_DNS = False
    print("Warning: dnspython not installed. Install with: pip install dnspython")

try:
    from colorama import init, Fore, Style
    init()
except ImportError:
    class Fore:
        GREEN = RED = YELLOW = CYAN = RESET = ""
    class Style:
        BRIGHT = RESET_ALL = ""


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


def check_dns_resolution(domain: str) -> Dict:
    """Check DNS resolution for a domain"""
    result = {
        "domain": domain,
        "resolved": False,
        "ip_addresses": [],
        "cname": None,
        "error": None
    }

    if not HAS_DNS:
        result["error"] = "dnspython not installed"
        return result

    try:
        resolver = dns.resolver.Resolver()
        resolver.timeout = 5
        resolver.lifetime = 5

        # Try CNAME first
        try:
            cname_answers = resolver.resolve(domain, 'CNAME')
            if cname_answers:
                result["cname"] = str(cname_answers[0].target).rstrip('.')
                print_status(f"  CNAME: {result['cname']}", "info")
        except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN):
            pass

        # Try A record
        try:
            answers = resolver.resolve(domain, 'A')
            result["ip_addresses"] = [str(rdata) for rdata in answers]
            result["resolved"] = True
            for ip in result["ip_addresses"]:
                print_status(f"  A: {ip}", "info")
        except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN) as e:
            result["error"] = str(e)

    except Exception as e:
        result["error"] = str(e)

    return result


def check_ssl_certificate(domain: str) -> Dict:
    """Check SSL certificate for a domain"""
    result = {
        "domain": domain,
        "valid": False,
        "issuer": None,
        "expires": None,
        "days_remaining": None,
        "error": None
    }

    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=10) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()

                result["issuer"] = dict(x[0] for x in cert['issuer'])
                result["expires"] = cert['notAfter']

                # Parse expiry date
                expire_date = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                days_remaining = (expire_date - datetime.now()).days
                result["days_remaining"] = days_remaining
                result["valid"] = days_remaining > 0

                print_status(f"  Issuer: {result['issuer'].get('organizationName', 'Unknown')}", "info")
                print_status(f"  Expires: {result['expires']} ({days_remaining} days)",
                           "success" if days_remaining > 30 else "warning")

    except Exception as e:
        result["error"] = str(e)

    return result


def check_http_accessibility(domain: str, check_redirects: bool = True) -> Dict:
    """Check HTTP/HTTPS accessibility and redirects"""
    result = {
        "domain": domain,
        "http_accessible": False,
        "https_accessible": False,
        "redirects_to_https": False,
        "www_redirects": False,
        "status_code": None,
        "error": None
    }

    try:
        # Check HTTP -> HTTPS redirect
        http_response = requests.get(f"http://{domain}", allow_redirects=True, timeout=10)
        result["http_accessible"] = True
        result["redirects_to_https"] = http_response.url.startswith("https://")

        if result["redirects_to_https"]:
            print_status(f"  HTTP → HTTPS redirect: ✓", "success")
        else:
            print_status(f"  HTTP → HTTPS redirect: ✗", "warning")

    except Exception as e:
        result["error"] = f"HTTP check failed: {e}"

    try:
        # Check HTTPS accessibility
        https_response = requests.get(f"https://{domain}", timeout=10)
        result["https_accessible"] = https_response.status_code == 200
        result["status_code"] = https_response.status_code

        if result["https_accessible"]:
            print_status(f"  HTTPS accessible: ✓ (Status: {https_response.status_code})", "success")
        else:
            print_status(f"  HTTPS status: {https_response.status_code}", "warning")

    except Exception as e:
        if not result["error"]:
            result["error"] = f"HTTPS check failed: {e}"

    # Check www redirect if requested
    if check_redirects and not domain.startswith("www."):
        try:
            www_response = requests.get(f"https://www.{domain}", allow_redirects=True, timeout=10)
            result["www_redirects"] = www_response.url == f"https://{domain}/" or www_response.url == f"https://{domain}"

            if result["www_redirects"]:
                print_status(f"  www → apex redirect: ✓", "success")
            else:
                print_status(f"  www redirect: ✗ (goes to {www_response.url})", "warning")

        except Exception as e:
            print_status(f"  www redirect check failed: {e}", "info")

    return result


def validate_domain(domain: str, full_check: bool = True) -> bool:
    """Validate a single domain"""
    print(f"\n{'='*60}")
    print(f"{Style.BRIGHT}Validating: {domain}{Style.RESET_ALL}")
    print(f"{'='*60}")

    all_passed = True

    # DNS Resolution
    print(f"\n{Fore.CYAN}[1/3] DNS Resolution{Fore.RESET}")
    dns_result = check_dns_resolution(domain)
    if dns_result["resolved"]:
        print_status(f"DNS resolved successfully", "success")
    else:
        print_status(f"DNS resolution failed: {dns_result.get('error', 'Unknown error')}", "error")
        all_passed = False

    if not full_check:
        return all_passed

    # SSL Certificate
    print(f"\n{Fore.CYAN}[2/3] SSL Certificate{Fore.RESET}")
    ssl_result = check_ssl_certificate(domain)
    if ssl_result["valid"]:
        print_status(f"SSL certificate is valid", "success")
    else:
        print_status(f"SSL certificate check failed: {ssl_result.get('error', 'Unknown error')}", "error")
        all_passed = False

    # HTTP Accessibility
    print(f"\n{Fore.CYAN}[3/3] HTTP Accessibility{Fore.RESET}")
    http_result = check_http_accessibility(domain)
    if http_result["https_accessible"]:
        print_status(f"Site is accessible via HTTPS", "success")
    else:
        print_status(f"Site accessibility check failed: {http_result.get('error', 'Unknown error')}", "error")
        all_passed = False

    # Summary
    print(f"\n{'='*60}")
    if all_passed:
        print_status(f"{domain}: All checks passed! ✓", "success")
    else:
        print_status(f"{domain}: Some checks failed", "warning")
    print(f"{'='*60}")

    return all_passed


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Validate DNS configuration and check propagation status"
    )
    parser.add_argument(
        "--domain",
        help="Domain to validate (default: blackroad.systems)"
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Check all BlackRoad domains"
    )
    parser.add_argument(
        "--dns-only",
        action="store_true",
        help="Only check DNS resolution (skip SSL and HTTP checks)"
    )

    args = parser.parse_args()

    # List of BlackRoad domains
    all_domains = [
        "blackroad.systems",
        "blackroad.ai",
        "blackroad.network",
        "blackroad.me",
        "lucidia.earth",
        "aliceqi.com",
        "blackroadqi.com",
        "roadwallet.com",
        "aliceos.io",
        "blackroadquantum.com"
    ]

    if args.all:
        domains = all_domains
    elif args.domain:
        domains = [args.domain]
    else:
        domains = ["blackroad.systems"]

    full_check = not args.dns_only
    all_passed = True

    for domain in domains:
        passed = validate_domain(domain, full_check=full_check)
        if not passed:
            all_passed = False

    # Final summary
    print(f"\n{'='*60}")
    print(f"{Style.BRIGHT}VALIDATION SUMMARY{Style.RESET_ALL}")
    print(f"{'='*60}")
    print(f"Domains checked: {len(domains)}")

    if all_passed:
        print_status("All validations passed!", "success")
        sys.exit(0)
    else:
        print_status("Some validations failed", "warning")
        sys.exit(1)


if __name__ == "__main__":
    main()
