# BlackRoad OS Metrics

**Real-time data aggregation across all BlackRoad OS infrastructure**

**Last Updated:** Auto-updated via GitHub Actions every hour

---

## Purpose

Single source of truth for all BlackRoad OS metrics:
- Repository stats
- Infrastructure inventory
- Codebase metrics
- Deployment status
- Application tracking
- Financial data

**This repository updates automatically** - no manual maintenance required.

---

## Data Files

### Infrastructure
- `infrastructure.json` - Live infrastructure inventory
- `repositories.json` - All GitHub repos with stats
- `cloudflare.json` - Cloudflare zones, Pages, KV, D1
- `railway.json` - Railway projects and deployments

### Codebase
- `code-metrics.json` - LOC, files, commits across all repos
- `languages.json` - Language breakdown
- `dependencies.json` - Package dependencies

### Applications
- `job-applications.json` - Job application tracker
- `response-rates.json` - Application success metrics

### Business
- `revenue.json` - Revenue tracking (if applicable)
- `crypto-holdings.json` - Crypto portfolio (anonymized)

### Resume
- `resume-data.json` - Latest resume metrics for easy embedding

---

## Update Frequency

- **Every hour:** Infrastructure, repos, deployments
- **Every 6 hours:** Code metrics, dependencies
- **Daily:** Job applications, financial data

---

## Usage

### Embed Latest Metrics in Any Project

```javascript
// Fetch latest metrics
const metrics = await fetch('https://raw.githubusercontent.com/BlackRoad-OS/blackroad-os-metrics/main/infrastructure.json');
const data = await metrics.json();

console.log(`Total repos: ${data.total_repos}`);
console.log(`Total LOC: ${data.total_loc}`);
```

### Python
```python
import requests

metrics = requests.get('https://raw.githubusercontent.com/BlackRoad-OS/blackroad-os-metrics/main/code-metrics.json').json()
print(f"Total LOC: {metrics['total_loc']:,}")
```

### Bash
```bash
curl -s https://raw.githubusercontent.com/BlackRoad-OS/blackroad-os-metrics/main/infrastructure.json | jq '.total_repos'
```

---

## Auto-Update System

This repository uses GitHub Actions to:
1. Scan all BlackRoad-OS repositories
2. Query Cloudflare API
3. Query Railway API
4. Aggregate codebase metrics
5. Update JSON files
6. Commit and push changes

**Runs automatically** - no manual intervention needed.

---

## Verification

All data is verified using PS-SHA-∞ cryptographic hashing.

Each JSON file includes:
```json
{
  "data": { ... },
  "metadata": {
    "updated_at": "2025-12-26T18:30:00Z",
    "verification_hash": "sha256:...",
    "source": "github-actions"
  }
}
```

---

## Source of Truth Hierarchy

1. **GitHub** (BlackRoad-OS) - Canonical code
2. **Cloudflare** - Live infrastructure
3. **This Repository** - Aggregated metrics
4. **Resume Files** - Human-readable summaries

---

## Access

**Public Repository:** Anyone can read metrics
**Write Access:** GitHub Actions only (automated)

---

**Status:** ✅ Operational
**Next Update:** Automatic (every hour)
