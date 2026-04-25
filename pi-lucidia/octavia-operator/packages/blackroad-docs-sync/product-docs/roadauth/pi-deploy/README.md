# roadauth - Pi Deployment

**Description:** Authentication Service
**Target Pi:** lucidia (192.168.4.38)
**Port:** 3002

## Deployment Instructions

1. Copy files to Pi:
```bash
scp -r /Users/alexa/roadauth-pi-deploy pi@192.168.4.38:~/
```

2. SSH into Pi:
```bash
ssh pi@192.168.4.38
```

3. Deploy:
```bash
cd roadauth-pi-deploy
./deploy.sh
```

4. Verify:
```bash
curl http://localhost:3002
curl http://localhost:3002/health
```

5. Monitor:
```bash
docker logs -f roadauth
```

## Management

- Stop: `docker-compose down`
- Restart: `docker-compose restart`
- Logs: `docker-compose logs -f`
- Status: `docker-compose ps`
