#!/usr/bin/env python3
"""
Update repository metrics
Scans all BlackRoad-OS repositories and aggregates stats
"""

import os
import json
from datetime import datetime
from github import Github

# Initialize GitHub
token = os.getenv('GITHUB_TOKEN')
g = Github(token)

# Get BlackRoad-OS organization
org = g.get_organization('BlackRoad-OS')

# Collect repository data
repos_data = []
total_stars = 0
total_forks = 0
total_size = 0

for repo in org.get_repos():
    try:
        repo_info = {
            'name': repo.name,
            'description': repo.description,
            'url': repo.html_url,
            'stars': repo.stargazers_count,
            'forks': repo.forks_count,
            'size_kb': repo.size,
            'language': repo.language,
            'updated_at': repo.updated_at.isoformat() if repo.updated_at else None,
            'created_at': repo.created_at.isoformat() if repo.created_at else None,
            'topics': repo.get_topics(),
            'private': repo.private,
        }

        repos_data.append(repo_info)
        total_stars += repo.stargazers_count
        total_forks += repo.forks_count
        total_size += repo.size

    except Exception as e:
        print(f"Error processing {repo.name}: {e}")

# Create output
output = {
    'data': {
        'total_repos': len(repos_data),
        'total_stars': total_stars,
        'total_forks': total_forks,
        'total_size_kb': total_size,
        'total_size_mb': round(total_size / 1024, 2),
        'repositories': repos_data
    },
    'metadata': {
        'updated_at': datetime.utcnow().isoformat() + 'Z',
        'source': 'github-actions',
        'org': 'BlackRoad-OS'
    }
}

# Write to file
with open('repositories.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f"✅ Updated metrics for {len(repos_data)} repositories")
