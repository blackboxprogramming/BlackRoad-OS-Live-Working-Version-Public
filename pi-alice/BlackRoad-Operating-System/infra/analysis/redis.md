# Service Analysis: Redis

**Status**: ✅ ACTIVE (Production)
**Last Analyzed**: 2025-11-19
**Service Type**: Managed Cache (Redis)
**Provider**: Railway

---

## Overview

Managed Redis cache service provided by Railway. Used for session storage, API caching, WebSocket state, and pub/sub messaging.

---

## Configuration

### Version
- **Redis**: 7+ (Railway managed)

### Resources
- **Memory**: 256MB (default, configurable)
- **Eviction Policy**: `allkeys-lru` (least recently used)
- **Persistence**: RDB snapshots (Railway managed)

---

## Usage Patterns

### Session Storage
```python
# Store session
await redis.setex(
    f"session:{user_id}",
    3600,  # 1 hour TTL
    json.dumps(session_data)
)

# Retrieve session
session_json = await redis.get(f"session:{user_id}")
```

### API Response Caching
```python
# Cache API response
cache_key = f"api:cache:{endpoint}:{params_hash}"
await redis.setex(cache_key, 300, json.dumps(response))  # 5 min TTL

# Retrieve cached response
cached = await redis.get(cache_key)
```

### WebSocket State (Planned)
```python
# Pub/sub for real-time updates
await redis.publish("prism:events", json.dumps(event))

# Subscribe to events
pubsub = redis.pubsub()
await pubsub.subscribe("prism:events")
```

### Rate Limiting
```python
# Track API rate limits
key = f"ratelimit:{ip}:{endpoint}"
count = await redis.incr(key)
if count == 1:
    await redis.expire(key, 60)  # 1 minute window
```

---

## Key Namespaces

| Namespace | Pattern | TTL | Purpose |
|-----------|---------|-----|---------|
| `session:*` | `session:{user_id}` | 1 hour | User session data |
| `api:cache:*` | `api:cache:{endpoint}:{hash}` | 5-60 min | Cached API responses |
| `ratelimit:*` | `ratelimit:{ip}:{endpoint}` | 1 min | Rate limit counters |
| `websocket:*` | `websocket:{connection_id}` | Variable | WebSocket state |
| `prism:*` | Pub/sub channels | N/A | Event bus |

---

## Performance

### Metrics
- **Hit Rate**: Target > 80%
- **Latency**: < 1ms (local network)
- **Memory Usage**: Monitor for evictions

### Optimization
- Use pipelining for bulk operations
- Implement connection pooling
- Use hiredis for faster parsing
- Monitor key expiration patterns

---

## Monitoring

### Metrics (Railway Dashboard)
- Memory usage
- Connections count
- Commands per second
- Evicted keys

### Alerts (Recommended)
- Memory > 90% full
- High eviction rate
- Connection errors

---

## Connection Details

### Environment Variable
```bash
REDIS_URL=${{Redis.REDIS_URL}}
# Format: redis://host:port/db
```

### Connection Pool
```python
# backend/app/redis_client.py
redis = await aioredis.create_redis_pool(
    REDIS_URL,
    minsize=5,
    maxsize=10,
    encoding='utf-8'
)
```

---

## Security

### Access Control
- **Network**: Private Railway network only
- **Credentials**: Auto-generated, injected via `${{Redis.REDIS_URL}}`
- **Encryption**: TLS optional (not required on private network)

---

## Troubleshooting

### Connection Issues
1. Verify `REDIS_URL` is set
2. Check Redis service status
3. Verify network connectivity
4. Check connection pool exhaustion

### Memory Issues
1. Check eviction metrics
2. Analyze key distribution
3. Adjust TTLs for less critical data
4. Upgrade Redis plan if needed

---

*Analysis Date: 2025-11-19*
*Next Review: 2025-12-19*
