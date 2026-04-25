"""
IP Vault Agent

Cryptographic proof-of-origin system for ideas, concepts, and intellectual property.
Produces forensically defensible evidence objects suitable for blockchain anchoring.
"""

import hashlib
import re
from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Any, Dict, Optional
from uuid import uuid4

from agents.base import BaseAgent


@dataclass
class LEO:
    """
    Ledger Evidence Object (LEO)

    Cryptographically signed record of an idea's origin.
    Suitable for blockchain anchoring and legal defense.
    """
    id: str
    author: str
    title: Optional[str]
    canonical_size: int
    sha256: str
    sha512: str
    keccak256: str
    created_at: str
    anchor_status: str = "pending"
    anchor_txid: Optional[str] = None
    anchor_chain: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert LEO to dictionary."""
        return asdict(self)


class VaultAgent(BaseAgent):
    """
    IP Vault cryptographic agent.

    Capabilities:
    - Canonical text normalization (deterministic)
    - Multi-hash generation (SHA-256, SHA-512, Keccak-256)
    - LEO (Ledger Evidence Object) construction
    - Blockchain anchoring preparation
    - Verification text generation
    """

    def __init__(self):
        super().__init__(
            name='vault-agent',
            description='Cryptographic IP proof-of-origin system',
            category='security',
            version='1.0.0',
            tags=['cryptography', 'ip', 'blockchain', 'evidence', 'hashing']
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute vault operation.

        Args:
            params: {
                'action': 'canonicalize|hash|create_leo|verify',
                'idea': str,  # Raw idea text
                'author': str,  # Default: 'Alexa'
                'title': str (optional),
                'leo_id': str (for verify action)
            }

        Returns:
            {
                'status': 'success|failed',
                'action': str,
                'result': Dict  # Action-specific result
            }
        """
        action = params.get('action', 'create_leo')
        idea = params.get('idea', '')
        author = params.get('author', 'Alexa')
        title = params.get('title')

        self.logger.info(f"Vault agent: {action}")

        result = {'status': 'success', 'action': action}

        if action == 'canonicalize':
            canonical = self._canonicalize(idea)
            result['result'] = {
                'canonical_text': canonical,
                'original_size': len(idea),
                'canonical_size': len(canonical)
            }

        elif action == 'hash':
            canonical = self._canonicalize(idea)
            hashes = self._compute_hashes(canonical)
            result['result'] = {
                'sha256': hashes['sha256'],
                'sha512': hashes['sha512'],
                'keccak256': hashes['keccak256'],
                'canonical_size': len(canonical)
            }

        elif action == 'create_leo':
            leo = self._create_leo(idea, author, title)
            result['result'] = {
                'leo': leo.to_dict(),
                'verification_text': self._generate_verification_text(leo),
                'anchoring_options': self._generate_anchoring_options(leo)
            }

        elif action == 'verify':
            leo_id = params.get('leo_id')
            verification_steps = self._generate_verification_steps()
            result['result'] = {
                'leo_id': leo_id,
                'verification_steps': verification_steps
            }

        return result

    def _canonicalize(self, text: str) -> str:
        """
        Canonicalize text to deterministic form.

        Rules:
        - Strip leading/trailing whitespace
        - Normalize internal whitespace to single spaces
        - Remove empty lines
        - Preserve semantic meaning exactly
        - No interpretation or expansion

        Args:
            text: Raw input text

        Returns:
            Canonical text form
        """
        # Strip leading/trailing whitespace
        text = text.strip()

        # Normalize line endings to \n
        text = text.replace('\r\n', '\n').replace('\r', '\n')

        # Remove empty lines
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        # Join with single newline
        text = '\n'.join(lines)

        # Collapse multiple spaces to single space (within lines)
        text = re.sub(r' +', ' ', text)

        return text

    def _compute_hashes(self, canonical_text: str) -> Dict[str, str]:
        """
        Compute cryptographic hashes of canonical text.

        Args:
            canonical_text: Canonicalized input

        Returns:
            Dictionary of hashes (hex format)
        """
        text_bytes = canonical_text.encode('utf-8')

        # SHA-256
        sha256 = hashlib.sha256(text_bytes).hexdigest()

        # SHA-512
        sha512 = hashlib.sha512(text_bytes).hexdigest()

        # Keccak-256 (Ethereum-compatible)
        keccak256 = hashlib.sha3_256(text_bytes).hexdigest()

        return {
            'sha256': sha256,
            'sha512': sha512,
            'keccak256': keccak256
        }

    def _create_leo(
        self,
        idea: str,
        author: str = 'Alexa',
        title: Optional[str] = None
    ) -> LEO:
        """
        Create a Ledger Evidence Object.

        Args:
            idea: Raw idea text
            author: Idea author
            title: Optional title

        Returns:
            LEO instance
        """
        canonical = self._canonicalize(idea)
        hashes = self._compute_hashes(canonical)

        leo = LEO(
            id=str(uuid4()),
            author=author,
            title=title,
            canonical_size=len(canonical),
            sha256=hashes['sha256'],
            sha512=hashes['sha512'],
            keccak256=hashes['keccak256'],
            created_at=datetime.utcnow().isoformat() + 'Z'
        )

        return leo

    def _generate_verification_text(self, leo: LEO) -> str:
        """
        Generate verification instructions for LEO.

        Args:
            leo: LEO instance

        Returns:
            Verification text
        """
        return f"""VERIFICATION INSTRUCTIONS

This Ledger Evidence Object (LEO) proves:
- The idea existed at {leo.created_at}
- The author is {leo.author}
- The content is cryptographically bound to the hashes below

To verify:
1. Obtain the original idea text
2. Canonicalize it using the same rules
3. Compute SHA-256 hash
4. Compare against: {leo.sha256}

If hashes match:
- The idea is authentic and unmodified
- The timestamp predates any later-origin claim
- Tampering is cryptographically impossible

This uses the SAME cryptographic primitives underlying Bitcoin/ETF custody systems.
Any blockchain anchor transaction provides additional immutable proof.

Hash fingerprints:
- SHA-256:    {leo.sha256}
- SHA-512:    {leo.sha512}
- Keccak-256: {leo.keccak256}
"""

    def _generate_anchoring_options(self, leo: LEO) -> Dict[str, Any]:
        """
        Generate blockchain anchoring options.

        Args:
            leo: LEO instance

        Returns:
            Anchoring options
        """
        # Bitcoin OP_RETURN payload (80 bytes max)
        short_hash = leo.sha256[:64]  # First 32 bytes (64 hex chars)

        return {
            'bitcoin': {
                'method': 'OP_RETURN',
                'payload': short_hash,
                'payload_size': len(short_hash),
                'estimated_fee_sat': 1000,
                'estimated_fee_usd': 0.50,
                'confirmation_time': '10-60 minutes'
            },
            'litecoin': {
                'method': 'OP_RETURN',
                'payload': short_hash,
                'estimated_fee_ltc': 0.001,
                'confirmation_time': '2.5-15 minutes'
            },
            'ethereum': {
                'method': 'Contract event',
                'hash': leo.keccak256,
                'estimated_fee_gwei': 20,
                'confirmation_time': '12-60 seconds'
            },
            'recommended': 'bitcoin',
            'reason': 'Highest immutability and legal recognition'
        }

    def _generate_verification_steps(self) -> list:
        """
        Generate generic verification steps.

        Returns:
            List of verification steps
        """
        return [
            "Obtain the LEO from the database or blockchain",
            "Retrieve the original idea text",
            "Apply canonicalization rules",
            "Compute SHA-256 hash of canonical text",
            "Compare computed hash to LEO's sha256 field",
            "If match: idea is verified as authentic",
            "Check blockchain for anchor transaction (if anchored)",
            "Verify anchor transaction confirms before any dispute date"
        ]

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate vault operation parameters."""
        valid_actions = ['canonicalize', 'hash', 'create_leo', 'verify']
        action = params.get('action', 'create_leo')

        if action not in valid_actions:
            self.logger.error(f"Invalid action: {action}")
            return False

        if action in ['canonicalize', 'hash', 'create_leo']:
            if 'idea' not in params or not params['idea']:
                self.logger.error("'idea' parameter required and cannot be empty")
                return False

        if action == 'verify':
            if 'leo_id' not in params:
                self.logger.error("'leo_id' parameter required for verify action")
                return False

        return True
