// BlackRoad JavaScript SDK
class BlackRoad {
  constructor(apiKey) {
    this.apiKey = apiKey
    this.baseURL = 'https://api.blackroad.io/v1'
  }
  async deploy(config) {
    return this.request('POST', '/deployments', config)
  }
  async getAnalytics(range = '7d') {
    return this.request('GET', `/analytics?range=${range}`)
  }
  async request(method, endpoint, data = null) {
    const res = await fetch(this.baseURL + endpoint, {
      method,
      headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : null
    })
    return res.json()
  }
}
module.exports = BlackRoad
