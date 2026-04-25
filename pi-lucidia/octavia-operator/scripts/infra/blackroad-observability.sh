#!/bin/bash
# BlackRoad Observability
# Distributed tracing and observability for the cluster
# Agent: Icarus (b3e01bd9)

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

# macOS-compatible nanosecond timestamp
_timestamp_ns() {
    if command -v gdate &>/dev/null; then
        gdate +%s%N
    else
        echo "$(date +%s)000000000"
    fi
}

OBS_DIR="$HOME/.blackroad/observability"
OBS_DB="$OBS_DIR/traces.db"
ALL_NODES=("lucidia" "cecilia" "octavia" "aria" "alice")

# Initialize
init() {
    mkdir -p "$OBS_DIR"/{traces,metrics,logs}

    sqlite3 "$OBS_DB" << 'SQL'
CREATE TABLE IF NOT EXISTS traces (
    trace_id TEXT PRIMARY KEY,
    name TEXT,
    service TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    duration_ms INTEGER,
    status TEXT DEFAULT 'in_progress',
    metadata TEXT
);

CREATE TABLE IF NOT EXISTS spans (
    span_id TEXT PRIMARY KEY,
    trace_id TEXT,
    parent_span_id TEXT,
    name TEXT,
    service TEXT,
    node TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    duration_ms INTEGER,
    status TEXT DEFAULT 'in_progress',
    tags TEXT,
    logs TEXT,
    FOREIGN KEY (trace_id) REFERENCES traces(trace_id)
);

CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    value REAL,
    tags TEXT,
    node TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trace_id TEXT,
    span_id TEXT,
    level TEXT,
    message TEXT,
    node TEXT,
    service TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trace ON spans(trace_id);
CREATE INDEX IF NOT EXISTS idx_metric_name ON metrics(name);
CREATE INDEX IF NOT EXISTS idx_log_trace ON logs(trace_id);
SQL

    echo -e "${GREEN}Observability system initialized${RESET}"
}

# Start trace
trace_start() {
    local name="$1"
    local service="${2:-unknown}"
    local metadata="${3:-{}}"

    local trace_id="trace_$(_timestamp_ns)_$(openssl rand -hex 4)"

    sqlite3 "$OBS_DB" "
        INSERT INTO traces (trace_id, name, service, metadata)
        VALUES ('$trace_id', '$name', '$service', '$metadata')
    "

    echo "$trace_id"
}

# End trace
trace_end() {
    local trace_id="$1"
    local status="${2:-success}"

    local start=$(sqlite3 "$OBS_DB" "SELECT started_at FROM traces WHERE trace_id = '$trace_id'")
    local duration_ms=$(( ($(_timestamp_ns) - $(_timestamp_ns)) / 1000000 ))

    sqlite3 "$OBS_DB" "
        UPDATE traces
        SET ended_at = datetime('now'), duration_ms = $duration_ms, status = '$status'
        WHERE trace_id = '$trace_id'
    "

    echo -e "${GREEN}Trace completed: $trace_id (${duration_ms}ms)${RESET}"
}

# Start span
span_start() {
    local trace_id="$1"
    local name="$2"
    local service="${3:-unknown}"
    local parent="${4:-}"
    local node="${5:-$(hostname)}"

    local span_id="span_$(_timestamp_ns)_$(openssl rand -hex 4)"

    sqlite3 "$OBS_DB" "
        INSERT INTO spans (span_id, trace_id, parent_span_id, name, service, node)
        VALUES ('$span_id', '$trace_id', '$parent', '$name', '$service', '$node')
    "

    echo "$span_id"
}

# End span
span_end() {
    local span_id="$1"
    local status="${2:-success}"
    local tags="${3:-{}}"

    sqlite3 "$OBS_DB" "
        UPDATE spans
        SET ended_at = datetime('now'),
            duration_ms = CAST((julianday('now') - julianday(started_at)) * 86400000 AS INTEGER),
            status = '$status',
            tags = '$tags'
        WHERE span_id = '$span_id'
    "
}

