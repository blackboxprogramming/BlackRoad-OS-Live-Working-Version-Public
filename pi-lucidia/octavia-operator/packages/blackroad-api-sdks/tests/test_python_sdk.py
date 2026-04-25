"""Tests for the BlackRoad Python SDK.

Tests SDK structure without making real HTTP requests.
"""

import os
import sys
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Import the SDK module directly
import importlib.util
spec = importlib.util.spec_from_file_location(
    "python_sdk",
    os.path.join(os.path.dirname(__file__), '..', 'python-sdk.py')
)
sdk = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sdk)

BlackRoad = sdk.BlackRoad
BlackRoadClient = sdk.BlackRoadClient
Products = sdk.Products
Deployments = sdk.Deployments


class TestBlackRoadClient:
    def test_initialization(self):
        client = BlackRoadClient("test-key-123")
        assert client.api_key == "test-key-123"
        assert client.base_url == "https://api.blackroad.io"

    def test_custom_base_url(self):
        client = BlackRoadClient("key", base_url="https://custom.api.io")
        assert client.base_url == "https://custom.api.io"

    def test_auth_header(self):
        client = BlackRoadClient("my-secret-key")
        assert client.session.headers["Authorization"] == "Bearer my-secret-key"

    def test_user_agent(self):
        client = BlackRoadClient("key")
        assert "BlackRoad" in client.session.headers["User-Agent"]


class TestBlackRoadSDK:
    def test_has_products_namespace(self):
        br = BlackRoad(api_key="test")
        assert isinstance(br.products, Products)

    def test_has_deployments_namespace(self):
        br = BlackRoad(api_key="test")
        assert isinstance(br.deployments, Deployments)


class TestProductsAPI:
    @patch.object(BlackRoadClient, '_request')
    def test_list_products(self, mock_req):
        mock_req.return_value = {"products": []}
        br = BlackRoad(api_key="test")
        result = br.products.list()
        mock_req.assert_called_once_with("GET", "/v1/products", params={"limit": 100})

    @patch.object(BlackRoadClient, '_request')
    def test_list_products_custom_limit(self, mock_req):
        mock_req.return_value = {"products": []}
        br = BlackRoad(api_key="test")
        br.products.list(limit=10)
        mock_req.assert_called_once_with("GET", "/v1/products", params={"limit": 10})

    @patch.object(BlackRoadClient, '_request')
    def test_get_product(self, mock_req):
        mock_req.return_value = {"id": "prod-1", "name": "Test"}
        br = BlackRoad(api_key="test")
        result = br.products.get("prod-1")
        mock_req.assert_called_once_with("GET", "/v1/products/prod-1", params=None)

    @patch.object(BlackRoadClient, '_request')
    def test_create_product(self, mock_req):
        mock_req.return_value = {"id": "prod-new"}
        br = BlackRoad(api_key="test")
        data = {"name": "New Product", "description": "Test"}
        br.products.create(data)
        mock_req.assert_called_once_with("POST", "/v1/products", json=data)


class TestDeploymentsAPI:
    @patch.object(BlackRoadClient, '_request')
    def test_list_deployments(self, mock_req):
        mock_req.return_value = {"deployments": []}
        br = BlackRoad(api_key="test")
        br.deployments.list()
        mock_req.assert_called_once_with("GET", "/v1/deployments", params=None)

    @patch.object(BlackRoadClient, '_request')
    def test_create_deployment(self, mock_req):
        mock_req.return_value = {"id": "deploy-1"}
        br = BlackRoad(api_key="test")
        br.deployments.create("prod-1", "production")
        mock_req.assert_called_once_with(
            "POST", "/v1/deployments",
            json={"product_id": "prod-1", "environment": "production"}
        )

    @patch.object(BlackRoadClient, '_request')
    def test_get_status(self, mock_req):
        mock_req.return_value = {"id": "deploy-1", "status": "running"}
        br = BlackRoad(api_key="test")
        br.deployments.get_status("deploy-1")
        mock_req.assert_called_once_with("GET", "/v1/deployments/deploy-1", params=None)


class TestHTTPMethods:
    @patch.object(BlackRoadClient, '_request')
    def test_put_method(self, mock_req):
        client = BlackRoadClient("key")
        client.put("/endpoint", {"data": "value"})
        mock_req.assert_called_once_with("PUT", "/endpoint", json={"data": "value"})

    @patch.object(BlackRoadClient, '_request')
    def test_delete_method(self, mock_req):
        client = BlackRoadClient("key")
        client.delete("/endpoint")
        mock_req.assert_called_once_with("DELETE", "/endpoint")
