#!/usr/bin/env python3
"""
RoadChain Miner
===============
Orchestrate CPU mining across the BlackRoad Pi fleet.
Mined crypto feeds into the ROAD conversion pipeline:

  Pi Fleet (XMR mining) → Exchange (XMR→BTC) → Reserve (BTC) → Mint (ROAD)

Supported algorithms:
  - RandomX (Monero/XMR) - default, ARM-optimized
  - VerusHash (Verus/VRSC) - CPU-friendly alternative
  - GhostRider (Raptoreum/RTM) - CPU-focused

Fleet:
  cecilia   192.168.4.89  Pi 5 + Hailo-8 + 500GB NVMe (primary)
  lucidia   192.168.4.81  Pi 5 + Pironman + 1TB NVMe
  octavia   192.168.4.38  Pi 5
  alice     192.168.4.49  Pi 4 (32-bit armhf, not viable for RandomX)
  gematria  159.65.43.12  DigitalOcean x86_64 4-core (fastest miner)
"""

import json
import time
import subprocess
import hashlib
from datetime import datetime
from pathlib import Path

# ============================================================================
# CONFIGURATION
# ============================================================================

DATA_DIR = Path.home() / ".roadchain" / "mining"
DATA_DIR.mkdir(parents=True, exist_ok=True)

EARNINGS_FILE = DATA_DIR / "earnings.json"
CONFIG_FILE = DATA_DIR / "config.json"
HASHRATE_LOG = DATA_DIR / "hashrate.log"

# Pi fleet
FLEET = {
    "cecilia": {
        "ip": "192.168.4.89",
        "user": "blackroad",
        "cores": 4,
        "role": "primary",
        "note": "Pi 5 + Hailo-8 + 500GB NVMe",
        "xmr_hashrate": 200  # H/s measured with 2 threads on Pi 5
    },
    "lucidia": {
        "ip": "192.168.4.81",
        "user": "blackroad",
        "cores": 4,
        "role": "secondary",
        "note": "Pi 5 + Pironman + 1TB NVMe"
    },
    "octavia": {
        "ip": "192.168.4.38",
        "user": "blackroad",
        "cores": 4,
        "role": "worker",
        "note": "Pi 5",
        "xmr_hashrate": 367  # H/s measured with 2 threads on Pi 5
    },
    "alice": {
        "ip": "192.168.4.49",
        "user": "blackroad",
        "cores": 4,
        "role": "worker",
        "note": "Pi 4 (32-bit armhf, not viable for RandomX)",
        "xmr_hashrate": 0,
        "disabled": True
    },
    "gematria": {
        "ip": "159.65.43.12",
        "user": "root",
        "cores": 4,
        "role": "primary",
        "note": "DigitalOcean x86_64 AVX2 4-core",
        "xmr_hashrate": 955
    }
}

# XMR wallet for pool mining
XMR_WALLET = "474mmWWJFdEfVNkpAAubRGJanVzgtCK2AQa7fgW83Fzehv9RH3i4DxH81RNh2NcAdCTT3x85Ap1YNdPd5eX4SpZt1e4N45p"

# Mining defaults
DEFAULT_COIN = "xmr"
COINS = {
    "xmr": {
        "name": "Monero",
        "symbol": "XMR",
        "algorithm": "RandomX",
        "pool": "pool.hashvault.pro:80",
        "pool_tls": "pool.hashvault.pro:443",
        "pool_alt": "pool.supportxmr.com:443",
        "miner_binary": "xmrig",
        "tls": False
    },
    "vrsc": {
        "name": "Verus",
        "symbol": "VRSC",
        "algorithm": "VerusHash 2.1",
        "pool": "na.luckpool.net:3956",
        "miner_binary": "ccminer",
        "tls": False
    },
    "rtm": {
        "name": "Raptoreum",
        "symbol": "RTM",
        "algorithm": "GhostRider",
        "pool": "stratum+tcp://flockpool.com:4444",
        "miner_binary": "xmrig",
        "tls": False
    }
}


# ============================================================================
# MINING CONFIG GENERATION
# ============================================================================

