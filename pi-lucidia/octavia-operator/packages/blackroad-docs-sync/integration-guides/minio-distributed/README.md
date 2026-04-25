# MinIO Distributed Storage

Deploy to each Pi for distributed object storage.

## Deploy to all Pis:
```bash
for pi in lucidia:192.168.4.38 blackroad-pi:192.168.4.64 lucidia-alt:192.168.4.99; do
    IFS=':' read -r name ip <<< "$pi"
    echo "Deploying to $name ($ip)..."
    scp -r /Users/alexa/minio-distributed pi@$ip:~/
    ssh pi@$ip 'cd minio-distributed && docker-compose up -d'
done
```

## Access:
- Console: http://[PI_IP]:9001
- API: http://[PI_IP]:9000
- User: blackroad
- Pass: blackroad-secure-2026
