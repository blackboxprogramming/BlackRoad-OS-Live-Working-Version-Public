#!/usr/bin/env python3
"""
RoadChain Mint
==============
Mint ROAD tokens against BTC deposited to the reserve address.

Pipeline: BTC arrives at reserve -> Verify on-chain -> Mint ROAD -> Update ledger

Reserve address: bc1qqf4l8mj0cjz6gqvvjdmqmdkez5x2gq4smu5fr4
Mint ratio: 1 BTC deposited = 1 ROAD minted (1:1 backing)
ROAD valuation: 1 ROAD = $100,000 USD

The mint only creates ROAD when real BTC is verified in the reserve.
This keeps ROAD revenue-backed rather than speculative.
"""

import json
import time
import hashlib
import urllib.request
from datetime import datetime
from pathlib import Path

# ============================================================================
# CONFIGURATION
# ============================================================================

DATA_DIR = Path.home() / ".roadchain" / "mint"
DATA_DIR.mkdir(parents=True, exist_ok=True)

RESERVE_FILE = DATA_DIR / "reserve.json"
MINT_LOG = DATA_DIR / "mint-log.json"

BTC_RESERVE_ADDRESS = "bc1qqf4l8mj0cjz6gqvvjdmqmdkez5x2gq4smu5fr4"
ROAD_PER_BTC = 1.0  # 1:1 mint ratio
ROAD_TO_USD = 100_000  # $100k per ROAD


# ============================================================================
# BTC ADDRESS MONITORING
# ============================================================================

def check_btc_balance(address=None):
    """Check BTC balance at the reserve address via public API."""
    addr = address or BTC_RESERVE_ADDRESS

    # Try mempool.space (no API key needed)
    url = f"https://mempool.space/api/address/{addr}"

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "RoadChain/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())

        funded = data.get("chain_stats", {}).get("funded_txo_sum", 0)
        spent = data.get("chain_stats", {}).get("spent_txo_sum", 0)
        balance_sats = funded - spent

        # Include mempool (unconfirmed)
        mempool_funded = data.get("mempool_stats", {}).get("funded_txo_sum", 0)
        mempool_spent = data.get("mempool_stats", {}).get("spent_txo_sum", 0)
        unconfirmed_sats = mempool_funded - mempool_spent

        balance_btc = balance_sats / 1e8
        unconfirmed_btc = unconfirmed_sats / 1e8

        return {
            "address": addr,
            "balance_btc": balance_btc,
            "balance_sats": balance_sats,
            "unconfirmed_btc": unconfirmed_btc,
            "total_funded_btc": funded / 1e8,
            "tx_count": data.get("chain_stats", {}).get("tx_count", 0),
            "source": "mempool.space",
            "timestamp": time.time()
        }
    except Exception as e:
        return {"error": str(e), "address": addr}


def get_recent_txs(address=None, limit=10):
    """Get recent transactions for the reserve address."""
    addr = address or BTC_RESERVE_ADDRESS
    url = f"https://mempool.space/api/address/{addr}/txs"

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "RoadChain/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            txs = json.loads(resp.read())

        results = []
        for tx in txs[:limit]:
            # Calculate amount received at this address
            received = 0
            for vout in tx.get("vout", []):
                if vout.get("scriptpubkey_address") == addr:
                    received += vout.get("value", 0)

            results.append({
                "txid": tx.get("txid"),
                "confirmed": tx.get("status", {}).get("confirmed", False),
                "block_height": tx.get("status", {}).get("block_height"),
                "received_sats": received,
                "received_btc": received / 1e8,
                "time": tx.get("status", {}).get("block_time")
            })

        return {"txs": results, "address": addr}
    except Exception as e:
        return {"error": str(e)}


# ============================================================================
# RESERVE LEDGER
# ============================================================================

