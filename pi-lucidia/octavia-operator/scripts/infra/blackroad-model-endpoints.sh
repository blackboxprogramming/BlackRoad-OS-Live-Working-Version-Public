#!/bin/bash
# BlackRoad Model Endpoints
# Production-ready model serving with load balancing
# Agent: Icarus (b3e01bd9)

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

ENDPOINTS_DIR="$HOME/.blackroad/endpoints"
ENDPOINTS_DB="$ENDPOINTS_DIR/endpoints.db"
ALL_NODES=("lucidia" "cecilia" "octavia" "aria" "alice")

# Initialize
init() {
    mkdir -p "$ENDPOINTS_DIR"/{configs,logs}

    sqlite3 "$ENDPOINTS_DB" << 'SQL'
CREATE TABLE IF NOT EXISTS endpoints (
    name TEXT PRIMARY KEY,
    model TEXT,
    nodes TEXT,
    strategy TEXT DEFAULT 'round-robin',
    replicas INTEGER DEFAULT 1,
    max_batch_size INTEGER DEFAULT 1,
    timeout_ms INTEGER DEFAULT 30000,
    status TEXT DEFAULT 'stopped',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS instances (
    id TEXT PRIMARY KEY,
    endpoint TEXT,
    node TEXT,
    port INTEGER,
    status TEXT DEFAULT 'starting',
    requests INTEGER DEFAULT 0,
    errors INTEGER DEFAULT 0,
    avg_latency_ms REAL DEFAULT 0,
    last_health DATETIME,
    FOREIGN KEY (endpoint) REFERENCES endpoints(name)
);

CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    endpoint TEXT,
    instance TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    latency_ms INTEGER,
    status TEXT,
    tokens_in INTEGER,
    tokens_out INTEGER
);

CREATE INDEX IF NOT EXISTS idx_endpoint ON instances(endpoint);
CREATE INDEX IF NOT EXISTS idx_requests ON requests(endpoint);
SQL

    echo -e "${GREEN}Model endpoints system initialized${RESET}"
}

# Create endpoint
create() {
    local name="$1"
    local model="$2"
    local nodes="${3:-cecilia}"
    local replicas="${4:-1}"
    local strategy="${5:-round-robin}"

    sqlite3 "$ENDPOINTS_DB" "
        INSERT OR REPLACE INTO endpoints (name, model, nodes, replicas, strategy)
        VALUES ('$name', '$model', '$nodes', $replicas, '$strategy')
    "

    echo -e "${GREEN}Endpoint created: $name${RESET}"
    echo "  Model: $model"
    echo "  Nodes: $nodes"
    echo "  Replicas: $replicas"
    echo "  Strategy: $strategy"
}

