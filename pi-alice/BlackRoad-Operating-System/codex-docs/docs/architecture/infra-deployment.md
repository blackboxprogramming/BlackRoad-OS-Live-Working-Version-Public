# Infrastructure & Deployment

Complete guide to BlackRoad OS infrastructure and deployment architecture.

---

## Deployment Architecture

```
User → Cloudflare (DNS + CDN) → Railway (Backend) → PostgreSQL + Redis
                                ↓
                         GitHub Pages (Docs)
```

---

## Production Stack

### Railway (Backend Hosting)

- **Service**: blackroad-os-backend
- **Region**: us-west-2
- **Instances**: Auto-scaling (1-3)
- **Database**: PostgreSQL 15 (managed)
- **Cache**: Redis 7 (managed)

### Cloudflare (CDN + DNS)

- **DNS**: Cloudflare nameservers
- **SSL**: Full (strict) mode
- **Caching**: Static assets cached at edge
- **DDoS**: Automatic protection

### GitHub Pages (Documentation)

- **Source**: `codex-docs/` directory
- **Builder**: MkDocs + Material theme
- **Branch**: `gh-pages`
- **URL**: https://docs.blackroad.systems

---

## Environment Variables

See [DEPLOYMENT_NOTES.md](../../DEPLOYMENT_NOTES.md) for complete environment variable reference.

---

## Deployment Process

See [Deployment Guide](../guides/deployment.md) for step-by-step instructions.

---

**Where AI meets the open road.** 🛣️