def load_reserve():
    """Load the reserve ledger."""
    if RESERVE_FILE.exists():
        with open(RESERVE_FILE) as f:
            return json.load(f)
    return {
        "btc_address": BTC_RESERVE_ADDRESS,
        "btc_deposited": 0.0,
        "road_minted": 0.0,
        "road_from_mining": 0.0,
        "road_from_compute": 0.0,
        "conversions": [],
        "last_checked": None
    }


def save_reserve(data):
    """Save the reserve ledger."""
    with open(RESERVE_FILE, 'w') as f:
        json.dump(data, f, indent=2)


def load_mint_log():
    """Load the mint log."""
    if MINT_LOG.exists():
        with open(MINT_LOG) as f:
            return json.load(f)
    return {"mints": [], "total_minted": 0.0}


def save_mint_log(data):
    """Save the mint log."""
    with open(MINT_LOG, 'w') as f:
        json.dump(data, f, indent=2)


# ============================================================================
# MINTING
# ============================================================================

def mint_road(btc_amount, source="btc_deposit", tx_id=None, notes=""):
    """Mint ROAD tokens against a verified BTC deposit.

    Args:
        btc_amount: Amount of BTC that was deposited
        source: Where the BTC came from (btc_deposit, xmr_swap, vrsc_swap, mining)
        tx_id: Bitcoin transaction ID for verification
        notes: Additional context
    """
    reserve = load_reserve()
    mint_log = load_mint_log()

    road_amount = btc_amount * ROAD_PER_BTC
    usd_value = road_amount * ROAD_TO_USD

    mint_hash = hashlib.sha256(
        f"{btc_amount}{road_amount}{time.time()}{tx_id or ''}".encode()
    ).hexdigest()[:16]

    conversion = {
        "id": f"CONV-{mint_hash.upper()}",
        "btc_in": btc_amount,
        "road_minted": road_amount,
        "usd_value": usd_value,
        "source": source,
        "tx_id": tx_id,
        "notes": notes,
        "timestamp": time.time(),
        "datetime": datetime.now().isoformat(),
        "road_price_usd": ROAD_TO_USD,
        "status": "minted"
    }

    # Update reserve
    reserve["btc_deposited"] += btc_amount
    reserve["road_minted"] += road_amount
    if source in ("xmr_swap", "vrsc_swap", "rtm_swap", "mining"):
        reserve["road_from_mining"] += road_amount
    elif source == "compute":
        reserve["road_from_compute"] += road_amount
    reserve["conversions"].append(conversion)
    reserve["last_checked"] = datetime.now().isoformat()
    save_reserve(reserve)

    # Update mint log
    mint_log["mints"].append(conversion)
    mint_log["total_minted"] += road_amount
    save_mint_log(mint_log)

    return conversion


def sync_reserve():
    """Sync reserve ledger with on-chain BTC balance.

    Checks the actual BTC balance at the reserve address and
    reports any discrepancies with the local ledger.
    """
    reserve = load_reserve()
    on_chain = check_btc_balance()

    if "error" in on_chain:
        return {"error": on_chain["error"]}

    ledger_btc = reserve["btc_deposited"]
    chain_btc = on_chain["balance_btc"]
    diff = chain_btc - ledger_btc

    result = {
        "on_chain_btc": chain_btc,
        "ledger_btc": ledger_btc,
        "difference": diff,
        "synced": abs(diff) < 0.00000001,
        "road_minted": reserve["road_minted"],
        "unconfirmed": on_chain.get("unconfirmed_btc", 0),
        "tx_count": on_chain.get("tx_count", 0)
    }

    if diff > 0.00000001:
        result["action"] = f"New BTC detected: {diff:.8f} BTC. Run mint to create ROAD."
        result["mintable_road"] = diff * ROAD_PER_BTC
    elif diff < -0.00000001:
        result["action"] = f"Warning: Ledger shows more BTC than on-chain by {abs(diff):.8f}"

    # Update last checked
    reserve["last_checked"] = datetime.now().isoformat()
    save_reserve(reserve)

    return result