# Add span log
span_log() {
    local span_id="$1"
    local message="$2"
    local level="${3:-info}"

    local trace_id=$(sqlite3 "$OBS_DB" "SELECT trace_id FROM spans WHERE span_id = '$span_id'")
    local service=$(sqlite3 "$OBS_DB" "SELECT service FROM spans WHERE span_id = '$span_id'")
    local node=$(sqlite3 "$OBS_DB" "SELECT node FROM spans WHERE span_id = '$span_id'")

    sqlite3 "$OBS_DB" "
        INSERT INTO logs (trace_id, span_id, level, message, node, service)
        VALUES ('$trace_id', '$span_id', '$level', '$(echo "$message" | sed "s/'/''/g")', '$node', '$service')
    "
}

# Record metric
metric() {
    local name="$1"
    local value="$2"
    local tags="${3:-{}}"
    local node="${4:-$(hostname)}"

    sqlite3 "$OBS_DB" "
        INSERT INTO metrics (name, value, tags, node)
        VALUES ('$name', $value, '$tags', '$node')
    "
}

# View trace
view_trace() {
    local trace_id="$1"

    echo -e "${PINK}=== TRACE: $trace_id ===${RESET}"
    echo

    # Trace info
    sqlite3 "$OBS_DB" -line "SELECT * FROM traces WHERE trace_id = '$trace_id'"

    echo
    echo "Spans:"
    echo

    # Build span tree
    sqlite3 "$OBS_DB" "
        SELECT span_id, parent_span_id, name, service, node, duration_ms, status
        FROM spans WHERE trace_id = '$trace_id'
        ORDER BY started_at
    " | while IFS='|' read -r span_id parent name service node duration status; do
        local indent=""
        [ -n "$parent" ] && indent="  "

        local status_color=$GREEN
        [ "$status" = "error" ] && status_color=$RED
        [ "$status" = "in_progress" ] && status_color=$YELLOW

        printf "${indent}├── %-20s %-10s %-10s ${status_color}%dms${RESET}\n" "$name" "$service" "$node" "$duration"

        # Show span logs
        sqlite3 "$OBS_DB" "
            SELECT level, message FROM logs WHERE span_id = '$span_id'
        " | while IFS='|' read -r level msg; do
            local log_color=$RESET
            [ "$level" = "error" ] && log_color=$RED
            [ "$level" = "warn" ] && log_color=$YELLOW

            echo -e "${indent}│   ${log_color}[$level] $msg${RESET}"
        done
    done
}

# List traces
list_traces() {
    local limit="${1:-20}"
    local filter="${2:-}"

    echo -e "${PINK}=== TRACES ===${RESET}"
    echo

    local where=""
    [ -n "$filter" ] && where="WHERE name LIKE '%$filter%' OR service LIKE '%$filter%'"

    sqlite3 "$OBS_DB" "
        SELECT trace_id, name, service, duration_ms, status, started_at
        FROM traces $where
        ORDER BY started_at DESC LIMIT $limit
    " | while IFS='|' read -r trace_id name service duration status started; do
        local status_color=$GREEN
        [ "$status" = "error" ] && status_color=$RED
        [ "$status" = "in_progress" ] && status_color=$YELLOW

        printf "  %-30s %-15s %-10s ${status_color}%dms${RESET} %s\n" \
            "$trace_id" "$name" "$service" "$duration" "$started"
    done
}

# Search logs
search_logs() {
    local query="$1"
    local limit="${2:-50}"

    echo -e "${PINK}=== LOG SEARCH: $query ===${RESET}"
    echo

    sqlite3 "$OBS_DB" "
        SELECT timestamp, level, service, node, message
        FROM logs
        WHERE message LIKE '%$query%'
        ORDER BY timestamp DESC LIMIT $limit
    " | while IFS='|' read -r ts level service node msg; do
        local color=$RESET
        [ "$level" = "error" ] && color=$RED
        [ "$level" = "warn" ] && color=$YELLOW

        echo -e "${color}[$ts] [$level] $service@$node: $msg${RESET}"
    done
}

# Metrics summary
metrics_summary() {
    local period="${1:-1 hour}"

    echo -e "${PINK}=== METRICS SUMMARY (last $period) ===${RESET}"
    echo

    sqlite3 "$OBS_DB" "
        SELECT name, node, AVG(value), MIN(value), MAX(value), COUNT(*)
        FROM metrics
        WHERE datetime(timestamp, '+$period') > datetime('now')
        GROUP BY name, node
        ORDER BY name, node
    " | while IFS='|' read -r name node avg min max count; do
        printf "  %-20s %-10s avg:%.2f min:%.2f max:%.2f (%d samples)\n" \
            "$name" "$node" "$avg" "$min" "$max" "$count"
    done
}

# Service map
service_map() {
    echo -e "${PINK}=== SERVICE MAP ===${RESET}"
    echo

    echo "Services and their dependencies:"
    echo

    sqlite3 "$OBS_DB" "
        SELECT DISTINCT s1.service, s2.service
        FROM spans s1
        JOIN spans s2 ON s1.span_id = s2.parent_span_id
        WHERE s1.service != s2.service
    " | while IFS='|' read -r from to; do
        echo "  $from -> $to"
    done

    echo
    echo "Service stats (last hour):"
    sqlite3 "$OBS_DB" "
        SELECT service, COUNT(*), AVG(duration_ms),
               SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)
        FROM spans
        WHERE datetime(started_at, '+1 hour') > datetime('now')
        GROUP BY service
    " | while IFS='|' read -r service count avg_lat error_rate; do
        printf "  %-20s spans:%d avg:%.0fms err:%.1f%%\n" "$service" "$count" "$avg_lat" "$error_rate"
    done
}

