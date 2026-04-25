# BlackRoad OS Backend - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Production Deployment](#production-deployment)
5. [Cloud Platforms](#cloud-platforms)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (for containerized deployment)

### Required Environment Variables
```env
DATABASE_URL=postgresql://user:password@host:port/dbname
DATABASE_ASYNC_URL=postgresql+asyncpg://user:password@host:port/dbname
REDIS_URL=redis://host:port/0
SECRET_KEY=your-secret-key
ALLOWED_ORIGINS=https://yourdomain.com
```

> 💡 **Railway-first secrets**: copy `backend/.env.example` to `.env` for local
> runs, but store the real values inside your Railway project. The template is
> kept in sync with `app.config.Settings` by the
> [`scripts/railway/validate_env_template.py`](../scripts/railway/validate_env_template.py)
> audit script, which also runs automatically in CI.

### Railway Secrets Checklist

1. Install the Railway CLI and authenticate: `curl -fsSL https://railway.app/install.sh | sh`
2. Link the project locally: `railway link <project-id>`
3. Use the template to populate secrets:
   ```bash
   while IFS='=' read -r key value; do
     if [[ -n "$key" && $key != \#* ]]; then
       railway variables set "$key" "$value"
     fi
   done < backend/.env.example
   ```
4. Override placeholder values using the Railway dashboard or `railway variables set`.
5. Verify everything with `railway variables list` or by running the GitHub
   Action **Railway Secrets & Automation Audit** from the Actions tab.

## Local Development

### 1. Setup Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Start Dependencies
```bash
# PostgreSQL
docker run -d -p 5432:5432 \
  -e POSTGRES_USER=blackroad \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=blackroad_db \
  postgres:15-alpine

# Redis
docker run -d -p 6379:6379 redis:7-alpine
```

### 4. Run Application
```bash
# PORT defaults to 8000 if not set
python run.py                          # respects the PORT env variable
# Or using uvicorn directly:
uvicorn app.main:app --reload --host 0.0.0.0 --port ${PORT:-8000}
```

Access the API:
- API: http://localhost:8000
- Docs: http://localhost:8000/api/docs

## Docker Deployment

### Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Production Build
```bash
# Build production image
docker build -t blackroad-backend:production .

# Run with production settings
docker run -d \
  -p 8000:8000 \
  --env-file .env.production \
  --name blackroad-backend \
  blackroad-backend:production
```

## Production Deployment

### Security Checklist
- [ ] Generate strong SECRET_KEY: `openssl rand -hex 32`
- [ ] Set DEBUG=False
- [ ] Configure HTTPS/SSL
- [ ] Use strong database passwords
- [ ] Enable CORS only for trusted origins
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Configure logging

### 1. DigitalOcean Deployment

#### Using App Platform
```bash
# Create app.yaml
doctl apps create --spec .do/app.yaml

# Or use the web interface:
# 1. Connect GitHub repository
# 2. Configure environment variables
# 3. Deploy
```

#### Using Droplet
```bash
# Create droplet
doctl compute droplet create blackroad-backend \
  --image ubuntu-22-04-x64 \
  --size s-2vcpu-4gb \
  --region nyc1

# SSH into droplet
ssh root@your-droplet-ip

# Install dependencies
apt update && apt install -y docker.io docker-compose git

# Clone repository
git clone https://github.com/your-org/BlackRoad-Operating-System.git
cd BlackRoad-Operating-System/backend

# Configure environment
cp .env.example .env
nano .env  # Edit settings

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### 2. AWS Deployment

#### Using ECS (Elastic Container Service)
```bash
# Build and push to ECR
aws ecr create-repository --repository-name blackroad-backend
docker tag blackroad-backend:latest \
  123456789012.dkr.ecr.us-east-1.amazonaws.com/blackroad-backend:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/blackroad-backend:latest

# Create ECS task definition and service
aws ecs create-cluster --cluster-name blackroad-cluster
# ... (see AWS ECS documentation for full setup)
```

#### Using EC2
```bash
# Launch EC2 instance (t3.medium recommended)
# SSH into instance
ssh -i your-key.pem ubuntu@ec2-instance-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Deploy application
# ... (similar to DigitalOcean Droplet steps)
```

### 3. Google Cloud Platform

#### Using Cloud Run
```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/your-project/blackroad-backend

# Deploy to Cloud Run
gcloud run deploy blackroad-backend \
  --image gcr.io/your-project/blackroad-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=... \
  --allow-unauthenticated
```

### 4. Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create blackroad-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Add Redis
heroku addons:create heroku-redis:hobby-dev

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set ENVIRONMENT=production

# Deploy
git push heroku main

# Scale
heroku ps:scale web=1
```

## Database Migrations

### Using Alembic
```bash
# Initialize Alembic (already done)
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Add new table"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Monitoring

### Health Checks
```bash
# API health
curl http://your-domain.com/health

# Expected response:
# {"status": "healthy", "timestamp": 1234567890}
```

### Logging
```python
# Configure logging in production
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/blackroad/app.log'),
        logging.StreamHandler()
    ]
)
```

### Monitoring Tools
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization
- **Sentry**: Error tracking
- **New Relic**: APM
- **Datadog**: Full-stack monitoring

## Performance Optimization

### Database
```python
# Add indexes to frequently queried columns
# In your models:
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(255), unique=True, index=True)
```

### Caching
```python
# Implement Redis caching
from app.redis_client import get_redis

async def get_cached_data(key: str):
    redis = await get_redis()
    cached = await redis.get(key)
    if cached:
        return json.loads(cached)
    return None
```

### Rate Limiting
```python
# Add to main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
```

## Backup and Recovery

### Database Backups
```bash
# Automated PostgreSQL backups
# Add to crontab:
0 2 * * * pg_dump -U blackroad blackroad_db > /backups/db_$(date +\%Y\%m\%d).sql

# Restore from backup
psql -U blackroad blackroad_db < /backups/db_20231215.sql
```

### File Storage Backups
```bash
# Sync to S3
aws s3 sync /var/lib/blackroad/files s3://blackroad-backups/files
```

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check connection
psql -U blackroad -h localhost -d blackroad_db
```

#### Redis Connection Issues
```bash
# Check Redis is running
docker ps | grep redis

# Test connection
redis-cli ping
```

#### High Memory Usage
```bash
# Check container stats
docker stats

# Adjust worker processes
uvicorn app.main:app --workers 2 --limit-concurrency 100
```

### Debugging
```bash
# View logs
docker-compose logs -f backend

# Enter container
docker exec -it blackroad_backend bash

# Check database
docker exec -it blackroad_postgres psql -U blackroad -d blackroad_db
```

## Support

For issues and questions:
- GitHub Issues: https://github.com/blackboxprogramming/BlackRoad-Operating-System/issues
- Documentation: http://your-domain.com/api/docs
