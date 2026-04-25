"""
RoadChain CLI — identity > provider.

Usage:
    python -m roadchain identity register --name <name> [--provider <provider>] [--model <model>]
    python -m roadchain identity show <name>
    python -m roadchain identity list
    python -m roadchain identity card <name>
    python -m roadchain identity switch-provider <name> --provider <provider> [--model <model>]
    python -m roadchain identity attest <subject> --by <attester>
    python -m roadchain identity stats
    python -m roadchain identity verify <name>

    python -m roadchain wallet create <name>
    python -m roadchain wallet show <name>
    python -m roadchain wallet list
    python -m roadchain wallet link <wallet-name> <identity-name>

    python -m roadchain hash <data>
    python -m roadchain fingerprint <data>

    python -m roadchain stats
    python -m roadchain version

BlackRoad OS, Inc. 2026 — SHA-2048 Agent Identity
"""

import sys
import json
import time

from ..identity.agent import AgentIdentity
from ..identity.registry import IdentityRegistry
from ..identity.model_registry import ModelRegistry
from ..security.scanner import NetworkScanner
from ..security.hardening import HardeningAuditor
from ..security.device_identity import DeviceRegistry
from ..wallet.wallet import Wallet
from ..crypto.sha2048 import (
    sha2048_hex, dsha2048_hex, fingerprint_display, SHA2048_BYTES,
)
from ..constants import USER_AGENT


# ── Colors ────────────────────────────────────────────────────────────
PINK = "\033[38;5;205m"
AMBER = "\033[38;5;214m"
BLUE = "\033[38;5;69m"
VIOLET = "\033[38;5;135m"
GREEN = "\033[38;5;82m"
RED = "\033[38;5;196m"
WHITE = "\033[1;37m"
DIM = "\033[2m"
RESET = "\033[0m"


def banner():
    print(f"""
{PINK}╔══════════════════════════════════════════════════════════════╗{RESET}
{PINK}║{RESET}  {WHITE}ROADCHAIN{RESET} — {AMBER}SHA-2048 Agent Identity{RESET}                        {PINK}║{RESET}
{PINK}║{RESET}  {DIM}identity > provider{RESET}                                        {PINK}║{RESET}
{PINK}╚══════════════════════════════════════════════════════════════╝{RESET}
""")


def cmd_identity_register(args: list[str]):
    """Register a new agent identity."""
    name = _get_flag(args, "--name") or (args[0] if args else None)
    if not name:
        print(f"{PINK}Error:{RESET} --name required")
        sys.exit(1)

    provider = _get_flag(args, "--provider") or ""
    model = _get_flag(args, "--model") or ""
    caps = _get_flag(args, "--capabilities")
    capabilities = caps.split(",") if caps else []

    print(f"{AMBER}Creating agent identity:{RESET} {WHITE}{name}{RESET}")
    print(f"  Provider: {provider or 'sovereign'}")
    print(f"  Model:    {model or 'native'}")
    print()

    identity = AgentIdentity.create(
        name=name,
        provider=provider,
        model=model,
        capabilities=capabilities,
    )

    registry = IdentityRegistry()
    record = registry.register(identity)
    registry.close()

    print(f"{GREEN}Identity registered on RoadChain{RESET}")
    print()
    print(identity.card())
    print()
    print(f"{DIM}SHA-2048 fingerprint (2048 bits / 256 bytes):{RESET}")
    print(f"  {identity.fingerprint_hex[:64]}")
    print(f"  {identity.fingerprint_hex[64:128]}")
    print(f"  {identity.fingerprint_hex[128:192]}")
    print(f"  {identity.fingerprint_hex[192:256]}")
    print(f"  {identity.fingerprint_hex[256:320]}")
    print(f"  {identity.fingerprint_hex[320:384]}")
    print(f"  {identity.fingerprint_hex[384:448]}")
    print(f"  {identity.fingerprint_hex[448:]}")
    print()
    print(f"{AMBER}Identity saved.{RESET} This hash IS the agent. Provider can change. Identity cannot.")


