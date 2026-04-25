"""
BlackRoad API Client - Python SDK
Official Python client for BlackRoad products
"""

import requests
from typing import Dict, Any, Optional
import json

class BlackRoadClient:
    """Main client for BlackRoad API"""
    
    def __init__(self, api_key: str, base_url: str = "https://api.blackroad.io"):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "BlackRoad-Python-SDK/1.0.0"
        })
    
    def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make API request"""
        url = f"{self.base_url}{endpoint}"
        response = self.session.request(method, url, **kwargs)
        response.raise_for_status()
        return response.json()
    
    def get(self, endpoint: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """GET request"""
        return self._request("GET", endpoint, params=params)
    
    def post(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """POST request"""
        return self._request("POST", endpoint, json=data)
    
    def put(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """PUT request"""
        return self._request("PUT", endpoint, json=data)
    
    def delete(self, endpoint: str) -> Dict[str, Any]:
        """DELETE request"""
        return self._request("DELETE", endpoint)

class Products:
    """Products API"""
    
    def __init__(self, client: BlackRoadClient):
        self.client = client
    
    def list(self, limit: int = 100) -> Dict[str, Any]:
        """List all products"""
        return self.client.get("/v1/products", params={"limit": limit})
    
    def get(self, product_id: str) -> Dict[str, Any]:
        """Get product by ID"""
        return self.client.get(f"/v1/products/{product_id}")
    
    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new product"""
        return self.client.post("/v1/products", data=data)

class Deployments:
    """Deployments API"""
    
    def __init__(self, client: BlackRoadClient):
        self.client = client
    
    def list(self) -> Dict[str, Any]:
        """List all deployments"""
        return self.client.get("/v1/deployments")
    
    def create(self, product_id: str, environment: str) -> Dict[str, Any]:
        """Create new deployment"""
        return self.client.post("/v1/deployments", data={
            "product_id": product_id,
            "environment": environment
        })
    
    def get_status(self, deployment_id: str) -> Dict[str, Any]:
        """Get deployment status"""
        return self.client.get(f"/v1/deployments/{deployment_id}")

# Main API class
class BlackRoad:
    """
    BlackRoad API Client
    
    Usage:
        from blackroad import BlackRoad
        
        client = BlackRoad(api_key="your-api-key")
        products = client.products.list()
        deployment = client.deployments.create("product-123", "production")
    """
    
    def __init__(self, api_key: str, base_url: str = "https://api.blackroad.io"):
        self._client = BlackRoadClient(api_key, base_url)
        self.products = Products(self._client)
        self.deployments = Deployments(self._client)

# Convenience exports
__all__ = ["BlackRoad", "BlackRoadClient"]
