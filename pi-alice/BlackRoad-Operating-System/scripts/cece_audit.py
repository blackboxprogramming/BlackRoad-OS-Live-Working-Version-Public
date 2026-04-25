#!/usr/bin/env python3
"""
CECE AUDIT - BlackRoad OS Complete System Audit
================================================

Cece checks EVERYTHING. No questions. No confirmations. Just truth.

This script performs a comprehensive audit of the entire BlackRoad OS
infrastructure, checking repos, configs, DNS, services, and integration points.

Usage:
    python scripts/cece_audit.py

Output:
    Full audit report printed to stdout
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum


class Severity(Enum):
    """Issue severity levels"""
    CRITICAL = "🔴 CRITICAL"
    ERROR = "🟠 ERROR"
    WARNING = "🟡 WARNING"
    INFO = "🔵 INFO"
    SUCCESS = "🟢 SUCCESS"


@dataclass
class Issue:
    """Represents an audit finding"""
    severity: Severity
    category: str
    message: str
    location: str = ""
    fix: str = ""


@dataclass
class AuditReport:
    """Complete audit report"""
    issues: List[Issue] = field(default_factory=list)
    stats: Dict[str, Any] = field(default_factory=dict)

    def add_issue(self, severity: Severity, category: str, message: str,
                  location: str = "", fix: str = ""):
        """Add an issue to the report"""
        self.issues.append(Issue(severity, category, message, location, fix))

    def add_success(self, category: str, message: str):
        """Add a success finding"""
        self.add_issue(Severity.SUCCESS, category, message)

    def get_summary(self) -> Dict[str, int]:
        """Get summary counts by severity"""
        summary = {
            "CRITICAL": 0,
            "ERROR": 0,
            "WARNING": 0,
            "INFO": 0,
            "SUCCESS": 0
        }
        for issue in self.issues:
            severity_name = issue.severity.name
            summary[severity_name] += 1
        return summary


class CeceAuditor:
    """Cece's comprehensive BlackRoad OS auditor"""

    def __init__(self, repo_root: Path):
        self.repo_root = repo_root
        self.report = AuditReport()

        # Expected directory structure
        self.expected_dirs = [
            "backend",
            "agents",
            "sdk",
            "kernel",
            "prompts",
            "templates",
            "docs",
            "infra",
            "ops",
            "scripts",
            ".github/workflows"
        ]

        # Expected key files
        self.expected_files = [
            "README.md",
            "CLAUDE.md",
            "INFRASTRUCTURE.md",
            "SYSCALL_API.md",
            "railway.toml",
            "backend/requirements.txt",
            "backend/app/main.py",
            "backend/Dockerfile",
            "kernel/typescript/package.json",
            "infra/DNS.md"
        ]

        # Service registry (from INFRASTRUCTURE.md)
        self.expected_services = {
            "operator": "operator.blackroad.systems",
            "core": "core.blackroad.systems",
            "api": "api.blackroad.systems",
            "console": "console.blackroad.systems",
            "docs": "docs.blackroad.systems",
            "web": "web.blackroad.systems",
            "os": "os.blackroad.systems",
            "app": "app.blackroad.systems"
        }

    def run_full_audit(self) -> AuditReport:
        """Run complete audit"""
        print("🔍 CECE AUDIT - BlackRoad OS Complete System Check")
        print("=" * 80)
        print()

        # 1. Repository structure
        print("📁 Checking repository structure...")
        self._audit_repo_structure()

        # 2. Service definitions
        print("🔧 Checking service definitions...")
        self._audit_services()

        # 3. DNS mappings
        print("🌐 Checking DNS configuration...")
        self._audit_dns()

        # 4. Infrastructure configs
        print("⚙️  Checking infrastructure configs...")
        self._audit_infrastructure()

        # 5. Kernel integration
        print("🧠 Checking kernel integration...")
        self._audit_kernel()

        # 6. GitHub workflows
        print("🔄 Checking GitHub workflows...")
        self._audit_workflows()

        # 7. Backend configuration
        print("🖥️  Checking backend configuration...")
        self._audit_backend()

        # 8. Frontend structure
        print("🎨 Checking frontend structure...")
        self._audit_frontend()

        # 9. Documentation
        print("📚 Checking documentation...")
        self._audit_documentation()

        # 10. Cross-references
        print("🔗 Checking cross-references...")
        self._audit_cross_references()

        print()
        print("✅ Audit complete!")
        print()

        return self.report

    def _audit_repo_structure(self):
        """Check repository directory structure"""
        for dir_path in self.expected_dirs:
            full_path = self.repo_root / dir_path
            if full_path.exists():
                self.report.add_success("repo_structure",
                                       f"Directory exists: {dir_path}")
            else:
                self.report.add_issue(
                    Severity.ERROR,
                    "repo_structure",
                    f"Missing expected directory: {dir_path}",
                    location=str(full_path),
                    fix=f"mkdir -p {full_path}"
                )

        for file_path in self.expected_files:
            full_path = self.repo_root / file_path
            if full_path.exists():
                self.report.add_success("repo_structure",
                                       f"File exists: {file_path}")
            else:
                self.report.add_issue(
                    Severity.WARNING,
                    "repo_structure",
                    f"Missing expected file: {file_path}",
                    location=str(full_path),
                    fix=f"Create file: {file_path}"
                )

    def _audit_services(self):
        """Check service definitions and registry"""
        # Check kernel service registry
        service_registry_path = self.repo_root / "kernel/typescript/serviceRegistry.ts"

        if not service_registry_path.exists():
            self.report.add_issue(
                Severity.CRITICAL,
                "services",
                "Service registry file missing",
                location=str(service_registry_path),
                fix="Create kernel/typescript/serviceRegistry.ts"
            )
            return

        # Read and parse service registry
        content = service_registry_path.read_text()

        for service_name, expected_domain in self.expected_services.items():
            if service_name in content:
                self.report.add_success("services",
                                       f"Service '{service_name}' found in registry")
            else:
                self.report.add_issue(
                    Severity.WARNING,
                    "services",
                    f"Service '{service_name}' not found in registry",
                    location=str(service_registry_path),
                    fix=f"Add '{service_name}' to service registry"
                )

            if expected_domain in content:
                self.report.add_success("services",
                                       f"DNS '{expected_domain}' found in registry")
            else:
                self.report.add_issue(
                    Severity.WARNING,
                    "services",
                    f"DNS '{expected_domain}' not found in registry",
                    location=str(service_registry_path),
                    fix=f"Add DNS mapping for {service_name}"
                )

    def _audit_dns(self):
        """Check DNS configuration"""
        dns_md_path = self.repo_root / "infra/DNS.md"

        if not dns_md_path.exists():
            self.report.add_issue(
                Severity.CRITICAL,
                "dns",
                "DNS configuration file missing",
                location=str(dns_md_path),
                fix="Create infra/DNS.md with DNS mappings"
            )
            return

        content = dns_md_path.read_text()

        # Check for each expected service domain
        for service_name, domain in self.expected_services.items():
            if domain in content:
                self.report.add_success("dns",
                                       f"DNS entry found for {service_name}: {domain}")
            else:
                self.report.add_issue(
                    Severity.WARNING,
                    "dns",
                    f"DNS entry missing for {service_name}: {domain}",
                    location=str(dns_md_path),
                    fix=f"Add CNAME record: {domain}"
                )

        # Check for critical DNS records
        critical_records = ["MX", "SPF", "DKIM", "DMARC"]
        for record_type in critical_records:
            if record_type in content:
                self.report.add_success("dns",
                                       f"{record_type} record documented")
            else:
                self.report.add_issue(
                    Severity.INFO,
                    "dns",
                    f"{record_type} record not documented",
                    location=str(dns_md_path),
                    fix=f"Document {record_type} configuration"
                )

    def _audit_infrastructure(self):
        """Check infrastructure configuration files"""
        # Check railway.toml
        railway_toml = self.repo_root / "railway.toml"
        if railway_toml.exists():
            self.report.add_success("infrastructure",
                                   "railway.toml exists")
            content = railway_toml.read_text()

            # Check for critical sections
            if "[build]" in content:
                self.report.add_success("infrastructure",
                                       "railway.toml has [build] section")
            else:
                self.report.add_issue(
                    Severity.WARNING,
                    "infrastructure",
                    "railway.toml missing [build] section",
                    location=str(railway_toml)
                )

            if "[deploy]" in content:
                self.report.add_success("infrastructure",
                                       "railway.toml has [deploy] section")
            else:
                self.report.add_issue(
                    Severity.WARNING,
                    "infrastructure",
                    "railway.toml missing [deploy] section",
                    location=str(railway_toml)
                )
        else:
            self.report.add_issue(
                Severity.WARNING,
                "infrastructure",
                "railway.toml missing",
                location=str(railway_toml),
                fix="Create railway.toml with deployment configuration"
            )

        # Check INFRASTRUCTURE.md
        infra_md = self.repo_root / "INFRASTRUCTURE.md"
        if infra_md.exists():
            self.report.add_success("infrastructure",
                                   "INFRASTRUCTURE.md exists")
        else:
            self.report.add_issue(
                Severity.ERROR,
                "infrastructure",
                "INFRASTRUCTURE.md missing",
                location=str(infra_md),
                fix="Create INFRASTRUCTURE.md documenting architecture"
            )

    def _audit_kernel(self):
        """Check kernel integration"""
        kernel_dir = self.repo_root / "kernel/typescript"

        if not kernel_dir.exists():
            self.report.add_issue(
                Severity.CRITICAL,
                "kernel",
                "Kernel directory missing",
                location=str(kernel_dir),
                fix="Create kernel/typescript/ directory"
            )
            return

        # Expected kernel files
        kernel_files = [
            "index.ts",
            "types.ts",
            "serviceRegistry.ts",
            "identity.ts",
            "config.ts",
            "logger.ts",
            "rpc.ts",
            "events.ts",
            "jobs.ts",
            "state.ts",
            "package.json",
            "README.md"
        ]

        for filename in kernel_files:
            file_path = kernel_dir / filename
            if file_path.exists():
                self.report.add_success("kernel",
                                       f"Kernel file exists: {filename}")
            else:
                self.report.add_issue(
                    Severity.WARNING,
                    "kernel",
                    f"Kernel file missing: {filename}",
                    location=str(file_path),
                    fix=f"Create {file_path}"
                )

        # Check syscall API spec
        syscall_api = self.repo_root / "SYSCALL_API.md"
        if syscall_api.exists():
            self.report.add_success("kernel",
                                   "SYSCALL_API.md exists")
        else:
            self.report.add_issue(
                Severity.ERROR,
                "kernel",
                "SYSCALL_API.md missing",
                location=str(syscall_api),
                fix="Create SYSCALL_API.md documenting syscall interface"
            )

    def _audit_workflows(self):
        """Check GitHub workflows"""
        workflows_dir = self.repo_root / ".github/workflows"

        if not workflows_dir.exists():
            self.report.add_issue(
                Severity.WARNING,
                "workflows",
                "GitHub workflows directory missing",
                location=str(workflows_dir),
                fix="mkdir -p .github/workflows"
            )
            return

        # Expected workflows
        expected_workflows = [
            "ci.yml",
            "backend-tests.yml",
            "deploy.yml",
            "railway-deploy.yml"
        ]

        for workflow_file in expected_workflows:
            file_path = workflows_dir / workflow_file
            if file_path.exists():
                self.report.add_success("workflows",
                                       f"Workflow exists: {workflow_file}")
            else:
                self.report.add_issue(
                    Severity.INFO,
                    "workflows",
                    f"Workflow missing: {workflow_file}",
                    location=str(file_path),
                    fix=f"Create workflow: {workflow_file}"
                )

        # Check templates
        templates_dir = self.repo_root / "templates/github-workflows"
        if templates_dir.exists():
            self.report.add_success("workflows",
                                   "Workflow templates directory exists")
        else:
            self.report.add_issue(
                Severity.INFO,
                "workflows",
                "Workflow templates directory missing",
                location=str(templates_dir),
                fix="mkdir -p templates/github-workflows"
            )

    def _audit_backend(self):
        """Check backend configuration"""
        backend_dir = self.repo_root / "backend"

        if not backend_dir.exists():
            self.report.add_issue(
                Severity.CRITICAL,
                "backend",
                "Backend directory missing",
                location=str(backend_dir),
                fix="mkdir -p backend"
            )
            return

        # Check critical backend files
        critical_files = [
            "app/main.py",
            "app/config.py",
            "app/database.py",
            "requirements.txt",
            "Dockerfile",
            "docker-compose.yml",
            ".env.example"
        ]

        for filename in critical_files:
            file_path = backend_dir / filename
            if file_path.exists():
                self.report.add_success("backend",
                                       f"Backend file exists: {filename}")
            else:
                severity = Severity.CRITICAL if filename in ["app/main.py", "requirements.txt"] else Severity.WARNING
                self.report.add_issue(
                    severity,
                    "backend",
                    f"Backend file missing: {filename}",
                    location=str(file_path),
                    fix=f"Create {file_path}"
                )

        # Check requirements.txt
        requirements_path = backend_dir / "requirements.txt"
        if requirements_path.exists():
            content = requirements_path.read_text()
            critical_deps = ["fastapi", "uvicorn", "sqlalchemy", "pydantic"]

            for dep in critical_deps:
                if dep in content.lower():
                    self.report.add_success("backend",
                                           f"Dependency found: {dep}")
                else:
                    self.report.add_issue(
                        Severity.ERROR,
                        "backend",
                        f"Critical dependency missing: {dep}",
                        location=str(requirements_path),
                        fix=f"Add {dep} to requirements.txt"
                    )

    def _audit_frontend(self):
        """Check frontend structure"""
        # Canonical frontend location
        frontend_dir = self.repo_root / "backend/static"

        if not frontend_dir.exists():
            self.report.add_issue(
                Severity.CRITICAL,
                "frontend",
                "Frontend directory missing (backend/static)",
                location=str(frontend_dir),
                fix="mkdir -p backend/static"
            )
            return

        # Check critical frontend files
        critical_files = [
            "index.html",
            "js/os.js",
            "js/components.js",
            "js/registry.js"
        ]

        for filename in critical_files:
            file_path = frontend_dir / filename
            if file_path.exists():
                self.report.add_success("frontend",
                                       f"Frontend file exists: {filename}")
            else:
                self.report.add_issue(
                    Severity.ERROR,
                    "frontend",
                    f"Frontend file missing: {filename}",
                    location=str(file_path),
                    fix=f"Create {file_path}"
                )

        # Check for legacy frontend duplication
        legacy_frontend = self.repo_root / "blackroad-os/index.html"
        if legacy_frontend.exists():
            self.report.add_issue(
                Severity.WARNING,
                "frontend",
                "Legacy frontend detected (blackroad-os/)",
                location=str(legacy_frontend),
                fix="Consider removing blackroad-os/ directory to avoid duplication"
            )

    def _audit_documentation(self):
        """Check documentation completeness"""
        # Critical documentation files
        critical_docs = [
            "README.md",
            "CLAUDE.md",
            "INFRASTRUCTURE.md",
            "SYSCALL_API.md"
        ]

        for doc_file in critical_docs:
            file_path = self.repo_root / doc_file
            if file_path.exists():
                self.report.add_success("documentation",
                                       f"Documentation exists: {doc_file}")

                # Check file size (should have substantial content)
                size = file_path.stat().st_size
                if size < 1000:
                    self.report.add_issue(
                        Severity.WARNING,
                        "documentation",
                        f"Documentation may be incomplete (< 1KB): {doc_file}",
                        location=str(file_path),
                        fix=f"Expand documentation in {doc_file}"
                    )
            else:
                severity = Severity.CRITICAL if doc_file == "README.md" else Severity.ERROR
                self.report.add_issue(
                    severity,
                    "documentation",
                    f"Documentation missing: {doc_file}",
                    location=str(file_path),
                    fix=f"Create {doc_file}"
                )

    def _audit_cross_references(self):
        """Check cross-references and consistency"""
        # Check for monorepo mention in configs (should NOT deploy monorepo)
        railway_toml = self.repo_root / "railway.toml"
        if railway_toml.exists():
            content = railway_toml.read_text()
            if "BlackRoad-Operating-System" in content:
                self.report.add_issue(
                    Severity.WARNING,
                    "cross_references",
                    "Monorepo name found in railway.toml (ensure this is for local testing only)",
                    location=str(railway_toml),
                    fix="Verify railway.toml is marked for local development"
                )

        # Check service registry matches DNS.md
        service_registry = self.repo_root / "kernel/typescript/serviceRegistry.ts"
        dns_md = self.repo_root / "infra/DNS.md"

        if service_registry.exists() and dns_md.exists():
            registry_content = service_registry.read_text()
            dns_content = dns_md.read_text()

            # Extract domains from both
            for service_name, domain in self.expected_services.items():
                in_registry = domain in registry_content
                in_dns = domain in dns_content

                if in_registry and in_dns:
                    self.report.add_success("cross_references",
                                           f"Service '{service_name}' consistent across registry and DNS")
                elif in_registry and not in_dns:
                    self.report.add_issue(
                        Severity.WARNING,
                        "cross_references",
                        f"Service '{service_name}' in registry but not in DNS.md",
                        location=str(dns_md),
                        fix=f"Add DNS entry for {domain}"
                    )
                elif not in_registry and in_dns:
                    self.report.add_issue(
                        Severity.WARNING,
                        "cross_references",
                        f"Service '{service_name}' in DNS.md but not in registry",
                        location=str(service_registry),
                        fix=f"Add service registry entry for {service_name}"
                    )

    def print_report(self):
        """Print formatted audit report"""
        print()
        print("=" * 80)
        print("🎯 CECE AUDIT REPORT - BlackRoad OS")
        print("=" * 80)
        print()

        # Summary
        summary = self.report.get_summary()
        print("📊 SUMMARY")
        print("-" * 80)
        print(f"  🔴 CRITICAL: {summary['CRITICAL']}")
        print(f"  🟠 ERROR:    {summary['ERROR']}")
        print(f"  🟡 WARNING:  {summary['WARNING']}")
        print(f"  🔵 INFO:     {summary['INFO']}")
        print(f"  🟢 SUCCESS:  {summary['SUCCESS']}")
        print()

        # Group issues by category
        categories = {}
        for issue in self.report.issues:
            if issue.category not in categories:
                categories[issue.category] = []
            categories[issue.category].append(issue)

        # Print issues by category
        for category, issues in sorted(categories.items()):
            print(f"📂 {category.upper()}")
            print("-" * 80)

            # Group by severity within category
            by_severity = {
                Severity.CRITICAL: [],
                Severity.ERROR: [],
                Severity.WARNING: [],
                Severity.INFO: [],
                Severity.SUCCESS: []
            }

            for issue in issues:
                by_severity[issue.severity].append(issue)

            # Print in severity order
            for severity in [Severity.CRITICAL, Severity.ERROR, Severity.WARNING, Severity.INFO, Severity.SUCCESS]:
                for issue in by_severity[severity]:
                    print(f"  {issue.severity.value} {issue.message}")
                    if issue.location:
                        print(f"      Location: {issue.location}")
                    if issue.fix:
                        print(f"      Fix: {issue.fix}")

            print()

        # Final recommendations
        print("=" * 80)
        print("💡 RECOMMENDATIONS")
        print("=" * 80)

        if summary['CRITICAL'] > 0:
            print("  ⚠️  Address CRITICAL issues immediately - these block deployment")

        if summary['ERROR'] > 0:
            print("  ⚠️  Fix ERROR issues - these will cause runtime problems")

        if summary['WARNING'] > 0:
            print("  ℹ️  Review WARNING issues - these may cause issues later")

        if summary['CRITICAL'] == 0 and summary['ERROR'] == 0:
            print("  ✅ No blocking issues found!")
            print("  ✅ System is in good shape for deployment")

        print()
        print("=" * 80)
        print("🎯 SINGLE SOURCE OF TRUTH")
        print("=" * 80)
        print()
        print("  📍 Canonical frontend: backend/static/index.html")
        print("  📍 Canonical backend: backend/app/main.py")
        print("  📍 Service registry: kernel/typescript/serviceRegistry.ts")
        print("  📍 DNS mapping: infra/DNS.md")
        print("  📍 Infrastructure docs: INFRASTRUCTURE.md")
        print("  📍 Syscall spec: SYSCALL_API.md")
        print()
        print("=" * 80)
        print("🚀 MINIMAL SET TO RUN THE OS")
        print("=" * 80)
        print()
        print("  1. backend/app/main.py (FastAPI app)")
        print("  2. backend/static/index.html (OS UI)")
        print("  3. backend/requirements.txt (dependencies)")
        print("  4. backend/.env (configuration)")
        print("  5. Railway deployment of core service")
        print("  6. DNS CNAME: os.blackroad.systems → Railway URL")
        print()
        print("  Quick start:")
        print("    cd backend")
        print("    pip install -r requirements.txt")
        print("    cp .env.example .env")
        print("    uvicorn app.main:app --reload")
        print("    # Visit http://localhost:8000/")
        print()
        print("=" * 80)
        print()


def main():
    """Main entry point"""
    repo_root = Path(__file__).parent.parent

    auditor = CeceAuditor(repo_root)
    auditor.run_full_audit()
    auditor.print_report()


if __name__ == "__main__":
    main()