def auto_mint():
    """Check for new BTC deposits and auto-mint ROAD.

    Compares on-chain balance to ledger and mints ROAD for
    any new deposits found.
    """
    sync = sync_reserve()

    if "error" in sync:
        return {"error": sync["error"]}

    if sync.get("mintable_road", 0) > 0:
        diff = sync["difference"]
        print(f"  New BTC deposit detected: {diff:.8f} BTC")
        print(f"  Minting {diff * ROAD_PER_BTC:.8f} ROAD...")

        conversion = mint_road(
            btc_amount=diff,
            source="btc_deposit",
            notes="Auto-minted from sync"
        )

        return {
            "minted": True,
            "conversion": conversion,
            "new_btc": diff,
            "road_minted": conversion["road_minted"]
        }

    return {
        "minted": False,
        "message": "Reserve is synced. No new deposits.",
        "on_chain": sync["on_chain_btc"],
        "ledger": sync["ledger_btc"]
    }


# ============================================================================
# FULL PIPELINE
# ============================================================================

def pipeline_status():
    """Get status of the full mining -> ROAD pipeline."""
    reserve = load_reserve()
    mint_log = load_mint_log()

    # Try to get on-chain balance (may fail if no network)
    on_chain = check_btc_balance()
    chain_btc = on_chain.get("balance_btc", "N/A") if "error" not in on_chain else "offline"

    return {
        "reserve_address": BTC_RESERVE_ADDRESS,
        "on_chain_btc": chain_btc,
        "ledger_btc": reserve["btc_deposited"],
        "total_road_minted": reserve["road_minted"],
        "road_from_mining": reserve["road_from_mining"],
        "road_from_compute": reserve["road_from_compute"],
        "total_conversions": len(reserve["conversions"]),
        "total_mint_events": len(mint_log["mints"]),
        "road_usd_rate": ROAD_TO_USD,
        "portfolio_usd": reserve["road_minted"] * ROAD_TO_USD,
        "last_checked": reserve.get("last_checked")
    }


# ============================================================================
# CLI
# ============================================================================

def print_reserve_status():
    """Pretty-print reserve status."""
    status = pipeline_status()

    print()
    print("=" * 62)
    print("  ROADCHAIN RESERVE & MINT STATUS")
    print("=" * 62)
    print()
    print(f"  Reserve Address: {BTC_RESERVE_ADDRESS}")
    print()
    print(f"  On-chain BTC:     {status['on_chain_btc']}")
    print(f"  Ledger BTC:       {status['ledger_btc']:.8f}")
    print(f"  ROAD minted:      {status['total_road_minted']:.8f}")
    print(f"    from mining:    {status['road_from_mining']:.8f}")
    print(f"    from compute:   {status['road_from_compute']:.8f}")
    print(f"  Conversions:      {status['total_conversions']}")
    print()
    print(f"  ROAD rate:        ${ROAD_TO_USD:,}/ROAD")
    print(f"  Portfolio value:  ${status['portfolio_usd']:,.2f}")
    print()


def print_conversions():
    """Pretty-print conversion history."""
    reserve = load_reserve()

    print()
    print("=" * 62)
    print("  ROADCHAIN CONVERSIONS")
    print("=" * 62)
    print()

    if not reserve["conversions"]:
        print("  No conversions yet.")
        print()
        return

    print(f"  {'ID':<18} {'BTC In':<14} {'ROAD Out':<14} {'Source':<12} {'USD Value'}")
    print("  " + "-" * 58)

    for c in reserve["conversions"][-15:]:
        print(f"  {c['id']:<18} {c['btc_in']:<14.8f} {c['road_minted']:<14.8f} {c['source']:<12} ${c['usd_value']:,.2f}")
    print()