def generate_xmrig_config(wallet_address, pool=None, coin="xmr", threads=None):
    """Generate xmrig config.json for a Pi node."""
    coin_info = COINS[coin]
    pool_url = pool or coin_info["pool"]

    config = {
        "autosave": True,
        "cpu": {
            "enabled": True,
            "huge-pages": True,
            "hw-aes": True,
            "priority": 2,
            "max-threads-hint": 75  # leave headroom for OS
        },
        "pools": [
            {
                "url": pool_url,
                "user": wallet_address,
                "pass": "blackroad",
                "keepalive": True,
                "tls": coin_info.get("tls", False),
                "coin": coin_info["symbol"].lower() if coin != "xmr" else None
            }
        ],
        "print-time": 60,
        "health-print-time": 300,
        "retries": 5,
        "retry-pause": 5,
        "donate-level": 1
    }

    if threads:
        config["cpu"]["max-threads-hint"] = threads

    # Remove None values from pool
    config["pools"][0] = {k: v for k, v in config["pools"][0].items() if v is not None}

    return config


def save_fleet_config(wallet_address, coin="xmr", pool=None):
    """Save mining configuration for the fleet."""
    config = {
        "wallet_address": wallet_address,
        "coin": coin,
        "pool": pool or COINS[coin]["pool"],
        "fleet": {name: node["ip"] for name, node in FLEET.items()},
        "created": datetime.now().isoformat(),
        "status": "configured"
    }

    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)

    return config


def load_config():
    """Load fleet mining config."""
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE) as f:
            return json.load(f)
    return None


# ============================================================================
# FLEET OPERATIONS (via SSH)
# ============================================================================

def ssh_cmd(host, command, user=None, timeout=10):
    """Execute command on a fleet node via SSH."""
    node = FLEET.get(host)
    if not node:
        return {"success": False, "error": f"Unknown host: {host}"}

    if node.get("disabled"):
        return {"success": False, "error": f"{host} is disabled", "host": host}

    user = user or node["user"]
    ip = node["ip"]

    try:
        result = subprocess.run(
            ["ssh", "-o", "ConnectTimeout=5", "-o", "StrictHostKeyChecking=no",
             f"{user}@{ip}", command],
            capture_output=True, text=True, timeout=timeout
        )
        return {
            "success": result.returncode == 0,
            "stdout": result.stdout.strip(),
            "stderr": result.stderr.strip(),
            "host": host
        }
    except subprocess.TimeoutExpired:
        return {"success": False, "error": f"Timeout connecting to {host}", "host": host}
    except Exception as e:
        return {"success": False, "error": str(e), "host": host}


def deploy_miner(host, wallet_address, coin="xmr"):
    """Deploy xmrig config to a Pi and start mining."""
    config = generate_xmrig_config(wallet_address, coin=coin)
    config_json = json.dumps(config, indent=2)

    # Write config to remote
    write_cmd = f"mkdir -p ~/.xmrig && cat > ~/.xmrig/config.json << 'XMRIG_EOF'\n{config_json}\nXMRIG_EOF"
    result = ssh_cmd(host, write_cmd, timeout=15)
    if not result["success"]:
        return {"success": False, "error": f"Failed to write config: {result.get('error', result.get('stderr', ''))}"}

    # Start miner in background (nohup)
    start_cmd = "pkill -f xmrig 2>/dev/null; sleep 1; nohup xmrig -c ~/.xmrig/config.json > ~/.xmrig/miner.log 2>&1 &"
    result = ssh_cmd(host, start_cmd, timeout=15)

    return {
        "success": True,
        "host": host,
        "coin": coin,
        "wallet": wallet_address[:16] + "...",
        "status": "started"
    }


def stop_miner(host):
    """Stop mining on a Pi."""
    result = ssh_cmd(host, "pkill -f xmrig 2>/dev/null; echo stopped")
    return {"success": True, "host": host, "status": "stopped"}


def check_miner_status(host):
    """Check if miner is running and get stats."""
    node = FLEET.get(host, {})
    if node.get("disabled"):
        return {
            "host": host, "running": False, "hashrate": "disabled",
            "ip": node["ip"], "role": node["role"]
        }

    # Check process
    proc = ssh_cmd(host, "pgrep -a xmrig 2>/dev/null || echo 'not running'")

    # Check recent hashrate from log (different paths per host)
    log_cmd = "tail -5 /var/log/xmrig/xmrig.log 2>/dev/null || tail -5 ~/.xmrig/xmrig.log 2>/dev/null || echo 'no log'"
    log = ssh_cmd(host, log_cmd)

    running = proc["success"] and "not running" not in proc.get("stdout", "")

    # Parse hashrate from xmrig log if available
    hashrate = "0 H/s"
    if log["success"] and log.get("stdout"):
        for line in reversed(log["stdout"].split("\n")):
            if "H/s" in line:
                # Extract hashrate value
                parts = line.split()
                for i, p in enumerate(parts):
                    if "H/s" in p and i > 0:
                        hashrate = f"{parts[i-1]} {p}"
                        break
                break

    return {
        "host": host,
        "running": running,
        "hashrate": hashrate,
        "ip": FLEET[host]["ip"],
        "role": FLEET[host]["role"]
    }


