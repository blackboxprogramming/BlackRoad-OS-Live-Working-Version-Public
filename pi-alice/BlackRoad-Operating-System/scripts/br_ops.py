#!/usr/bin/env python3
"""
BlackRoad OS Operations CLI (br-ops)

Central command-line tool for managing all BlackRoad services from the control plane.
Reads from infra/blackroad-manifest.yml to provide unified operations across all repos.

Usage:
    python scripts/br_ops.py list
    python scripts/br_ops.py env blackroad-backend
    python scripts/br_ops.py repo blackroad-backend
    python scripts/br_ops.py status
    python scripts/br_ops.py open blackroad-backend prod
    python scripts/br_ops.py health blackroad-backend

Author: Atlas (AI Infrastructure Orchestrator)
Version: 1.0.0
Date: 2025-11-19
"""

import sys
import os
import yaml
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime


class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


class BlackRoadOps:
    """Main operations CLI class"""

    def __init__(self):
        self.repo_root = Path(__file__).parent.parent
        self.manifest_path = self.repo_root / "infra" / "blackroad-manifest.yml"
        self.manifest = self._load_manifest()

    def _load_manifest(self) -> Dict[str, Any]:
        """Load the service manifest YAML"""
        if not self.manifest_path.exists():
            self._error(f"Manifest not found: {self.manifest_path}")
            sys.exit(1)

        with open(self.manifest_path, 'r') as f:
            return yaml.safe_load(f)

    def _print(self, message: str, color: str = ""):
        """Print colored message"""
        if color:
            print(f"{color}{message}{Colors.ENDC}")
        else:
            print(message)

    def _error(self, message: str):
        """Print error message"""
        self._print(f"❌ ERROR: {message}", Colors.FAIL)

    def _success(self, message: str):
        """Print success message"""
        self._print(f"✅ {message}", Colors.OKGREEN)

    def _warning(self, message: str):
        """Print warning message"""
        self._print(f"⚠️  {message}", Colors.WARNING)

    def _header(self, message: str):
        """Print section header"""
        self._print(f"\n{'=' * 80}", Colors.BOLD)
        self._print(message, Colors.HEADER + Colors.BOLD)
        self._print('=' * 80, Colors.BOLD)

    def _get_all_services(self) -> Dict[str, Dict[str, Any]]:
        """Get all services from active and planned projects"""
        all_services = {}

        # Active projects
        for project_name, project_data in self.manifest.get('projects', {}).items():
            for service_name, service_data in project_data.get('services', {}).items():
                all_services[service_name] = {
                    **service_data,
                    'project': project_name,
                    'status': project_data.get('status', 'unknown'),
                    'phase': project_data.get('phase', 'unknown')
                }

        # Planned projects
        for project_name, project_data in self.manifest.get('planned_projects', {}).items():
            for service_name, service_data in project_data.get('services', {}).items():
                all_services[service_name] = {
                    **service_data,
                    'project': project_name,
                    'status': project_data.get('status', 'planned'),
                    'phase': project_data.get('phase', 'unknown'),
                    'target_date': project_data.get('target_date', 'TBD')
                }

        return all_services

    def cmd_list(self, args: List[str]):
        """List all services with their details"""
        self._header("BLACKROAD OS SERVICES")

        services = self._get_all_services()

        if not services:
            self._warning("No services found in manifest")
            return

        # Group by status
        active_services = {k: v for k, v in services.items() if v['status'] == 'active'}
        planned_services = {k: v for k, v in services.items() if v['status'] == 'planned'}
        dev_services = {k: v for k, v in services.items() if v['status'] == 'development'}

        # Active services
        if active_services:
            self._print("\n🟢 ACTIVE SERVICES", Colors.OKGREEN + Colors.BOLD)
            self._print("-" * 80)
            for name, data in active_services.items():
                kind = data.get('kind', 'unknown')
                repo = data.get('repo', 'N/A')
                domains = data.get('domains', {})
                prod_domain = domains.get('prod', 'N/A')

                self._print(f"\n  {Colors.BOLD}{name}{Colors.ENDC}")
                self._print(f"    Type:     {kind}")
                self._print(f"    Repo:     {repo}")
                self._print(f"    Domain:   {prod_domain}")
                self._print(f"    Project:  {data['project']}")
                self._print(f"    Phase:    {data['phase']}")

        # Development services
        if dev_services:
            self._print("\n🟡 DEVELOPMENT SERVICES", Colors.WARNING + Colors.BOLD)
            self._print("-" * 80)
            for name, data in dev_services.items():
                kind = data.get('kind', 'unknown')
                repo = data.get('repo', 'N/A')

                self._print(f"\n  {Colors.BOLD}{name}{Colors.ENDC}")
                self._print(f"    Type:     {kind}")
                self._print(f"    Repo:     {repo}")
                self._print(f"    Project:  {data['project']}")

        # Planned services
        if planned_services:
            self._print("\n📋 PLANNED SERVICES (Future)", Colors.OKCYAN + Colors.BOLD)
            self._print("-" * 80)
            for name, data in planned_services.items():
                kind = data.get('kind', 'unknown')
                repo = data.get('repo', 'N/A')
                target = data.get('target_date', 'TBD')

                self._print(f"\n  {Colors.BOLD}{name}{Colors.ENDC}")
                self._print(f"    Type:        {kind}")
                self._print(f"    Repo:        {repo}")
                self._print(f"    Target Date: {target}")
                self._print(f"    Project:     {data['project']}")

        # Summary
        self._print("\n" + "=" * 80)
        self._print(f"Total Services: {len(services)}", Colors.BOLD)
        self._print(f"  Active:       {len(active_services)}")
        self._print(f"  Development:  {len(dev_services)}")
        self._print(f"  Planned:      {len(planned_services)}")

    def cmd_env(self, args: List[str]):
        """Show required environment variables for a service"""
        if not args:
            self._error("Usage: br-ops env <service-name>")
            return

        service_name = args[0]
        services = self._get_all_services()

        if service_name not in services:
            self._error(f"Service not found: {service_name}")
            self._print("\nAvailable services:")
            for name in services.keys():
                self._print(f"  - {name}")
            return

        service = services[service_name]
        env_config = service.get('env', {})

        self._header(f"ENVIRONMENT VARIABLES: {service_name}")

        # Required variables
        required = env_config.get('required', [])
        if required:
            self._print("\n🔴 REQUIRED (Must Set)", Colors.FAIL + Colors.BOLD)
            self._print("-" * 80)
            for var in required:
                if isinstance(var, dict):
                    name = var.get('name')
                    desc = var.get('description', '')
                    example = var.get('example', '')
                    source = var.get('source', '')
                    generate = var.get('generate', '')
                    secret = var.get('secret', False)

                    self._print(f"\n  {Colors.BOLD}{name}{Colors.ENDC}")
                    if desc:
                        self._print(f"    Description: {desc}")
                    if source:
                        self._print(f"    Source:      {source}")
                    if example:
                        self._print(f"    Example:     {example}")
                    if generate:
                        self._print(f"    Generate:    {generate}", Colors.OKCYAN)
                    if secret:
                        self._print(f"    Secret:      Yes (keep secure!)", Colors.WARNING)

        # Important variables
        important = env_config.get('important', [])
        if important:
            self._print("\n🟡 IMPORTANT (Recommended)", Colors.WARNING + Colors.BOLD)
            self._print("-" * 80)
            for var in important:
                if isinstance(var, dict):
                    name = var.get('name')
                    desc = var.get('description', '')
                    default = var.get('default', '')

                    self._print(f"\n  {Colors.BOLD}{name}{Colors.ENDC}")
                    if desc:
                        self._print(f"    Description: {desc}")
                    if default:
                        self._print(f"    Default:     {default}")

        # Optional variables
        optional = env_config.get('optional', [])
        if optional:
            self._print("\n🟢 OPTIONAL (Features)", Colors.OKGREEN + Colors.BOLD)
            self._print("-" * 80)
            for var in optional:
                if isinstance(var, dict):
                    name = var.get('name')
                    desc = var.get('description', '')

                    self._print(f"\n  {Colors.BOLD}{name}{Colors.ENDC}")
                    if desc:
                        self._print(f"    Description: {desc}")

    def cmd_repo(self, args: List[str]):
        """Show repository information for a service"""
        if not args:
            self._error("Usage: br-ops repo <service-name>")
            return

        service_name = args[0]
        services = self._get_all_services()

        if service_name not in services:
            self._error(f"Service not found: {service_name}")
            return

        service = services[service_name]

        self._header(f"REPOSITORY INFO: {service_name}")

        repo = service.get('repo', 'N/A')
        branch = service.get('branch', 'main')
        kind = service.get('kind', 'unknown')
        language = service.get('language', 'N/A')
        framework = service.get('framework', 'N/A')

        self._print(f"\nRepository:  {repo}", Colors.BOLD)
        self._print(f"Branch:      {branch}")
        self._print(f"Type:        {kind}")
        self._print(f"Language:    {language}")
        self._print(f"Framework:   {framework}")

        # Git URLs
        if repo != 'N/A':
            self._print(f"\nGit URLs:", Colors.BOLD)
            self._print(f"  HTTPS: https://github.com/{repo}.git")
            self._print(f"  SSH:   git@github.com:{repo}.git")

    def cmd_open(self, args: List[str]):
        """Print Railway dashboard URL for a service"""
        if not args:
            self._error("Usage: br-ops open <service-name> [env]")
            self._print("  env: prod (default), staging, dev")
            return

        service_name = args[0]
        env = args[1] if len(args) > 1 else 'prod'

        services = self._get_all_services()

        if service_name not in services:
            self._error(f"Service not found: {service_name}")
            return

        service = services[service_name]
        domains = service.get('domains', {})
        domain = domains.get(env)

        if not domain:
            self._error(f"No {env} domain configured for {service_name}")
            return

        self._header(f"SERVICE URL: {service_name} ({env})")
        self._print(f"\n🌐 {Colors.BOLD}https://{domain}{Colors.ENDC}\n")

        # Also print Railway info
        self._print("Railway Dashboard:", Colors.BOLD)
        self._print("  Visit https://railway.app/ and select your project")
        self._print(f"  Service: {service_name}")

    def cmd_status(self, args: List[str]):
        """Show status of all services"""
        self._header("SERVICE STATUS")

        services = self._get_all_services()
        active_count = sum(1 for s in services.values() if s['status'] == 'active')
        planned_count = sum(1 for s in services.values() if s['status'] == 'planned')
        dev_count = sum(1 for s in services.values() if s['status'] == 'development')

        self._print(f"\nTotal Services:     {len(services)}", Colors.BOLD)
        self._print(f"  🟢 Active:        {active_count}")
        self._print(f"  🟡 Development:   {dev_count}")
        self._print(f"  📋 Planned:       {planned_count}")

        # Deployment state
        state = self.manifest.get('deployment_state', {})
        self._print(f"\nDeployment Phase:   {state.get('phase', 'unknown')}", Colors.BOLD)
        self._print(f"Strategy:           {state.get('strategy', 'unknown')}")
        self._print(f"Active Services:    {state.get('active_services', 'unknown')}")
        self._print(f"Target Phase:       {state.get('target_phase', 'unknown')}")

        # Instructions for health checks
        self._print("\n" + "=" * 80)
        self._print("Health Check Commands:", Colors.BOLD)
        self._print("  curl https://blackroad.systems/health")
        self._print("  curl https://blackroad.systems/api/health/summary")

    def cmd_health(self, args: List[str]):
        """Show health check instructions for a service"""
        if not args:
            self._error("Usage: br-ops health <service-name>")
            return

        service_name = args[0]
        services = self._get_all_services()

        if service_name not in services:
            self._error(f"Service not found: {service_name}")
            return

        service = services[service_name]
        domains = service.get('domains', {})
        prod_domain = domains.get('prod')
        entrypoints = service.get('entrypoints', [])

        self._header(f"HEALTH CHECKS: {service_name}")

        if not prod_domain:
            self._warning("No production domain configured")
            return

        self._print(f"\nProduction Domain: https://{prod_domain}\n", Colors.BOLD)

        if entrypoints:
            self._print("Health Endpoints:", Colors.BOLD)
            for endpoint in entrypoints:
                if isinstance(endpoint, dict):
                    path = endpoint.get('path')
                    method = endpoint.get('method', 'GET')
                    desc = endpoint.get('description', '')
                    self._print(f"\n  {method} {path}")
                    if desc:
                        self._print(f"    {desc}")
                    self._print(f"    curl https://{prod_domain}{path}", Colors.OKCYAN)
                else:
                    self._print(f"\n  GET {endpoint}")
                    self._print(f"    curl https://{prod_domain}{endpoint}", Colors.OKCYAN)

    def cmd_help(self, args: List[str]):
        """Show help message"""
        self._header("BLACKROAD OS OPERATIONS CLI")

        self._print("\nManage all BlackRoad services from the control plane.\n")
        self._print("Usage:", Colors.BOLD)
        self._print("  python scripts/br_ops.py <command> [args]\n")

        self._print("Commands:", Colors.BOLD)
        self._print("  list              List all services")
        self._print("  env <service>     Show environment variables for service")
        self._print("  repo <service>    Show repository info for service")
        self._print("  open <service>    Show service URL")
        self._print("  status            Show overall status")
        self._print("  health <service>  Show health check commands")
        self._print("  help              Show this help message")

        self._print("\nExamples:", Colors.BOLD)
        self._print("  python scripts/br_ops.py list")
        self._print("  python scripts/br_ops.py env blackroad-backend")
        self._print("  python scripts/br_ops.py repo blackroad-backend")
        self._print("  python scripts/br_ops.py open blackroad-backend prod")
        self._print("  python scripts/br_ops.py health blackroad-backend")

        self._print("\nNote:", Colors.WARNING)
        self._print("  This tool reads from infra/blackroad-manifest.yml")
        self._print("  For actual deployment operations, use Railway CLI or GitHub Actions")

    def run(self):
        """Main entry point"""
        if len(sys.argv) < 2:
            self.cmd_help([])
            return

        command = sys.argv[1]
        args = sys.argv[2:]

        commands = {
            'list': self.cmd_list,
            'env': self.cmd_env,
            'repo': self.cmd_repo,
            'open': self.cmd_open,
            'status': self.cmd_status,
            'health': self.cmd_health,
            'help': self.cmd_help,
        }

        if command not in commands:
            self._error(f"Unknown command: {command}")
            self._print("\nRun 'python scripts/br_ops.py help' for usage")
            sys.exit(1)

        try:
            commands[command](args)
        except Exception as e:
            self._error(f"Command failed: {str(e)}")
            import traceback
            traceback.print_exc()
            sys.exit(1)


if __name__ == '__main__':
    cli = BlackRoadOps()
    cli.run()
