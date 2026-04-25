# BlackRoad Raspberry Pi Cluster Test Suite

**Zero physical intervention. All tests over SSH. Non-destructive. Idempotent.**

## Quick Start

```bash
# Run full test suite on all nodes
./run-tests.sh

# Dry run (shows what would be tested)
./run-tests.sh --dry-run

# Fast mode (skips slow tests like SMART, latency)
./run-tests.sh --fast

# Test single node
./run-tests.sh --node lucidia

# Combine flags
./run-tests.sh --fast --node octavia
```

## Prerequisites

- Passwordless SSH to all nodes (use `ssh-copy-id` or Tailscale)
- Nodes must be reachable by hostname (use `.local` mDNS or `/etc/hosts`)
- Bash 4.0+ on orchestrator machine
- `jq` for JSON parsing (optional but recommended)

## What Gets Tested

| Test Module | Validates | Critical Checks |
|------------|-----------|----------------|
| `test_os.sh` | Boot & OS health | Uptime, kernel, filesystem R/W, boot device |
| `test_storage.sh` | Storage integrity | Disk/inode usage, SMART health |
| `test_network.sh` | Network fabric | LAN, Tailscale, DNS, mDNS, inter-node ping |
| `test_time.sh` | Time authority | Chrony tracking, octavia as NTP source, drift |
| `test_mqtt.sh` | MQTT fabric | Broker reachable, pub/sub roundtrip, retained msgs |
| `test_systemd.sh` | Service health | BlackRoad services active, no failed units |
| `test_hardware.sh` | Hardware status | Temperature, throttling, USB, I2C, HDMI |
| `test_role.sh` | Role correctness | node.yaml exists, role matches hardware |
| `test_ui.sh` | Dashboard/UI | Grafana, kiosk service, HDMI output |
| `test_agent.sh` | Operator layer | Heartbeat MQTT, phase cycling, emotional envelope |

## Test Results

Results are saved in `results/` directory:
- Per-node JSON files: `{node}_{timestamp}.json`
- Summary report: `summary_{timestamp}.txt`

### Exit Codes
- `0` = All tests passed
- `1` = Warnings present
- `2` = Failures detected

## Example Output

```
╔════════════════════════════════════════════════════════╗
║  BlackRoad Cluster Test Suite                         ║
║  Fri Dec 26 15:30:00 PST 2025                          ║
╚════════════════════════════════════════════════════════╝

Mode: LIVE | Speed: FULL
Nodes: lucidia alice aria octavia shellfish

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Testing: lucidia
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  test_os... ✓ PASS
  test_storage... ✓ PASS
  test_network... ✓ PASS
  test_time... ✓ PASS
  test_mqtt... ✓ PASS
  test_systemd... ✓ PASS
  test_hardware... ✓ PASS
  test_role... ✓ PASS
  test_ui... ✓ PASS
  test_agent... ✓ PASS

  Summary: 10 pass | 0 warn | 0 fail

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Testing: octavia
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  test_os... ✓ PASS
  test_storage... ⚠ WARN
  test_network... ✓ PASS
  test_time... ✓ PASS
  test_mqtt... ✓ PASS
  test_systemd... ✓ PASS
  test_hardware... ✓ PASS
  test_role... ✓ PASS
  test_ui... ✓ PASS
  test_agent... ✓ PASS

  Summary: 9 pass | 1 warn | 0 fail

╔════════════════════════════════════════════════════════╗
║  Cluster Summary                                       ║
╚════════════════════════════════════════════════════════╝

Total Tests: 50
Pass:  48
Warn:  2
Fail:  0

Results saved to: /Users/alexa/blackroad-cluster-tests/results

Status: WARNINGS PRESENT
```

## Safety Guarantees

✅ **No destructive operations**
- No `mkfs`, `dd`, `fdisk`, or partition changes
- No EEPROM writes
- No forced reboots
- No service restarts

✅ **Read-only by default**
- All tests use read operations
- MQTT tests use temporary topics and clean up
- File system checks are non-invasive

✅ **Idempotent execution**
- Safe to run every minute
- Results don't affect system state
- No cumulative side effects

## Integration Examples

### Cron Job (every 15 minutes)
```bash
*/15 * * * * cd /home/alexa/blackroad-cluster-tests && ./run-tests.sh --fast
```

### MQTT Alert on Failure
```bash
./run-tests.sh || mosquitto_pub -h octavia -t blackroad/alerts/tests -m "Test suite failed at $(date)"
```

### Dashboard Integration
```bash
# Parse JSON results and send to monitoring system
./run-tests.sh --fast
for result in results/*_$(date +%Y%m%d)*.json; do
  jq -c . "$result" | curl -X POST https://monitor.blackroad.com/api/test-results -d @-
done
```

### Pre-Deployment Check
```bash
#!/bin/bash
# deploy.sh
set -e

echo "Running cluster health check..."
./run-tests.sh --fast

if [ $? -ne 0 ]; then
  echo "❌ Cluster health check failed. Aborting deployment."
  exit 1
fi

echo "✅ Cluster healthy. Proceeding with deployment..."
# ... deployment logic
```

## Customization

### Add Custom Test Module

Create `modules/test_custom.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail

output_result() {
  local status=$1
  local message=$2
  local details=${3:-"{}"}
  echo "{\"test\": \"custom\", \"status\": \"$status\", \"message\": \"$message\", \"details\": $details}"
}

if [[ "${DRY_RUN:-false}" == "true" ]]; then
  output_result "DRY_RUN" "Would check custom metric"
  exit 0
fi

# Your test logic here
# ...

output_result "PASS" "Custom check passed" "{}"
```

Then add to `TEST_MODULES` array in `run-tests.sh`.

### Change Target Nodes

Edit `NODES` array in `run-tests.sh`:
```bash
NODES=(lucidia alice aria octavia shellfish)
```

### Adjust Thresholds

Edit individual test modules. Example in `test_storage.sh`:
```bash
# Change disk warning from 80% to 70%
elif [[ $ROOT_USAGE -gt 70 ]]; then
  output_result "WARN" "Root disk usage high (${ROOT_USAGE}%)" "$DETAILS"
```

## Troubleshooting

### SSH Connection Issues
```bash
# Test manual SSH
ssh lucidia "echo test"

# Set up passwordless auth
ssh-copy-id lucidia
```

### Missing Tools on Nodes
```bash
# Install on each node
ssh lucidia "sudo apt-get update && sudo apt-get install -y jq mosquitto-clients i2c-tools smartmontools"
```

### Slow Test Execution
```bash
# Use fast mode to skip SMART checks and latency tests
./run-tests.sh --fast
```

### JSON Parsing Errors
```bash
# Install jq on orchestrator machine
brew install jq  # macOS
apt-get install jq  # Debian/Ubuntu
```

## Architecture

```
run-tests.sh (orchestrator)
    │
    ├─ SSH to each node
    │   │
    │   ├─ modules/test_os.sh → JSON output
    │   ├─ modules/test_storage.sh → JSON output
    │   ├─ modules/test_network.sh → JSON output
    │   └─ ... (all test modules)
    │
    └─ Aggregate results → results/{node}_{timestamp}.json
                        → results/summary_{timestamp}.txt
```

Each test module:
1. Runs read-only commands
2. Outputs single-line JSON to stdout
3. Returns 0 (script always succeeds; status in JSON)

Orchestrator:
1. Copies test module via stdin to SSH
2. Executes remotely
3. Captures JSON output (last line)
4. Aggregates into cluster summary

## License

MIT - BlackRoad Systems 2025
