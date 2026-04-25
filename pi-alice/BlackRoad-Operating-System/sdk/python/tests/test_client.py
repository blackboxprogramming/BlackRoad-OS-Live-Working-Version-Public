"""Tests for the BlackRoad client."""

import os
from unittest.mock import MagicMock, patch

import pytest

from blackroad import (
    AuthenticationError,
    BlackRoadClient,
    ConfigurationError,
    NotFoundError,
)
from blackroad.models import Token, User, Wallet


class TestBlackRoadClient:
    """Test suite for BlackRoadClient."""

    def test_client_initialization(self) -> None:
        """Test client initialization."""
        client = BlackRoadClient(base_url="http://localhost:8000")
        assert client._base_url == "http://localhost:8000"
        client.close()

    def test_client_initialization_from_env(self) -> None:
        """Test client initialization from environment variables."""
        with patch.dict(os.environ, {"BLACKROAD_BASE_URL": "http://env-url:8000"}):
            client = BlackRoadClient()
            assert client._base_url == "http://env-url:8000"
            client.close()

    def test_client_initialization_no_url(self) -> None:
        """Test client initialization without base URL."""
        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(ConfigurationError):
                BlackRoadClient()

    def test_client_context_manager(self) -> None:
        """Test client as context manager."""
        with BlackRoadClient(base_url="http://localhost:8000") as client:
            assert client._base_url == "http://localhost:8000"

    def test_set_token(self) -> None:
        """Test setting authentication token."""
        client = BlackRoadClient(base_url="http://localhost:8000")
        client.set_token("test_token")
        assert "Authorization" in client._http.headers
        assert client._http.headers["Authorization"] == "Bearer test_token"
        client.close()

    def test_clear_token(self) -> None:
        """Test clearing authentication token."""
        client = BlackRoadClient(base_url="http://localhost:8000")
        client.set_token("test_token")
        client.clear_token()
        assert "Authorization" not in client._http.headers
        client.close()

    def test_add_header(self) -> None:
        """Test adding custom header."""
        client = BlackRoadClient(base_url="http://localhost:8000")
        client.add_header("X-Custom", "value")
        assert client._http.headers["X-Custom"] == "value"
        client.close()

    def test_remove_header(self) -> None:
        """Test removing custom header."""
        client = BlackRoadClient(base_url="http://localhost:8000")
        client.add_header("X-Custom", "value")
        client.remove_header("X-Custom")
        assert "X-Custom" not in client._http.headers
        client.close()

    @patch("blackroad.utils.http.HTTPClient.post")
    def test_auth_login(self, mock_post: MagicMock) -> None:
        """Test authentication login."""
        mock_post.return_value = {
            "access_token": "test_access_token",
            "refresh_token": "test_refresh_token",
            "token_type": "bearer",
        }

        client = BlackRoadClient(base_url="http://localhost:8000")
        token = client.auth.login(username="testuser", password="testpass")

        assert isinstance(token, Token)
        assert token.access_token == "test_access_token"
        assert token.token_type == "bearer"

        mock_post.assert_called_once()
        client.close()

    @patch("blackroad.utils.http.HTTPClient.post")
    def test_auth_register(self, mock_post: MagicMock) -> None:
        """Test user registration."""
        mock_post.return_value = {
            "id": 1,
            "username": "testuser",
            "email": "test@example.com",
            "full_name": "Test User",
            "is_active": True,
            "is_verified": False,
            "is_admin": False,
            "wallet_address": "0x1234567890abcdef",
            "balance": 100.0,
            "created_at": "2024-01-01T00:00:00Z",
        }

        client = BlackRoadClient(base_url="http://localhost:8000")
        user = client.auth.register(
            username="testuser",
            email="test@example.com",
            password="testpass",
            full_name="Test User",
        )

        assert isinstance(user, User)
        assert user.username == "testuser"
        assert user.email == "test@example.com"

        mock_post.assert_called_once()
        client.close()

    @patch("blackroad.utils.http.HTTPClient.get")
    def test_auth_me(self, mock_get: MagicMock) -> None:
        """Test getting current user."""
        mock_get.return_value = {
            "id": 1,
            "username": "testuser",
            "email": "test@example.com",
            "full_name": "Test User",
            "is_active": True,
            "is_verified": False,
            "is_admin": False,
            "wallet_address": "0x1234567890abcdef",
            "balance": 100.0,
            "created_at": "2024-01-01T00:00:00Z",
        }

        client = BlackRoadClient(base_url="http://localhost:8000")
        client.set_token("test_token")
        user = client.auth.me()

        assert isinstance(user, User)
        assert user.username == "testuser"

        mock_get.assert_called_once()
        client.close()

    @patch("blackroad.utils.http.HTTPClient.get")
    def test_blockchain_get_wallet(self, mock_get: MagicMock) -> None:
        """Test getting wallet."""
        mock_get.return_value = {
            "address": "0x1234567890abcdef",
            "balance": 100.0,
            "label": "Primary Wallet",
        }

        client = BlackRoadClient(base_url="http://localhost:8000")
        client.set_token("test_token")
        wallet = client.blockchain.get_wallet()

        assert isinstance(wallet, Wallet)
        assert wallet.address == "0x1234567890abcdef"
        assert wallet.balance == 100.0

        mock_get.assert_called_once()
        client.close()

    @patch("blackroad.utils.http.HTTPClient.post")
    def test_blockchain_create_transaction(self, mock_post: MagicMock) -> None:
        """Test creating a transaction."""
        from blackroad.models import Transaction

        mock_post.return_value = {
            "id": 1,
            "transaction_hash": "0xabcdef",
            "from_address": "0x1234",
            "to_address": "0x5678",
            "amount": 50.0,
            "fee": 0.001,
            "is_confirmed": False,
            "confirmations": 0,
            "created_at": "2024-01-01T00:00:00Z",
        }

        client = BlackRoadClient(base_url="http://localhost:8000")
        client.set_token("test_token")
        tx = client.blockchain.create_transaction(
            to_address="0x5678", amount=50.0, message="Test"
        )

        assert isinstance(tx, Transaction)
        assert tx.amount == 50.0

        mock_post.assert_called_once()
        client.close()

    @patch("blackroad.utils.http.HTTPClient.get")
    def test_blockchain_get_stats(self, mock_get: MagicMock) -> None:
        """Test getting blockchain stats."""
        from blackroad.models import BlockchainStats

        mock_get.return_value = {
            "latest_block_index": 100,
            "latest_block_hash": "0xabcdef",
            "total_blocks": 101,
            "total_transactions": 500,
            "pending_transactions": 10,
            "difficulty": 4,
            "mining_reward": 50.0,
        }

        client = BlackRoadClient(base_url="http://localhost:8000")
        stats = client.blockchain.get_stats()

        assert isinstance(stats, BlockchainStats)
        assert stats.total_blocks == 101
        assert stats.total_transactions == 500

        mock_get.assert_called_once()
        client.close()

    @patch("blackroad.utils.http.HTTPClient.get")
    def test_agents_list(self, mock_get: MagicMock) -> None:
        """Test listing agents."""
        from blackroad.models import AgentInfo

        mock_get.return_value = [
            {
                "name": "test-agent",
                "description": "Test agent",
                "category": "test",
                "version": "1.0.0",
                "author": "BlackRoad",
                "tags": [],
                "status": "idle",
                "dependencies": [],
            }
        ]

        client = BlackRoadClient(base_url="http://localhost:8000")
        agents = client.agents.list_agents()

        assert len(agents) == 1
        assert isinstance(agents[0], AgentInfo)
        assert agents[0].name == "test-agent"

        mock_get.assert_called_once()
        client.close()

    @patch("blackroad.utils.http.HTTPClient.post")
    def test_agents_execute(self, mock_post: MagicMock) -> None:
        """Test executing an agent."""
        from blackroad.models import AgentResult

        mock_post.return_value = {
            "agent_name": "test-agent",
            "execution_id": "123e4567-e89b-12d3-a456-426614174000",
            "status": "completed",
            "data": {"result": "success"},
            "error": None,
            "started_at": "2024-01-01T00:00:00Z",
            "completed_at": "2024-01-01T00:01:00Z",
            "duration_seconds": 60.0,
            "metadata": {},
        }

        client = BlackRoadClient(base_url="http://localhost:8000")
        client.set_token("test_token")
        result = client.agents.execute_agent(
            agent_name="test-agent", params={"test": "value"}
        )

        assert isinstance(result, AgentResult)
        assert result.agent_name == "test-agent"
        assert result.status.value == "completed"

        mock_post.assert_called_once()
        client.close()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
