# Troubleshooting Guide

> Solutions to common issues in BlackRoad OS

---

## 📋 Quick Diagnostics

Run these commands first to diagnose issues:

```bash
# Full system health check
./health.sh

# Infrastructure mesh status
./blackroad-mesh.sh

# Check all services
./status.sh

# View recent logs
./logs.sh
```

---

## 🔴 Critical Issues

### System Won't Start

**Symptoms:**
- `./boot.sh` fails
- Services don't come online
- No agent response

**Solutions:**

```bash
# 1. Check if Ollama is running
curl http://localhost:11434/api/tags
# If not running:
ollama serve &

# 2. Check environment variables
cat .env | grep -E "^[A-Z]"
# Ensure required vars are set

# 3. Check port conflicts
lsof -i :8000  # API port
lsof -i :11434 # Ollama port
lsof -i :3000  # Web port

# 4. Reset and restart
./scripts/reset.sh
./boot.sh
```

### Agent Not Responding

**Symptoms:**
- Agent shows as offline
- Tasks stuck in queue
- No wake response

**Solutions:**

```bash
# 1. Check agent status
./status.sh | grep -i agent

# 2. Try manual wake
./wake.sh llama3.2 ALICE

# 3. Check Ollama models
ollama list
# If model missing:
ollama pull llama3.2

# 4. Check agent logs
cat cece-logs/alice-*.log | tail -50

# 5. Restart agent service
./scripts/restart-agent.sh ALICE
```

### Memory System Failure

**Symptoms:**
- Memory writes fail
- Search returns empty
- Consolidation errors

**Solutions:**

```bash
# 1. Check Redis connection
redis-cli ping
# Should return PONG

# 2. Check Pinecone connection
curl -H "Api-Key: $PINECONE_API_KEY" \
  https://your-index.pinecone.io/describe_index_stats

# 3. Check memory service
curl http://localhost:8001/health

# 4. Clear corrupted cache
redis-cli FLUSHDB

# 5. Rebuild vector index
python scripts/rebuild_vectors.py
```

---

## 🟡 Common Issues

### Ollama Issues

#### Model Not Found

```bash
# Error: model 'llama3.2' not found

# Solution: Pull the model
ollama pull llama3.2

# List available models
ollama list
```

#### Ollama Not Running

```bash
# Error: connection refused to localhost:11434

# Solution 1: Start Ollama
ollama serve

# Solution 2: Check if already running
ps aux | grep ollama

# Solution 3: Kill and restart
pkill ollama
sleep 2
ollama serve &
```

#### Out of Memory

```bash
# Error: CUDA out of memory

# Solution 1: Use smaller model
ollama pull llama3.2:1b  # 1B instead of 8B

# Solution 2: Reduce context
export OLLAMA_NUM_CTX=2048

# Solution 3: Check GPU memory
nvidia-smi
```

### Git Issues

#### Push Rejected

```bash
# Error: failed to push some refs

# Solution 1: Pull first
git pull --rebase origin main

# Solution 2: Force push (careful!)
git push --force-with-lease

# Solution 3: Check branch protection
gh api repos/{owner}/{repo}/branches/main/protection
```

#### Large File Error

```bash
# Error: file exceeds 100MB limit

# Solution: Use Git LFS
git lfs install
git lfs track "*.bin"
git add .gitattributes
git add large-file.bin
git commit -m "Add large file with LFS"
```

### API Issues

#### 401 Unauthorized

```bash
# Error: {"error": "unauthorized"}

# Solution 1: Check API key
echo $BLACKROAD_API_KEY

# Solution 2: Regenerate key
./scripts/regenerate-api-key.sh

# Solution 3: Check token expiry
jwt decode $TOKEN
```

#### 429 Rate Limited

```bash
# Error: {"error": "rate_limited"}

# Solution 1: Wait and retry
sleep 60

# Solution 2: Check rate limit headers
curl -I https://api.blackroad.io/v1/agents

# Solution 3: Upgrade tier
# Contact support for higher limits
```

#### 500 Internal Error

```bash
# Error: {"error": "internal_error"}

# Solution 1: Check server logs
railway logs

# Solution 2: Check service health
./blackroad-mesh.sh

# Solution 3: Report bug
gh issue create --title "500 error" --body "..."
```

### Docker Issues

#### Container Won't Start

```bash
# Error: container exited with code 1

# Solution 1: Check logs
docker logs container_name

# Solution 2: Check resources
docker stats

# Solution 3: Rebuild
docker compose down
docker compose build --no-cache
docker compose up -d
```

#### Port Already in Use

```bash
# Error: port is already allocated

# Solution 1: Find process
lsof -i :8000

# Solution 2: Kill process
kill -9 $(lsof -t -i :8000)

# Solution 3: Use different port
PORT=8001 docker compose up
```

### Network Issues

#### DNS Resolution Failed

```bash
# Error: could not resolve host

# Solution 1: Check DNS
nslookup api.blackroad.io

# Solution 2: Use different DNS
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf

# Solution 3: Check /etc/hosts
cat /etc/hosts
```

#### SSL Certificate Error

