# SECRETS.md - Vault & Encryption Guide

> **BlackRoad OS** - Your AI. Your Hardware. Your Rules.
>
> Zero-trust secrets management for distributed AI agents.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Secret Types](#secret-types)
4. [Vault Operations](#vault-operations)
5. [Encryption](#encryption)
6. [Access Control](#access-control)
7. [Rotation](#rotation)
8. [Agent Secrets](#agent-secrets)
9. [Integration](#integration)
10. [Audit & Compliance](#audit--compliance)
11. [Disaster Recovery](#disaster-recovery)

---

## Overview

### Why Secrets Management?

BlackRoad OS handles thousands of agents accessing sensitive data:

| Challenge | Solution |
|-----------|----------|
| **API Keys** | Encrypted vault with automatic rotation |
| **Credentials** | Zero-knowledge storage |
| **Certificates** | Automated PKI management |
| **Agent Identity** | Cryptographic attestation |
| **Compliance** | Full audit trail |

### Security Principles

```
┌─────────────────────────────────────────────────────────────┐
│                   Zero Trust Architecture                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   1. Never Trust, Always Verify                              │
│   2. Least Privilege Access                                  │
│   3. Assume Breach                                           │
│   4. Verify Explicitly                                       │
│   5. Defense in Depth                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Architecture

### Vault Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    BlackRoad Secrets Vault                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      API Gateway                             │ │
│  │              (mTLS + JWT Authentication)                     │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
│                             │                                     │
│  ┌──────────────────────────▼──────────────────────────────────┐ │
│  │                   Policy Engine                              │ │
│  │           (RBAC + ABAC + Path-based ACLs)                   │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
│                             │                                     │
│  ┌──────────────────────────▼──────────────────────────────────┐ │
│  │                  Secret Engines                              │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │ │
│  │  │   KV    │ │  PKI    │ │ Transit │ │Database │           │ │
│  │  │ Store   │ │ Certs   │ │ Encrypt │ │ Creds   │           │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
│                             │                                     │
│  ┌──────────────────────────▼──────────────────────────────────┐ │
│  │                  Storage Backend                             │ │
│  │     (AES-256-GCM encrypted, Shamir's Secret Sharing)        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Key Hierarchy

```
Master Key (Shamir's Secret Sharing - 5 shares, 3 threshold)
    │
    ├── Encryption Key (AES-256-GCM)
    │       │
    │       ├── Secret Storage
    │       └── Transit Encryption
    │
    ├── Signing Key (Ed25519)
    │       │
    │       ├── Agent Attestation
    │       └── Audit Signatures
    │
    └── PKI Root CA
            │
            ├── Intermediate CA
            │       │
            │       ├── Agent Certificates
            │       └── Service Certificates
            │
            └── OCSP Responder
```

---

## Secret Types

### API Keys & Tokens

```yaml
# secrets/api-keys.yaml
secrets:
  openai:
    path: api/openai
    type: kv
    data:
      api_key: "sk-..."
      org_id: "org-..."
    metadata:
      rotation_days: 90
      last_rotated: "2024-01-15"

  anthropic:
    path: api/anthropic
    type: kv
    data:
      api_key: "sk-ant-..."
    metadata:
      rotation_days: 90

  github:
    path: api/github
    type: kv
    data:
      token: "ghp_..."
      app_id: "12345"
      private_key: |
        -----BEGIN RSA PRIVATE KEY-----
        ...
        -----END RSA PRIVATE KEY-----
```

### Database Credentials

```yaml
# secrets/databases.yaml
secrets:
  postgres_primary:
    path: database/postgres/primary
    type: dynamic
    engine: postgresql
    config:
      host: db.blackroad.io
      port: 5432
      database: blackroad
      username_template: "agent_{{random 8}}"
      default_ttl: 1h
      max_ttl: 24h
    roles:
      readonly:
        sql: |
          CREATE ROLE "{{name}}" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}';
          GRANT SELECT ON ALL TABLES IN SCHEMA public TO "{{name}}";
      readwrite:
        sql: |
          CREATE ROLE "{{name}}" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}';
          GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "{{name}}";
```

### Certificates

```yaml
# secrets/certificates.yaml
secrets:
  agent_pki:
    path: pki/agents
    type: pki
    config:
      ttl: 8760h  # 1 year
      max_ttl: 43800h  # 5 years
      key_type: ec
      key_bits: 256
    roles:
      agent:
        allowed_domains:
          - "*.agent.blackroad.io"
        allow_subdomains: true
        max_ttl: 720h  # 30 days
        key_usage:
          - DigitalSignature
          - KeyEncipherment
        ext_key_usage:
          - ClientAuth
          - ServerAuth
```

### Encryption Keys

```yaml
# secrets/encryption.yaml
secrets:
  memory_encryption:
    path: transit/memory
    type: transit
    config:
      type: aes256-gcm96
      derived: true
      convergent_encryption: false
      exportable: false
      allow_plaintext_backup: false
      min_decryption_version: 1
      min_encryption_version: 1
      deletion_allowed: false
```

---

## Vault Operations

### CLI Commands

```bash
# Initialize vault (first time setup)
./vault.sh init --key-shares=5 --key-threshold=3

# Unseal vault
./vault.sh unseal <key-1>
./vault.sh unseal <key-2>
./vault.sh unseal <key-3>

# Check status
./vault.sh status

# Store a secret
./vault.sh kv put secrets/api/openai api_key="sk-..."

# Read a secret
./vault.sh kv get secrets/api/openai

# List secrets
./vault.sh kv list secrets/api/

# Delete a secret
./vault.sh kv delete secrets/api/openai

# Enable audit logging
./vault.sh audit enable file file_path=/var/log/vault/audit.log
```

### Python SDK

```python
# blackroad/secrets/vault.py
import hvac
from typing import Any, Dict, Optional
from functools import lru_cache
import os

class SecretsVault:
    """BlackRoad secrets vault client."""

    def __init__(
        self,
        url: str = None,
        token: str = None,
        namespace: str = "blackroad"
    ):
        self.url = url or os.getenv("VAULT_ADDR", "http://localhost:8200")
        self.token = token or os.getenv("VAULT_TOKEN")
        self.namespace = namespace
        self.client = hvac.Client(url=self.url, token=self.token)

    def get_secret(self, path: str, key: str = None) -> Any:
        """Retrieve a secret from the vault."""
        try:
            response = self.client.secrets.kv.v2.read_secret_version(
                path=path,
                mount_point=f"{self.namespace}/secrets"
            )
            data = response["data"]["data"]
            return data.get(key) if key else data
        except Exception as e:
            raise SecretNotFoundError(f"Secret not found: {path}") from e

    def set_secret(self, path: str, data: Dict[str, Any]) -> None:
        """Store a secret in the vault."""
        self.client.secrets.kv.v2.create_or_update_secret(
            path=path,
            secret=data,
            mount_point=f"{self.namespace}/secrets"
        )

    def delete_secret(self, path: str) -> None:
        """Delete a secret from the vault."""
        self.client.secrets.kv.v2.delete_metadata_and_all_versions(
            path=path,
            mount_point=f"{self.namespace}/secrets"
        )

    def get_dynamic_credentials(
        self,
        engine: str,
        role: str
    ) -> Dict[str, Any]:
        """Get dynamic credentials (e.g., database)."""
        response = self.client.read(f"{engine}/creds/{role}")
        return {
            "username": response["data"]["username"],
            "password": response["data"]["password"],
            "lease_id": response["lease_id"],
            "lease_duration": response["lease_duration"]
        }

    def encrypt(self, key_name: str, plaintext: bytes) -> str:
        """Encrypt data using transit engine."""
        import base64
        encoded = base64.b64encode(plaintext).decode()
        response = self.client.secrets.transit.encrypt_data(
            name=key_name,
            plaintext=encoded,
            mount_point=f"{self.namespace}/transit"
        )
        return response["data"]["ciphertext"]

    def decrypt(self, key_name: str, ciphertext: str) -> bytes:
        """Decrypt data using transit engine."""
        import base64
        response = self.client.secrets.transit.decrypt_data(
            name=key_name,
            ciphertext=ciphertext,
            mount_point=f"{self.namespace}/transit"
        )
        return base64.b64decode(response["data"]["plaintext"])

    def issue_certificate(
        self,
        common_name: str,
        ttl: str = "720h"
    ) -> Dict[str, str]:
        """Issue a new certificate."""
        response = self.client.secrets.pki.generate_certificate(
            name="agent",
            common_name=common_name,
            mount_point=f"{self.namespace}/pki",
            extra_params={"ttl": ttl}
        )
        return {
            "certificate": response["data"]["certificate"],
            "private_key": response["data"]["private_key"],
            "ca_chain": response["data"]["ca_chain"],
            "serial_number": response["data"]["serial_number"],
            "expiration": response["data"]["expiration"]
        }


# Singleton instance
@lru_cache()
def get_vault() -> SecretsVault:
    return SecretsVault()


# Usage
vault = get_vault()
api_key = vault.get_secret("api/openai", "api_key")
```

### Secret Injection

```python
# blackroad/secrets/injection.py
from functools import wraps
import os

def inject_secret(path: str, key: str = None, env_var: str = None):
    """Decorator to inject secrets into functions."""

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            vault = get_vault()
            secret = vault.get_secret(path, key)

            if env_var:
                os.environ[env_var] = str(secret)

            kwargs["_secret"] = secret
            return func(*args, **kwargs)
        return wrapper
    return decorator


# Usage
@inject_secret("api/openai", "api_key", env_var="OPENAI_API_KEY")
def call_openai(prompt: str, _secret: str = None):
    # _secret contains the API key
    # OPENAI_API_KEY is also set in environment
    pass
```

---

## Encryption

### At-Rest Encryption

```python
# blackroad/secrets/encryption.py
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
import base64
import os

class LocalEncryption:
    """Local encryption for secrets at rest."""

    def __init__(self, master_key: bytes = None):
        self.master_key = master_key or os.urandom(32)

    def derive_key(self, salt: bytes, context: str) -> bytes:
        """Derive an encryption key from master key."""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt + context.encode(),
            iterations=100000,
            backend=default_backend()
        )
        return base64.urlsafe_b64encode(kdf.derive(self.master_key))

    def encrypt(self, plaintext: bytes, context: str = "") -> bytes:
        """Encrypt data with context binding."""
        salt = os.urandom(16)
        key = self.derive_key(salt, context)
        fernet = Fernet(key)
        ciphertext = fernet.encrypt(plaintext)
        return salt + ciphertext

    def decrypt(self, data: bytes, context: str = "") -> bytes:
        """Decrypt data with context verification."""
        salt = data[:16]
        ciphertext = data[16:]
        key = self.derive_key(salt, context)
        fernet = Fernet(key)
        return fernet.decrypt(ciphertext)


class AES256GCM:
    """AES-256-GCM encryption for high-security secrets."""

    def __init__(self):
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        self.aesgcm_class = AESGCM

    def encrypt(
        self,
        key: bytes,
        plaintext: bytes,
        associated_data: bytes = None
    ) -> bytes:
        """Encrypt with AES-256-GCM."""
        nonce = os.urandom(12)
        aesgcm = self.aesgcm_class(key)
        ciphertext = aesgcm.encrypt(nonce, plaintext, associated_data)
        return nonce + ciphertext

    def decrypt(
        self,
        key: bytes,
        data: bytes,
        associated_data: bytes = None
    ) -> bytes:
        """Decrypt with AES-256-GCM."""
        nonce = data[:12]
        ciphertext = data[12:]
        aesgcm = self.aesgcm_class(key)
        return aesgcm.decrypt(nonce, ciphertext, associated_data)
```

### In-Transit Encryption

```python
# blackroad/secrets/transit.py
from cryptography.hazmat.primitives.asymmetric import x25519
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes

class X25519KeyExchange:
    """X25519 key exchange for agent-to-agent encryption."""

    def __init__(self):
        self.private_key = x25519.X25519PrivateKey.generate()
        self.public_key = self.private_key.public_key()

    def get_public_bytes(self) -> bytes:
        """Get public key bytes for sharing."""
        return self.public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        )

    def derive_shared_key(self, peer_public_bytes: bytes) -> bytes:
        """Derive shared secret from peer's public key."""
        peer_public = x25519.X25519PublicKey.from_public_bytes(peer_public_bytes)
        shared_key = self.private_key.exchange(peer_public)

        # Derive actual encryption key using HKDF
        derived_key = HKDF(
            algorithm=hashes.SHA256(),
            length=32,
            salt=None,
            info=b"blackroad-agent-encryption"
        ).derive(shared_key)

        return derived_key


class SecureChannel:
    """Secure communication channel between agents."""

    def __init__(self, local_agent_id: str, remote_agent_id: str):
        self.local_id = local_agent_id
        self.remote_id = remote_agent_id
        self.key_exchange = X25519KeyExchange()
        self.shared_key = None
        self.aes = AES256GCM()

    def initiate_handshake(self) -> bytes:
        """Start key exchange handshake."""
        return self.key_exchange.get_public_bytes()

    def complete_handshake(self, peer_public: bytes):
        """Complete key exchange with peer's public key."""
        self.shared_key = self.key_exchange.derive_shared_key(peer_public)

    def encrypt_message(self, message: bytes) -> bytes:
        """Encrypt message for secure transmission."""
        if not self.shared_key:
            raise ValueError("Handshake not completed")

        # Include sender/receiver in associated data
        aad = f"{self.local_id}:{self.remote_id}".encode()
        return self.aes.encrypt(self.shared_key, message, aad)

    def decrypt_message(self, ciphertext: bytes) -> bytes:
        """Decrypt received message."""
        if not self.shared_key:
            raise ValueError("Handshake not completed")

        aad = f"{self.remote_id}:{self.local_id}".encode()
        return self.aes.decrypt(self.shared_key, ciphertext, aad)
```

---

## Access Control

### Policy Definition

```hcl
# policies/agent-policy.hcl

# Allow agents to read their own secrets
path "blackroad/secrets/data/agents/{{identity.entity.name}}/*" {
  capabilities = ["read", "list"]
}

# Allow reading shared API keys
path "blackroad/secrets/data/api/*" {
  capabilities = ["read"]
}

# Allow transit encryption
path "blackroad/transit/encrypt/memory" {
  capabilities = ["update"]
}

path "blackroad/transit/decrypt/memory" {
  capabilities = ["update"]
}

# Allow certificate issuance
path "blackroad/pki/issue/agent" {
  capabilities = ["create", "update"]
}

# Deny access to admin secrets
path "blackroad/secrets/data/admin/*" {
  capabilities = ["deny"]
}
```

### RBAC Configuration

```yaml
# config/rbac.yaml
roles:
  agent_basic:
    description: "Basic agent access"
    policies:
      - agent-policy
    allowed_paths:
      - "secrets/data/agents/{{agent_id}}/*"
      - "secrets/data/api/readonly/*"
      - "transit/encrypt/*"
      - "transit/decrypt/*"

  agent_privileged:
    description: "Privileged agent access"
    inherits: agent_basic
    policies:
      - agent-policy
      - privileged-policy
    allowed_paths:
      - "secrets/data/agents/*"
      - "secrets/data/api/*"
      - "pki/issue/*"

  admin:
    description: "Full administrative access"
    policies:
      - admin-policy
    allowed_paths:
      - "*"

# Agent role assignments
assignments:
  LUCIDIA: agent_privileged
  ALICE: agent_basic
  OCTAVIA: agent_privileged
  PRISM: agent_basic
  ECHO: agent_basic
  CIPHER: admin  # Security agent needs full access
```

### Token-Based Auth

```python
# blackroad/secrets/auth.py
import jwt
from datetime import datetime, timedelta
from typing import Optional

class AgentAuthenticator:
    """Agent authentication for vault access."""

    def __init__(self, signing_key: str, vault: SecretsVault):
        self.signing_key = signing_key
        self.vault = vault

    def issue_token(
        self,
        agent_id: str,
        role: str,
        ttl_hours: int = 24
    ) -> str:
        """Issue a JWT token for agent authentication."""
        payload = {
            "sub": agent_id,
            "role": role,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=ttl_hours),
            "iss": "blackroad-vault",
            "aud": "blackroad-agents"
        }
        return jwt.encode(payload, self.signing_key, algorithm="HS256")

    def verify_token(self, token: str) -> Optional[dict]:
        """Verify and decode agent token."""
        try:
            payload = jwt.decode(
                token,
                self.signing_key,
                algorithms=["HS256"],
                audience="blackroad-agents"
            )
            return payload
        except jwt.InvalidTokenError:
            return None

    def get_vault_token(self, agent_token: str) -> str:
        """Exchange agent token for vault token."""
        payload = self.verify_token(agent_token)
        if not payload:
            raise AuthenticationError("Invalid agent token")

        # Get vault token with appropriate policies
        role = payload["role"]
        return self.vault.client.auth.token.create(
            policies=[f"{role}-policy"],
            ttl="1h",
            metadata={"agent_id": payload["sub"]}
        )["auth"]["client_token"]
```

---

## Rotation

### Automatic Rotation

```python
# blackroad/secrets/rotation.py
import asyncio
from datetime import datetime, timedelta
from typing import Callable, Dict
import logging

logger = logging.getLogger(__name__)

class SecretRotator:
    """Automatic secret rotation manager."""

    def __init__(self, vault: SecretsVault):
        self.vault = vault
        self.rotation_handlers: Dict[str, Callable] = {}
        self.rotation_schedules: Dict[str, timedelta] = {}

    def register_rotation(
        self,
        secret_path: str,
        handler: Callable,
        interval: timedelta
    ):
        """Register a secret for automatic rotation."""
        self.rotation_handlers[secret_path] = handler
        self.rotation_schedules[secret_path] = interval

    async def rotate_secret(self, path: str):
        """Rotate a specific secret."""
        handler = self.rotation_handlers.get(path)
        if not handler:
            raise ValueError(f"No handler for {path}")

        # Generate new secret
        new_secret = await handler()

        # Store new version (old version preserved)
        self.vault.set_secret(path, {"value": new_secret})

        logger.info(f"Rotated secret: {path}")
        return new_secret

    async def run_rotation_loop(self):
        """Run continuous rotation loop."""
        while True:
            for path, interval in self.rotation_schedules.items():
                metadata = self.vault.get_secret_metadata(path)
                last_rotated = datetime.fromisoformat(
                    metadata.get("last_rotated", "2000-01-01")
                )

                if datetime.utcnow() - last_rotated > interval:
                    try:
                        await self.rotate_secret(path)
                    except Exception as e:
                        logger.error(f"Rotation failed for {path}: {e}")

            await asyncio.sleep(3600)  # Check every hour


# Rotation handlers
async def rotate_openai_key():
    """Generate new OpenAI API key."""
    # In practice, this would call OpenAI's API to rotate
    # For now, return existing key with rotation timestamp
    return {"rotated_at": datetime.utcnow().isoformat()}

async def rotate_database_password():
    """Rotate database password."""
    import secrets
    new_password = secrets.token_urlsafe(32)
    # Update database with new password
    return new_password


# Setup
rotator = SecretRotator(vault)
rotator.register_rotation(
    "api/openai",
    rotate_openai_key,
    timedelta(days=90)
)
rotator.register_rotation(
    "database/postgres/password",
    rotate_database_password,
    timedelta(days=30)
)
```

### Zero-Downtime Rotation

```python
# blackroad/secrets/zero_downtime.py
from enum import Enum
from dataclasses import dataclass
from typing import List
import asyncio

class RotationPhase(Enum):
    PREPARE = "prepare"
    DUAL_ACTIVE = "dual_active"
    MIGRATE = "migrate"
    CLEANUP = "cleanup"
    COMPLETE = "complete"

@dataclass
class RotationState:
    secret_path: str
    phase: RotationPhase
    old_version: int
    new_version: int
    affected_agents: List[str]
    started_at: str

class ZeroDowntimeRotator:
    """Zero-downtime secret rotation with gradual rollout."""

    def __init__(self, vault: SecretsVault, agent_manager):
        self.vault = vault
        self.agent_manager = agent_manager

    async def rotate(self, secret_path: str) -> RotationState:
        """Perform zero-downtime rotation."""

        # Phase 1: Prepare new secret
        state = RotationState(
            secret_path=secret_path,
            phase=RotationPhase.PREPARE,
            old_version=self.vault.get_version(secret_path),
            new_version=self.vault.get_version(secret_path) + 1,
            affected_agents=self.agent_manager.get_agents_using(secret_path),
            started_at=datetime.utcnow().isoformat()
        )

        # Generate and store new secret version
        new_secret = await self.generate_new_secret(secret_path)
        self.vault.set_secret(secret_path, new_secret)

        # Phase 2: Enable dual-read (both versions valid)
        state.phase = RotationPhase.DUAL_ACTIVE
        await self.enable_dual_read(secret_path, state.old_version, state.new_version)

        # Phase 3: Migrate agents to new version
        state.phase = RotationPhase.MIGRATE
        for agent_id in state.affected_agents:
            await self.migrate_agent(agent_id, secret_path, state.new_version)
            await asyncio.sleep(1)  # Gradual rollout

        # Phase 4: Disable old version
        state.phase = RotationPhase.CLEANUP
        await self.disable_version(secret_path, state.old_version)

        state.phase = RotationPhase.COMPLETE
        return state
```

---

## Agent Secrets

### Per-Agent Secrets

```python
# blackroad/secrets/agent_secrets.py
from dataclasses import dataclass
from typing import Dict, Any

@dataclass
class AgentSecrets:
    """Secrets specific to an agent."""
    agent_id: str
    identity_key: bytes
    signing_key: bytes
    encryption_key: bytes
    api_tokens: Dict[str, str]
    certificates: Dict[str, str]

class AgentSecretsManager:
    """Manage per-agent secrets."""

    def __init__(self, vault: SecretsVault):
        self.vault = vault

    async def provision_agent(self, agent_id: str, agent_type: str) -> AgentSecrets:
        """Provision secrets for a new agent."""
        import os

        # Generate identity keys
        identity_key = os.urandom(32)
        signing_key = os.urandom(32)
        encryption_key = os.urandom(32)

        # Issue certificate
        cert = self.vault.issue_certificate(
            common_name=f"{agent_id}.agent.blackroad.io",
            ttl="720h"
        )

        # Store in vault
        secrets_data = {
            "identity_key": identity_key.hex(),
            "signing_key": signing_key.hex(),
            "encryption_key": encryption_key.hex(),
            "certificate": cert["certificate"],
            "private_key": cert["private_key"]
        }

        self.vault.set_secret(f"agents/{agent_id}/identity", secrets_data)

        # Get API tokens based on agent type
        api_tokens = await self.get_api_tokens_for_type(agent_type)
        self.vault.set_secret(f"agents/{agent_id}/api_tokens", api_tokens)

        return AgentSecrets(
            agent_id=agent_id,
            identity_key=identity_key,
            signing_key=signing_key,
            encryption_key=encryption_key,
            api_tokens=api_tokens,
            certificates=cert
        )

    async def get_agent_secrets(self, agent_id: str) -> AgentSecrets:
        """Retrieve secrets for an agent."""
        identity = self.vault.get_secret(f"agents/{agent_id}/identity")
        tokens = self.vault.get_secret(f"agents/{agent_id}/api_tokens")

        return AgentSecrets(
            agent_id=agent_id,
            identity_key=bytes.fromhex(identity["identity_key"]),
            signing_key=bytes.fromhex(identity["signing_key"]),
            encryption_key=bytes.fromhex(identity["encryption_key"]),
            api_tokens=tokens,
            certificates={
                "certificate": identity["certificate"],
                "private_key": identity["private_key"]
            }
        )

    async def revoke_agent(self, agent_id: str):
        """Revoke all secrets for an agent."""
        # Revoke certificate
        cert = self.vault.get_secret(f"agents/{agent_id}/identity")
        self.vault.revoke_certificate(cert["serial_number"])

        # Delete all agent secrets
        self.vault.delete_secret(f"agents/{agent_id}/identity")
        self.vault.delete_secret(f"agents/{agent_id}/api_tokens")

        # Log revocation
        logger.warning(f"Revoked all secrets for agent: {agent_id}")
```

### Secret Attestation

```python
# blackroad/secrets/attestation.py
import hashlib
import hmac
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Attestation:
    """Cryptographic attestation of agent identity."""
    agent_id: str
    timestamp: str
    nonce: str
    signature: str
    public_key: str

class AttestationService:
    """Agent identity attestation."""

    def __init__(self, vault: SecretsVault):
        self.vault = vault

    def create_attestation(
        self,
        agent_id: str,
        signing_key: bytes,
        nonce: str
    ) -> Attestation:
        """Create signed attestation."""
        timestamp = datetime.utcnow().isoformat()

        # Create attestation message
        message = f"{agent_id}:{timestamp}:{nonce}"

        # Sign with agent's key
        signature = hmac.new(
            signing_key,
            message.encode(),
            hashlib.sha256
        ).hexdigest()

        return Attestation(
            agent_id=agent_id,
            timestamp=timestamp,
            nonce=nonce,
            signature=signature,
            public_key=self.get_public_key(signing_key)
        )

    def verify_attestation(
        self,
        attestation: Attestation,
        expected_nonce: str
    ) -> bool:
        """Verify agent attestation."""
        # Check nonce matches
        if attestation.nonce != expected_nonce:
            return False

        # Check timestamp freshness (within 5 minutes)
        timestamp = datetime.fromisoformat(attestation.timestamp)
        if (datetime.utcnow() - timestamp).seconds > 300:
            return False

        # Get agent's signing key from vault
        secrets = self.vault.get_secret(f"agents/{attestation.agent_id}/identity")
        signing_key = bytes.fromhex(secrets["signing_key"])

        # Verify signature
        message = f"{attestation.agent_id}:{attestation.timestamp}:{attestation.nonce}"
        expected_sig = hmac.new(
            signing_key,
            message.encode(),
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(attestation.signature, expected_sig)
```

---

## Integration

### Environment Injection

```bash
#!/bin/bash
# scripts/inject-secrets.sh

# Inject secrets as environment variables
inject_secrets() {
    local agent_id="$1"

    # Get secrets from vault
    export OPENAI_API_KEY=$(./vault.sh kv get -field=api_key secrets/api/openai)
    export ANTHROPIC_API_KEY=$(./vault.sh kv get -field=api_key secrets/api/anthropic)
    export GITHUB_TOKEN=$(./vault.sh kv get -field=token secrets/api/github)

    # Get agent-specific secrets
    export AGENT_IDENTITY_KEY=$(./vault.sh kv get -field=identity_key secrets/agents/$agent_id/identity)
    export AGENT_SIGNING_KEY=$(./vault.sh kv get -field=signing_key secrets/agents/$agent_id/identity)

    echo "Secrets injected for agent: $agent_id"
}

# Usage
inject_secrets "LUCIDIA"
```

### Kubernetes Integration

```yaml
# k8s/secrets-injection.yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: blackroad-secrets
spec:
  provider: vault
  parameters:
    vaultAddress: "https://vault.blackroad.io"
    roleName: "agent-role"
    objects: |
      - objectName: "openai-api-key"
        secretPath: "blackroad/secrets/data/api/openai"
        secretKey: "api_key"
      - objectName: "anthropic-api-key"
        secretPath: "blackroad/secrets/data/api/anthropic"
        secretKey: "api_key"

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blackroad-agent
spec:
  template:
    spec:
      serviceAccountName: blackroad-agent
      containers:
        - name: agent
          volumeMounts:
            - name: secrets
              mountPath: "/secrets"
              readOnly: true
          env:
            - name: OPENAI_API_KEY
              valueFrom:
                secretKeyRef:
                  name: blackroad-secrets
                  key: openai-api-key
      volumes:
        - name: secrets
          csi:
            driver: secrets-store.csi.k8s.io
            readOnly: true
            volumeAttributes:
              secretProviderClass: "blackroad-secrets"
```

---

## Audit & Compliance

### Audit Logging

```python
# blackroad/secrets/audit.py
from dataclasses import dataclass
from datetime import datetime
from typing import Optional
import json

@dataclass
class AuditEvent:
    """Vault audit event."""
    timestamp: str
    event_type: str  # read, write, delete, auth
    path: str
    agent_id: str
    success: bool
    client_ip: str
    request_id: str
    metadata: dict

class AuditLogger:
    """Secrets audit logging."""

    def __init__(self, log_path: str = "/var/log/vault/audit.json"):
        self.log_path = log_path

    def log_event(self, event: AuditEvent):
        """Log audit event."""
        entry = {
            "timestamp": event.timestamp,
            "type": event.event_type,
            "path": event.path,
            "agent_id": event.agent_id,
            "success": event.success,
            "client_ip": event.client_ip,
            "request_id": event.request_id,
            "metadata": event.metadata
        }

        with open(self.log_path, "a") as f:
            f.write(json.dumps(entry) + "\n")

    def get_events(
        self,
        agent_id: Optional[str] = None,
        path_prefix: Optional[str] = None,
        since: Optional[datetime] = None
    ) -> list:
        """Query audit events."""
        events = []
        with open(self.log_path, "r") as f:
            for line in f:
                event = json.loads(line)

                if agent_id and event["agent_id"] != agent_id:
                    continue
                if path_prefix and not event["path"].startswith(path_prefix):
                    continue
                if since and datetime.fromisoformat(event["timestamp"]) < since:
                    continue

                events.append(event)

        return events
```

### Compliance Reports

```python
# blackroad/secrets/compliance.py
from dataclasses import dataclass
from typing import List
from datetime import datetime, timedelta

@dataclass
class ComplianceReport:
    """Secrets compliance report."""
    report_date: str
    total_secrets: int
    secrets_needing_rotation: int
    expired_certificates: int
    unused_secrets: int
    policy_violations: List[dict]
    recommendations: List[str]

class ComplianceChecker:
    """Check secrets compliance."""

    def __init__(self, vault: SecretsVault):
        self.vault = vault

    def generate_report(self) -> ComplianceReport:
        """Generate compliance report."""
        secrets = self.vault.list_all_secrets()
        violations = []
        recommendations = []

        secrets_needing_rotation = 0
        expired_certs = 0
        unused_secrets = 0

        for secret in secrets:
            metadata = self.vault.get_secret_metadata(secret)

            # Check rotation
            last_rotated = datetime.fromisoformat(
                metadata.get("last_rotated", "2000-01-01")
            )
            rotation_days = metadata.get("rotation_days", 90)

            if (datetime.utcnow() - last_rotated).days > rotation_days:
                secrets_needing_rotation += 1
                violations.append({
                    "path": secret,
                    "violation": "rotation_overdue",
                    "days_overdue": (datetime.utcnow() - last_rotated).days - rotation_days
                })

            # Check last access
            last_accessed = datetime.fromisoformat(
                metadata.get("last_accessed", datetime.utcnow().isoformat())
            )
            if (datetime.utcnow() - last_accessed).days > 90:
                unused_secrets += 1
                recommendations.append(f"Consider removing unused secret: {secret}")

        # Check certificates
        certs = self.vault.list_certificates()
        for cert in certs:
            if cert["expiration"] < datetime.utcnow():
                expired_certs += 1
                violations.append({
                    "path": cert["path"],
                    "violation": "certificate_expired",
                    "expired_at": cert["expiration"].isoformat()
                })

        return ComplianceReport(
            report_date=datetime.utcnow().isoformat(),
            total_secrets=len(secrets),
            secrets_needing_rotation=secrets_needing_rotation,
            expired_certificates=expired_certs,
            unused_secrets=unused_secrets,
            policy_violations=violations,
            recommendations=recommendations
        )
```

---

## Disaster Recovery

### Backup Strategy

```bash
#!/bin/bash
# scripts/vault-backup.sh

BACKUP_DIR="/backups/vault"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/vault_backup_$DATE.enc"

# Create encrypted backup
vault operator raft snapshot save "$BACKUP_FILE.tmp"

# Encrypt with GPG
gpg --encrypt --recipient "backup@blackroad.io" \
    --output "$BACKUP_FILE" "$BACKUP_FILE.tmp"

rm "$BACKUP_FILE.tmp"

# Upload to secure storage
aws s3 cp "$BACKUP_FILE" s3://blackroad-backups/vault/ \
    --sse aws:kms \
    --sse-kms-key-id alias/backup-key

# Retain last 30 days locally
find "$BACKUP_DIR" -name "vault_backup_*.enc" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

### Recovery Procedure

```bash
#!/bin/bash
# scripts/vault-restore.sh

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: vault-restore.sh <backup_file>"
    exit 1
fi

# Download from S3 if needed
if [[ "$BACKUP_FILE" == s3://* ]]; then
    aws s3 cp "$BACKUP_FILE" /tmp/restore.enc
    BACKUP_FILE="/tmp/restore.enc"
fi

# Decrypt backup
gpg --decrypt --output /tmp/restore.snapshot "$BACKUP_FILE"

# Stop current vault
systemctl stop vault

# Restore snapshot
vault operator raft snapshot restore /tmp/restore.snapshot

# Start vault
systemctl start vault

# Unseal (requires key holders)
echo "Vault restored. Please unseal with key shares."

# Cleanup
rm /tmp/restore.snapshot /tmp/restore.enc 2>/dev/null

echo "Recovery complete. Vault is sealed and ready for unseal."
```

---

## Quick Reference

### CLI Commands

```bash
# Vault management
vault.sh init                     # Initialize vault
vault.sh unseal                   # Unseal vault
vault.sh status                   # Check status
vault.sh seal                     # Seal vault (emergency)

# Secrets
vault.sh kv put <path> <data>     # Store secret
vault.sh kv get <path>            # Read secret
vault.sh kv delete <path>         # Delete secret
vault.sh kv list <path>           # List secrets

# Encryption
vault.sh transit encrypt <key>    # Encrypt data
vault.sh transit decrypt <key>    # Decrypt data

# Certificates
vault.sh pki issue <name>         # Issue certificate
vault.sh pki revoke <serial>      # Revoke certificate
```

### Environment Variables

```bash
VAULT_ADDR=http://localhost:8200  # Vault address
VAULT_TOKEN=hvs.xxx               # Auth token
VAULT_NAMESPACE=blackroad         # Namespace
VAULT_SKIP_VERIFY=false           # TLS verification
```

---

## Related Documentation

- [SECURITY.md](SECURITY.md) - Security practices
- [AGENTS.md](AGENTS.md) - Agent configuration
- [INFRASTRUCTURE.md](INFRASTRUCTURE.md) - Infrastructure setup
- [MONITORING.md](MONITORING.md) - Observability
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide

---

*Your AI. Your Hardware. Your Rules.*