def cmd_identity_show(args: list[str]):
    """Show an agent identity."""
    name = args[0] if args else None
    if not name:
        print(f"{PINK}Error:{RESET} name required")
        sys.exit(1)

    registry = IdentityRegistry()
    record = registry.get_by_name(name)
    registry.close()

    if not record:
        print(f"{PINK}Error:{RESET} identity '{name}' not found")
        sys.exit(1)

    print(f"{WHITE}Agent:{RESET} {record.name}")
    print(f"  {AMBER}ROAD Address:{RESET}  {record.road_address}")
    print(f"  {AMBER}Provider:{RESET}      {record.provider or 'sovereign'}")
    print(f"  {AMBER}Model:{RESET}         {record.model or 'native'}")
    print(f"  {AMBER}Status:{RESET}        {record.status}")
    print(f"  {AMBER}Attestations:{RESET}  {record.attestations}")
    print(f"  {AMBER}Created:{RESET}       {record.created_at}")
    print(f"  {AMBER}Block:{RESET}         {record.block_height or 'pending'}")
    print()
    print(f"  {DIM}SHA-2048 Fingerprint:{RESET}")
    fp = record.fingerprint
    for i in range(0, len(fp), 64):
        print(f"    {fp[i:i+64]}")


def cmd_identity_list(args: list[str]):
    """List all registered identities."""
    registry = IdentityRegistry()
    records = registry.list_all()
    registry.close()

    if not records:
        print(f"{DIM}No identities registered.{RESET}")
        return

    print(f"{WHITE}Registered Agents ({len(records)}):{RESET}")
    print(f"{'─' * 70}")
    print(f"  {'Name':<16} {'Address':<46} {'Provider':<12}")
    print(f"{'─' * 70}")
    for r in records:
        provider = r.provider or "sovereign"
        print(f"  {r.name:<16} {r.road_address:<46} {provider:<12}")
    print(f"{'─' * 70}")


def cmd_identity_card(args: list[str]):
    """Show agent identity card."""
    name = args[0] if args else None
    if not name:
        print(f"{PINK}Error:{RESET} name required")
        sys.exit(1)

    from ..constants import LEGACY_DIR
    identity_path = LEGACY_DIR / "identities" / name / "identity.json"
    if not identity_path.exists():
        print(f"{PINK}Error:{RESET} identity file not found for '{name}'")
        sys.exit(1)

    identity = AgentIdentity.load(identity_path)
    print(identity.card())


def cmd_identity_switch(args: list[str]):
    """Switch an agent's provider."""
    name = args[0] if args else None
    provider = _get_flag(args, "--provider")
    model = _get_flag(args, "--model") or ""

    if not name or not provider:
        print(f"{PINK}Error:{RESET} name and --provider required")
        sys.exit(1)

    registry = IdentityRegistry()
    record = registry.get_by_name(name)
    if not record:
        print(f"{PINK}Error:{RESET} identity '{name}' not found")
        registry.close()
        sys.exit(1)

    old_provider = record.provider or "sovereign"
    registry.switch_provider(record.fingerprint, provider, model)
    registry.close()

    print(f"{GREEN}Provider switched{RESET}")
    print(f"  Agent:    {name}")
    print(f"  From:     {old_provider}")
    print(f"  To:       {provider}")
    print(f"  Model:    {model or 'default'}")
    print()
    print(f"  {DIM}Identity unchanged. SHA-2048 fingerprint is permanent.{RESET}")


def cmd_identity_attest(args: list[str]):
    """One agent attests to another's identity."""
    subject_name = args[0] if args else None
    attester_name = _get_flag(args, "--by")
    message = _get_flag(args, "--message") or ""

    if not subject_name or not attester_name:
        print(f"{PINK}Error:{RESET} subject name and --by attester required")
        sys.exit(1)

    from ..constants import LEGACY_DIR
    subject_path = LEGACY_DIR / "identities" / subject_name / "identity.json"
    attester_path = LEGACY_DIR / "identities" / attester_name / "identity.json"

    if not subject_path.exists() or not attester_path.exists():
        print(f"{PINK}Error:{RESET} both identities must exist locally")
        sys.exit(1)

    subject = AgentIdentity.load(subject_path)
    attester = AgentIdentity.load(attester_path)

    registry = IdentityRegistry()
    registry.attest(subject, attester, message)
    registry.close()

    print(f"{GREEN}Attestation recorded{RESET}")
    print(f"  {attester.name} vouches for {subject.name}")


