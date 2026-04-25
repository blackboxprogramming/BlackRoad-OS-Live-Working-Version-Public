#!/usr/bin/env python3
"""
ROADCHAIN TRANSACTION SIGNING
Securely sign the BlackRoad OS IP protection transaction

© 2026 BlackRoad OS, Inc. All Rights Reserved.
"""

import json
import hashlib
import time
from getpass import getpass

def sign_roadchain_transaction():
    """
    Sign RoadChain transaction for IP protection

    SECURITY NOTE: This script uses your private key locally.
    Your private key NEVER leaves your machine.
    """

    print("="*78)
    print("🔐 ROADCHAIN TRANSACTION SIGNING")
    print("="*78)
    print()
    print("This will sign the BlackRoad OS IP protection transaction.")
    print()
    print("⚠️  SECURITY NOTICE:")
    print("   - Your private key will be used locally only")
    print("   - It will NOT be stored or transmitted")
    print("   - Make sure you're on a secure machine")
    print()

    # Load transaction
    try:
        with open('roadchain_transaction.json', 'r') as f:
            transaction = json.load(f)
        print("✅ Transaction loaded: roadchain_transaction.json")
        print()
    except FileNotFoundError:
        print("❌ Error: roadchain_transaction.json not found!")
        return

    # Display transaction details
    print("📋 TRANSACTION DETAILS:")
    print(f"   Company: {transaction['data']['company']}")
    print(f"   Repository: {transaction['data']['repository']}")
    print(f"   SHA-256: {transaction['data']['hashes']['sha256'][:32]}...")
    print(f"   Chain ID: {transaction['chainId']}")
    print(f"   TX Hash: {transaction['hash']}")
    print()

    # Prompt for signing method
    print("🔑 SIGNING METHODS:")
    print()
    print("1. MetaMask (Browser - RECOMMENDED)")
    print("2. Private Key (Manual entry)")
    print("3. Hardware Wallet (Ledger/Trezor)")
    print("4. Generate New Wallet")
    print()

    choice = input("Select method (1-4): ").strip()
    print()

    if choice == '1':
        sign_with_metamask(transaction)
    elif choice == '2':
        sign_with_private_key(transaction)
    elif choice == '3':
        sign_with_hardware_wallet(transaction)
    elif choice == '4':
        generate_new_wallet(transaction)
    else:
        print("❌ Invalid choice")
        return

def sign_with_metamask(transaction):
    """Sign using MetaMask browser extension"""
    print("🦊 METAMASK SIGNING")
    print("="*78)
    print()
    print("1. Open MetaMask in your browser")
    print("2. Add RoadChain network:")
    print()
    print("   Network Name: RoadChain Mainnet")
    print("   RPC URL: https://rpc.roadchain.io")
    print("   Chain ID: 7777")
    print("   Symbol: ROAD")
    print("   Explorer: https://explorer.roadchain.io")
    print()
    print("3. Go to: https://roadchain.io/sign")
    print("4. Upload roadchain_transaction.json")
    print("5. Click 'Sign with MetaMask'")
    print("6. Confirm in MetaMask popup")
    print()
    print("✅ MetaMask will handle signing securely")
    print()

def sign_with_private_key(transaction):
    """Sign using private key (FOR DEMO - USE METAMASK IN PRODUCTION!)"""
    print("🔐 PRIVATE KEY SIGNING")
    print("="*78)
    print()
    print("⚠️  WARNING: Only use this on a secure, offline machine!")
    print()

    try:
        from eth_account import Account
        from eth_account.messages import encode_defunct
        from web3 import Web3

        print("Enter your private key (or press Enter to skip):")
        print("Format: 0x followed by 64 hexadecimal characters")
        print()

        private_key = getpass("Private Key (hidden): ")

        if not private_key:
            print("❌ Signing cancelled")
            return

        # Ensure proper format
        if not private_key.startswith('0x'):
            private_key = '0x' + private_key

        # Create account from private key
        account = Account.from_key(private_key)

        print()
        print(f"✅ Loaded address: {account.address}")
        print()

        # Create message to sign
        tx_hash = transaction['hash']
        message = encode_defunct(text=tx_hash)

        # Sign the message
        signed_message = account.sign_message(message)

        # Update transaction with signature
        transaction['data']['signature'] = signed_message.signature.hex()
        transaction['data']['public_key'] = account.address
        transaction['signed_by'] = account.address
        transaction['signed_at'] = int(time.time())

        # Save signed transaction
        signed_file = 'roadchain_transaction_SIGNED.json'
        with open(signed_file, 'w') as f:
            json.dump(transaction, f, indent=2)

        print("="*78)
        print("✅ TRANSACTION SIGNED SUCCESSFULLY!")
        print("="*78)
        print()
        print(f"Signed by: {account.address}")
        print(f"Signature: {signed_message.signature.hex()[:32]}...")
        print(f"Saved to: {signed_file}")
        print()
        print("🚀 NEXT STEPS:")
        print("1. Review the signed transaction file")
        print("2. Submit to RoadChain:")
        print("   curl -X POST https://rpc.roadchain.io \\")
        print(f"     -d @{signed_file}")
        print()
        print("Or use the web interface:")
        print(f"   https://roadchain.io/submit")
        print()

    except ImportError:
        print("❌ Error: eth-account library not installed")
        print()
        print("Install with:")
        print("   pip install eth-account web3")
        print()
    except Exception as e:
        print(f"❌ Error signing transaction: {e}")
        print()