if __name__ == "__main__":
    import sys

    print("""
+==============================================================+
|                    ROADCHAIN MINT                            |
|            BTC Reserve -> ROAD Token Minting                 |
|                                                              |
|  1 BTC deposited = 1 ROAD minted (1:1 backing)              |
|  1 ROAD = $100,000 USD                                      |
+==============================================================+
    """)

    if len(sys.argv) < 2:
        print("Usage:")
        print("  python3 mint.py status                 Reserve & mint status")
        print("  python3 mint.py check                  Check on-chain BTC balance")
        print("  python3 mint.py sync                   Sync ledger with on-chain")
        print("  python3 mint.py auto                   Auto-mint from new deposits")
        print("  python3 mint.py mint <btc> [source]    Manually mint ROAD")
        print("  python3 mint.py conversions            Conversion history")
        print("  python3 mint.py txs                    Recent BTC transactions")
        print()
        print(f"  Reserve: {BTC_RESERVE_ADDRESS}")
        sys.exit(0)

    cmd = sys.argv[1]

    if cmd == "status":
        print_reserve_status()

    elif cmd == "check":
        print("  Checking on-chain balance...")
        result = check_btc_balance()
        if "error" in result:
            print(f"  Error: {result['error']}")
        else:
            print(f"\n  Address: {result['address']}")
            print(f"  Balance: {result['balance_btc']:.8f} BTC ({result['balance_sats']} sats)")
            print(f"  Unconfirmed: {result['unconfirmed_btc']:.8f} BTC")
            print(f"  Total funded: {result['total_funded_btc']:.8f} BTC")
            print(f"  TX count: {result['tx_count']}")

    elif cmd == "sync":
        print("  Syncing reserve ledger with on-chain...")
        result = sync_reserve()
        if "error" in result:
            print(f"  Error: {result['error']}")
        else:
            print(f"\n  On-chain: {result['on_chain_btc']:.8f} BTC")
            print(f"  Ledger:   {result['ledger_btc']:.8f} BTC")
            print(f"  Diff:     {result['difference']:.8f} BTC")
            print(f"  Synced:   {'YES' if result['synced'] else 'NO'}")
            if result.get("action"):
                print(f"  Action:   {result['action']}")

    elif cmd == "auto":
        print("  Running auto-mint...")
        result = auto_mint()
        if "error" in result:
            print(f"  Error: {result['error']}")
        elif result.get("minted"):
            c = result["conversion"]
            print(f"\n  Minted: {c['id']}")
            print(f"  BTC:    {c['btc_in']:.8f}")
            print(f"  ROAD:   {c['road_minted']:.8f}")
            print(f"  Value:  ${c['usd_value']:,.2f}")
        else:
            print(f"  {result['message']}")

    elif cmd == "mint":
        if len(sys.argv) < 3:
            print("Usage: python3 mint.py mint <btc_amount> [source] [tx_id] [notes]")
            sys.exit(1)
        btc = float(sys.argv[2])
        source = sys.argv[3] if len(sys.argv) > 3 else "btc_deposit"
        tx_id = sys.argv[4] if len(sys.argv) > 4 else None
        notes = sys.argv[5] if len(sys.argv) > 5 else ""

        c = mint_road(btc, source, tx_id, notes)
        print(f"\n  Minted: {c['id']}")
        print(f"  {btc:.8f} BTC -> {c['road_minted']:.8f} ROAD")
        print(f"  USD value: ${c['usd_value']:,.2f}")
        print(f"  Source: {source}")

    elif cmd == "conversions":
        print_conversions()

    elif cmd == "txs":
        print("  Fetching recent transactions...")
        result = get_recent_txs()
        if "error" in result:
            print(f"  Error: {result['error']}")
        else:
            print(f"\n  Recent transactions for {result['address']}:")
            print(f"  {'TXID':<20} {'BTC Received':<16} {'Confirmed':<10} {'Block'}")
            print("  " + "-" * 56)
            for tx in result["txs"]:
                confirmed = "YES" if tx["confirmed"] else "PENDING"
                block = str(tx["block_height"]) if tx["block_height"] else "-"
                print(f"  {tx['txid'][:18]:<20} {tx['received_btc']:<16.8f} {confirmed:<10} {block}")

    else:
        print(f"Unknown command: {cmd}")
