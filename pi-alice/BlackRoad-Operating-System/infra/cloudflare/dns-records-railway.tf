# BlackRoad OS - Cloudflare DNS Configuration (Railway CNAMEs)
# Updated with actual Railway custom domain targets
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
# Railway custom domain CNAMEs - Updated 2025-11-29
# =============================================================================

# API Gateway
resource "cloudflare_record" "api_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "api"
  value   = "wghu19q0.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "API Gateway - blackroad-os-api-gateway"
}

# Core API
resource "cloudflare_record" "core_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "core"
  value   = "panyy677.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Core API - blackroad-os-core"
}

# Infrastructure
resource "cloudflare_record" "infra_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "infra"
  value   = "xmky2kqn.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Infrastructure - blackroad-os-infra"
}

# Documentation
resource "cloudflare_record" "docs_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "docs"
  value   = "xz8ar3k7.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Documentation - blackroad-os-docs"
}

# Console (Master)
resource "cloudflare_record" "console_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "console"
  value   = "alxh5zmf.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Console - blackroad-os-master"
}

# Demo
resource "cloudflare_record" "demo_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "demo"
  value   = "828zo5g8.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Demo - blackroad-os-demo"
}

# Archive
resource "cloudflare_record" "archive_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "archive"
  value   = "6339jp4b.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Archive - blackroad-os-archive"
}

# Research
resource "cloudflare_record" "research_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "research"
  value   = "3rlozcvl.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Research - blackroad-os-research"
}

# Finance Pack
resource "cloudflare_record" "finance_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "finance"
  value   = "70iyk36h.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Finance Pack - blackroad-os-pack-finance"
}

# Legal Pack
resource "cloudflare_record" "legal_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "legal"
  value   = "4zx90bq2.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Legal Pack - blackroad-os-pack-legal"
}

# Research Lab Pack
resource "cloudflare_record" "lab_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "lab"
  value   = "rf5v4b68.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Research Lab - blackroad-os-pack-research-lab"
}

# DevOps Pack
resource "cloudflare_record" "devops_systems" {
  zone_id = var.zone_id_blackroad_systems
  name    = "devops"
  value   = "gjsw3tvq.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "DevOps Pack - blackroad-os-pack-infra-devops"
}

# =============================================================================
# blackroad.io DNS Records (Consumer)
# =============================================================================

# Main App
resource "cloudflare_record" "app_io" {
  zone_id = var.zone_id_blackroad_io
  name    = "app"
  value   = "qydv7efz.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Main App - blackroad-os-web"
}

# Home/Landing
resource "cloudflare_record" "home_io" {
  zone_id = var.zone_id_blackroad_io
  name    = "home"
  value   = "e5zobwvo.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Home - blackroad-os-home"
}

# Public API
resource "cloudflare_record" "api_io" {
  zone_id = var.zone_id_blackroad_io
  name    = "api"
  value   = "ulwsu2c6.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Public API - blackroad-os-api"
}

# OS Interface
resource "cloudflare_record" "os_io" {
  zone_id = var.zone_id_blackroad_io
  name    = "os"
  value   = "ay7xf8lw.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "OS Interface - blackroad-os"
}

# Creator Studio
resource "cloudflare_record" "creator_io" {
  zone_id = var.zone_id_blackroad_io
  name    = "creator"
  value   = "z1imx63q.up.railway.app"
  type    = "CNAME"
  proxied = true
  comment = "Creator Studio - blackroad-os-pack-creator-studio"
}

# =============================================================================
# Outputs
# =============================================================================

output "blackroad_systems_records" {
  value = {
    api      = "api.blackroad.systems → ${cloudflare_record.api_systems.value}"
    core     = "core.blackroad.systems → ${cloudflare_record.core_systems.value}"
    infra    = "infra.blackroad.systems → ${cloudflare_record.infra_systems.value}"
    docs     = "docs.blackroad.systems → ${cloudflare_record.docs_systems.value}"
    console  = "console.blackroad.systems → ${cloudflare_record.console_systems.value}"
    demo     = "demo.blackroad.systems → ${cloudflare_record.demo_systems.value}"
    archive  = "archive.blackroad.systems → ${cloudflare_record.archive_systems.value}"
    research = "research.blackroad.systems → ${cloudflare_record.research_systems.value}"
    finance  = "finance.blackroad.systems → ${cloudflare_record.finance_systems.value}"
    legal    = "legal.blackroad.systems → ${cloudflare_record.legal_systems.value}"
    lab      = "lab.blackroad.systems → ${cloudflare_record.lab_systems.value}"
    devops   = "devops.blackroad.systems → ${cloudflare_record.devops_systems.value}"
  }
  description = "All blackroad.systems DNS records"
}

output "blackroad_io_records" {
  value = {
    app     = "app.blackroad.io → ${cloudflare_record.app_io.value}"
    home    = "home.blackroad.io → ${cloudflare_record.home_io.value}"
    api     = "api.blackroad.io → ${cloudflare_record.api_io.value}"
    os      = "os.blackroad.io → ${cloudflare_record.os_io.value}"
    creator = "creator.blackroad.io → ${cloudflare_record.creator_io.value}"
  }
  description = "All blackroad.io DNS records"
}