def cmd_identity_stats(args: list[str]):
    """Show identity registry statistics."""
    registry = IdentityRegistry()
    s = registry.stats()
    registry.close()

    print(f"{WHITE}Identity Registry Stats{RESET}")
    print(f"{'─' * 40}")
    print(f"  Total:         {s['total_identities']}")
    print(f"  Active:        {GREEN}{s['active']}{RESET}")
    print(f"  Revoked:       {s['revoked']}")
    print(f"  Migrated:      {s['migrated']}")
    print(f"  Attestations:  {s['attestations']}")
    print(f"{'─' * 40}")
    print(f"  {WHITE}Providers:{RESET}")
    for provider, count in s["providers"].items():
        print(f"    {provider:<16} {count} agents")
    print(f"{'─' * 40}")
    print(f"  Merkle root:   {DIM}{s['merkle_root']}{RESET}")


def cmd_identity_verify(args: list[str]):
    """Verify an agent's identity."""
    name = args[0] if args else None
    if not name:
        print(f"{PINK}Error:{RESET} name required")
        sys.exit(1)

    from ..constants import LEGACY_DIR
    identity_path = LEGACY_DIR / "identities" / name / "identity.json"
    if not identity_path.exists():
        print(f"{PINK}Error:{RESET} identity file not found for '{name}'")
        sys.exit(1)

    identity = AgentIdentity.load(identity_path)
    sig = identity.sign_identity_claim()
    valid = identity.verify_claim(sig, identity.public_key)

    if valid:
        print(f"{GREEN}VERIFIED{RESET} — {name} controls their private key")
        print(f"  Address:     {identity.road_address}")
        print(f"  Short ID:    {identity.short_id}")
        print(f"  Fingerprint: {identity.fingerprint_display}")
    else:
        print(f"{PINK}FAILED{RESET} — signature verification failed for {name}")


def cmd_wallet_create(args: list[str]):
    """Create a new wallet."""
    name = args[0] if args else None
    if not name:
        print(f"{PINK}Error:{RESET} wallet name required")
        sys.exit(1)

    wallet = Wallet.create(name)
    path = wallet.save()

    print(f"{GREEN}Wallet created{RESET}")
    print(wallet)
    print(f"  {DIM}Saved to: {path}{RESET}")


def cmd_wallet_show(args: list[str]):
    """Show wallet details."""
    name = args[0] if args else None
    if not name:
        print(f"{PINK}Error:{RESET} wallet name required")
        sys.exit(1)

    try:
        wallet = Wallet.load(name)
        print(wallet)
    except FileNotFoundError:
        print(f"{PINK}Error:{RESET} wallet '{name}' not found")
        sys.exit(1)


def cmd_wallet_list(args: list[str]):
    """List all wallets."""
    names = Wallet.list_wallets()
    if not names:
        print(f"{DIM}No wallets found.{RESET}")
        return

    print(f"{WHITE}Wallets ({len(names)}):{RESET}")
    for name in sorted(names):
        try:
            wallet = Wallet.load(name)
            identity_tag = f" {VIOLET}[identity]{RESET}" if wallet.has_identity else ""
            print(f"  {name:<20} {wallet.address}  {wallet.balance_road:.8f} ROAD{identity_tag}")
        except Exception:
            print(f"  {name:<20} {DIM}(error loading){RESET}")