# Deploy endpoint
deploy() {
    local name="$1"

    local endpoint=$(sqlite3 "$ENDPOINTS_DB" "
        SELECT model, nodes, replicas FROM endpoints WHERE name = '$name'
    ")

    if [ -z "$endpoint" ]; then
        echo -e "${RED}Endpoint not found: $name${RESET}"
        return 1
    fi

    local model=$(echo "$endpoint" | cut -d'|' -f1)
    local nodes=$(echo "$endpoint" | cut -d'|' -f2)
    local replicas=$(echo "$endpoint" | cut -d'|' -f3)

    echo -e "${PINK}╔══════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║           🚀 DEPLOYING: $name${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════════╝${RESET}"
    echo

    # Parse nodes
    IFS=',' read -ra NODE_LIST <<< "$nodes"

    local instance_num=0
    for i in $(seq 1 "$replicas"); do
        local node_idx=$(( (i - 1) % ${#NODE_LIST[@]} ))
        local node="${NODE_LIST[$node_idx]}"

        local instance_id="${name}_${node}_${i}"

        echo -n "  Deploying instance $i on $node... "

        # Check if Ollama is running
        if ! ssh -o ConnectTimeout=5 "$node" "curl -s http://localhost:11434/api/tags" >/dev/null 2>&1; then
            echo -e "${YELLOW}Ollama not running, starting...${RESET}"
            ssh "$node" "sudo systemctl start ollama" 2>/dev/null
            sleep 3
        fi

        # Ensure model is loaded
        ssh "$node" "curl -s http://localhost:11434/api/pull -d '{\"name\":\"$model\"}'" >/dev/null 2>&1 &

        sqlite3 "$ENDPOINTS_DB" "
            INSERT OR REPLACE INTO instances (id, endpoint, node, port, status)
            VALUES ('$instance_id', '$name', '$node', 11434, 'running')
        "

        echo -e "${GREEN}done${RESET}"
        ((instance_num++))
    done

    sqlite3 "$ENDPOINTS_DB" "UPDATE endpoints SET status = 'running' WHERE name = '$name'"

    echo
    echo -e "${GREEN}Deployed $instance_num instances${RESET}"
}

# Undeploy endpoint
undeploy() {
    local name="$1"

    sqlite3 "$ENDPOINTS_DB" "
        DELETE FROM instances WHERE endpoint = '$name';
        UPDATE endpoints SET status = 'stopped' WHERE name = '$name';
    "

    echo -e "${GREEN}Undeployed: $name${RESET}"
}

# Invoke endpoint
invoke() {
    local name="$1"
    local prompt="$2"
    local stream="${3:-false}"

    local endpoint=$(sqlite3 "$ENDPOINTS_DB" "
        SELECT model, strategy, timeout_ms FROM endpoints WHERE name = '$name'
    ")

    if [ -z "$endpoint" ]; then
        echo -e "${RED}Endpoint not found: $name${RESET}"
        return 1
    fi

    local model=$(echo "$endpoint" | cut -d'|' -f1)
    local strategy=$(echo "$endpoint" | cut -d'|' -f2)
    local timeout=$(echo "$endpoint" | cut -d'|' -f3)

    # Get instance based on strategy
    local instance
    case "$strategy" in
        round-robin)
            instance=$(sqlite3 "$ENDPOINTS_DB" "
                SELECT id, node, port FROM instances
                WHERE endpoint = '$name' AND status = 'running'
                ORDER BY requests ASC LIMIT 1
            ")
            ;;
        least-latency)
            instance=$(sqlite3 "$ENDPOINTS_DB" "
                SELECT id, node, port FROM instances
                WHERE endpoint = '$name' AND status = 'running'
                ORDER BY avg_latency_ms ASC LIMIT 1
            ")
            ;;
        random)
            instance=$(sqlite3 "$ENDPOINTS_DB" "
                SELECT id, node, port FROM instances
                WHERE endpoint = '$name' AND status = 'running'
                ORDER BY RANDOM() LIMIT 1
            ")
            ;;
    esac

    if [ -z "$instance" ]; then
        echo -e "${RED}No healthy instances for: $name${RESET}"
        return 1
    fi

    local instance_id=$(echo "$instance" | cut -d'|' -f1)
    local node=$(echo "$instance" | cut -d'|' -f2)
    local port=$(echo "$instance" | cut -d'|' -f3)

    local request_id="req_$(date +%s%N)"

    # Record request start
    sqlite3 "$ENDPOINTS_DB" "
        INSERT INTO requests (id, endpoint, instance) VALUES ('$request_id', '$name', '$instance_id');
        UPDATE instances SET requests = requests + 1 WHERE id = '$instance_id';
    "

    local start=$(date +%s%N)

    # Make request
    local response=$(ssh -o ConnectTimeout=$((timeout/1000)) "$node" "
        curl -s --max-time $((timeout/1000)) http://localhost:$port/api/generate \
            -d '{\"model\":\"$model\",\"prompt\":\"$prompt\",\"stream\":$stream}'
    " 2>/dev/null)

    local end=$(date +%s%N)
    local latency=$(( (end - start) / 1000000 ))

    local status="success"
    if [ -z "$response" ] || echo "$response" | jq -e '.error' >/dev/null 2>&1; then
        status="error"
        sqlite3 "$ENDPOINTS_DB" "UPDATE instances SET errors = errors + 1 WHERE id = '$instance_id'"
    fi

    # Record completion
    sqlite3 "$ENDPOINTS_DB" "
        UPDATE requests SET completed_at = datetime('now'), latency_ms = $latency, status = '$status'
        WHERE id = '$request_id';
        UPDATE instances SET avg_latency_ms = (avg_latency_ms * (requests - 1) + $latency) / requests
        WHERE id = '$instance_id';
    "

    echo "$response" | jq -r '.response // .error // "No response"'
}

# Health check
health() {
    local name="${1:-all}"

    echo -e "${PINK}=== ENDPOINT HEALTH ===${RESET}"
    echo

    local where=""
    [ "$name" != "all" ] && where="WHERE endpoint = '$name'"

    sqlite3 "$ENDPOINTS_DB" "
        SELECT id, endpoint, node, port, status, requests, errors, avg_latency_ms
        FROM instances $where ORDER BY endpoint
    " | while IFS='|' read -r id ep node port status reqs errs latency; do
        local health_color=$GREEN
        [ "$status" = "unhealthy" ] && health_color=$RED

        # Quick health check
        local healthy=$(ssh -o ConnectTimeout=2 "$node" "curl -s -o /dev/null -w '%{http_code}' http://localhost:$port/api/tags" 2>/dev/null)

        if [ "$healthy" != "200" ]; then
            health_color=$RED
            status="unhealthy"
            sqlite3 "$ENDPOINTS_DB" "UPDATE instances SET status = 'unhealthy' WHERE id = '$id'"
        else
            sqlite3 "$ENDPOINTS_DB" "UPDATE instances SET status = 'running', last_health = datetime('now') WHERE id = '$id'"
        fi

        printf "  %-25s %-10s ${health_color}%-10s${RESET} reqs:%-5d errs:%-3d lat:%.0fms\n" \
            "$id" "$node" "$status" "$reqs" "$errs" "$latency"
    done
}

# Scale endpoint
scale() {
    local name="$1"
    local replicas="$2"

    sqlite3 "$ENDPOINTS_DB" "UPDATE endpoints SET replicas = $replicas WHERE name = '$name'"

    # Redeploy with new replica count
    undeploy "$name" >/dev/null
    deploy "$name"
}

# List endpoints
list() {
    echo -e "${PINK}=== MODEL ENDPOINTS ===${RESET}"
    echo

    sqlite3 "$ENDPOINTS_DB" "
        SELECT e.name, e.model, e.status, e.replicas, e.strategy,
               (SELECT COUNT(*) FROM instances i WHERE i.endpoint = e.name AND i.status = 'running')
        FROM endpoints e ORDER BY e.name
    " | while IFS='|' read -r name model status replicas strategy running; do
        local status_color=$YELLOW
        [ "$status" = "running" ] && status_color=$GREEN
        [ "$status" = "stopped" ] && status_color=$RED

        printf "  %-20s %-15s ${status_color}%-10s${RESET} %d/%d (%s)\n" \
            "$name" "$model" "$status" "$running" "$replicas" "$strategy"
    done
}

# Endpoint stats
stats() {
    local name="$1"

    echo -e "${PINK}=== ENDPOINT STATS: $name ===${RESET}"
    echo

    # Get summary stats
    local total=$(sqlite3 "$ENDPOINTS_DB" "SELECT COUNT(*) FROM requests WHERE endpoint = '$name'")
    local success=$(sqlite3 "$ENDPOINTS_DB" "SELECT COUNT(*) FROM requests WHERE endpoint = '$name' AND status = 'success'")
    local avg_lat=$(sqlite3 "$ENDPOINTS_DB" "SELECT AVG(latency_ms) FROM requests WHERE endpoint = '$name' AND status = 'success'")
    local p99=$(sqlite3 "$ENDPOINTS_DB" "
        SELECT latency_ms FROM requests WHERE endpoint = '$name' AND status = 'success'
        ORDER BY latency_ms DESC LIMIT 1 OFFSET (SELECT COUNT(*) * 0.01 FROM requests WHERE endpoint = '$name')
    ")

    echo "Total requests: $total"
    [ "$total" -gt 0 ] && echo "Success rate: $(echo "scale=1; $success * 100 / $total" | bc)%"
    printf "Avg latency: %.0fms\n" "${avg_lat:-0}"
    printf "P99 latency: %dms\n" "${p99:-0}"

    echo
    echo "Requests per instance:"
    sqlite3 "$ENDPOINTS_DB" "
        SELECT id, requests, errors, avg_latency_ms FROM instances WHERE endpoint = '$name'
    " | while IFS='|' read -r id reqs errs lat; do
        printf "  %-25s reqs:%d errs:%d lat:%.0fms\n" "$id" "$reqs" "$errs" "$lat"
    done

    echo
    echo "Last 10 requests:"
    sqlite3 "$ENDPOINTS_DB" "
        SELECT instance, latency_ms, status, started_at FROM requests
        WHERE endpoint = '$name' ORDER BY started_at DESC LIMIT 10
    " | while IFS='|' read -r inst lat status started; do
        local status_icon="✓"
        [ "$status" = "error" ] && status_icon="✗"
        printf "  %s %-25s %dms %s\n" "$status_icon" "$inst" "$lat" "$started"
    done
}

# Benchmark endpoint
benchmark() {
    local name="$1"
    local requests="${2:-10}"
    local concurrent="${3:-1}"

    echo -e "${PINK}=== BENCHMARKING: $name ===${RESET}"
    echo "Requests: $requests | Concurrency: $concurrent"
    echo

    local prompts=(
        "What is 2+2?"
        "Hello world"
        "Explain AI briefly"
        "Write a haiku"
        "What is Python?"
    )

    local start_time=$(date +%s)
    local completed=0
    local total_lat=0

    for i in $(seq 1 $requests); do
        local prompt="${prompts[$((i % ${#prompts[@]}))]}"

        local req_start=$(date +%s%N)
        invoke "$name" "$prompt" >/dev/null 2>&1
        local req_end=$(date +%s%N)
        local lat=$(( (req_end - req_start) / 1000000 ))

        ((completed++))
        total_lat=$((total_lat + lat))

        printf "\r  Progress: %d/%d (avg: %dms)" "$completed" "$requests" "$((total_lat / completed))"
    done

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    echo
    echo
    echo "Results:"
    echo "  Duration: ${duration}s"
    echo "  Throughput: $(echo "scale=2; $requests / $duration" | bc) req/s"
    echo "  Avg latency: $((total_lat / requests))ms"
}

# Help
help() {
    echo -e "${PINK}BlackRoad Model Endpoints${RESET}"
    echo
    echo "Production model serving with load balancing"
    echo
    echo "Commands:"
    echo "  create <name> <model> [nodes] [rep]  Create endpoint"
    echo "  deploy <name>                        Deploy endpoint"
    echo "  undeploy <name>                      Stop endpoint"
    echo "  invoke <name> <prompt>               Call endpoint"
    echo "  health [name]                        Health check"
    echo "  scale <name> <replicas>              Scale replicas"
    echo "  list                                 List endpoints"
    echo "  stats <name>                         Endpoint statistics"
    echo "  benchmark <name> [reqs] [conc]       Load test"
    echo
    echo "Strategies: round-robin, least-latency, random"
    echo
    echo "Examples:"
    echo "  $0 create chat llama3.2:1b 'cecilia,lucidia' 2"
    echo "  $0 deploy chat"
    echo "  $0 invoke chat 'Hello!'"
}

# Ensure initialized
[ -f "$ENDPOINTS_DB" ] || init >/dev/null

case "${1:-help}" in
    init)
        init
        ;;
    create)
        create "$2" "$3" "$4" "$5" "$6"
        ;;
    deploy)
        deploy "$2"
        ;;
    undeploy|stop)
        undeploy "$2"
        ;;
    invoke|call)
        invoke "$2" "$3" "$4"
        ;;
    health|check)
        health "$2"
        ;;
    scale)
        scale "$2" "$3"
        ;;
    list|ls)
        list
        ;;
    stats)
        stats "$2"
        ;;
    benchmark|bench)
        benchmark "$2" "$3" "$4"
        ;;
    *)
        help
        ;;
esac
