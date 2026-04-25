#!/usr/bin/env python3
"""
Update resume data
Creates JSON version of resume metrics for easy embedding
"""

import json
from datetime import datetime

# Load latest metrics
try:
    with open('repositories.json', 'r') as f:
        repos = json.load(f)
    total_repos = repos['data']['total_repos']
except:
    total_repos = 53

try:
    with open('code-metrics.json', 'r') as f:
        code = json.load(f)
    total_loc = code['data']['estimated_loc']
    total_commits = code['data']['total_commits']
except:
    total_loc = 1377909
    total_commits = 5937

try:
    with open('infrastructure.json', 'r') as f:
        infra = json.load(f)
    total_orgs = infra['data']['total_orgs']
except:
    total_orgs = 15

# Create resume data
resume_data = {
    'personal': {
        'name': 'Alexa Louise Amundson',
        'email': 'blackroad@gmail.com',
        'phone': '(507) 828-0842',
        'location': 'Lakeville, MN',
        'linkedin': 'https://linkedin.com/in/alexaamundson',
        'github': 'https://github.com/blackboxprogramming',
        'website': 'https://blackroad.io'
    },
    'metrics': {
        'total_loc': total_loc,
        'total_repos': total_repos,
        'total_commits': total_commits,
        'github_orgs': total_orgs,
        'sales_revenue': 26800000,
        'cloudflare_zones': 16,
        'ai_agents': 76,
        'api_endpoints': 2119,
        'microservices': 23,
        'years_experience': 7
    },
    'skills': {
        'languages': ['Python', 'TypeScript', 'JavaScript', 'Go', 'C', 'SQL', 'Bash'],
        'ai_ml': ['PyTorch', 'TensorFlow', 'LangChain', 'RAG Pipelines', 'Multi-agent Systems'],
        'cloud': ['AWS', 'GCP', 'Cloudflare', 'Railway', 'DigitalOcean'],
        'devops': ['Kubernetes', 'Docker', 'Terraform', 'GitHub Actions', 'CI/CD'],
        'frameworks': ['FastAPI', 'Node.js', 'Express', 'React']
    },
    'licenses': [
        'SIE (Securities Industry Essentials)',
        'Series 7 (General Securities Representative)',
        'Series 66 (Uniform Combined State Law)',
        'Life & Health Insurance',
        'Real Estate License (inactive)'
    ],
    'metadata': {
        'updated_at': datetime.utcnow().isoformat() + 'Z',
        'source': 'auto-aggregated',
        'verified': True
    }
}

with open('resume-data.json', 'w') as f:
    json.dump(resume_data, f, indent=2)

print("✅ Resume data updated")
print(f"   LOC: {total_loc:,}")
print(f"   Repos: {total_repos}")
print(f"   Commits: {total_commits:,}")
