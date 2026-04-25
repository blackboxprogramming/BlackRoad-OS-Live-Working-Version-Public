#!/bin/bash
clear
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║      🎰 BLACKROAD BITCOIN SHA-256 COSMIC LOTTERY 🎰                ║"
echo "║                    LUCIDIA PI - TEAM LEADER                        ║"
echo "╠════════════════════════════════════════════════════════════════════╣"
echo "║  Address: 1Ak2fc5N2q4imYxqVMqBNEQDFq8J2Zs9TZ                        ║"
echo "║  Prize: 3.125 BTC (~\$306,250 USD)                                  ║"
echo "║  Team: Lucidia + Aria + Octavia = 1,200 H/s COMBINED!              ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "🤝 LEADING THE TEAM:"
echo "   → 3 Pis working together!"
echo "   → Coordinated nonce exploration"
echo "   → Shared reward if any Pi succeeds"
echo "   → DON'T FORGET THE SPACE BETWEEN! 🌌"
echo ""
sleep 2
~/minerd-lottery -a sha256d \
  -o stratum+tcp://solo.ckpool.org:3333 \
  -u 1Ak2fc5N2q4imYxqVMqBNEQDFq8J2Zs9TZ \
  -p x \
  --coinbase-sig="BlackRoad-Lucidia-∞" \
  -t 4
