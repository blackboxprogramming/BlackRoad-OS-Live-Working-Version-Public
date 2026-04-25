[![CI](https://github.com/blackboxprogramming/blackroad-api-sdks/actions/workflows/ci.yml/badge.svg)](https://github.com/blackboxprogramming/blackroad-api-sdks/actions/workflows/ci.yml)
[![GitHub stars](https://img.shields.io/github/stars/blackboxprogramming/blackroad-api-sdks.svg?style=social&label=Star)](https://github.com/blackboxprogramming/blackroad-api-sdks)
[![GitHub forks](https://img.shields.io/github/forks/blackboxprogramming/blackroad-api-sdks.svg?style=social&label=Fork)](https://github.com/blackboxprogramming/blackroad-api-sdks/fork)


# BlackRoad API SDKs 📦

Official SDKs for JavaScript, Python, Go, and Ruby!

## Languages

- ✅ JavaScript/TypeScript
- ✅ Python
- ✅ Go
- ✅ Ruby

## Installation

### JavaScript/TypeScript
```bash
npm install blackroad
```

### Python
```bash
pip install blackroad
```

### Go
```bash
go get github.com/blackboxprogramming/blackroad-api-sdks/go
```

### Ruby
```bash
gem install blackroad
```

## Quick Start

### JavaScript
```javascript
const BlackRoad = require('blackroad')
const client = new BlackRoad('your-api-key')

const deployment = await client.deployments.create({
  name: 'my-app',
  source: 'github.com/user/repo'
})
```

### Python
```python
from blackroad import BlackRoad

client = BlackRoad('your-api-key')
deployment = client.deployments.create(
    name='my-app',
    source='github.com/user/repo'
)
```

### Go
```go
import "github.com/blackboxprogramming/blackroad-api-sdks/go"

client := blackroad.NewClient("your-api-key")
deployment, err := client.Deployments.Create(&blackroad.DeploymentInput{
    Name: "my-app",
})
```

## Documentation

Full API docs: https://blackroad.io/docs

## License

Proprietary — BlackRoad OS, Inc. All rights reserved.
