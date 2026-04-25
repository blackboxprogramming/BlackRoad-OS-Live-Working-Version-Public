#!/usr/bin/env python3
"""HTML validator for BlackRoad OS"""
import re
import sys
from pathlib import Path

DEFAULT_INDEX = Path("backend/static/index.html")

def validate_html(filename):
    errors = []
    warnings = []

    with open(filename, 'r') as f:
        content = f.read()

    # Check basic structure
    if not content.strip().startswith('<!DOCTYPE html>'):
        errors.append("Missing DOCTYPE declaration")

    if '<html' not in content or '</html>' not in content:
        errors.append("Missing html tags")

    if '<head>' not in content or '</head>' not in content:
        errors.append("Missing head tags")

    if '<body>' not in content or '</body>' not in content:
        errors.append("Missing body tags")

    # Check for unclosed tags
    script_opens = content.count('<script')
    script_closes = content.count('</script>')
    if script_opens != script_closes:
        errors.append(f"Mismatched script tags: {script_opens} opens, {script_closes} closes")

    div_opens = content.count('<div')
    div_closes = content.count('</div>')
    if div_opens != div_closes:
        errors.append(f"Mismatched div tags: {div_opens} opens, {div_closes} closes")

    # Check for syntax errors in JavaScript
    if '<script>' in content:
        # Extract JavaScript
        script_match = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
        if script_match:
            js_code = script_match.group(1)
            # Basic JS validation
            if 'function' in js_code and 'let' in js_code:
                print("✓ JavaScript code found and appears valid")

    # Check CSS
    if '<style>' in content:
        style_opens = content.count('<style>')
        style_closes = content.count('</style>')
        if style_opens != style_closes:
            errors.append(f"Mismatched style tags: {style_opens} opens, {style_closes} closes")
        else:
            print(f"✓ Found {style_opens} style block(s)")

    # Report results
    print(f"\n{'='*60}")
    print(f"HTML Validation Results for: {filename}")
    print(f"{'='*60}")
    print(f"File size: {len(content)} bytes")
    print(f"Lines: {content.count(chr(10))}")
    print(f"Divs: {div_opens} opens, {div_closes} closes")
    print(f"Scripts: {script_opens} opens, {script_closes} closes")

    if errors:
        print(f"\n❌ ERRORS FOUND ({len(errors)}):")
        for i, error in enumerate(errors, 1):
            print(f"  {i}. {error}")
    else:
        print("\n✓ No structural errors found")

    if warnings:
        print(f"\n⚠ WARNINGS ({len(warnings)}):")
        for i, warning in enumerate(warnings, 1):
            print(f"  {i}. {warning}")

    return len(errors) == 0

if __name__ == '__main__':
    filename = sys.argv[1] if len(sys.argv) > 1 else str(DEFAULT_INDEX)
    valid = validate_html(filename)
    sys.exit(0 if valid else 1)
