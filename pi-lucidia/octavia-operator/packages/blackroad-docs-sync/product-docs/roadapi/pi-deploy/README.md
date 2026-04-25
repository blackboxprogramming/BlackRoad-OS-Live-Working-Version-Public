# roadapi - Pi Deployment

**Description:** Core API Gateway
**Target Pi:** lucidia (192.168.4.38)
**Port:** 3001

## Deployment Instructions

1. Copy files to Pi:
```bash
scp -r /Users/alexa/roadapi-pi-deploy pi@192.168.4.38:~/
```

2. SSH into Pi:
```bash
ssh pi@192.168.4.38
```

3. Deploy:
```bash
cd roadapi-pi-deploy
./deploy.sh
```

4. Verify:
```bash
curl http://localhost:3001
curl http://localhost:3001/health
```

5. Monitor:
```bash
docker logs -f roadapi
```

## Management

- Stop: `docker-compose down`
- Restart: `docker-compose restart`
- Logs: `docker-compose logs -f`
- Status: `docker-compose ps`
