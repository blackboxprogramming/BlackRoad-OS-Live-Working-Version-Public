# BlackRoad Documentation Archive

**Generated:** $(date '+%Y-%m-%d %H:%M:%S')
**Sync Targets:**
- blackroad.systems@gmail.com
- amundsonalexa@gmail.com

## 📂 Directory Structure

```
blackroad-docs-sync/
├── master-guides/          # Master documentation & guides
├── deployment-scripts/     # Deployment automation scripts
├── product-docs/           # Individual product documentation (24 products)
├── integration-guides/     # Platform integration guides
└── INDEX.md               # This file
```

## 🚀 Products (24 Total)

### Core Services
1. **RoadAuth** - Authentication service (JWT, OAuth 2.0)
2. **RoadAPI** - Core API gateway
3. **RoadBilling** - Subscription billing & payments

### AI Platform
4. **BlackRoad AI Platform** - 6 models, 30K agents, 104 TOPS
5. **BlackRoad LangChain Studio** - Workflow orchestration
6. **BlackRoad vLLM** - High-performance inference (10x faster)
7. **BlackRoad LocalAI** - Self-hosted AI platform

### Enterprise Tools
8. **BlackRoad Admin Portal** - Admin dashboard
9. **BlackRoad Meet** - Video conferencing (Jitsi-based)
10. **BlackRoad MinIO** - Object storage
11. **BlackRoad Docs Site** - Documentation platform
12. **BlackRoad Keycloak** - Identity management
13. **RoadLog Monitoring** - System monitoring

### Infrastructure
14. **RoadVPN** - WireGuard VPN service

### Productivity
15. **RoadNote** - Professional note-taking
16. **RoadScreen** - Screen recording & video

### Development
17. **Genesis Road** - Game engine & development
18. **RoadGateway** - API management & dev platform
19. **RoadMobile** - Cross-platform mobile framework
20. **RoadCLI** - Command-line developer tool

### Enterprise Security
21. **RoadAuth Pro** - Zero-trust identity (Authelia-based)

### Creative Tools
22. **RoadStudio** - Video production & editing (4K/8K)

### Marketplace
23. **RoadMarket** - Digital product marketplace (0% fees)

## 🔐 Authentication (Clerk Integration)

All products integrated with Clerk enterprise authentication:
- Email/password authentication
- Social login (Google, GitHub, Apple)
- Multi-factor authentication (MFA)
- Passwordless sign-in
- Organization support (teams)

Configuration: `master-guides/clerk-config.json`
Guide: `master-guides/CLERK_INTEGRATION_GUIDE.md`

## 🥧 Raspberry Pi Deployment

8 backend services packaged for Pi cluster deployment:
- blackroad-ai-platform (lucidia:192.168.4.38)
- blackroad-vllm (blackroad-pi:192.168.4.64)
- blackroad-localai (lucidia-alt:192.168.4.99)
- roadapi, roadlog-monitoring, blackroad-minio
- roadauth, roadbilling

Plus: vLLM edge AI inference, MinIO distributed storage

Scripts: `deployment-scripts/deploy-to-pi-cluster.sh`

## 🤖 Hugging Face AI Products

4 AI products prepared for Hugging Face Spaces:
- blackroad-ai-platform
- blackroad-langchain-studio
- blackroad-vllm
- blackroad-localai

Script: `deployment-scripts/deploy-ai-to-huggingface.sh`

## 📊 Deployment Status

- ✅ **Cloudflare Pages**: 24/24 products live
- ✅ **GitHub**: 23/24 repos in BlackRoad-OS organization
- ⏳ **Hugging Face**: 4 AI products prepared (awaiting HF token)
- ⏳ **Raspberry Pi**: 8 packages ready (Pis currently offline)
- ✅ **Clerk Auth**: 23/23 products integrated

## 🌐 Live URLs

All products deployed to Cloudflare Pages:
- Format: `https://[hash].blackroad-[project].pages.dev`
- Custom domains: Configure via Cloudflare DNS

## 📝 Documentation Files

Each product includes:
- `index.html` - Main application
- `README.md` - Product documentation (where available)
- `clerk-integration/` - Authentication setup
- `pi-deploy/` - Raspberry Pi deployment package

## 🔧 Deployment Scripts

All deployment automation in `deployment-scripts/`:
- GitHub mass deployment
- Hugging Face AI deployment prep
- Pi cluster package creation
- Clerk authentication integration

## 🖤🛣️ BlackRoad OS

Enterprise software ecosystem built for scale, security, and simplicity.

**Contact:**
- blackroad.systems@gmail.com
- amundsonalexa@gmail.com

**GitHub**: BlackRoad-OS organization (66+ repositories)
**Website**: blackroad.io
