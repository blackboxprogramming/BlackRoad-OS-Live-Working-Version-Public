"""Validate Railway env template and deployment config."""
from __future__ import annotations

import argparse
import ast
import json
from pathlib import Path
from typing import Dict, List, Set, Tuple

import tomllib

REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = REPO_ROOT / "backend"
CONFIG_PATH = BACKEND_DIR / "app" / "config.py"
ENV_TEMPLATE_PATH = BACKEND_DIR / ".env.example"
RAILWAY_TOML_PATH = REPO_ROOT / "railway.toml"
RAILWAY_JSON_PATH = REPO_ROOT / "railway.json"

# Keys that live outside app.config.Settings but should exist for automation
EXTRA_REQUIRED_KEYS: Set[str] = {
    "RAILWAY_TOKEN",
    "RAILWAY_PROJECT_ID",
    "RAILWAY_ENVIRONMENT_ID",
    "RAILWAY_DOMAIN",
    "SLACK_WEBHOOK_URL",
    "DISCORD_WEBHOOK_URL",
    "DIGITAL_OCEAN_API_KEY",
    "CLOUDFLARE_API_TOKEN",
    "GITHUB_TOKEN",
    "HUGGINGFACE_TOKEN",
    "VERCEL_TOKEN",
    "VERCEL_TEAM_ID",
    "STRIPE_SECRET_KEY",
    "STRIPE_PUBLISHABLE_KEY",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER",
    "SLACK_BOT_TOKEN",
    "DISCORD_BOT_TOKEN",
    "SENTRY_DSN",
    "SENTRY_AUTH_TOKEN",
    "SENTRY_ORG",
    "ROADCHAIN_RPC_URL",
    "ROADCOIN_POOL_URL",
    "ROADCOIN_WALLET_ADDRESS",
    "MQTT_BROKER_URL",
    "MQTT_USERNAME",
    "MQTT_PASSWORD",
    "DEVICE_HEARTBEAT_TIMEOUT_SECONDS",
    "ANTHROPIC_API_KEY",
    "POSTGRES_URL",
    "JWT_SECRET",
    "SESSION_SECRET",
    "NEXTAUTH_SECRET",
    "NODE_ENV",
    "PYTHON_ENV",
    # Cloudflare details used by infrastructure automation and DNS routes
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_ZONE_ID",
    "CLOUDFLARE_EMAIL",
}

SENSITIVE_KEYS: Set[str] = {
    "DATABASE_URL",
    "DATABASE_ASYNC_URL",
    "REDIS_URL",
    "SECRET_KEY",
    "WALLET_MASTER_KEY",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "SMTP_PASSWORD",
    "OPENAI_API_KEY",
    "RAILWAY_TOKEN",
    "RAILWAY_PROJECT_ID",
    "RAILWAY_ENVIRONMENT_ID",
    "RAILWAY_DOMAIN",
    "SLACK_WEBHOOK_URL",
    "DISCORD_WEBHOOK_URL",
    "DIGITAL_OCEAN_API_KEY",
    "CLOUDFLARE_API_TOKEN",
    "GITHUB_TOKEN",
    "HUGGINGFACE_TOKEN",
    "VERCEL_TOKEN",
    "STRIPE_SECRET_KEY",
    "STRIPE_PUBLISHABLE_KEY",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_PHONE_NUMBER",
    "SLACK_BOT_TOKEN",
    "DISCORD_BOT_TOKEN",
    "SENTRY_DSN",
    "SENTRY_AUTH_TOKEN",
    "ROADCHAIN_RPC_URL",
    "ROADCOIN_POOL_URL",
    "ROADCOIN_WALLET_ADDRESS",
    "MQTT_BROKER_URL",
    "MQTT_PASSWORD",
    "ANTHROPIC_API_KEY",
    "POSTGRES_URL",
    "JWT_SECRET",
    "SESSION_SECRET",
    "NEXTAUTH_SECRET",
}

PLACEHOLDER_MARKERS: Tuple[str, ...] = (
    "changeme",
    "your_",
    "your-",
    "placeholder",
    "example",
    "dummy",
    "xxxx",
    "xxx",
    "yyy",
    "zzz",
    "0000",
)


