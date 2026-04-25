#!/bin/bash
# BlackRoad Cost Tracker
# Track resource usage and costs across the cluster
# Agent: Icarus (b3e01bd9)

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

COST_DIR="$HOME/.blackroad/costs"
COST_DB="$COST_DIR/costs.db"
ALL_NODES=("lucidia" "cecilia" "octavia" "aria" "alice")

# Default rates (can be customized)
RATE_CPU_HOUR=0.001        # $ per CPU-hour
RATE_MEM_GB_HOUR=0.0005    # $ per GB-hour
RATE_GPU_HOUR=0.01         # $ per GPU-hour (Hailo)
RATE_INFERENCE=0.0001      # $ per inference request
RATE_TOKEN=0.000001        # $ per token

# Initialize
init() {
    mkdir -p "$COST_DIR"/{reports,budgets}

    sqlite3 "$COST_DB" << 'SQL'
CREATE TABLE IF NOT EXISTS usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    node TEXT,
    project TEXT DEFAULT 'default',
    resource_type TEXT,
    quantity REAL,
    unit TEXT,
    cost REAL
);

CREATE TABLE IF NOT EXISTS rates (
    resource_type TEXT PRIMARY KEY,
    rate REAL,
    unit TEXT,
    description TEXT
);

CREATE TABLE IF NOT EXISTS budgets (
    project TEXT PRIMARY KEY,
    monthly_limit REAL,
    alert_threshold REAL DEFAULT 0.8,
    current_spend REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    project TEXT,
    period_start DATE,
    period_end DATE,
    total REAL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project ON usage(project);
CREATE INDEX IF NOT EXISTS idx_timestamp ON usage(timestamp);
SQL

    # Seed default rates
    seed_rates

    echo -e "${GREEN}Cost tracker initialized${RESET}"
}

# Seed default rates
seed_rates() {
    sqlite3 "$COST_DB" << SQL
INSERT OR IGNORE INTO rates (resource_type, rate, unit, description) VALUES
    ('cpu', $RATE_CPU_HOUR, 'cpu-hour', 'CPU compute time'),
    ('memory', $RATE_MEM_GB_HOUR, 'gb-hour', 'Memory usage'),
    ('gpu', $RATE_GPU_HOUR, 'gpu-hour', 'Hailo accelerator time'),
    ('inference', $RATE_INFERENCE, 'request', 'LLM inference request'),
    ('tokens', $RATE_TOKEN, 'token', 'Input/output tokens'),
    ('storage', 0.00001, 'gb-hour', 'Disk storage'),
    ('network', 0.00001, 'gb', 'Network transfer');
SQL
}

# Record usage
record() {
    local resource="$1"
    local quantity="$2"
    local project="${3:-default}"
    local node="${4:-$(hostname)}"

    local rate=$(sqlite3 "$COST_DB" "SELECT rate FROM rates WHERE resource_type = '$resource'")
    local cost=$(echo "scale=6; $quantity * $rate" | bc)

    sqlite3 "$COST_DB" "
        INSERT INTO usage (node, project, resource_type, quantity, unit, cost)
        VALUES ('$node', '$project', '$resource', $quantity, (SELECT unit FROM rates WHERE resource_type = '$resource'), $cost)
    "

    # Update budget
    sqlite3 "$COST_DB" "
        UPDATE budgets SET current_spend = current_spend + $cost WHERE project = '$project'
    "

    echo -e "${GREEN}Recorded: $quantity $resource = \$$cost${RESET}"
}

# Record inference usage
record_inference() {
    local project="${1:-default}"
    local tokens_in="${2:-0}"
    local tokens_out="${3:-0}"
    local node="${4:-$(hostname)}"

    record "inference" 1 "$project" "$node"
    record "tokens" "$((tokens_in + tokens_out))" "$project" "$node"
}

# Set rate
set_rate() {
    local resource="$1"
    local rate="$2"
    local unit="${3:-unit}"

    sqlite3 "$COST_DB" "
        INSERT OR REPLACE INTO rates (resource_type, rate, unit)
        VALUES ('$resource', $rate, '$unit')
    "

    echo -e "${GREEN}Rate set: $resource = \$$rate per $unit${RESET}"
}

# List rates
rates() {
    echo -e "${PINK}=== RESOURCE RATES ===${RESET}"
    echo

    sqlite3 "$COST_DB" "SELECT resource_type, rate, unit, description FROM rates ORDER BY resource_type" | \
    while IFS='|' read -r resource rate unit desc; do
        printf "  %-15s \$%-10.6f per %-10s %s\n" "$resource" "$rate" "$unit" "$desc"
    done
}

# Create budget
budget_create() {
    local project="$1"
    local limit="$2"
    local threshold="${3:-0.8}"

    sqlite3 "$COST_DB" "
        INSERT OR REPLACE INTO budgets (project, monthly_limit, alert_threshold, current_spend)
        VALUES ('$project', $limit, $threshold, 0)
    "

    echo -e "${GREEN}Budget created: $project = \$$limit/month${RESET}"
}

