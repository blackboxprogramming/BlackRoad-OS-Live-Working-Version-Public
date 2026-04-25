#!/usr/bin/env bash
# OPS Role Deployment Script
# For lucidia-pi and alice-pi

set -euo pipefail

echo "━━━ OPS Deployment ━━━"
echo "Repo: $REPO_PATH"
echo "Commit: $COMMIT"
echo "Task: $TASK"

case "$TASK" in
    deploy-frontend)
        echo "Building frontend..."
        cd "$REPO_PATH"

        if [[ -f "package.json" ]]; then
            npm install
            npm run build

            # Upload to Cloudflare Pages if on lucidia
            if [[ "$(hostname)" == "lucidia" ]] && command -v wrangler &> /dev/null; then
                echo "Deploying to Cloudflare Pages..."
                wrangler pages deploy dist --project-name="$(basename $REPO_PATH)"
            fi
        fi
        ;;

    deploy-backend)
        echo "Deploying backend..."
        cd "$REPO_PATH"

        # If on alice-pi, deploy to K8s
        if [[ "$(hostname)" == "alice" ]] && command -v kubectl &> /dev/null; then
            echo "Deploying to Kubernetes..."
            kubectl apply -f k8s/
        fi
        ;;

    deploy-k8s)
        echo "Kubernetes deployment..."
        cd "$REPO_PATH"

        if command -v kubectl &> /dev/null; then
            kubectl apply -f k8s/ || kubectl apply -f kubernetes/
        else
            echo "kubectl not available"
            exit 1
        fi
        ;;

    *)
        echo "Generic deployment for ops role"
        cd "$REPO_PATH"

        # Check for common build files
        if [[ -f "Dockerfile" ]]; then
            echo "Building Docker image..."
            docker build -t "blackroad/$(basename $REPO_PATH):$COMMIT" .
        elif [[ -f "package.json" ]]; then
            echo "Installing npm dependencies..."
            npm install
        elif [[ -f "requirements.txt" ]]; then
            echo "Installing Python dependencies..."
            pip3 install -r requirements.txt
        fi
        ;;
esac

echo "✅ OPS deployment complete"