def cmd_wallet_link(args: list[str]):
    """Link a wallet to an agent identity."""
    wallet_name = args[0] if len(args) > 0 else None
    identity_name = args[1] if len(args) > 1 else None

    if not wallet_name or not identity_name:
        print(f"{PINK}Error:{RESET} wallet-name and identity-name required")
        sys.exit(1)

    from ..constants import LEGACY_DIR
    identity_path = LEGACY_DIR / "identities" / identity_name / "identity.json"
    if not identity_path.exists():
        print(f"{PINK}Error:{RESET} identity '{identity_name}' not found")
        sys.exit(1)

    identity = AgentIdentity.load(identity_path)
    wallet = Wallet.from_identity(identity)
    path = wallet.save()

    print(f"{GREEN}Wallet linked to identity{RESET}")
    print(f"  Wallet:      {wallet_name}")
    print(f"  Identity:    {identity_name}")
    print(f"  Address:     {wallet.address}")
    print(f"  Fingerprint: {identity.short_id}")


def cmd_hash(args: list[str]):
    """Compute SHA-2048 hash of input data."""
    data = " ".join(args) if args else ""
    if not data:
        print(f"{PINK}Error:{RESET} data required")
        sys.exit(1)

    h = sha2048_hex(data.encode("utf-8"))
    print(f"{WHITE}SHA-2048{RESET} ({len(h) * 4} bits)")
    print()
    for i in range(0, len(h), 64):
        print(f"  {h[i:i+64]}")
    print()
    fp = fingerprint_display(bytes.fromhex(h))
    print(f"  {DIM}Fingerprint: {fp}{RESET}")


def cmd_stats(args: list[str]):
    """Show overall RoadChain stats."""
    banner()

    registry = IdentityRegistry()
    s = registry.stats()
    registry.close()

    wallets = Wallet.list_wallets()

    print(f"  {WHITE}Chain:{RESET}           RoadChain L1 (Chain ID 7777)")
    print(f"  {WHITE}Identity Hash:{RESET}   SHA-2048 (2048-bit / 256-byte)")
    print(f"  {WHITE}PoW Hash:{RESET}        Double SHA-256 (Bitcoin-compatible)")
    print(f"  {WHITE}Keys:{RESET}            secp256k1")
    print(f"  {WHITE}Address:{RESET}         ROAD + RIPEMD160(SHA256(pubkey))")
    print()
    print(f"  {AMBER}Agents:{RESET}          {s['active']} active, {s['total_identities']} total")
    print(f"  {AMBER}Attestations:{RESET}    {s['attestations']}")
    print(f"  {AMBER}Wallets:{RESET}         {len(wallets)}")
    print(f"  {AMBER}Providers:{RESET}       {len(s['providers'])}")
    for p, c in s["providers"].items():
        print(f"    {p}: {c}")
    print()
    print(f"  {DIM}identity > provider{RESET}")


def cmd_models_list(args: list[str]):
    """List all verified models."""
    vendor = _get_flag(args, "--vendor") or ""
    category = _get_flag(args, "--category") or ""

    registry = ModelRegistry()
    if category:
        records = registry.list_by_category(category)
    else:
        records = registry.list_all(vendor=vendor)
    registry.close()

    if not records:
        print(f"{DIM}No models registered.{RESET}")
        return

    print(f"{WHITE}Verified Models ({len(records)}):{RESET}")
    print(f"{'─' * 85}")
    print(f"  {'Name':<45} {'Type':<12} {'SHA-2048 ID':<18} {'Category'}")
    print(f"{'─' * 85}")
    for r in records:
        print(f"  {r.name:<45} {r.model_type:<12} {r.short_id:<18} {r.metadata.get('category', '')}")
    print(f"{'─' * 85}")


