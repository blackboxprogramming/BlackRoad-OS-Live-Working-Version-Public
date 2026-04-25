# Deployment Guide

Complete deployment guide for BlackRoad OS.

See [DEPLOYMENT_NOTES.md](../../DEPLOYMENT_NOTES.md) in the repository for the complete, detailed deployment checklist.

## Quick Reference

### Railway Deployment

1. Create Railway project
2. Add PostgreSQL + Redis plugins
3. Set environment variables
4. Deploy backend
5. Add custom domain

### Cloudflare DNS

1. Add domain to Cloudflare
2. Update nameservers at registrar
3. Configure DNS records
4. Enable SSL (Full strict mode)

### GitHub Pages

1. Enable Pages in repository settings
2. Set source: `gh-pages` branch
3. Add custom domain: `docs.blackroad.systems`
4. Add CNAME in Cloudflare DNS

---

**Where AI meets the open road.** 🛣️
