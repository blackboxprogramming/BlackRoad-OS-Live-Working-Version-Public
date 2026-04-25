"""Account state for the account-based model."""

from dataclasses import dataclass, field


@dataclass
class AccountState:
    """Mutable account state tracked in the chainstate."""

    address: str
    balance: int = 0       # in base units (1 ROAD = 10^8)
    nonce: int = 0         # number of transactions sent

    def to_dict(self) -> dict:
        return {"address": self.address, "balance": self.balance, "nonce": self.nonce}

    @classmethod
    def from_dict(cls, d: dict) -> "AccountState":
        return cls(address=d["address"], balance=d["balance"], nonce=d["nonce"])