def cmd_models_show(args: list[str]):
    """Show details for a specific model."""
    name = args[0] if args else None
    if not name:
        print(f"{PINK}Error:{RESET} model name required")
        sys.exit(1)

    registry = ModelRegistry()
    record = registry.get_by_name(name)
    registry.close()

    if not record:
        print(f"{PINK}Error:{RESET} model '{name}' not found")
        sys.exit(1)

    print(f"{WHITE}Model:{RESET} {record.name}")
    print(f"  {AMBER}Type:{RESET}        {record.model_type}")
    print(f"  {AMBER}Vendor:{RESET}      {record.vendor}")
    print(f"  {AMBER}Path:{RESET}        {record.path}")
    print(f"  {AMBER}Size:{RESET}        {record.size_bytes / 1024:.0f} KB" if record.size_bytes else f"  {AMBER}Size:{RESET}        (metadata only)")
    print(f"  {AMBER}Short ID:{RESET}    {record.short_id}")
    print(f"  {AMBER}SHA-256:{RESET}     {record.sha256}")
    print(f"  {AMBER}Verified:{RESET}    {GREEN}yes{RESET}" if record.verified else f"  {AMBER}Verified:{RESET}    no")
    print()
    print(f"  {DIM}SHA-2048 Fingerprint:{RESET}")
    fp = record.fingerprint
    for i in range(0, len(fp), 64):
        print(f"    {fp[i:i+64]}")


def cmd_models_verify(args: list[str]):
    """Re-verify a model's fingerprint."""
    name = args[0] if args else None
    if not name:
        print(f"{PINK}Error:{RESET} model name required")
        sys.exit(1)

    registry = ModelRegistry()
    ok = registry.verify_model(name)
    registry.close()

    if ok:
        print(f"{GREEN}VERIFIED{RESET} — {name} matches its SHA-2048 fingerprint")
    else:
        print(f"{PINK}CHANGED{RESET} — {name} fingerprint mismatch (model may have been updated)")


def cmd_models_stats(args: list[str]):
    """Show model registry statistics."""
    registry = ModelRegistry()
    s = registry.stats()
    registry.close()

    print(f"{WHITE}Model Registry Stats{RESET}")
    print(f"{'─' * 50}")
    print(f"  Total:       {s['total_models']}")
    print(f"  Verified:    {GREEN}{s['verified']}{RESET}")
    print(f"  Size:        {s['total_size_mb']} MB")
    print()
    print(f"  {WHITE}By Vendor:{RESET}")
    for v, c in s["vendors"].items():
        print(f"    {v:<20} {c}")
    print()
    print(f"  {WHITE}By Type:{RESET}")
    for t, c in s["types"].items():
        print(f"    {t:<20} {c}")
    print()
    print(f"  {WHITE}By Category:{RESET}")
    for cat, c in s["categories"].items():
        print(f"    {cat:<24} {c}")
    print()
    print(f"  {DIM}identity > provider — every model has a 2048-bit fingerprint{RESET}")


def cmd_security_scan(args: list[str]):
    """Scan a host."""
    host = args[0] if args else None
    if not host:
        print(f"{PINK}Error:{RESET} host required")
        sys.exit(1)
    scanner = NetworkScanner()
    result = scanner.scan_host(host)
    scanner.close()
    alive = f"{GREEN}UP{RESET}" if result.alive else f"{RED}DOWN{RESET}"
    sc = f"{GREEN}" if result.score >= 80 else f"{AMBER}" if result.score >= 50 else f"{RED}"
    print(f"  Host:  {result.hostname or result.host}  {alive}")
    print(f"  Score: {sc}{result.score}/100{RESET}  ID: {result.short_id}")
    if result.open_ports:
        print(f"  Ports: {', '.join(f'{p.port}/{p.service}' for p in result.open_ports)}")
    for v in result.vulnerabilities:
        print(f"  {RED}VULN:{RESET} {v.get('issue', v.get('detail', ''))}")


def cmd_security_scores(args: list[str]):
    """Show fleet security scores."""
    dev_reg = DeviceRegistry()
    devices = dev_reg.list_all()
    dev_reg.close()
    if not devices:
        print(f"{DIM}No devices. Run: br security fleet{RESET}")
        return
    print(f"{WHITE}Fleet Security Scores:{RESET}")
    for d in sorted(devices, key=lambda x: x.security_score):
        sc = f"{GREEN}" if d.security_score >= 80 else f"{AMBER}" if d.security_score >= 50 else f"{RED}"
        print(f"  {d.name:<16} {sc}{d.security_score:3d}{RESET}  {d.device_type:<6}  {d.short_id}")


