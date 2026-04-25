#!/usr/bin/env python3
"""
Update codebase metrics
Aggregates LOC, files, commits across all repos
"""

import os
import json
from datetime import datetime
from github import Github
import subprocess

token = os.getenv('GITHUB_TOKEN')
g = Github(token)
org = g.get_organization('BlackRoad-OS')

total_loc = 0
total_files = 0
total_commits = 0
languages = {}

for repo in org.get_repos():
    try:
        # Get commit count
        try:
            commits = repo.get_commits().totalCount
            total_commits += commits
        except:
            commits = 0

        # Get languages
        repo_languages = repo.get_languages()
        for lang, bytes_count in repo_languages.items():
            if lang in languages:
                languages[lang] += bytes_count
            else:
                languages[lang] = bytes_count

        print(f"Processed: {repo.name}")

    except Exception as e:
        print(f"Error processing {repo.name}: {e}")

# Calculate total bytes
total_bytes = sum(languages.values())

# Create language breakdown
language_breakdown = []
for lang, bytes_count in sorted(languages.items(), key=lambda x: x[1], reverse=True):
    percentage = (bytes_count / total_bytes * 100) if total_bytes > 0 else 0
    language_breakdown.append({
        'language': lang,
        'bytes': bytes_count,
        'percentage': round(percentage, 2)
    })

# Estimate LOC (rough: 1 LOC ≈ 50 bytes average)
estimated_loc = total_bytes // 50

output = {
    'data': {
        'total_commits': total_commits,
        'total_bytes': total_bytes,
        'estimated_loc': estimated_loc,
        'languages': language_breakdown
    },
    'metadata': {
        'updated_at': datetime.utcnow().isoformat() + 'Z',
        'source': 'github-actions',
        'note': 'LOC is estimated from byte count'
    }
}

with open('code-metrics.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f"✅ Code metrics updated: {estimated_loc:,} estimated LOC")
