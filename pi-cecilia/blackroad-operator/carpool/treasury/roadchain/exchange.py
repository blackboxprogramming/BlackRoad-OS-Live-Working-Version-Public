#!/usr/bin/env python3
"""
RoadChain Exchange
==================
Swap mined crypto (XMR, VRSC, RTM) into BTC for the ROAD reserve.

Pipeline: Mined Crypto -> Exchange -> BTC -> Reserve Address -> Mint ROAD

Supported exchange backends:
  - ChangeNow (no KYC for small amounts)
  - TradeOgre (XMR/BTC pairs)
  - Manual (record swaps done on any exchange)

Reserve BTC address: bc1qqf4l8mj0cjz6gqvvjdmqmdkez5x2gq4smu5fr4
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

DATA_DIR = Path.home() / ".roadchain" / "exchange"
DATA_DIR.mkdir(parents=True, exist_ok=True)

SWAPS_FILE = DATA_DIR / "swaps.json"
RATES_CACHE = DATA_DIR / "rates.json"

# The BTC reserve address for ROAD backing
BTC_RESERVE_ADDRESS = "bc1qqf4l8mj0cjz6gqvvjdmqmdkez5x2gq4smu5fr4"

# Exchange API endpoints
APIS = {
    "changenow": {
        "name": "ChangeNow",
        "rate_url": "https://api.changenow.io/v2/exchange/estimated-amount",
        "swap_url": "https://api.changenow.io/v2/exchange",
        "min_url": "https://api.changenow.io/v2/exchange/min-amount",
        "needs_key": True
    },
    "tradeogre": {
        "name": "TradeOgre",
        "rate_url": "https://tradeogre.com/api/v1/ticker/BTC-XMR",
        "needs_key": False
    },
    "coingecko": {
        "name": "CoinGecko (rates only)",
        "rate_url": "https://api.coingecko.com/api/v3/simple/price",
        "needs_key": False
    }
}


# ============================================================================
# RATE FETCHING
# ============================================================================

def fetch_rates():
    """Fetch current exchange rates from CoinGecko (free, no key)."""
    url = "https://api.coingecko.com/api/v3/simple/price?ids=monero,verus,raptoreum,bitcoin&vs_currencies=btc,usd"

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "RoadChain/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())

        rates = {
            "xmr_btc": data.get("monero", {}).get("btc", 0),
            "xmr_usd": data.get("monero", {}).get("usd", 0),
            "vrsc_btc": data.get("verus", {}).get("btc", 0),
            "vrsc_usd": data.get("verus", {}).get("usd", 0),
            "rtm_btc": data.get("raptoreum", {}).get("btc", 0),
            "rtm_usd": data.get("raptoreum", {}).get("usd", 0),
            "btc_usd": data.get("bitcoin", {}).get("usd", 0),
            "timestamp": time.time(),
            "datetime": datetime.now().isoformat(),
            "source": "coingecko"
        }

        # Cache rates
        with open(RATES_CACHE, 'w') as f:
            json.dump(rates, f, indent=2)

        return rates

    except Exception as e:
        # Try cached rates
        if RATES_CACHE.exists():
            with open(RATES_CACHE) as f:
                cached = json.load(f)
                cached["_cached"] = True
                return cached
        return {"error": str(e)}


def get_cached_rates():
    """Get cached rates or fetch fresh ones."""
    if RATES_CACHE.exists():
        with open(RATES_CACHE) as f:
            cached = json.load(f)
        # Use cache if less than 5 minutes old
        if time.time() - cached.get("timestamp", 0) < 300:
            return cached
    return fetch_rates()


def estimate_btc(coin, amount):
    """Estimate BTC output for a given coin amount."""
    rates = get_cached_rates()
    if "error" in rates:
        return {"error": rates["error"]}

    rate_key = f"{coin}_btc"
    rate = rates.get(rate_key, 0)

    if rate == 0:
        return {"error": f"No rate available for {coin}"}

    btc_amount = amount * rate
    usd_value = btc_amount * rates.get("btc_usd", 0)

    return {
        "coin": coin,
        "amount": amount,
        "rate": rate,
        "btc_out": btc_amount,
        "usd_value": usd_value,
        "btc_usd": rates.get("btc_usd", 0)
    }


# ============================================================================
# SWAP TRACKING
# ============================================================================

def load_swaps():
    """Load swap history."""
    if SWAPS_FILE.exists():
        with open(SWAPS_FILE) as f:
            return json.load(f)
    return {
        "swaps": [],
        "total_btc_received": 0.0,
        "total_swaps": 0,
        "by_coin": {}
    }


def save_swaps(data):
    """Save swap history."""
    with open(SWAPS_FILE, 'w') as f:
        json.dump(data, f, indent=2)


def record_swap(coin, amount_in, btc_out, exchange="manual", tx_id=None, notes=""):
    """Record a completed swap (crypto -> BTC).

    Use this after executing a swap on any exchange to track it
    in the RoadChain ledger.
    """
    data = load_swaps()
    rates = get_cached_rates()

    swap_hash = hashlib.sha256(
        f"{coin}{amount_in}{btc_out}{time.time()}".encode()
    ).hexdigest()[:16]

    swap = {
        "id": f"SWAP-{swap_hash.upper()}",
        "coin_in": coin.upper(),
        "amount_in": amount_in,
        "btc_out": btc_out,
        "rate": btc_out / amount_in if amount_in > 0 else 0,
        "usd_value": btc_out * rates.get("btc_usd", 0),
        "exchange": exchange,
        "tx_id": tx_id,
        "btc_address": BTC_RESERVE_ADDRESS,
        "notes": notes,
        "timestamp": time.time(),
        "datetime": datetime.now().isoformat(),
        "status": "completed"
    }

    data["swaps"].append(swap)
    data["total_btc_received"] += btc_out
    data["total_swaps"] += 1

    # Track by coin
    coin_key = coin.lower()
    if coin_key not in data["by_coin"]:
        data["by_coin"][coin_key] = {"total_in": 0, "total_btc": 0, "count": 0}
    data["by_coin"][coin_key]["total_in"] += amount_in
    data["by_coin"][coin_key]["total_btc"] += btc_out
    data["by_coin"][coin_key]["count"] += 1

    save_swaps(data)
    return swap


def get_swap_summary():
    """Get summary of all swaps."""
    data = load_swaps()
    rates = get_cached_rates()

    return {
        "total_btc": data["total_btc_received"],
        "total_btc_usd": data["total_btc_received"] * rates.get("btc_usd", 0),
        "total_swaps": data["total_swaps"],
        "by_coin": data.get("by_coin", {}),
        "recent": data["swaps"][-10:] if data["swaps"] else []
    }


# ============================================================================
# CHANGENOW INTEGRATION
# ============================================================================

def changenow_estimate(coin_from, amount, api_key=None):
    """Get swap estimate from ChangeNow.

    Requires CHANGENOW_API_KEY env var or api_key param.
    """
    import os
    key = api_key or os.getenv("CHANGENOW_API_KEY")
    if not key:
        return {"error": "CHANGENOW_API_KEY not set. Use manual swaps or set the env var."}

    url = (
        f"https://api.changenow.io/v2/exchange/estimated-amount"
        f"?fromCurrency={coin_from}&toCurrency=btc"
        f"&fromAmount={amount}&fromNetwork={coin_from}&toNetwork=btc"
        f"&flow=standard&type=direct"
    )

    try:
        req = urllib.request.Request(url, headers={
            "x-changenow-api-key": key,
            "User-Agent": "RoadChain/1.0"
        })
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
        return {
            "estimated_btc": float(data.get("toAmount", 0)),
            "rate": float(data.get("rateId", 0)) if data.get("rateId") else None,
            "fee": data.get("networkFee", {}),
            "valid_until": data.get("validUntil"),
            "source": "changenow"
        }
    except Exception as e:
        return {"error": str(e)}


def changenow_create_swap(coin_from, amount, api_key=None):
    """Create a swap on ChangeNow (XMR -> BTC to reserve address).

    Returns deposit address to send mined crypto to.
    """
    import os
    key = api_key or os.getenv("CHANGENOW_API_KEY")
    if not key:
        return {"error": "CHANGENOW_API_KEY not set"}

    payload = json.dumps({
        "fromCurrency": coin_from,
        "toCurrency": "btc",
        "fromNetwork": coin_from,
        "toNetwork": "btc",
        "fromAmount": str(amount),
        "address": BTC_RESERVE_ADDRESS,
        "flow": "standard",
        "type": "direct"
    }).encode()

    try:
        req = urllib.request.Request(
            "https://api.changenow.io/v2/exchange",
            data=payload,
            headers={
                "x-changenow-api-key": key,
                "Content-Type": "application/json",
                "User-Agent": "RoadChain/1.0"
            }
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())

        return {
            "swap_id": data.get("id"),
            "deposit_address": data.get("payinAddress"),
            "deposit_memo": data.get("payinExtraId"),
            "expected_btc": float(data.get("toAmount", 0)),
            "status": data.get("status"),
            "source": "changenow"
        }
    except Exception as e:
        return {"error": str(e)}


# ============================================================================
# CLI
# ============================================================================

def print_rates():
    """Pretty-print current rates."""
    rates = fetch_rates()

    if "error" in rates:
        print(f"  Error fetching rates: {rates['error']}")
        return

    print()
    print("=" * 62)
    print("  EXCHANGE RATES")
    print("=" * 62)
    print()

    cached = " (cached)" if rates.get("_cached") else ""
    print(f"  Source: {rates.get('source', 'unknown')}{cached}")
    print(f"  Updated: {rates.get('datetime', 'unknown')}")
    print()

    btc_usd = rates.get("btc_usd", 0)
    print(f"  {'Coin':<6} {'BTC Rate':<16} {'USD Price':<14} {'1 coin → BTC reserve'}")
    print("  " + "-" * 58)

    for coin, symbol in [("xmr", "XMR"), ("vrsc", "VRSC"), ("rtm", "RTM")]:
        btc_rate = rates.get(f"{coin}_btc", 0)
        usd_rate = rates.get(f"{coin}_usd", 0)
        if btc_rate > 0:
            print(f"  {symbol:<6} {btc_rate:<16.8f} ${usd_rate:<13,.2f} mineable")
        else:
            print(f"  {symbol:<6} {'N/A':<16} {'N/A':<14} -")

    print()
    print(f"  BTC/USD: ${btc_usd:,.2f}")
    print(f"  Reserve: {BTC_RESERVE_ADDRESS}")
    print()


def print_swap_history():
    """Pretty-print swap history."""
    summary = get_swap_summary()

    print()
    print("=" * 62)
    print("  ROADCHAIN SWAP HISTORY")
    print("=" * 62)
    print()
    print(f"  Total BTC received:  {summary['total_btc']:.8f} BTC")
    print(f"  USD value:           ${summary['total_btc_usd']:,.2f}")
    print(f"  Total swaps:         {summary['total_swaps']}")
    print()

    if summary["by_coin"]:
        print("  By coin:")
        for coin, stats in summary["by_coin"].items():
            print(f"    {coin.upper()}: {stats['total_in']:.8f} in -> {stats['total_btc']:.8f} BTC ({stats['count']} swaps)")
        print()

    if summary["recent"]:
        print("  Recent swaps:")
        print(f"    {'ID':<18} {'In':<20} {'BTC Out':<14} {'Exchange'}")
        print("    " + "-" * 56)
        for s in summary["recent"][-5:]:
            print(f"    {s['id']:<18} {s['amount_in']:.6f} {s['coin_in']:<8}  {s['btc_out']:<14.8f} {s['exchange']}")
    print()


if __name__ == "__main__":
    import sys

    print("""
