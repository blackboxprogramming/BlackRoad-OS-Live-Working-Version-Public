# BlackRoad OS - Cloudflare DNS Configuration
# Terraform configuration for all DNS records
#
# Usage:
#   terraform init
#   terraform plan
#   terraform apply
#
# Prerequisites:
#   - CLOUDFLARE_API_TOKEN environment variable set
#   - Zone IDs for each domain

terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

# Variables
variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "zone_id_blackroad_systems" {
  description = "Zone ID for blackroad.systems"
  type        = string
}

variable "zone_id_blackroad_io" {
  description = "Zone ID for blackroad.io"
  type        = string
}

# Provider
provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# =============================================================================
# blackroad.systems DNS Records (Enterprise)
# =============================================================================

# API Gateway
resource "cloudflare_record" "api_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "api"
  value   = "blackroad-os-api-gateway-production.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "API Gateway - blackroad-os-api-gateway"
}

# Core API
resource "cloudflare_record" "core_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "core"
  value   = "blackroad-os-core-production.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Core API - blackroad-os-core"
}

# Operator (GitHub Automation)
resource "cloudflare_record" "operator_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "operator"
  value   = "blackroad-os-operator-production.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Operator - blackroad-os-operator"
}

# Beacon (Health Monitoring)
resource "cloudflare_record" "beacon_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "beacon"
  value   = "blackroad-os-beacon-production.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Beacon - blackroad-os-beacon"
}

# Prism Console
resource "cloudflare_record" "prism_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "prism"
  value   = "blackroad-prism-console-production.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Prism Console - blackroad-prism-console"
}

# Documentation
resource "cloudflare_record" "docs_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "docs"
  value   = "blackroad-os-docs-production-f7af.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Documentation - blackroad-os-docs"
}

# Console (Master)
resource "cloudflare_record" "console_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "console"
  value   = "blackroad-os-master-production.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Console - blackroad-os-master"
}

# Infrastructure
resource "cloudflare_record" "infra_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "infra"
  value   = "blackroad-os-infra-production.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Infrastructure - blackroad-os-infra"
}

# Archive
resource "cloudflare_record" "archive_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "archive"
  value   = "blackroad-os-archive-production.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Archive - blackroad-os-archive"
}

# Demo
resource "cloudflare_record" "demo_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "demo"
  value   = "blackroad-os-demo-production.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Demo - blackroad-os-demo"
}

# Research
resource "cloudflare_record" "research_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "research"
  value   = "blackroad-os-research-production.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Research - blackroad-os-research"
}

# =============================================================================
# blackroad.systems Pack Subdomains
# =============================================================================

# Finance Pack
resource "cloudflare_record" "finance_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "finance"
  value   = "blackroad-os-pack-finance-production.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Finance Pack - blackroad-os-pack-finance"
}

# Legal Pack
resource "cloudflare_record" "legal_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "legal"
  value   = "blackroad-os-pack-legal-production.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Legal Pack - blackroad-os-pack-legal"
}

# DevOps Pack
resource "cloudflare_record" "devops_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "devops"
  value   = "blackroad-os-pack-infra-devops-production.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "DevOps Pack - blackroad-os-pack-infra-devops"
}

# Research Lab Pack
resource "cloudflare_record" "lab_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "lab"
  value   = "blackroad-os-pack-research-lab-production.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Research Lab - blackroad-os-pack-research-lab"
}

# =============================================================================
# blackroad.io DNS Records (Consumer)
# =============================================================================

# Main App
resource "cloudflare_record" "app_io" {
  zone_id = var.zone_id_blackroad_io
  name    = "app"
  value   = "blackroad-os-web-production.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Main App - blackroad-os-web"
}

# Home/Landing
resource "cloudflare_record" "home_io" {
  zone_id = var.zone_id_blackroad_io
  name    = "home"
  value   = "blackroad-os-home-production.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Home - blackroad-os-home"
}

# Public API
resource "cloudflare_record" "api_io" {
  zone_id = var.zone_id_blackroad_io
  name    = "api"
  value   = "blackroad-os-api-production-3335.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Public API - blackroad-os-api"
}

# Creator Studio
resource "cloudflare_record" "creator_io" {
  zone_id = var.zone_id_blackroad_io
  name    = "creator"
  value   = "blackroad-os-pack-creator-studio-production.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Creator Studio - blackroad-os-pack-creator-studio"
}

# OS Interface
resource "cloudflare_record" "os_io" {
  zone_id = var.zone_id_blackroad_io
  name    = "os"
  value   = "blackroad-os-production.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "OS Interface - blackroad-os"
}

# =============================================================================
# Outputs
# =============================================================================

output "blackroad_systems_records" {
  value = {
    api      = cloudflare_record.api_systems.hostname
    core     = cloudflare_record.core_systems.hostname
    operator = cloudflare_record.operator_systems.hostname
    beacon   = cloudflare_record.beacon_systems.hostname
    prism    = cloudflare_record.prism_systems.hostname
    docs     = cloudflare_record.docs_systems.hostname
    console  = cloudflare_record.console_systems.hostname
    infra    = cloudflare_record.infra_systems.hostname
    archive  = cloudflare_record.archive_systems.hostname
    demo     = cloudflare_record.demo_systems.hostname
    research = cloudflare_record.research_systems.hostname
    finance  = cloudflare_record.finance_systems.hostname
    legal    = cloudflare_record.legal_systems.hostname
    devops   = cloudflare_record.devops_systems.hostname
    lab      = cloudflare_record.lab_systems.hostname
  }
  description = "All blackroad.systems DNS records"
}

output "blackroad_io_records" {
  value = {
    app     = cloudflare_record.app_io.hostname
    home    = cloudflare_record.home_io.hostname
    api     = cloudflare_record.api_io.hostname
    creator = cloudflare_record.creator_io.hostname
    os      = cloudflare_record.os_io.hostname
  }
  description = "All blackroad.io DNS records"
}
