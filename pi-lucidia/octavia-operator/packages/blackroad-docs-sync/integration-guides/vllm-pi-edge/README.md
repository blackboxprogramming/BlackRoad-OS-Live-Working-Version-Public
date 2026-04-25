# vLLM Edge AI Inference

**Target:** lucidia (192.168.4.38)
**Model:** TinyLlama 1.1B (optimized for Raspberry Pi)
**Port:** 8000

## Deploy:
```bash
scp -r /Users/alexa/vllm-pi-edge pi@192.168.4.38:~/
ssh pi@192.168.4.38 'cd vllm-pi-edge && docker-compose up -d'
```

## Test:
```bash
curl http://192.168.4.38:8000/v1/models
```
