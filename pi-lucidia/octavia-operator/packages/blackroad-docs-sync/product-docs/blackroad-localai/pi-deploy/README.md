# blackroad-localai - Pi Deployment

**Description:** LocalAI Server
**Target Pi:** lucidia-alt (192.168.4.99)
**Port:** 8080

## Deployment Instructions

1. Copy files to Pi:
```bash
scp -r /Users/alexa/blackroad-localai-pi-deploy pi@192.168.4.99:~/
```

2. SSH into Pi:
```bash
ssh pi@192.168.4.99
```

3. Deploy:
```bash
cd blackroad-localai-pi-deploy
./deploy.sh
```

4. Verify:
```bash
curl http://localhost:8080
curl http://localhost:8080/health
```

5. Monitor:
```bash
docker logs -f blackroad-localai
```

## Management

- Stop: `docker-compose down`
- Restart: `docker-compose restart`
- Logs: `docker-compose logs -f`
- Status: `docker-compose ps`
