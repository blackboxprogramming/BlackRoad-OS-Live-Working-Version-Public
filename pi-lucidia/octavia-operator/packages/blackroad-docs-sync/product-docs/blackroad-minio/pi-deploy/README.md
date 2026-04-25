# blackroad-minio - Pi Deployment

**Description:** Object Storage
**Target Pi:** lucidia-alt (192.168.4.99)
**Port:** 9000

## Deployment Instructions

1. Copy files to Pi:
```bash
scp -r /Users/alexa/blackroad-minio-pi-deploy pi@192.168.4.99:~/
```

2. SSH into Pi:
```bash
ssh pi@192.168.4.99
```

3. Deploy:
```bash
cd blackroad-minio-pi-deploy
./deploy.sh
```

4. Verify:
```bash
curl http://localhost:9000
curl http://localhost:9000/health
```

5. Monitor:
```bash
docker logs -f blackroad-minio
```

## Management

- Stop: `docker-compose down`
- Restart: `docker-compose restart`
- Logs: `docker-compose logs -f`
- Status: `docker-compose ps`