# Error analysis
errors() {
    local limit="${1:-20}"

    echo -e "${PINK}=== ERROR ANALYSIS ===${RESET}"
    echo

    echo "Recent errors:"
    sqlite3 "$OBS_DB" "
        SELECT t.trace_id, t.name, s.service, s.node, l.message, l.timestamp
        FROM logs l
        JOIN spans s ON l.span_id = s.span_id
        JOIN traces t ON l.trace_id = t.trace_id
        WHERE l.level = 'error'
        ORDER BY l.timestamp DESC LIMIT $limit
    " | while IFS='|' read -r trace name service node msg ts; do
        echo -e "${RED}[$ts] $service@$node${RESET}"
        echo "  Trace: $trace ($name)"
        echo "  Error: $msg"
        echo
    done

    echo "Error rates by service:"
    sqlite3 "$OBS_DB" "
        SELECT service, COUNT(*) as total,
               SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errors
        FROM spans
        WHERE datetime(started_at, '+1 hour') > datetime('now')
        GROUP BY service
        HAVING errors > 0
        ORDER BY errors DESC
    " | while IFS='|' read -r service total errors; do
        local rate=$(echo "scale=1; $errors * 100 / $total" | bc)
        printf "  %-20s %d/%d (%.1f%%)\n" "$service" "$errors" "$total" "$rate"
    done
}