# Check budgets
budget_check() {
    echo -e "${PINK}=== BUDGET STATUS ===${RESET}"
    echo

    sqlite3 "$COST_DB" "SELECT project, monthly_limit, current_spend, alert_threshold FROM budgets" | \
    while IFS='|' read -r project limit spend threshold; do
        local pct=$(echo "scale=1; $spend * 100 / $limit" | bc 2>/dev/null || echo 0)
        local threshold_pct=$(echo "scale=0; $threshold * 100" | bc)

        local color=$GREEN
        local alert_val=$(echo "$spend / $limit" | bc -l)
        if [ "$(echo "$alert_val > $threshold" | bc -l)" = "1" ]; then
            color=$YELLOW
        fi
        if [ "$(echo "$alert_val > 1" | bc -l)" = "1" ]; then
            color=$RED
        fi

        printf "  %-15s ${color}\$%.2f / \$%.2f (%.1f%%)${RESET}\n" "$project" "$spend" "$limit" "$pct"
    done
}

# Current period costs
current() {
    local project="${1:-all}"
    local period="${2:-month}"

    echo -e "${PINK}=== CURRENT $period COSTS ===${RESET}"
    echo

    local where=""
    [ "$project" != "all" ] && where="AND project = '$project'"

    local period_filter
    case "$period" in
        day) period_filter="date(timestamp) = date('now')" ;;
        week) period_filter="datetime(timestamp, '+7 days') > datetime('now')" ;;
        month) period_filter="datetime(timestamp, '+1 month') > datetime('now')" ;;
    esac

    echo "By resource:"
    sqlite3 "$COST_DB" "
        SELECT resource_type, SUM(quantity), unit, SUM(cost)
        FROM usage
        WHERE $period_filter $where
        GROUP BY resource_type
        ORDER BY SUM(cost) DESC
    " | while IFS='|' read -r resource qty unit cost; do
        printf "  %-15s %10.2f %-10s \$%.4f\n" "$resource" "$qty" "$unit" "$cost"
    done

    echo
    echo "By project:"
    sqlite3 "$COST_DB" "
        SELECT project, SUM(cost)
        FROM usage
        WHERE $period_filter $where
        GROUP BY project
        ORDER BY SUM(cost) DESC
    " | while IFS='|' read -r proj cost; do
        printf "  %-15s \$%.4f\n" "$proj" "$cost"
    done

    echo
    echo "By node:"
    sqlite3 "$COST_DB" "
        SELECT node, SUM(cost)
        FROM usage
        WHERE $period_filter $where
        GROUP BY node
        ORDER BY SUM(cost) DESC
    " | while IFS='|' read -r node cost; do
        printf "  %-15s \$%.4f\n" "$node" "$cost"
    done

    echo
    local total=$(sqlite3 "$COST_DB" "SELECT SUM(cost) FROM usage WHERE $period_filter $where")
    echo -e "Total: ${GREEN}\$${total:-0}${RESET}"
}

