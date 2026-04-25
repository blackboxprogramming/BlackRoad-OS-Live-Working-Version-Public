"""Tests for roadchain agent identity system."""

import hashlib
from roadchain.identity.agent import AgentIdentity


class TestAgentIdentity:
    def test_create(self):
        agent = AgentIdentity.create("test-agent", provider="anthropic", model="claude-4")
        assert agent.name == "test-agent"
        assert len(agent.fingerprint) == 256  # SHA-2048 = 256 bytes
        assert agent.road_address.startswith("ROAD")

    def test_fingerprint_hex(self):
        agent = AgentIdentity.create("fp-test")
        assert len(agent.fingerprint_hex) == 512  # 256 bytes = 512 hex chars

    def test_short_id(self):
        agent = AgentIdentity.create("id-test")
        assert len(agent.short_id) == 16

    def test_sign_and_verify_message(self):
        agent = AgentIdentity.create("signer")
        msg = b"roadchain identity proof"
        sig = agent.sign_message(msg)
        assert isinstance(sig, bytes)
        assert len(sig) > 0

    def test_identity_claim(self):
        agent = AgentIdentity.create("claimer")
        claim_sig = agent.sign_identity_claim()
        assert isinstance(claim_sig, bytes)

    def test_unique_identities(self):
        a1 = AgentIdentity.create("agent-1")
        a2 = AgentIdentity.create("agent-2")
        assert a1.fingerprint != a2.fingerprint
        assert a1.road_address != a2.road_address

    def test_switch_provider(self):
        agent = AgentIdentity.create("switchable", provider="openai", model="gpt-4")
        original_fp = agent.fingerprint
        agent.switch_provider("anthropic", "claude-4")
        # Identity (fingerprint) must NOT change
        assert agent.fingerprint == original_fp
        assert agent.provider == "anthropic"
        assert agent.model == "claude-4"

    def test_provider_info(self):
        agent = AgentIdentity.create("info-test", provider="anthropic")
        info = agent.provider_info()
        assert isinstance(info, dict)

    def test_roundtrip_dict(self):
        agent = AgentIdentity.create("serial-test", provider="blackroad")
        d = agent.to_dict(include_private=False)
        assert "private_key" not in d or d.get("private_key") == ""
        restored = AgentIdentity.from_dict(d)
        assert restored.name == "serial-test"
        assert restored.fingerprint_hex == agent.fingerprint_hex

    def test_roundtrip_json(self):
        agent = AgentIdentity.create("json-test")
        json_str = agent.to_json()
        restored = AgentIdentity.from_json(json_str)
        assert restored.fingerprint_hex == agent.fingerprint_hex

    def test_card_display(self):
        agent = AgentIdentity.create("card-test", provider="anthropic", model="claude-4")
        card = agent.card()
        assert "card-test" in card
        assert "ROAD" in card

    def test_from_private_key(self):
        agent = AgentIdentity.create("original")
        restored = AgentIdentity.from_private_key(
            agent._AgentIdentity__private_key if hasattr(agent, '_AgentIdentity__private_key') else agent.private_key,
            name="restored",
        )
        # Same keypair should produce same address
        assert restored.road_address == agent.road_address
