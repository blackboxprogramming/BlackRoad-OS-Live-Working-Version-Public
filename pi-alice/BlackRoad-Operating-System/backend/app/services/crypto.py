"""Utilities for encrypting wallet secrets."""
from __future__ import annotations

import base64
import hashlib
import string
from dataclasses import dataclass
from typing import Tuple

from cryptography.fernet import Fernet, InvalidToken
from sqlalchemy import select

from app.config import settings
from app.database import AsyncSessionLocal
from app.models.blockchain import Wallet
from app.models.user import User


class WalletKeyEncryptionError(RuntimeError):
    """Raised when a wallet key cannot be encrypted."""


class WalletKeyDecryptionError(RuntimeError):
    """Raised when a wallet key cannot be decrypted."""


@dataclass
class WalletCryptoService:
    """Simple Fernet wrapper used for wallet key protection."""

    master_key: str

    def __post_init__(self) -> None:
        if not self.master_key or len(self.master_key) < 32:
            raise ValueError("WALLET_MASTER_KEY must be at least 32 characters long")
        derived_key = self._derive_key(self.master_key)
        self._fernet = Fernet(derived_key)

    @staticmethod
    def _derive_key(master_key: str) -> bytes:
        """Derive a url-safe 32-byte key for Fernet from the provided secret."""
        digest = hashlib.sha256(master_key.encode("utf-8")).digest()
        return base64.urlsafe_b64encode(digest)

    def encrypt(self, plaintext: str) -> str:
        """Encrypt a wallet secret."""
        if plaintext is None:
            raise WalletKeyEncryptionError("Cannot encrypt an empty wallet key")
        try:
            token = self._fernet.encrypt(plaintext.encode("utf-8"))
            return token.decode("utf-8")
        except Exception as exc:  # pragma: no cover - defensive
            raise WalletKeyEncryptionError("Unable to encrypt wallet key") from exc

    def decrypt(self, token: str) -> str:
        """Decrypt a wallet secret."""
        if token is None:
            raise WalletKeyDecryptionError("Wallet key is missing")
        try:
            plaintext = self._fernet.decrypt(token.encode("utf-8"))
            return plaintext.decode("utf-8")
        except (InvalidToken, ValueError, TypeError) as exc:
            raise WalletKeyDecryptionError("Unable to decrypt wallet key") from exc


wallet_crypto = WalletCryptoService(settings.WALLET_MASTER_KEY)


def _looks_like_plaintext_key(value: str | None) -> bool:
    if not value:
        return False
    normalized = value.strip()
    return len(normalized) == 64 and all(ch in string.hexdigits for ch in normalized)


async def rotate_plaintext_wallet_keys() -> Tuple[int, int]:
    """Encrypt plaintext wallet keys that may still exist in the database."""
    updated_users = 0
    updated_wallets = 0

    async with AsyncSessionLocal() as session:
        user_result = await session.execute(select(User).where(User.wallet_private_key.is_not(None)))
        for user in user_result.scalars():
            if _looks_like_plaintext_key(user.wallet_private_key):
                user.wallet_private_key = wallet_crypto.encrypt(user.wallet_private_key)
                updated_users += 1

        wallet_result = await session.execute(select(Wallet).where(Wallet.private_key.is_not(None)))
        for wallet in wallet_result.scalars():
            if _looks_like_plaintext_key(wallet.private_key):
                wallet.private_key = wallet_crypto.encrypt(wallet.private_key)
                updated_wallets += 1

        if updated_users or updated_wallets:
            await session.commit()

    return updated_users, updated_wallets


__all__ = [
    "WalletCryptoService",
    "WalletKeyEncryptionError",
    "WalletKeyDecryptionError",
    "wallet_crypto",
    "rotate_plaintext_wallet_keys",
]