+==============================================================+
|                  ROADCHAIN EXCHANGE                           |
|            Swap Mined Crypto -> BTC Reserve                  |
|                                                              |
|  XMR/VRSC/RTM -> BTC -> Reserve -> Mint ROAD                |
+==============================================================+
    """)

    if len(sys.argv) < 2:
        print("Usage:")
        print("  python3 exchange.py rates                     Current exchange rates")
        print("  python3 exchange.py estimate <coin> <amount>  Estimate BTC output")
        print("  python3 exchange.py record <coin> <in> <btc>  Record a completed swap")
        print("  python3 exchange.py history                   Swap history")
        print("  python3 exchange.py changenow-estimate <coin> <amount>  ChangeNow quote")
        print("  python3 exchange.py changenow-swap <coin> <amount>      Create ChangeNow swap")
        print()
        print(f"  Reserve address: {BTC_RESERVE_ADDRESS}")
        sys.exit(0)

    cmd = sys.argv[1]

    if cmd == "rates":
        print_rates()

    elif cmd == "estimate":
        if len(sys.argv) < 4:
            print("Usage: python3 exchange.py estimate <coin> <amount>")
            print("  coin: xmr, vrsc, rtm")
            sys.exit(1)
        coin, amount = sys.argv[2].lower(), float(sys.argv[3])
        result = estimate_btc(coin, amount)
        if "error" in result:
            print(f"Error: {result['error']}")
        else:
            print(f"\n  {amount} {coin.upper()} -> {result['btc_out']:.8f} BTC (${result['usd_value']:,.2f})")
            print(f"  Rate: 1 {coin.upper()} = {result['rate']:.8f} BTC")
            print(f"  BTC/USD: ${result['btc_usd']:,.2f}")

    elif cmd == "record":
        if len(sys.argv) < 5:
            print("Usage: python3 exchange.py record <coin> <amount_in> <btc_out> [exchange] [tx_id]")
            sys.exit(1)
        coin = sys.argv[2].lower()
        amount_in = float(sys.argv[3])
        btc_out = float(sys.argv[4])
        exchange = sys.argv[5] if len(sys.argv) > 5 else "manual"
        tx_id = sys.argv[6] if len(sys.argv) > 6 else None

        swap = record_swap(coin, amount_in, btc_out, exchange, tx_id)
        print(f"\n  Swap recorded: {swap['id']}")
        print(f"  {amount_in} {coin.upper()} -> {btc_out:.8f} BTC")
        print(f"  Exchange: {exchange}")
        print(f"  -> {BTC_RESERVE_ADDRESS}")

    elif cmd == "history":
        print_swap_history()

    elif cmd == "changenow-estimate":
        if len(sys.argv) < 4:
            print("Usage: python3 exchange.py changenow-estimate <coin> <amount>")
            sys.exit(1)
        result = changenow_estimate(sys.argv[2].lower(), float(sys.argv[3]))
        if "error" in result:
            print(f"Error: {result['error']}")
        else:
            print(f"\n  ChangeNow estimate:")
            print(f"  {sys.argv[3]} {sys.argv[2].upper()} -> {result['estimated_btc']:.8f} BTC")

    elif cmd == "changenow-swap":
        if len(sys.argv) < 4:
            print("Usage: python3 exchange.py changenow-swap <coin> <amount>")
            sys.exit(1)
        result = changenow_create_swap(sys.argv[2].lower(), float(sys.argv[3]))
        if "error" in result:
            print(f"Error: {result['error']}")
        else:
            print(f"\n  Swap created: {result['swap_id']}")
            print(f"  Deposit {sys.argv[3]} {sys.argv[2].upper()} to: {result['deposit_address']}")
            if result.get("deposit_memo"):
                print(f"  Memo/Payment ID: {result['deposit_memo']}")
            print(f"  Expected BTC: {result['expected_btc']:.8f}")
            print(f"  BTC goes to: {BTC_RESERVE_ADDRESS}")

    else:
        print(f"Unknown command: {cmd}")
