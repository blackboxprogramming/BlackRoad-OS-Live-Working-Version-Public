# roadbilling - Pi Deployment

**Description:** Billing Service
**Target Pi:** blackroad-pi (192.168.4.64)
**Port:** 3003

## Deployment Instructions

1. Copy files to Pi:
```bash
scp -r /Users/alexa/roadbilling-pi-deploy pi@192.168.4.64:~/
```

2. SSH into Pi:
```bash
ssh pi@192.168.4.64
```

3. Deploy:
```bash
cd roadbilling-pi-deploy
./deploy.sh
```

4. Verify:
```bash
curl http://localhost:3003
curl http://localhost:3003/health
```

5. Monitor:
```bash
docker logs -f roadbilling
```

## Management

- Stop: `docker-compose down`
- Restart: `docker-compose restart`
- Logs: `docker-compose logs -f`
- Status: `docker-compose ps`
