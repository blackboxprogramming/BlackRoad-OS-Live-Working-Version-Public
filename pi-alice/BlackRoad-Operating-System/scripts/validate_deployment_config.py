#!/usr/bin/env python3
"""
Deployment Configuration Validator

This script validates that the BlackRoad-Operating-System monorepo
is NOT being incorrectly added to Railway configurations or service
environment variables.

Usage:
    python scripts/validate_deployment_config.py

Exit codes:
    0 - All validations passed
    1 - Validation failures detected

Author: BlackRoad OS Team
Last Updated: 2025-11-19
"""

import os
import sys
import re
import json
import yaml
from pathlib import Path
from typing import List, Tuple, Dict

# ANSI color codes
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"
BOLD = "\033[1m"

# Repository root
REPO_ROOT = Path(__file__).parent.parent

# Patterns that indicate monorepo is being incorrectly referenced
FORBIDDEN_PATTERNS = [
    r"BlackRoad-Operating-System",
    r"blackroad-operating-system",
    r"BLACKROAD_OPERATING_SYSTEM",
    r"monorepo\.up\.railway\.app",
    r"blackroad-os-monorepo",
]

# Allowed contexts where monorepo reference is OK
ALLOWED_FILES = [
    "README.md",
    "DEPLOYMENT_ARCHITECTURE.md",
    "CLAUDE.md",
    "docs/",
    ".git/",
    ".github/",
    "infra/github/",
    "scripts/",
    ".md",  # All markdown files (usually docs)
    "IMPLEMENTATION",  # Implementation plan docs
    "PHASE",  # Phase summary docs
    "ORG_STRUCTURE.md",
    "CODEBASE_STATUS.md",
]

# Files to check for forbidden patterns
CHECK_PATTERNS = [
    "**/.env",
    "**/.env.example",
    "**/.env.production",
    "**/.env.staging",
    "**/.env.development",
    "**/railway.json",
    "**/vercel.json",
    "**/netlify.toml",
]


class ValidationResult:
    """Stores validation results"""

    def __init__(self):
        self.errors: List[Tuple[str, str]] = []
        self.warnings: List[Tuple[str, str]] = []
        self.passed: List[str] = []

    def add_error(self, check: str, message: str):
        """Add a validation error"""
        self.errors.append((check, message))

    def add_warning(self, check: str, message: str):
        """Add a validation warning"""
        self.warnings.append((check, message))

    def add_pass(self, check: str):
        """Add a passing check"""
        self.passed.append(check)

    def has_failures(self) -> bool:
        """Check if there are any failures"""
        return len(self.errors) > 0

    def print_summary(self):
        """Print validation summary"""
        print(f"\n{BOLD}{'=' * 70}{RESET}")
        print(f"{BOLD}Deployment Configuration Validation Results{RESET}")
        print(f"{BOLD}{'=' * 70}{RESET}\n")

        # Print errors
        if self.errors:
            print(f"{RED}{BOLD}❌ ERRORS ({len(self.errors)}):{RESET}")
            for check, message in self.errors:
                print(f"{RED}  • {check}:{RESET} {message}")
            print()

        # Print warnings
        if self.warnings:
            print(f"{YELLOW}{BOLD}⚠️  WARNINGS ({len(self.warnings)}):{RESET}")
            for check, message in self.warnings:
                print(f"{YELLOW}  • {check}:{RESET} {message}")
            print()

        # Print passed checks
        if self.passed:
            print(f"{GREEN}{BOLD}✅ PASSED ({len(self.passed)}):{RESET}")
            for check in self.passed:
                print(f"{GREEN}  • {check}{RESET}")
            print()

        # Overall status
        print(f"{BOLD}{'=' * 70}{RESET}")
        if self.has_failures():
            print(f"{RED}{BOLD}❌ VALIDATION FAILED{RESET}")
            print(f"\nThe monorepo is being incorrectly referenced in deployment configs.")
            print(f"See {BLUE}DEPLOYMENT_ARCHITECTURE.md{RESET} for correct deployment model.\n")
            return 1
        elif self.warnings:
            print(f"{YELLOW}{BOLD}⚠️  VALIDATION PASSED WITH WARNINGS{RESET}\n")
            return 0
        else:
            print(f"{GREEN}{BOLD}✅ ALL VALIDATIONS PASSED{RESET}\n")
            return 0


def is_allowed_file(file_path: Path) -> bool:
    """Check if file is in allowed list for monorepo references"""
    file_str = str(file_path)
    for allowed in ALLOWED_FILES:
        if allowed in file_str:
            return True
    return False


def check_railway_toml(result: ValidationResult):
    """Validate railway.toml is marked for local dev only"""
    railway_toml = REPO_ROOT / "railway.toml"

    if not railway_toml.exists():
        result.add_warning("railway.toml", "File not found (OK if not using Railway)")
        return

    content = railway_toml.read_text()

    # Check for warning banner
    if "CRITICAL WARNING" not in content:
        result.add_error(
            "railway.toml",
            "Missing CRITICAL WARNING banner at top of file"
        )

    # Check for "LOCAL DEV" or similar marker
    if "LOCAL DEV" not in content and "DEVELOPMENT" not in content:
        result.add_error(
            "railway.toml",
            "Not clearly marked as local development only"
        )

    if not result.errors:
        result.add_pass("railway.toml has proper warnings")


