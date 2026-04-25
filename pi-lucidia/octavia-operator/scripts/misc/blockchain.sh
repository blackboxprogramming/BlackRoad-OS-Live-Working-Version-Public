#!/bin/bash
clear
cat <<'MENU'

  ⛓️⛓️⛓️  ROADCHAIN ⛓️⛓️⛓️

  📊 1  Node Status
  ⛏️  2  Block Height
  💰 3  Account Balance
  📜 4  Recent Transactions
  📄 5  Deploy Contract
  🔑 6  Key Management
  🔙 0  ← Main Menu

MENU
read -p "  ⌨️  > " c
case $c in
  1) echo "  📊 Checking Besu node..."; curl -s -X POST --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' http://localhost:8545 2>/dev/null || echo "  ⚠️  Node not running"; read -p "  ↩ ";;
  2) curl -s -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545 2>/dev/null || echo "  ⚠️  Node offline"; read -p "  ↩ ";;
  3) read -p "  💰 Address (0x...): " addr
     result=$(curl -s -X POST --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"$addr\",\"latest\"],\"id\":1}" http://localhost:8545 2>/dev/null)
     if [[ -n "$result" ]]; then
       echo "  $result"
     else
       echo "  ⚠️  Besu node offline"
     fi
     # Show ROAD balance from chain if wallet exists
     PRICE_FEED="$HOME/.roadchain/price-feed.json"
     if [[ -f "$HOME/.roadchain/chain.json" ]]; then
       road_bal=$(python3 -c "
import json,sys
with open('$HOME/.roadchain/chain.json') as f:
    data = json.load(f)
bal = 0
for b in data.get('chain', []):
    for tx in b.get('transactions', []):
        if tx.get('recipient') == '$addr': bal += tx.get('amount', 0)
        if tx.get('sender') == '$addr': bal -= tx.get('amount', 0)
if bal > 0: print(f'{bal:.6f}')
" 2>/dev/null)
       if [[ -n "$road_bal" ]]; then
         btc_price="97500.00"
         if [[ -f "$PRICE_FEED" ]]; then
           btc_price=$(python3 -c "import json; print(f'{json.load(open(\"$PRICE_FEED\"))[\"btc_usd\"]:.2f}')" 2>/dev/null || echo "97500.00")
         fi
         usd_val=$(echo "$road_bal * $btc_price" | bc 2>/dev/null || echo "N/A")
         echo "  💰 ROAD Balance: $road_bal ROAD"
         echo "  💵 USD Value:    \$$usd_val (@ BTC \$$btc_price)"
       fi
     fi
     read -p "  ↩ ";;
  4) echo "  📜 Last 5 txs:"; cat ~/.blackroad/tx.log 2>/dev/null | tail -5 || echo "  (no log)"; read -p "  ↩ ";;
  5) echo "  📄 Contract deployment TBD"; read -p "  ↩ ";;
  6) echo "  🔑 Keys in ~/.blackroad/keys/"; ls ~/.blackroad/keys/ 2>/dev/null || echo "  (none)"; read -p "  ↩ ";;
  0) exec ./menu.sh;;
  *) echo "  ❌"; sleep 1;;
esac
exec ./blockchain.sh
