import requests

class BlackRoad:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.blackroad.io/v1"
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })
    
    def deploy(self, config):
        return self.session.post(f"{self.base_url}/deployments", json=config).json()
    
    def get_analytics(self, time_range='7d'):
        return self.session.get(f"{self.base_url}/analytics?range={time_range}").json()
