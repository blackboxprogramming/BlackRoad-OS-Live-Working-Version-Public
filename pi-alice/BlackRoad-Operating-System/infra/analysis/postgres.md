# Service Analysis: Postgres

**Status**: ✅ ACTIVE (Production)
**Last Analyzed**: 2025-11-19
**Service Type**: Managed Database (PostgreSQL)
**Provider**: Railway

---

## Overview

Managed PostgreSQL database service provided by Railway. Stores all persistent data for BlackRoad OS including users, wallets, blockchain, and application data.

---

## Configuration

### Version
- **PostgreSQL**: 15+ (Railway managed, auto-updates minor versions)

### Resources
- **Storage**: Auto-scaling (starts at 1GB)
- **Memory**: Shared (Railway managed)
- **Connections**: Max 100 concurrent

### Performance Tuning
```sql
-- Current settings (Railway defaults)
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
```

---

## Schema

### Current Tables
- `users` - User accounts (auth, profiles)
- `wallets` - Blockchain wallets (encrypted keys)
- `blocks` - RoadChain blockchain
- `transactions` - Blockchain transactions
- `jobs` - Prism job queue (future)
- `events` - Audit/compliance events

### Migration Management
- **Tool**: Alembic
- **Location**: `backend/alembic/`
- **Strategy**: Manual migrations (no auto-upgrade in production)

---

## Backups

### Automated Backups (Railway)
- **Frequency**: Daily
- **Retention**: 30 days
- **Storage**: Railway managed

### Restore Process
1. Railway Dashboard → Database → Backups
2. Select backup date
3. Click "Restore"
4. Verify data integrity

---

## Security

### Access Control
- **Network**: Private Railway network only
- **Credentials**: Auto-generated, injected via `${{Postgres.DATABASE_URL}}`
- **SSL/TLS**: Enforced

### Encryption
- **At Rest**: Railway managed encryption
- **In Transit**: SSL/TLS (required)

---

## Monitoring

### Metrics (Railway Dashboard)
- Connection count
- Query performance
- Storage usage
- CPU/memory usage

### Alerts (Recommended)
- Storage > 80% full
- Connection pool exhausted
- Slow queries (> 1s)

---

## Maintenance

### Regular Tasks
- **Vacuum**: Automatic (Railway managed)
- **Analyze**: Automatic (Railway managed)
- **Index optimization**: Manual (as needed)

### Scaling
- **Vertical**: Upgrade Railway plan
- **Storage**: Auto-scales up to plan limit

---

## Connection Details

### Environment Variable
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
# Format: postgresql+asyncpg://user:pass@host:port/db
```

### Connection Pool (SQLAlchemy)
```python
# backend/app/database.py
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
)
```

---

## Troubleshooting

### Connection Issues
1. Verify `DATABASE_URL` is set in Railway
2. Check service logs for connection errors
3. Verify database service is running
4. Check connection pool exhaustion

### Performance Issues
1. Check slow query log
2. Analyze query plans with `EXPLAIN`
3. Add missing indexes
4. Optimize N+1 queries

---

*Analysis Date: 2025-11-19*
*Next Review: 2025-12-19*
