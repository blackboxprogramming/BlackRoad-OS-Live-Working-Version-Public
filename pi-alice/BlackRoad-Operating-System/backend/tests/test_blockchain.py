"""Blockchain tests"""
import pytest
import pytest_asyncio
from httpx import AsyncClient


@pytest_asyncio.fixture
async def recipient_user(client: AsyncClient):
    """Create a secondary user to receive transactions"""
    user_data = {
        "username": "recipient",
        "email": "recipient@example.com",
        "password": "recipientpassword",
        "full_name": "Recipient User"
    }

    response = await client.post("/api/auth/register", json=user_data)
    assert response.status_code == 201
    return response.json()


@pytest.mark.asyncio
async def test_get_wallet(client: AsyncClient, auth_headers):
    """Test getting user wallet"""
    response = await client.get("/api/blockchain/wallet", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert "address" in data
    assert "balance" in data
    assert data["balance"] == 100.0  # Starting balance


@pytest.mark.asyncio
async def test_get_balance(client: AsyncClient, auth_headers):
    """Test getting wallet balance"""
    response = await client.get("/api/blockchain/balance", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert "address" in data
    assert "balance" in data


@pytest.mark.asyncio
async def test_blockchain_stats(client: AsyncClient):
    """Test getting blockchain stats"""
    response = await client.get("/api/blockchain/stats")
    assert response.status_code == 200

    data = response.json()
    assert "latest_block_index" in data
    assert "total_blocks" in data
    assert "difficulty" in data


@pytest.mark.asyncio
async def test_mine_block(client: AsyncClient, auth_headers):
    """Test mining a block"""
    response = await client.post("/api/blockchain/mine", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert "index" in data
    assert "hash" in data
    assert "reward" in data
    assert data["reward"] == 50.0  # Mining reward


@pytest.mark.asyncio
async def test_create_transaction_rejects_zero_amount(
    client: AsyncClient,
    auth_headers,
    recipient_user
):
    """Transaction creation should fail fast for zero amounts"""
    tx_data = {
        "to_address": recipient_user["wallet_address"],
        "amount": 0,
        "message": "Invalid zero"
    }

    response = await client.post(
        "/api/blockchain/transactions",
        json=tx_data,
        headers=auth_headers
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_transaction_rejects_negative_amount(
    client: AsyncClient,
    auth_headers,
    recipient_user
):
    """Transaction creation should fail fast for negative amounts"""
    tx_data = {
        "to_address": recipient_user["wallet_address"],
        "amount": -10,
        "message": "Invalid negative"
    }

    response = await client.post(
        "/api/blockchain/transactions",
        json=tx_data,
        headers=auth_headers
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_transaction_succeeds_with_encrypted_keys(
    client: AsyncClient,
    auth_headers,
    recipient_user
):
    """Transactions should succeed when wallet keys are encrypted"""
    tx_data = {
        "to_address": recipient_user["wallet_address"],
        "amount": 10,
        "message": "Encrypted transfer",
    }

    response = await client.post(
        "/api/blockchain/transactions",
        json=tx_data,
        headers=auth_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["from_address"] != data["to_address"]
    assert data["to_address"] == recipient_user["wallet_address"]
    assert data["amount"] == tx_data["amount"]