# Dashboard
dashboard() {
    clear
    echo -e "${PINK}╔══════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║           👁️  OBSERVABILITY DASHBOARD                        ║${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════════╝${RESET}"
    echo

    local total_traces=$(sqlite3 "$OBS_DB" "SELECT COUNT(*) FROM traces WHERE datetime(started_at, '+1 hour') > datetime('now')")
    local error_traces=$(sqlite3 "$OBS_DB" "SELECT COUNT(*) FROM traces WHERE status = 'error' AND datetime(started_at, '+1 hour') > datetime('now')")
    local avg_duration=$(sqlite3 "$OBS_DB" "SELECT AVG(duration_ms) FROM traces WHERE datetime(started_at, '+1 hour') > datetime('now')")

    echo "Last Hour:"
    printf "  Traces: %d | Errors: %d | Avg Duration: %.0fms\n" "$total_traces" "$error_traces" "${avg_duration:-0}"
    echo

    echo "─────────────────────────────────────────────────────────────────"
    echo "Active Services:"
    sqlite3 "$OBS_DB" "
        SELECT service, COUNT(*), AVG(duration_ms)
        FROM spans WHERE datetime(started_at, '+1 hour') > datetime('now')
        GROUP BY service ORDER BY COUNT(*) DESC LIMIT 5
    " | while IFS='|' read -r service count avg; do
        printf "  %-20s %d spans (avg: %.0fms)\n" "$service" "$count" "$avg"
    done

    echo
    echo "─────────────────────────────────────────────────────────────────"
    echo "Recent Errors:"
    sqlite3 "$OBS_DB" "
        SELECT service, message, timestamp FROM logs
        WHERE level = 'error' ORDER BY timestamp DESC LIMIT 3
    " | while IFS='|' read -r service msg ts; do
        echo -e "  ${RED}$service: $msg${RESET}"
    done
}

# Clean old data
cleanup() {
    local days="${1:-7}"

    sqlite3 "$OBS_DB" "
        DELETE FROM logs WHERE datetime(timestamp, '+$days days') < datetime('now');
        DELETE FROM spans WHERE datetime(started_at, '+$days days') < datetime('now');
        DELETE FROM traces WHERE datetime(started_at, '+$days days') < datetime('now');
        DELETE FROM metrics WHERE datetime(timestamp, '+$days days') < datetime('now');
    "

    echo -e "${GREEN}Cleaned data older than $days days${RESET}"
}

# Help
help() {
    echo -e "${PINK}BlackRoad Observability${RESET}"
    echo
    echo "Distributed tracing and observability"
    echo
    echo "Tracing:"
    echo "  trace-start <name> [service]         Start trace"
    echo "  trace-end <trace_id> [status]        End trace"
    echo "  span-start <trace> <name> [svc]      Start span"
    echo "  span-end <span_id> [status]          End span"
    echo "  span-log <span_id> <msg> [level]     Add log"
    echo "  view <trace_id>                      View trace"
    echo "  list [limit] [filter]                List traces"
    echo
    echo "Metrics & Logs:"
    echo "  metric <name> <value> [tags]         Record metric"
    echo "  search <query> [limit]               Search logs"
    echo "  metrics [period]                     Metrics summary"
    echo
    echo "Analysis:"
    echo "  service-map                          Service dependencies"
    echo "  errors [limit]                       Error analysis"
    echo "  dashboard                            Overview dashboard"
    echo "  cleanup [days]                       Clean old data"
    echo
    echo "Examples:"
    echo "  trace=\$($0 trace-start 'inference' 'api')"
    echo "  span=\$($0 span-start \$trace 'generate' 'llm')"
    echo "  $0 span-log \$span 'Processing request'"
    echo "  $0 span-end \$span"
    echo "  $0 trace-end \$trace"
}

# Ensure initialized
[ -f "$OBS_DB" ] || init >/dev/null

case "${1:-help}" in
    init)
        init
        ;;
    trace-start)
        trace_start "$2" "$3" "$4"
        ;;
    trace-end)
        trace_end "$2" "$3"
        ;;
    span-start)
        span_start "$2" "$3" "$4" "$5" "$6"
        ;;
    span-end)
        span_end "$2" "$3" "$4"
        ;;
    span-log|log)
        span_log "$2" "$3" "$4"
        ;;
    view)
        view_trace "$2"
        ;;
    list|traces)
        list_traces "$2" "$3"
        ;;
    metric)
        metric "$2" "$3" "$4" "$5"
        ;;
    search)
        search_logs "$2" "$3"
        ;;
    metrics)
        metrics_summary "$2"
        ;;
    service-map|map)
        service_map
        ;;
    errors)
        errors "$2"
        ;;
    dashboard|dash)
        dashboard
        ;;
    cleanup)
        cleanup "$2"
        ;;
    *)
        help
        ;;
esac
