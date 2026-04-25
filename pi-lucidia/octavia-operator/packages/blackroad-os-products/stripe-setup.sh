#!/bin/bash
# BlackRoad Products - Stripe Product Creation Script

echo "🏪 Creating BlackRoad Products in Stripe..."
echo ""

# Tier 1: Premium SaaS
echo "Creating Tier 1: Premium SaaS Products..."

stripe products create \
  --name "BlackRoad DevOps Suite" \
  --description "Complete CI/CD platform with Harness, Gitea, and Pulumi" \
  --id prod_devops_suite

stripe prices create \
  --product prod_devops_suite \
  --unit-amount 9900 \
  --currency usd \
  --recurring interval=month \
  --nickname "Starter Plan"

stripe prices create \
  --product prod_devops_suite \
  --unit-amount 29900 \
  --currency usd \
  --recurring interval=month \
  --nickname "Pro Plan"

stripe products create \
  --name "BlackRoad Knowledge Hub" \
  --description "Team wiki and documentation with Outline, Wiki.js, and BookStack" \
  --id prod_knowledge_hub

stripe prices create \
  --product prod_knowledge_hub \
  --unit-amount 4900 \
  --currency usd \
  --recurring interval=month \
  --nickname "Team Plan"

stripe prices create \
  --product prod_knowledge_hub \
  --unit-amount 14900 \
  --currency usd \
  --recurring interval=month \
  --nickname "Enterprise Plan"

stripe products create \
  --name "BlackRoad Project Command" \
  --description "Project management and CRM with Plane and EspoCRM" \
  --id prod_project_command

stripe prices create \
  --product prod_project_command \
  --unit-amount 7900 \
  --currency usd \
  --recurring interval=month \
  --nickname "Team Plan"

stripe prices create \
  --product prod_project_command \
  --unit-amount 19900 \
  --currency usd \
  --recurring interval=month \
  --nickname "Business Plan"

# Tier 2: AI/ML Services
echo "Creating Tier 2: AI/ML Services..."

stripe products create \
  --name "BlackRoad AI Studio" \
  --description "Local LLM hosting with Ollama, ComfyUI, PyTorch, and Haystack" \
  --id prod_ai_studio

stripe prices create \
  --product prod_ai_studio \
  --unit-amount 2900 \
  --currency usd \
  --recurring interval=month \
  --nickname "Base Plan"

stripe products create \
  --name "BlackRoad Vector Search" \
  --description "High-performance vector database with Qdrant" \
  --id prod_vector_search

stripe prices create \
  --product prod_vector_search \
  --unit-amount 1900 \
  --currency usd \
  --recurring interval=month \
  --nickname "Starter Plan"

# Tier 3: Infrastructure Services
echo "Creating Tier 3: Infrastructure Services..."

stripe products create \
  --name "BlackRoad Cloud Storage" \
  --description "Distributed storage with Ceph and Syncthing" \
  --id prod_cloud_storage

stripe prices create \
  --product prod_cloud_storage \
  --unit-amount 900 \
  --currency usd \
  --recurring interval=month \
  --nickname "Base Plan"

stripe products create \
  --name "BlackRoad Database Cloud" \
  --description "Managed PostgreSQL and Solr search" \
  --id prod_database_cloud

stripe prices create \
  --product prod_database_cloud \
  --unit-amount 1900 \
  --currency usd \
  --recurring interval=month \
  --nickname "Starter Plan"

stripe products create \
  --name "BlackRoad Secure Networks" \
  --description "WireGuard VPN mesh and identity management with Netmaker and Keycloak" \
  --id prod_secure_networks

stripe prices create \
  --product prod_secure_networks \
  --unit-amount 2900 \
  --currency usd \
  --recurring interval=month \
  --nickname "10 Nodes Plan"

stripe prices create \
  --product prod_secure_networks \
  --unit-amount 9900 \
  --currency usd \
  --recurring interval=month \
  --nickname "Unlimited Plan"

# Tier 4: Creative & Collaboration
echo "Creating Tier 4: Creative & Collaboration..."

stripe products create \
  --name "BlackRoad Office Suite" \
  --description "Cloud office suite with Collabora Online and Element chat" \
  --id prod_office_suite

stripe prices create \
  --product prod_office_suite \
  --unit-amount 1900 \
  --currency usd \
  --recurring interval=month \
  --nickname "Per User"

stripe products create \
  --name "BlackRoad Media Studio" \
  --description "Streaming and media production with OBS Studio" \
  --id prod_media_studio

stripe prices create \
  --product prod_media_studio \
  --unit-amount 3900 \
  --currency usd \
  --recurring interval=month \
  --nickname "Creator Plan"

stripe prices create \
  --product prod_media_studio \
  --unit-amount 9900 \
  --currency usd \
  --recurring interval=month \
  --nickname "Pro Plan"

# Tier 5: Specialty Products
echo "Creating Tier 5: Specialty Products..."

stripe products create \
  --name "Lucidia AI Companion" \
  --description "Personal AI companion built on transparency, consent, and care" \
  --id prod_lucidia_companion

stripe prices create \
  --product prod_lucidia_companion \
  --unit-amount 2900 \
  --currency usd \
  --recurring interval=month \
  --nickname "Personal Plan"

stripe prices create \
  --product prod_lucidia_companion \
  --unit-amount 14900 \
  --currency usd \
  --recurring interval=month \
  --nickname "Team Plan"

stripe products create \
  --name "BlackRoad Pi Hardware" \
  --description "Raspberry Pi edge devices with holographic displays and mining dashboards" \
  --id prod_pi_hardware

stripe prices create \
  --product prod_pi_hardware \
  --unit-amount 29900 \
  --currency usd \
  --currency usd \
  --nickname "Hardware (one-time)"

stripe prices create \
  --product prod_pi_hardware \
  --unit-amount 1900 \
  --currency usd \
  --recurring interval=month \
  --nickname "Cloud Service"

stripe products create \
  --name "Quantum BlackRoad" \
  --description "Quantum computing research platform" \
  --id prod_quantum

stripe prices create \
  --product prod_quantum \
  --unit-amount 49900 \
  --currency usd \
  --recurring interval=month \
  --nickname "Research Access"

# Tier 6: Bundles & Enterprise
echo "Creating Tier 6: Bundles & Enterprise..."

stripe products create \
  --name "BlackRoad Complete" \
  --description "All BlackRoad products with priority support" \
  --id prod_complete_bundle

stripe prices create \
  --product prod_complete_bundle \
  --unit-amount 99900 \
  --currency usd \
  --recurring interval=month \
  --nickname "Complete Bundle"

stripe products create \
  --name "BlackRoad Enterprise" \
  --description "Custom infrastructure with dedicated support and white-label options" \
  --id prod_enterprise

stripe prices create \
  --product prod_enterprise \
  --unit-amount 500000 \
  --currency usd \
  --recurring interval=month \
  --nickname "Enterprise (starts at)"

echo ""
echo "✅ All Stripe products created!"
echo "🔗 View at: https://dashboard.stripe.com/products"
