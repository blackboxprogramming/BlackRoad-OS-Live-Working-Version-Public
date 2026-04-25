# blackroad-vllm - Pi Deployment

**Description:** vLLM Inference Server
**Target Pi:** blackroad-pi (192.168.4.64)
**Port:** 8000

## Deployment Instructions

1. Copy files to Pi:
```bash
scp -r /Users/alexa/blackroad-vllm-pi-deploy pi@192.168.4.64:~/
```

2. SSH into Pi:
```bash
ssh pi@192.168.4.64
```

3. Deploy:
```bash
cd blackroad-vllm-pi-deploy
./deploy.sh
```

4. Verify:
```bash
curl http://localhost:8000
curl http://localhost:8000/health
```

5. Monitor:
```bash
docker logs -f blackroad-vllm
```

## Management

- Stop: `docker-compose down`
- Restart: `docker-compose restart`
- Logs: `docker-compose logs -f`
- Status: `docker-compose ps`
