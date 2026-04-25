#!/bin/bash
# Deploy BlackRoad Agent NLP to fleet
# Usage: ./deploy-nlp.sh [host|all]

set -e

NLP_DIR="/opt/blackroad/nlp"
HOSTS="cecilia lucidia octavia aria"

deploy_to_host() {
    local host=$1
    echo "━━━ Deploying to $host ━━━"

    # Create directory
    ssh $host "sudo mkdir -p $NLP_DIR && sudo chown \$(whoami) $NLP_DIR"

    # Copy files
    scp nlp_core.py agent_nlp_service.py $host:$NLP_DIR/

    # Create systemd service
    ssh $host "cat > /tmp/blackroad-nlp.service << 'EOF'
[Unit]
Description=BlackRoad Agent NLP Service
After=network.target ollama.service
Wants=ollama.service

[Service]
Type=simple
WorkingDirectory=$NLP_DIR
Environment=\"AGENT_NAME=\$(hostname)\"
Environment=\"NLP_MODEL=llama3.2:3b\"
Environment=\"NLP_PORT=4020\"
Environment=\"SAFE_MODE=true\"
ExecStart=/usr/bin/python3 $NLP_DIR/agent_nlp_service.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
sudo mv /tmp/blackroad-nlp.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable blackroad-nlp.service
sudo systemctl restart blackroad-nlp.service"

    # Verify
    sleep 2
    ssh $host "systemctl status blackroad-nlp.service --no-pager | head -10"
    echo ""
}

if [ "$1" = "all" ] || [ -z "$1" ]; then
    for host in $HOSTS; do
        deploy_to_host $host
    done
    echo "✅ Deployed to all hosts"
elif [ -n "$1" ]; then
    deploy_to_host $1
fi

echo ""
echo "Test with:"
echo "  curl http://<host>:4020/health"
echo "  curl -X POST http://<host>:4020/process -d '{\"text\":\"check system status\"}'"