```bash
# Error: certificate verify failed

# Solution 1: Update certificates
# macOS
brew install ca-certificates

# Linux
sudo apt update && sudo apt install ca-certificates

# Solution 2: Disable verification (dev only!)
export CURL_CA_BUNDLE=""
```

#### Timeout Errors

```bash
# Error: connection timed out

# Solution 1: Check internet
ping -c 3 google.com

# Solution 2: Check firewall
sudo ufw status

# Solution 3: Increase timeout
export TIMEOUT=60
```

---

## 🟢 Performance Issues

### Slow Response Times

**Diagnosis:**

```bash
# Check latency
time curl http://localhost:8000/health

# Check system resources
htop
```

**Solutions:**

```bash
# 1. Restart services
docker compose restart

# 2. Clear caches
redis-cli FLUSHALL

# 3. Check database
psql -c "SELECT * FROM pg_stat_activity"

# 4. Optimize queries
EXPLAIN ANALYZE SELECT ...
```

### High Memory Usage

**Diagnosis:**

```bash
# Check memory
free -h
docker stats
```

**Solutions:**

```bash
# 1. Restart containers
docker compose restart

# 2. Clear Ollama cache
rm -rf ~/.ollama/models/.cache

# 3. Limit container memory
# In docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       memory: 4G
```

### High CPU Usage

**Diagnosis:**

```bash
# Check CPU
top -o %CPU
```

**Solutions:**

```bash
# 1. Find culprit process
ps aux --sort=-%cpu | head

# 2. Limit container CPU
# In docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       cpus: '2'

# 3. Scale horizontally
docker compose up -d --scale api=3
```

---

## 🔧 Infrastructure Issues

### Cloudflare Issues

#### Worker Deployment Failed

```bash
# Error: failed to deploy worker

# Solution 1: Check wrangler auth
wrangler whoami

# Solution 2: Re-login
wrangler login

# Solution 3: Check worker size
wrangler publish --dry-run
```

#### KV Not Working

```bash
# Error: KV namespace not found

# Solution 1: Check namespace ID
wrangler kv:namespace list

# Solution 2: Update wrangler.toml
[[kv_namespaces]]
binding = "KV"
id = "correct-id-here"
```

### Railway Issues

#### Deployment Failed

```bash
# Error: build failed

# Solution 1: Check build logs
railway logs --build

# Solution 2: Check Dockerfile
docker build -t test .

# Solution 3: Check nixpacks
nixpacks build .
```

#### Service Unavailable

```bash
# Error: service not responding

# Solution 1: Check status
railway status

# Solution 2: Redeploy
railway up --force

# Solution 3: Check healthcheck
curl https://your-service.railway.app/health
```

### Raspberry Pi Issues

#### SSH Connection Refused

```bash
# Error: connection refused

# Solution 1: Check Pi is on
ping 192.168.4.38

# Solution 2: Enable SSH
# On Pi: sudo systemctl enable ssh

# Solution 3: Check firewall
# On Pi: sudo ufw allow 22
```

#### Out of Disk Space

```bash
# Error: no space left on device

# Solution 1: Check disk
df -h

# Solution 2: Clean up
sudo apt autoremove
docker system prune -a

# Solution 3: Expand filesystem
sudo raspi-config  # Advanced > Expand Filesystem
```

---

## 🔍 Debugging Tips

### Enable Debug Mode

```bash
# Python
export DEBUG=1
export LOG_LEVEL=DEBUG

# Node.js
export NODE_ENV=development
export DEBUG=blackroad:*

# Rust
export RUST_LOG=debug
```

### Verbose Logging

```bash
# Add to commands
./status.sh -v
./health.sh --verbose
```

### Check Logs

```bash
# Recent logs
./logs.sh | tail -100

# Specific agent
cat cece-logs/lucidia-*.log

# Docker logs
docker compose logs -f --tail=100

# System logs
journalctl -u blackroad -n 100
```

### Network Debugging

```bash
# Test connectivity
curl -v http://localhost:8000/health

# Check DNS
dig api.blackroad.io

# Trace route
traceroute api.blackroad.io

# Check ports
netstat -tlnp
```

---

## 📞 Getting Help

### Self-Service

1. Check this troubleshooting guide
2. Search GitHub issues
3. Check Discord FAQ channel
4. Review documentation

### Community Support

- **Discord**: discord.gg/blackroad
- **GitHub Discussions**: Ask questions
- **Stack Overflow**: Tag `blackroad-os`

### Direct Support

- **Email**: blackroad.systems@gmail.com
- **Emergency**: On-call rotation

### Filing a Bug Report

```markdown
## Bug Report

**Environment:**
- OS: macOS 14.0
- Node: 22.0.0
- Python: 3.12.0
- Ollama: 0.1.27

**Steps to Reproduce:**
1. Run `./boot.sh`
2. Execute `./wake.sh ALICE`
3. Observe error

**Expected Behavior:**
ALICE should wake up

**Actual Behavior:**
Error: "model not found"

**Logs:**
```
[paste relevant logs]
```

**Additional Context:**
First time setup, fresh install
```

---

*Last updated: 2026-02-05*
