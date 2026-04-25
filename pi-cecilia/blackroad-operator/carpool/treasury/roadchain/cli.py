#!/usr/bin/env python3
"""
RoadChain CLI
=============
Interactive blockchain interface.

Commands:
  mine <address>          - Mine a new block
  send <from> <to> <amt>  - Send ROAD tokens
  balance <address>       - Check balance
  chain                   - Show blockchain
  status                  - System status

Pipeline commands:
  fleet                   - Pi fleet mining status
  rates                   - Exchange rates (XMR/VRSC/RTM -> BTC)
  estimate <coin> <amt>   - Estimate BTC output for mined crypto
  swap <coin> <in> <btc>  - Record a completed swap
  swaps                   - Swap history
  reserve                 - BTC reserve & mint status
  check-btc               - Check on-chain BTC balance
  mint-road <btc> [src]   - Mint ROAD from BTC deposit
  sync                    - Sync reserve ledger with on-chain
  auto-mint               - Auto-mint from new BTC deposits
  pipeline                - Full pipeline status
  quit                    - Exit
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from roadchain import RoadChain, CHAIN_SYMBOL, QUANTUM, BLOCK_TIME, GENESIS_MESSAGE
from miner import fleet_status, get_earnings_summary, FLEET
from exchange import fetch_rates, estimate_btc, record_swap, get_swap_summary, BTC_RESERVE_ADDRESS
from mint import (
    check_btc_balance, sync_reserve, auto_mint, mint_road,
    pipeline_status, ROAD_TO_USD
)
import json
from pathlib import Path

# Persistence
CHAIN_FILE = Path.home() / ".roadchain" / "chain.json"
CHAIN_FILE.parent.mkdir(parents=True, exist_ok=True)

def save_chain(chain):
    """Save blockchain to file"""
    data = {
        "chain": [b.to_dict() for b in chain.chain],
        "pending": [tx.to_dict() for tx in chain.pending_transactions],
        "difficulty": chain.difficulty
    }
    with open(CHAIN_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def show_banner():
    print("""
╔══════════════════════════════════════════════════════════════╗
║                     ROADCHAIN CLI                             ║
║                  The BlackRoad Blockchain                     ║
║                                                                ║
║  Quantum: 25 (5²)  |  Block Time: 27s (3³)  |  Symbol: ROAD   ║
╚══════════════════════════════════════════════════════════════╝
    """)

def show_help():
    print("""
Blockchain:
  mine <address>          Mine a new block (rewards go to address)
  send <from> <to> <amt>  Send ROAD tokens
  balance <address>       Check address balance
  balances                Show all known balances
  chain                   Show blockchain summary
  block <n>               Show block details
  status                  System status
  genesis                 Show genesis message

Mining Pipeline (Pi Fleet -> XMR -> BTC -> ROAD):
  fleet                   Pi fleet mining status
  rates                   Live exchange rates
  estimate <coin> <amt>   Estimate BTC for mined crypto (xmr/vrsc/rtm)
  swap <coin> <in> <btc>  Record a completed crypto->BTC swap
  swaps                   Swap history
  reserve                 BTC reserve & ROAD mint status
  check-btc               Check on-chain BTC balance
  mint-road <btc> [src]   Mint ROAD from BTC deposit
  sync                    Sync reserve with on-chain BTC
  auto-mint               Auto-mint ROAD from new deposits
  pipeline                Full pipeline overview

