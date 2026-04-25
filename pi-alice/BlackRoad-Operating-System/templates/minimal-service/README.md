# BlackRoad OS - Minimal Service Template

A production-ready FastAPI service template that implements the BlackRoad OS syscall API specification.

## Features

✅ **Core Endpoints**:
- `/` - Hello World landing page (HTML)
- `/health` - Basic health check (required by Railway)
- `/version` - Version information

✅ **Syscall API Endpoints** (BlackRoad OS standard):
- `/v1/sys/identity` - Complete service identity
- `/v1/sys/health` - Detailed health metrics
- `/v1/sys/version` - Extended version info
- `/v1/sys/config` - Service configuration

✅ **Additional Features**:
- CORS middleware
- Custom error handlers (404, 500)
- OpenAPI documentation (`/api/docs`, `/api/redoc`)
- Railway deployment support
- Environment-based configuration
- Startup/shutdown hooks

## Usage

### 1. Local Development

```bash
# Install dependencies
pip install fastapi uvicorn

# Set environment variables
export SERVICE_NAME="blackroad-os-example"
export SERVICE_ROLE="example"
export ENVIRONMENT="development"
export PORT=8000

# Run the service
python main.py
```

Visit: http://localhost:8000

### 2. Deploy to Railway

```bash
# 1. Copy this template to your satellite repo
cp templates/minimal-service/main.py /path/to/satellite-repo/

# 2. Create Dockerfile
cat > Dockerfile <<EOF
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "\${PORT:-8000}"]
EOF

# 3. Create requirements.txt
cat > requirements.txt <<EOF
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
EOF

# 4. Push to satellite repo
git add .
git commit -m "Add minimal service implementation"
git push origin main

# Railway will automatically deploy
```

### 3. Configure Environment Variables (Railway)

In Railway dashboard, set:

```bash
SERVICE_NAME=blackroad-os-docs
SERVICE_ROLE=docs
ENVIRONMENT=production
ALLOWED_ORIGINS=https://blackroad.systems,https://api.blackroad.systems
CLOUDFLARE_URL=https://docs.blackroad.systems
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SERVICE_NAME` | No | `blackroad-os-service` | Full service name |
| `SERVICE_ROLE` | No | `unknown` | Service role (docs, web, api, etc.) |
| `SERVICE_VERSION` | No | `1.0.0` | Service version |
| `ENVIRONMENT` | No | `development` | `production` or `development` |
| `PORT` | No | `8000` | Port to run on |
| `ALLOWED_ORIGINS` | No | `*` | CORS allowed origins (comma-separated) |
| `CLOUDFLARE_URL` | No | - | Public Cloudflare URL |
| `RAILWAY_STATIC_URL` | Auto | - | Provided by Railway |
| `RAILWAY_GIT_COMMIT_SHA` | Auto | - | Provided by Railway |

## Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test version endpoint
curl http://localhost:8000/version

# Test identity (syscall API)
curl http://localhost:8000/v1/sys/identity

# Test detailed health (syscall API)
curl http://localhost:8000/v1/sys/health

# View API docs
open http://localhost:8000/api/docs
```

## Customization

### Add Custom Endpoints

```python
@app.get("/api/custom")
async def custom_endpoint():
    """Your custom endpoint"""
    return {"message": "Custom data"}
```

### Add Static File Serving

```python
from fastapi.staticfiles import StaticFiles

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")
```

### Add Database Connection

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

# Add to startup event
@app.on_event("startup")
async def startup_event():
    global engine
    database_url = os.getenv("DATABASE_URL")
    engine = create_async_engine(database_url)
```

### Add Health Checks

```python
@app.get("/v1/sys/health")
async def sys_health():
    checks = {
        "database": await check_database(),
        "redis": await check_redis(),
        "external_api": await check_external_api()
    }

    all_healthy = all(c["status"] == "ok" for c in checks.values())

    return {
        "status": "healthy" if all_healthy else "degraded",
        "checks": checks,
        ...
    }
```

## Integration with BlackRoad OS

### Service Registry

This template is compatible with the BlackRoad OS service registry (`INFRASTRUCTURE.md`).

Each service automatically reports its identity via `/v1/sys/identity`, which includes:
- DNS endpoints (Cloudflare, Railway, internal)
- Runtime information (host, port, uptime)
- Health status
- Capabilities

### Inter-Service Communication

To call other services:

```python
import httpx

# Call another BlackRoad service
async with httpx.AsyncClient() as client:
    response = await client.get(
        "http://blackroad-os-core.railway.internal:8000/v1/sys/identity"
    )
    core_identity = response.json()
```

### RPC Support (Optional)

To add RPC support, implement `/v1/sys/rpc`:

```python
@app.post("/v1/sys/rpc")
async def sys_rpc(request: Request):
    """Handle RPC calls from other services"""
    body = await request.json()
    method = body.get("method")
    params = body.get("params", {})

    # Route to method handler
    if method == "getStatus":
        result = await get_status()
    elif method == "getData":
        result = await get_data(params)
    else:
        return JSONResponse(
            status_code=404,
            content={"error": {"code": "METHOD_NOT_FOUND", "message": f"Method '{method}' not found"}}
        )

    return {"result": result}
```

## Production Checklist

Before deploying to production:

- [ ] Set `ENVIRONMENT=production`
- [ ] Configure `ALLOWED_ORIGINS` (no wildcards)
- [ ] Set proper `SERVICE_NAME` and `SERVICE_ROLE`
- [ ] Add health check monitoring
- [ ] Enable structured logging
- [ ] Add error tracking (Sentry, etc.)
- [ ] Configure rate limiting
- [ ] Add authentication (if needed)
- [ ] Test all endpoints
- [ ] Verify CORS configuration
- [ ] Check Railway deployment logs
- [ ] Verify Cloudflare DNS routing

## References

- **Syscall API Spec**: `SYSCALL_API.md`
- **Service Registry**: `INFRASTRUCTURE.md`
- **DNS Configuration**: `infra/DNS.md`
- **Deployment Guide**: `docs/RAILWAY_DEPLOYMENT.md`

---

**Template Version**: 1.0
**Compatible with**: BlackRoad OS v2.0
**Last Updated**: 2025-11-20
