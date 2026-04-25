# Quick Access

## Live Data URLs

### Infrastructure
```
https://raw.githubusercontent.com/BlackRoad-OS/blackroad-os-metrics/main/infrastructure.json
```

### Resume Data
```
https://raw.githubusercontent.com/BlackRoad-OS/blackroad-os-metrics/main/resume-data.json
```

### Repositories
```
https://raw.githubusercontent.com/BlackRoad-OS/blackroad-os-metrics/main/repositories.json
```

### Code Metrics
```
https://raw.githubusercontent.com/BlackRoad-OS/blackroad-os-metrics/main/code-metrics.json
```

## Example Usage

```bash
# Fetch latest LOC count
curl -s https://raw.githubusercontent.com/BlackRoad-OS/blackroad-os-metrics/main/resume-data.json | jq '.metrics.total_loc'
```

```python
import requests
data = requests.get('https://raw.githubusercontent.com/BlackRoad-OS/blackroad-os-metrics/main/resume-data.json').json()
print(f"Total LOC: {data['metrics']['total_loc']:,}")
```