def cmd_security_devices(args: list[str]):
    """List registered devices."""
    dev_reg = DeviceRegistry()
    devices = dev_reg.list_all()
    stats = dev_reg.stats()
    dev_reg.close()
    print(f"{WHITE}Registered Devices ({stats['total']}):{RESET}")
    for d in devices:
        status_c = f"{GREEN}" if d.status == "active" else f"{RED}"
        print(f"  {d.name:<16} {d.device_type:<6} {status_c}{d.status:<8}{RESET} {d.local_ip:<16} {d.short_id}")


def cmd_version(args: list[str]):
    print(f"RoadChain {USER_AGENT}")
    print(f"SHA-2048 Agent Identity Layer")
    print(f"BlackRoad OS, Inc. 2026")


# ── Flag Parsing ──────────────────────────────────────────────────────

def _get_flag(args: list[str], flag: str) -> str | None:
    """Extract --flag value from args list."""
    try:
        idx = args.index(flag)
        if idx + 1 < len(args):
            return args[idx + 1]
    except ValueError:
        pass
    return None


# ── Dispatch ──────────────────────────────────────────────────────────

COMMANDS = {
    ("identity", "register"): cmd_identity_register,
    ("identity", "show"): cmd_identity_show,
    ("identity", "list"): cmd_identity_list,
    ("identity", "card"): cmd_identity_card,
    ("identity", "switch-provider"): cmd_identity_switch,
    ("identity", "attest"): cmd_identity_attest,
    ("identity", "stats"): cmd_identity_stats,
    ("identity", "verify"): cmd_identity_verify,
    ("wallet", "create"): cmd_wallet_create,
    ("wallet", "show"): cmd_wallet_show,
    ("wallet", "list"): cmd_wallet_list,
    ("wallet", "link"): cmd_wallet_link,
    ("models", "list"): cmd_models_list,
    ("models", "show"): cmd_models_show,
    ("models", "verify"): cmd_models_verify,
    ("models", "stats"): cmd_models_stats,
    ("security", "scan"): cmd_security_scan,
    ("security", "scores"): cmd_security_scores,
    ("security", "devices"): cmd_security_devices,
    ("hash",): cmd_hash,
    ("stats",): cmd_stats,
    ("version",): cmd_version,
}


def main():
    args = sys.argv[1:]

    if not args or args[0] in ("-h", "--help", "help"):
        banner()
        print(f"  {WHITE}Commands:{RESET}")
        print(f"    identity register  --name <n> [--provider <p>] [--model <m>]")
        print(f"    identity show      <name>")
        print(f"    identity list")
        print(f"    identity card      <name>")
        print(f"    identity switch-provider <name> --provider <p> [--model <m>]")
        print(f"    identity attest    <subject> --by <attester>")
        print(f"    identity stats")
        print(f"    identity verify    <name>")
        print()
        print(f"    wallet create      <name>")
        print(f"    wallet show        <name>")
        print(f"    wallet list")
        print(f"    wallet link        <wallet> <identity>")
        print()
        print(f"    models list       [--vendor <v>] [--category <c>]")
        print(f"    models show       <name>")
        print(f"    models verify     <name>")
        print(f"    models stats")
        print()
        print(f"    security scan     <host>")
        print(f"    security scores")
        print(f"    security devices")
        print()
        print(f"    hash               <data>")
        print(f"    stats")
        print(f"    version")
        print()
        print(f"  {DIM}identity > provider — SHA-2048 agent identity on RoadChain{RESET}")
        return

    # Try 2-word commands first, then 1-word
    if len(args) >= 2:
        key = (args[0], args[1])
        if key in COMMANDS:
            COMMANDS[key](args[2:])
            return

    key = (args[0],)
    if key in COMMANDS:
        COMMANDS[key](args[1:])
        return

    print(f"{PINK}Unknown command:{RESET} {' '.join(args)}")
    print(f"Run with --help for usage.")
    sys.exit(1)


if __name__ == "__main__":
    main()