General:
  help                    Show this help
  quit / exit             Exit CLI
    """)

def run_cli():
    show_banner()
    
    # Initialize or load chain
    chain = RoadChain()
    print(f"Genesis: {GENESIS_MESSAGE[:50]}...")
    print(f"Chain initialized with {len(chain.chain)} block(s)")
    print()
    print("Type 'help' for commands")
    print()
    
    while True:
        try:
            cmd = input("ROAD> ").strip().lower().split()
            if not cmd:
                continue
                
            action = cmd[0]
            
            if action in ['quit', 'exit', 'q']:
                print("Saving chain...")
                save_chain(chain)
                print("Goodbye!")
                break
                
            elif action == 'help':
                show_help()
                
            elif action == 'mine':
                if len(cmd) < 2:
                    print("Usage: mine <address>")
                    continue
                address = cmd[1]
                print(f"\nMining block for {address}...")
                block = chain.mine_pending_transactions(address)
                print(f"Block {block.index} mined!")
                print(f"Reward: {chain.get_block_reward()} {CHAIN_SYMBOL}")
                
            elif action == 'send':
                if len(cmd) < 4:
                    print("Usage: send <from> <to> <amount>")
                    continue
                sender, recipient, amount = cmd[1], cmd[2], float(cmd[3])
                
                # Check balance
                balance = chain.get_balance(sender)
                if balance < amount:
                    print(f"Insufficient balance! {sender} has {balance} {CHAIN_SYMBOL}")
                    continue
                    
                tx = chain.add_transaction(sender, recipient, amount)
                print(f"Transaction added: {tx.tx_hash[:16]}...")
                print(f"  {sender} → {recipient}: {amount} {CHAIN_SYMBOL}")
                print("Mine a block to confirm!")
                
            elif action == 'balance':
                if len(cmd) < 2:
                    print("Usage: balance <address>")
                    continue
                address = cmd[1]
                bal = chain.get_balance(address)
                print(f"{address}: {bal} {CHAIN_SYMBOL}")
                
            elif action == 'balances':
                # Find all addresses
                addresses = set()
                for block in chain.chain:
                    for tx in block.transactions:
                        if tx.sender != "0" and tx.sender != "ROADCHAIN":
                            addresses.add(tx.sender)
                        addresses.add(tx.recipient)
                
                print(f"\n{'Address':<15} {'Balance':>15}")
                print("-" * 32)
                for addr in sorted(addresses):
                    bal = chain.get_balance(addr)
                    if bal > 0:
                        print(f"{addr:<15} {bal:>15} {CHAIN_SYMBOL}")
                        
            elif action == 'chain':
                print(f"\n{'='*50}")
                print(f"RoadChain - {len(chain.chain)} blocks")
                print(f"{'='*50}")
                for block in chain.chain:
                    print(f"Block {block.index}: {block.hash[:16]}... ({len(block.transactions)} txs)")
                print(f"\nPending transactions: {len(chain.pending_transactions)}")
                print(f"Chain valid: {chain.is_chain_valid()}")
                
            elif action == 'block':
                if len(cmd) < 2:
                    print("Usage: block <number>")
                    continue
                n = int(cmd[1])
                if n >= len(chain.chain):
                    print(f"Block {n} not found")
                    continue
                block = chain.chain[n]
                print(f"\nBlock {block.index}")
                print(f"  Hash:     {block.hash}")
                print(f"  Previous: {block.previous_hash}")
                print(f"  Nonce:    {block.nonce}")
                print(f"  TXs:      {len(block.transactions)}")
                for tx in block.transactions:
                    print(f"    {tx.sender[:8]}... → {tx.recipient}: {tx.amount} {CHAIN_SYMBOL}")
                    
            elif action == 'status':
                print(f"\n{'='*50}")
                print("ROADCHAIN STATUS")
                print(f"{'='*50}")
                print(f"Blocks:          {len(chain.chain)}")
                print(f"Difficulty:      {chain.difficulty}")
                print(f"Block reward:    {chain.get_block_reward()} {CHAIN_SYMBOL}")
                print(f"Block time:      {BLOCK_TIME}s (3³)")
                print(f"Quantum:         {QUANTUM} (5²)")
                print(f"Pending TXs:     {len(chain.pending_transactions)}")
                print(f"Chain valid:     {chain.is_chain_valid()}")
                
            elif action == 'genesis':
                print(f"\nGenesis Message:")
                print(f"  {GENESIS_MESSAGE}")
                print(f"\nGenesis Hash:")
                print(f"  {chain.chain[0].hash}")

            # === MINING PIPELINE COMMANDS ===

            elif action == 'fleet':
                statuses = fleet_status()
                print(f"\n{'Host':<12} {'IP':<16} {'Status':<10} {'Hashrate':<15} {'Role'}")
                print("-" * 62)
                running = 0
                disabled = 0
                for s in statuses:
                    if s['hashrate'] == 'disabled':
                        st = "DISABLED"
                        disabled += 1
                    elif s["running"]:
                        st = "MINING"
                        running += 1
                    else:
                        st = "OFFLINE"
                    print(f"{s['host']:<12} {s['ip']:<16} {st:<10} {s['hashrate']:<15} {s['role']}")
                active_fleet = len(FLEET) - disabled
                est_hashrate = sum(FLEET[h]["xmr_hashrate"] for h in FLEET if FLEET[h].get("xmr_hashrate", 0) > 0)
                print(f"\nFleet: {running}/{active_fleet} active | Est. {est_hashrate} H/s combined")

            elif action == 'rates':
                rates = fetch_rates()
                if "error" in rates:
                    print(f"Error: {rates['error']}")
                else:
                    print(f"\nExchange rates ({rates.get('source', '?')}):")
                    btc_usd = rates.get("btc_usd", 0)
                    for coin, sym in [("xmr", "XMR"), ("vrsc", "VRSC"), ("rtm", "RTM")]:
                        r = rates.get(f"{coin}_btc", 0)
                        u = rates.get(f"{coin}_usd", 0)
                        if r > 0:
                            print(f"  {sym}: {r:.8f} BTC (${u:,.2f})")
                    print(f"  BTC: ${btc_usd:,.2f}")

            elif action == 'estimate':
                if len(cmd) < 3:
                    print("Usage: estimate <coin> <amount>")
                    print("  coin: xmr, vrsc, rtm")
                    continue
                result = estimate_btc(cmd[1], float(cmd[2]))
                if "error" in result:
                    print(f"Error: {result['error']}")
                else:
                    print(f"\n  {cmd[2]} {cmd[1].upper()} -> {result['btc_out']:.8f} BTC (${result['usd_value']:,.2f})")

            elif action == 'swap':
                if len(cmd) < 4:
                    print("Usage: swap <coin> <amount_in> <btc_out> [exchange]")
                    continue
                ex = cmd[4] if len(cmd) > 4 else "manual"
                swap = record_swap(cmd[1], float(cmd[2]), float(cmd[3]), ex)
                print(f"\n  Recorded: {swap['id']}")
                print(f"  {cmd[2]} {cmd[1].upper()} -> {cmd[3]} BTC via {ex}")

            elif action == 'swaps':
                summary = get_swap_summary()
                print(f"\nTotal BTC received: {summary['total_btc']:.8f}")
                print(f"Total swaps: {summary['total_swaps']}")
                if summary["recent"]:
                    print(f"\n{'ID':<18} {'In':<18} {'BTC Out':<14} {'Exchange'}")
                    print("-" * 56)
                    for s in summary["recent"][-10:]:
                        print(f"{s['id']:<18} {s['amount_in']:.4f} {s['coin_in']:<6}  {s['btc_out']:<14.8f} {s['exchange']}")

            elif action == 'reserve':
                status = pipeline_status()
                print(f"\nReserve: {BTC_RESERVE_ADDRESS}")
                print(f"On-chain BTC:   {status['on_chain_btc']}")
                print(f"Ledger BTC:     {status['ledger_btc']:.8f}")
                print(f"ROAD minted:    {status['total_road_minted']:.8f}")
                print(f"  from mining:  {status['road_from_mining']:.8f}")
                print(f"  from compute: {status['road_from_compute']:.8f}")
                print(f"Portfolio:      ${status['portfolio_usd']:,.2f}")

            elif action in ('check-btc', 'checkbtc'):
                print("Checking on-chain balance...")
                result = check_btc_balance()
                if "error" in result:
                    print(f"Error: {result['error']}")
                else:
                    print(f"\n  Balance: {result['balance_btc']:.8f} BTC")
                    print(f"  Unconfirmed: {result['unconfirmed_btc']:.8f} BTC")
                    print(f"  TX count: {result['tx_count']}")

            elif action in ('mint-road', 'mintroad'):
                if len(cmd) < 2:
                    print("Usage: mint-road <btc_amount> [source]")
                    continue
                btc = float(cmd[1])
                src = cmd[2] if len(cmd) > 2 else "btc_deposit"
                c = mint_road(btc, src)
                print(f"\n  Minted: {c['id']}")
                print(f"  {btc:.8f} BTC -> {c['road_minted']:.8f} ROAD")
                print(f"  Value: ${c['usd_value']:,.2f}")

            elif action == 'sync':
                print("Syncing reserve with on-chain...")
                result = sync_reserve()
                if "error" in result:
                    print(f"Error: {result['error']}")
                else:
                    print(f"\n  On-chain: {result['on_chain_btc']:.8f} BTC")
                    print(f"  Ledger:   {result['ledger_btc']:.8f} BTC")
                    print(f"  Synced:   {'YES' if result['synced'] else 'NO'}")
                    if result.get("action"):
                        print(f"  {result['action']}")

            elif action in ('auto-mint', 'automint'):
                print("Running auto-mint...")
                result = auto_mint()
                if "error" in result:
                    print(f"Error: {result['error']}")
                elif result.get("minted"):
                    c = result["conversion"]
                    print(f"\n  Minted {c['road_minted']:.8f} ROAD from {c['btc_in']:.8f} BTC")
                else:
                    print(f"  {result['message']}")

            elif action == 'pipeline':
                status = pipeline_status()
                print(f"\n{'='*55}")
                print("  ROADCHAIN PIPELINE: Mine -> Swap -> Reserve -> Mint")
                print(f"{'='*55}")
                print()

                # Fleet
                statuses = fleet_status()
                active = sum(1 for s in statuses if s["running"])
                print(f"  [MINE]    Fleet: {active}/{len(FLEET)} Pis mining")

                # Swaps
                ss = get_swap_summary()
                print(f"  [SWAP]    {ss['total_swaps']} swaps -> {ss['total_btc']:.8f} BTC")

                # Reserve
                print(f"  [RESERVE] {status['on_chain_btc']} BTC on-chain")
                print(f"            {status['ledger_btc']:.8f} BTC in ledger")

                # Mint
                print(f"  [MINT]    {status['total_road_minted']:.8f} ROAD minted")
                print(f"            ${status['portfolio_usd']:,.2f} portfolio")
                print()
                print(f"  Rate: 1 ROAD = ${ROAD_TO_USD:,}")
                print(f"  Reserve: {BTC_RESERVE_ADDRESS}")
                print()

            else:
                print(f"Unknown command: {action}")
                print("Type 'help' for available commands")
                
        except KeyboardInterrupt:
            print("\n\nSaving chain...")
            save_chain(chain)
            print("Goodbye!")
            break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    run_cli()
