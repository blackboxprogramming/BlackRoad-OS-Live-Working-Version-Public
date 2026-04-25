# RoadChain

[![CI](https://github.com/blackboxprogramming/roadchain/actions/workflows/ci.yml/badge.svg)](https://github.com/blackboxprogramming/roadchain/actions/workflows/ci.yml)
[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/)

Layer-1 blockchain built from scratch in Python. Account-based model with secp256k1 signatures, SHA-256 proof-of-work, SHA-2048 agent identity, and Bitcoin-compatible block headers.

## Architecture

```
roadchain/
├── core/               # Block, Transaction, AccountState
│   ├── block.py        # 80-byte Bitcoin-compatible headers, merkle trees
│   ├── transaction.py  # Signed transfers with nonce replay protection
│   └── account.py      # Account state (balance + nonce)
├── crypto/             # Cryptographic primitives
│   ├── keys.py         # secp256k1 keypair generation, ECDSA sign/verify
│   ├── hashing.py      # Double SHA-256 (Bitcoin-style)
│   ├── bitcoin_pow.py  # PoW target calculation, header serialization
│   ├── sha2048.py      # 2048-bit identity hashing
│   └── address.py      # ROAD address derivation (pubkey → address)
├── consensus/          # Consensus engine
│   ├── pow.py          # Proof-of-work mining with callback reporting
│   ├── validation.py   # Block + transaction validation rules
│   └── difficulty.py   # Retarget algorithm (2,016 block intervals)
├── identity/           # Agent identity system
│   ├── agent.py        # SHA-2048 fingerprinted agent identities
│   ├── registry.py     # Agent registration and lookup
│   └── model_registry.py
├── security/           # Network security
│   └── scanner.py      # Port scanning, vulnerability detection, fleet scoring
├── wallet/             # Wallet management
├── mempool/            # Transaction pool
├── network/            # P2P networking
├── rpc/                # JSON-RPC interface
├── storage/            # Chain persistence
├── cli/                # Command-line interface
└── constants.py        # Network parameters (supply, timing, genesis)
```

## Features

**Blockchain Core**
- 80-byte block headers (Bitcoin wire-format compatible)
- Double SHA-256 hashing throughout
- Merkle tree transaction commitment
- Account-based state model with nonce replay protection
- Coinbase maturity (100 blocks)

**Cryptography**
- secp256k1 ECDSA (via coincurve) — same curve as Bitcoin/Ethereum
- ROAD addresses derived from compressed public keys
- SHA-2048 identity fingerprints (256-byte / 512-hex unique agent IDs)

**Consensus**
- Proof-of-work mining with adjustable difficulty
- 27-second target block time
- Difficulty retarget every 2,016 blocks
- 21M ROAD max supply with halving every 210,000 blocks

**Validation**
- Full block validation: header linkage, PoW, merkle root, timestamps
- Transaction validation: signature, nonce, balance, fee checks
- Coinbase validation: reward cap, maturity rules

## Network Parameters

| Parameter | Value |
|-----------|-------|
| Max supply | 21,000,000 ROAD |
| Block reward | 50 ROAD (halves every 210k blocks) |
| Block time | 27 seconds |
| Retarget interval | 2,016 blocks |
| Base unit | 1 ROAD = 10^8 units |
| Default port | 27270 |
| RPC port | 27271 |
| Protocol magic | `ROAD` |

## Testing

```bash
pip install pytest coincurve
cd .. && python -m pytest roadchain/tests/ -v
```

59 tests covering:
- **Cryptography** — key generation, ECDSA sign/verify, hashing, address derivation
- **Blocks** — header serialization, genesis block, merkle computation, serialization roundtrips
- **Transactions** — coinbase, signing, verification, ID generation, size calculation
- **Mining** — PoW block production, stop signals, hashrate callbacks
- **Validation** — balance checks, nonce enforcement, self-send rejection, coinbase limits
- **Identity** — SHA-2048 fingerprints, provider switching, claim signing, serialization

## License

Proprietary — BlackRoad OS, Inc. All rights reserved.