def deploy_all(wallet_address, coin="xmr"):
    """Deploy miner to all active fleet nodes."""
    results = []
    for host, node in FLEET.items():
        if node.get("disabled"):
            print(f"  Skipping {host} (disabled)")
            continue
        print(f"  Deploying to {host} ({node['ip']})...")
        result = deploy_miner(host, wallet_address, coin)
        results.append(result)
        status = "OK" if result["success"] else f"FAIL: {result.get('error', 'unknown')}"
        print(f"    {status}")
    return results


def stop_all():
    """Stop miners on all Pis."""
    results = []
    for host in FLEET:
        result = stop_miner(host)
        results.append(result)
    return results


def fleet_status():
    """Get mining status across the fleet."""
    statuses = []
    for host in FLEET:
        status = check_miner_status(host)
        statuses.append(status)
    return statuses


# ============================================================================
# EARNINGS TRACKING
# ============================================================================

def load_earnings():
    """Load earnings history."""
    if EARNINGS_FILE.exists():
        with open(EARNINGS_FILE) as f:
            return json.load(f)
    return {
        "earnings": [],
        "total_xmr": 0.0,
        "total_vrsc": 0.0,
        "total_rtm": 0.0,
        "total_hashes": 0,
        "sessions": 0
    }


def save_earnings(data):
    """Save earnings history."""
    with open(EARNINGS_FILE, 'w') as f:
        json.dump(data, f, indent=2)


def record_earning(coin, amount, source="mining", tx_hash=None):
    """Record a mining earning."""
    data = load_earnings()

    entry = {
        "coin": coin,
        "amount": amount,
        "source": source,
        "tx_hash": tx_hash or hashlib.sha256(f"{coin}{amount}{time.time()}".encode()).hexdigest()[:16],
        "timestamp": time.time(),
        "datetime": datetime.now().isoformat()
    }

    data["earnings"].append(entry)
    data[f"total_{coin}"] = data.get(f"total_{coin}", 0) + amount
    data["sessions"] += 1
    save_earnings(data)

    return entry


def get_earnings_summary():
    """Get earnings summary."""
    data = load_earnings()
    return {
        "total_xmr": data.get("total_xmr", 0),
        "total_vrsc": data.get("total_vrsc", 0),
        "total_rtm": data.get("total_rtm", 0),
        "sessions": data.get("sessions", 0),
        "recent": data["earnings"][-10:] if data["earnings"] else []
    }


# ============================================================================
# POOL BALANCE CHECK
# ============================================================================

def check_pool_balance(wallet_address, pool="hashvault"):
    """Check mining pool balance via API."""
    import urllib.request

    urls = {
        "hashvault": f"https://api.hashvault.pro/v3/xmr/wallet/{wallet_address}/stats",
        "supportxmr": f"https://supportxmr.com/api/miner/{wallet_address}/stats"
    }

    url = urls.get(pool)
    if not url:
        return {"error": f"Unknown pool: {pool}"}

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "RoadChain/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            return {
                "pool": pool,
                "balance": data.get("balance", 0) / 1e12,  # piconero to XMR
                "paid": data.get("paid", 0) / 1e12,
                "hashrate": data.get("hashrate", 0),
                "last_share": data.get("lastShare", 0)
            }
    except Exception as e:
        return {"error": str(e)}


# ============================================================================
# CLI
# ============================================================================