# Generate invoice
invoice() {
    local project="$1"
    local start_date="${2:-$(date -d 'first day of this month' +%Y-%m-%d 2>/dev/null || date -v1d +%Y-%m-%d)}"
    local end_date="${3:-$(date +%Y-%m-%d)}"

    local invoice_id="inv_$(date +%Y%m)_${project}"

    echo -e "${PINK}=== INVOICE: $invoice_id ===${RESET}"
    echo
    echo "Project: $project"
    echo "Period: $start_date to $end_date"
    echo

    echo "─────────────────────────────────────────────────────────────────"
    printf "%-20s %15s %12s %12s\n" "Resource" "Quantity" "Rate" "Cost"
    echo "─────────────────────────────────────────────────────────────────"

    local total=0
    sqlite3 "$COST_DB" "
        SELECT u.resource_type, SUM(u.quantity), u.unit, r.rate, SUM(u.cost)
        FROM usage u
        JOIN rates r ON u.resource_type = r.resource_type
        WHERE u.project = '$project'
        AND date(u.timestamp) BETWEEN '$start_date' AND '$end_date'
        GROUP BY u.resource_type
    " | while IFS='|' read -r resource qty unit rate cost; do
        printf "%-20s %12.2f %-3s \$%-8.6f \$%.4f\n" "$resource" "$qty" "$unit" "$rate" "$cost"
        total=$(echo "$total + $cost" | bc)
    done

    echo "─────────────────────────────────────────────────────────────────"

    total=$(sqlite3 "$COST_DB" "
        SELECT SUM(cost) FROM usage
        WHERE project = '$project'
        AND date(timestamp) BETWEEN '$start_date' AND '$end_date'
    ")

    printf "%48s \$%.4f\n" "TOTAL:" "$total"
    echo

    # Save invoice
    sqlite3 "$COST_DB" "
        INSERT OR REPLACE INTO invoices (id, project, period_start, period_end, total)
        VALUES ('$invoice_id', '$project', '$start_date', '$end_date', $total)
    "

    # Export to file
    local invoice_file="$COST_DIR/reports/${invoice_id}.txt"
    {
        echo "INVOICE: $invoice_id"
        echo "Project: $project"
        echo "Period: $start_date to $end_date"
        echo "Generated: $(date)"
        echo ""
        echo "Total: \$$total"
    } > "$invoice_file"

    echo "Saved to: $invoice_file"
}

# Cost forecast
forecast() {
    local project="${1:-all}"
    local days="${2:-30}"

    echo -e "${PINK}=== COST FORECAST ===${RESET}"
    echo "Based on last 7 days, projecting $days days"
    echo

    local where=""
    [ "$project" != "all" ] && where="WHERE project = '$project'"

    local daily_avg=$(sqlite3 "$COST_DB" "
        SELECT SUM(cost) / 7 FROM usage
        WHERE datetime(timestamp, '+7 days') > datetime('now')
        $where
    ")

    local projected=$(echo "scale=2; $daily_avg * $days" | bc)

    echo "Daily average: \$${daily_avg:-0}"
    echo "Projected ${days}-day cost: \$$projected"

    if [ "$project" != "all" ]; then
        local limit=$(sqlite3 "$COST_DB" "SELECT monthly_limit FROM budgets WHERE project = '$project'")
        if [ -n "$limit" ]; then
            local pct=$(echo "scale=1; $projected * 100 / $limit" | bc)
            echo "Budget utilization: ${pct}%"
        fi
    fi
}

# Collect usage from nodes
collect() {
    echo -e "${PINK}=== COLLECTING USAGE ===${RESET}"
    echo

    for node in "${ALL_NODES[@]}"; do
        echo -n "  $node: "

        if ! ssh -o ConnectTimeout=3 "$node" "echo ok" >/dev/null 2>&1; then
            echo "(offline)"
            continue
        fi

        # Get resource usage
        local metrics=$(ssh "$node" "
            cpu_hours=\$(cat /proc/stat | awk '/^cpu / {print (\$2+\$3+\$4)/100/3600}')
            mem_gb=\$(free -g | awk '/Mem:/ {print \$3}')
            disk_gb=\$(df / | awk 'NR==2 {print \$3/1024/1024}')
            echo \"\$cpu_hours|\$mem_gb|\$disk_gb\"
        " 2>/dev/null)

        if [ -n "$metrics" ]; then
            local cpu=$(echo "$metrics" | cut -d'|' -f1)
            local mem=$(echo "$metrics" | cut -d'|' -f2)
            local disk=$(echo "$metrics" | cut -d'|' -f3)

            record "cpu" "$cpu" "default" "$node" >/dev/null
            record "memory" "$mem" "default" "$node" >/dev/null
            record "storage" "$disk" "default" "$node" >/dev/null

            echo "collected"
        else
            echo "failed"
        fi
    done
}

# Reset monthly budgets
reset_budgets() {
    sqlite3 "$COST_DB" "UPDATE budgets SET current_spend = 0"
    echo -e "${GREEN}Reset all budget counters${RESET}"
}

# Help
help() {
    echo -e "${PINK}BlackRoad Cost Tracker${RESET}"
    echo
    echo "Track resource usage and costs"
    echo
    echo "Usage Recording:"
    echo "  record <resource> <qty> [proj]     Record usage"
    echo "  record-inference [proj] [in] [out] Record inference"
    echo "  collect                            Collect from nodes"
    echo
    echo "Rates & Budgets:"
    echo "  rates                              List rates"
    echo "  set-rate <res> <rate> [unit]       Set rate"
    echo "  budget-create <proj> <limit>       Create budget"
    echo "  budget-check                       Check budgets"
    echo
    echo "Reports:"
    echo "  current [proj] [day|week|month]    Current costs"
    echo "  invoice <proj> [start] [end]       Generate invoice"
    echo "  forecast [proj] [days]             Cost forecast"
    echo
    echo "Examples:"
    echo "  $0 record inference 100 myproject"
    echo "  $0 budget-create myproject 50"
    echo "  $0 invoice myproject 2024-01-01"
}

# Ensure initialized
[ -f "$COST_DB" ] || init >/dev/null

case "${1:-help}" in
    init)
        init
        ;;
    record)
        record "$2" "$3" "$4" "$5"
        ;;
    record-inference)
        record_inference "$2" "$3" "$4" "$5"
        ;;
    collect)
        collect
        ;;
    rates)
        rates
        ;;
    set-rate)
        set_rate "$2" "$3" "$4"
        ;;
    budget-create|budget)
        budget_create "$2" "$3" "$4"
        ;;
    budget-check|budgets)
        budget_check
        ;;
    current|costs)
        current "$2" "$3"
        ;;
    invoice)
        invoice "$2" "$3" "$4"
        ;;
    forecast)
        forecast "$2" "$3"
        ;;
    reset-budgets)
        reset_budgets
        ;;
    *)
        help
        ;;
esac