def parse_env_template(path: Path) -> Dict[str, str]:
    env: Dict[str, str] = {}
    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key.strip()] = value.strip()
    return env


def extract_settings_fields(config_path: Path) -> List[str]:
    tree = ast.parse(config_path.read_text())
    fields: Set[str] = set()

    class SettingsVisitor(ast.NodeVisitor):
        def visit_ClassDef(self, node: ast.ClassDef) -> None:
            if node.name != "Settings":
                return
            for stmt in node.body:
                if isinstance(stmt, ast.ClassDef):
                    continue
                if isinstance(stmt, ast.Assign):
                    for target in stmt.targets:
                        if isinstance(target, ast.Name):
                            fields.add(target.id)
                elif isinstance(stmt, ast.AnnAssign) and isinstance(stmt.target, ast.Name):
                    fields.add(stmt.target.id)

    SettingsVisitor().visit(tree)
    return sorted(fields)


def is_placeholder(value: str) -> bool:
    lower_value = value.lower()
    return any(marker in lower_value for marker in PLACEHOLDER_MARKERS)


def validate_env_template() -> None:
    if not ENV_TEMPLATE_PATH.exists():
        raise SystemExit(".env.example template is missing")

    env_values = parse_env_template(ENV_TEMPLATE_PATH)
    settings_fields = extract_settings_fields(CONFIG_PATH)
    required_keys = set(settings_fields) | EXTRA_REQUIRED_KEYS

    missing = sorted(key for key in required_keys if key not in env_values)
    if missing:
        raise SystemExit(
            "Missing keys in .env.example: " + ", ".join(missing)
        )

    unexpected = sorted(
        key for key in env_values.keys() if key not in required_keys
    )
    if unexpected:
        print("⚠️  Found extra keys in .env.example:", ", ".join(unexpected))

    insecure = sorted(
        key
        for key in SENSITIVE_KEYS
        if key in env_values and not is_placeholder(env_values[key])
    )
    if insecure:
        raise SystemExit(
            "Sensitive keys must use placeholders: " + ", ".join(insecure)
        )

    print("✅ .env.example matches app.config.Settings")


def validate_railway_configs() -> None:
    toml_data = tomllib.loads(RAILWAY_TOML_PATH.read_text())
    json_data = json.loads(RAILWAY_JSON_PATH.read_text()) if RAILWAY_JSON_PATH.exists() else {}

    build = toml_data.get("build", {})
    if build.get("builder") != "DOCKERFILE":
        raise SystemExit("railway.toml must use the Dockerfile builder")
    if build.get("dockerfilePath") != "backend/Dockerfile":
        raise SystemExit("railway.toml dockerfilePath must be backend/Dockerfile")

    deploy = toml_data.get("deploy", {})
    start_command = deploy.get("startCommand", "")
    if "$PORT" not in start_command:
        raise SystemExit("Railway start command must forward the $PORT value")

    services = toml_data.get("services", [])
    env_names = {
        env_entry.get("name")
        for service in services
        if isinstance(service, dict)
        for env_entry in service.get("env", [])
        if isinstance(env_entry, dict)
    }

    for required in ("ENVIRONMENT", "DEBUG"):
        if required not in env_names:
            raise SystemExit(f"Railway services must set {required}")

    json_build = json_data.get("build", {})
    if json_build.get("builder") and json_build.get("builder") != "DOCKERFILE":
        raise SystemExit("railway.json builder must remain DOCKERFILE")
    json_path = json_build.get("dockerfilePath")
    if json_path and json_path != "backend/Dockerfile":
        raise SystemExit("railway.json dockerfilePath must match backend/Dockerfile")

    print("✅ Railway deployment descriptors look consistent")


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate Railway secret automation")
    parser.add_argument("--skip-env", action="store_true", help="Skip env template validation")
    parser.add_argument("--skip-config", action="store_true", help="Skip Railway config validation")
    args = parser.parse_args()

    if not args.skip_env:
        validate_env_template()

    if not args.skip_config:
        validate_railway_configs()

    print("\nAll Railway automation checks passed ✅")


if __name__ == "__main__":
    main()