def print_fleet_status():
    """Pretty-print fleet mining status."""
    print()
    print("=" * 62)
    print("  ROADCHAIN MINING FLEET STATUS")
    print("=" * 62)
    print()

    statuses = fleet_status()
    total_running = 0

    print(f"  {'Host':<12} {'IP':<16} {'Status':<10} {'Hashrate':<15} {'Role'}")
    print("  " + "-" * 58)

    for s in statuses:
        status = "MINING" if s["running"] else "OFFLINE"
        if s["running"]:
            total_running += 1
        print(f"  {s['host']:<12} {s['ip']:<16} {status:<10} {s['hashrate']:<15} {s['role']}")

    print()
    print(f"  Fleet: {total_running}/{len(FLEET)} nodes active")
    print()


def print_earnings():
    """Pretty-print earnings summary."""
    summary = get_earnings_summary()

    print()
    print("=" * 62)
    print("  ROADCHAIN MINING EARNINGS")
    print("=" * 62)
    print()
    print(f"  XMR mined:   {summary['total_xmr']:.12f} XMR")
    print(f"  VRSC mined:  {summary['total_vrsc']:.8f} VRSC")
    print(f"  RTM mined:   {summary['total_rtm']:.8f} RTM")
    print(f"  Sessions:    {summary['sessions']}")
    print()

    if summary["recent"]:
        print("  Recent earnings:")
        for e in summary["recent"][-5:]:
            print(f"    {e['datetime'][:19]}  +{e['amount']:.8f} {e['coin'].upper()}  [{e['source']}]")
    print()


if __name__ == "__main__":
    import sys

    print("""
+==============================================================+
|                   ROADCHAIN MINER                            |
|          Pi Fleet Mining Orchestrator                         |
|                                                              |
|  Pi Fleet -> XMR -> BTC -> ROAD                              |
+==============================================================+
    """)

    if len(sys.argv) < 2:
        print("Usage:")
        print("  python3 miner.py status              Fleet status")
        print("  python3 miner.py deploy <wallet>      Deploy to all Pis")
        print("  python3 miner.py deploy-one <host> <wallet>  Deploy to one Pi")
        print("  python3 miner.py stop                 Stop all miners")
        print("  python3 miner.py stop-one <host>      Stop one miner")
        print("  python3 miner.py earnings             Show earnings")
        print("  python3 miner.py pool-check <wallet>  Check pool balance")
        print("  python3 miner.py config <wallet>      Generate xmrig config")
        sys.exit(0)

    cmd = sys.argv[1]

    if cmd == "status":
        print_fleet_status()

    elif cmd == "deploy":
        if len(sys.argv) < 3:
            print("Usage: python3 miner.py deploy <xmr-wallet-address>")
            sys.exit(1)
        wallet = sys.argv[2]
        coin = sys.argv[3] if len(sys.argv) > 3 else "xmr"
        print(f"Deploying {COINS[coin]['name']} miner to fleet...")
        save_fleet_config(wallet, coin)
        deploy_all(wallet, coin)
        print("\nDone. Check status with: python3 miner.py status")

    elif cmd == "deploy-one":
        if len(sys.argv) < 4:
            print("Usage: python3 miner.py deploy-one <host> <wallet>")
            sys.exit(1)
        host, wallet = sys.argv[2], sys.argv[3]
        coin = sys.argv[4] if len(sys.argv) > 4 else "xmr"
        result = deploy_miner(host, wallet, coin)
        print(json.dumps(result, indent=2))

    elif cmd == "stop":
        print("Stopping all miners...")
        stop_all()
        print("Done.")

    elif cmd == "stop-one":
        if len(sys.argv) < 3:
            print("Usage: python3 miner.py stop-one <host>")
            sys.exit(1)
        stop_miner(sys.argv[2])
        print(f"Stopped miner on {sys.argv[2]}")

    elif cmd == "earnings":
        print_earnings()

    elif cmd == "pool-check":
        if len(sys.argv) < 3:
            print("Usage: python3 miner.py pool-check <wallet>")
            sys.exit(1)
        result = check_pool_balance(sys.argv[2])
        if "error" in result:
            print(f"Error: {result['error']}")
        else:
            print(f"Pool: {result['pool']}")
            print(f"Balance: {result['balance']:.12f} XMR")
            print(f"Total paid: {result['paid']:.12f} XMR")
            print(f"Hashrate: {result['hashrate']} H/s")

    elif cmd == "config":
        if len(sys.argv) < 3:
            print("Usage: python3 miner.py config <wallet>")
            sys.exit(1)
        config = generate_xmrig_config(sys.argv[2])
        print(json.dumps(config, indent=2))

    else:
        print(f"Unknown command: {cmd}")