def sign_with_hardware_wallet(transaction):
    """Sign using hardware wallet"""
    print("🔒 HARDWARE WALLET SIGNING")
    print("="*78)
    print()
    print("1. Connect your Ledger or Trezor device")
    print("2. Open the Ethereum app")
    print("3. Use the web interface:")
    print("   https://roadchain.io/sign")
    print()
    print("4. Select 'Hardware Wallet'")
    print("5. Follow the prompts to connect")
    print("6. Verify transaction details on device screen")
    print("7. Confirm on device")
    print()
    print("✅ Hardware wallet provides maximum security")
    print()

def generate_new_wallet(transaction):
    """Generate a new wallet for RoadChain"""
    print("🆕 GENERATE NEW WALLET")
    print("="*78)
    print()

    try:
        from eth_account import Account
        Account.enable_unaudited_hdwallet_features()

        print("Generating new Ethereum-compatible wallet...")
        print()

        # Generate new account
        account = Account.create()

        print("✅ NEW WALLET CREATED")
        print("="*78)
        print()
        print(f"Address: {account.address}")
        print(f"Private Key: {account.key.hex()}")
        print()
        print("⚠️  IMPORTANT - SAVE THESE SECURELY:")
        print("   1. Write down your private key on paper")
        print("   2. Store in a secure location (safe, vault)")
        print("   3. NEVER share your private key")
        print("   4. Delete from this terminal after saving")
        print()

        # Save wallet info (user should delete after securing)
        wallet_file = 'NEW_ROADCHAIN_WALLET.txt'
        with open(wallet_file, 'w') as f:
            f.write("ROADCHAIN WALLET - SECURE THIS FILE!\n")
            f.write("="*78 + "\n\n")
            f.write(f"Address: {account.address}\n")
            f.write(f"Private Key: {account.key.hex()}\n\n")
            f.write("⚠️  DELETE THIS FILE AFTER SECURING YOUR KEYS!\n")

        print(f"💾 Wallet saved to: {wallet_file}")
        print()
        print("🚀 NEXT STEPS:")
        print("1. Secure your private key offline")
        print(f"2. Add ROAD tokens to: {account.address}")
        print("3. Use this wallet to sign the transaction")
        print(f"4. DELETE {wallet_file} after securing keys!")
        print()

        # Ask if they want to sign now
        sign_now = input("Sign transaction with this new wallet? (y/n): ").strip().lower()
        if sign_now == 'y':
            # Use the new account to sign
            from eth_account.messages import encode_defunct

            tx_hash = transaction['hash']
            message = encode_defunct(text=tx_hash)
            signed_message = account.sign_message(message)

            transaction['data']['signature'] = signed_message.signature.hex()
            transaction['data']['public_key'] = account.address
            transaction['signed_by'] = account.address
            transaction['signed_at'] = int(time.time())

            signed_file = 'roadchain_transaction_SIGNED.json'
            with open(signed_file, 'w') as f:
                json.dump(transaction, f, indent=2)

            print()
            print("✅ Transaction signed with new wallet!")
            print(f"   Saved to: {signed_file}")
            print()

    except ImportError:
        print("❌ Error: eth-account library not installed")
        print()
        print("Install with:")
        print("   pip install eth-account")
        print()
    except Exception as e:
        print(f"❌ Error generating wallet: {e}")
        print()

if __name__ == '__main__':
    print()
    sign_roadchain_transaction()
    print("="*78)
    print()