def check_env_files(result: ValidationResult):
    """Check environment files for monorepo references"""
    env_files = []

    for pattern in CHECK_PATTERNS:
        env_files.extend(REPO_ROOT.glob(pattern))

    found_issues = False
    checked_count = 0

    for env_file in env_files:
        if is_allowed_file(env_file):
            continue

        checked_count += 1
        content = env_file.read_text()

        for pattern in FORBIDDEN_PATTERNS:
            matches = re.finditer(pattern, content, re.IGNORECASE)
            for match in matches:
                # Get line number
                line_num = content[:match.start()].count('\n') + 1
                result.add_error(
                    f"{env_file.name}:{line_num}",
                    f"Contains forbidden reference: '{match.group()}'"
                )
                found_issues = True

    if checked_count == 0:
        result.add_warning("env files", "No environment files found to check")
    elif not found_issues:
        result.add_pass(f"Environment files clean ({checked_count} checked)")


def check_satellite_configs(result: ValidationResult):
    """Check if satellites are properly configured"""
    sync_config = REPO_ROOT / "infra/github/sync-config.yml"

    if not sync_config.exists():
        result.add_warning(
            "sync-config.yml",
            "Satellite sync config not found"
        )
        return

    with open(sync_config) as f:
        config = yaml.safe_load(f)

    # Expected satellites
    expected_services = ["core-api", "public-api", "operator"]
    expected_apps = ["prism-console", "web"]

    services = config.get("services", {})
    apps = config.get("apps", {})

    # Check all expected services are configured
    missing_services = [s for s in expected_services if s not in services]
    missing_apps = [a for a in expected_apps if a not in apps]

    if missing_services:
        result.add_warning(
            "sync-config.yml",
            f"Missing service configs: {', '.join(missing_services)}"
        )

    if missing_apps:
        result.add_warning(
            "sync-config.yml",
            f"Missing app configs: {', '.join(missing_apps)}"
        )

    if not missing_services and not missing_apps:
        result.add_pass("Satellite sync configuration complete")


def check_cloudflare_docs(result: ValidationResult):
    """Check Cloudflare documentation for correct DNS setup"""
    cloudflare_doc = REPO_ROOT / "CLOUDFLARE_DNS_BLUEPRINT.md"

    if not cloudflare_doc.exists():
        result.add_warning(
            "Cloudflare docs",
            "CLOUDFLARE_DNS_BLUEPRINT.md not found"
        )
        return

    content = cloudflare_doc.read_text()

    # Check for incorrect monorepo references in DNS
    forbidden_dns = [
        "blackroad-operating-system.up.railway.app",
        "monorepo.up.railway.app",
    ]

    found_issues = False
    for forbidden in forbidden_dns:
        if forbidden in content.lower():
            result.add_error(
                "CLOUDFLARE_DNS_BLUEPRINT.md",
                f"Contains forbidden DNS target: {forbidden}"
            )
            found_issues = True

    if not found_issues:
        result.add_pass("Cloudflare DNS documentation is correct")


def check_deployment_architecture_exists(result: ValidationResult):
    """Verify DEPLOYMENT_ARCHITECTURE.md exists"""
    doc_path = REPO_ROOT / "DEPLOYMENT_ARCHITECTURE.md"

    if not doc_path.exists():
        result.add_error(
            "DEPLOYMENT_ARCHITECTURE.md",
            "Critical deployment documentation is missing"
        )
        return

    content = doc_path.read_text()

    # Check for key sections
    required_sections = [
        "Monorepo vs Satellite Model",
        "Critical Rules",
        "NEVER DO THIS",
        "ALWAYS DO THIS",
    ]

    missing_sections = []
    for section in required_sections:
        if section not in content:
            missing_sections.append(section)

    if missing_sections:
        result.add_error(
            "DEPLOYMENT_ARCHITECTURE.md",
            f"Missing sections: {', '.join(missing_sections)}"
        )
    else:
        result.add_pass("DEPLOYMENT_ARCHITECTURE.md is complete")


def check_readme_warnings(result: ValidationResult):
    """Verify README.md has deployment warnings"""
    readme = REPO_ROOT / "README.md"

    if not readme.exists():
        result.add_error("README.md", "README.md not found")
        return

    content = readme.read_text()

    if "DEPLOYMENT WARNING" not in content:
        result.add_error(
            "README.md",
            "Missing deployment warning section"
        )

    if "DO NOT" not in content or "satellite" not in content.lower():
        result.add_error(
            "README.md",
            "Deployment warnings are not clear or comprehensive"
        )

    if not result.errors:
        result.add_pass("README.md has proper deployment warnings")


def main():
    """Run all validation checks"""
    print(f"\n{BOLD}{BLUE}BlackRoad OS Deployment Configuration Validator{RESET}")
    print(f"{BLUE}{'=' * 70}{RESET}\n")

    result = ValidationResult()

    # Run all checks
    print("Running validation checks...\n")

    check_railway_toml(result)
    check_env_files(result)
    check_satellite_configs(result)
    check_cloudflare_docs(result)
    check_deployment_architecture_exists(result)
    check_readme_warnings(result)

    # Print results
    exit_code = result.print_summary()

    sys.exit(exit_code)


if __name__ == "__main__":
    main()
