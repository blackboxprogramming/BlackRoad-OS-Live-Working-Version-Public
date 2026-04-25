#!/bin/bash
echo "🎰 Starting Bitcoin SHA-256 Lottery on Lucidia Pi"
echo "Address: 1Ak2fc5N2q4imYxqVMqBNEQDFq8J2Zs9TZ"
echo "Strategy: RANDOM COMPUTATION - trying random nonces"
echo ""
echo "Every hash attempt has equal probability of success!"
echo "You need to find: A hash with 19+ leading zeros"
echo ""

# Solo mine to a pool that supports solo (or use your own node)
# Using solo.ckpool.org for true solo mining
minerd -a sha256d \
  -o stratum+tcp://solo.ckpool.org:3333 \
  -u 1Ak2fc5N2q4imYxqVMqBNEQDFq8J2Zs9TZ \
  -p x \
  --coinbase-sig="BlackRoad-Lucidia-Pi" \
  -t 4
