# roadlog-monitoring - Pi Deployment

**Description:** Monitoring Dashboard
**Target Pi:** blackroad-pi (192.168.4.64)
**Port:** 9090

## Deployment Instructions

1. Copy files to Pi:
```bash
scp -r /Users/alexa/roadlog-monitoring-pi-deploy pi@192.168.4.64:~/
```

2. SSH into Pi:
```bash
ssh pi@192.168.4.64
```

3. Deploy:
```bash
cd roadlog-monitoring-pi-deploy
./deploy.sh
```

4. Verify:
```bash
curl http://localhost:9090
curl http://localhost:9090/health
```

5. Monitor:
```bash
docker logs -f roadlog-monitoring
```

## Management

- Stop: `docker-compose down`
- Restart: `docker-compose restart`
- Logs: `docker-compose logs -f`
- Status: `docker-compose ps`
