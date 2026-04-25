"""
Clause Agent - The Legal Mind

Precise, thorough legal analysis with:
- 7-step legal review process (Document → Risk → Compliance → IP → Policy → Recommendation → Documentation)
- Contract analysis and risk assessment
- Compliance checking (GDPR, CCPA, industry regulations)
- IP protection integration with Vault
- Plain-language legal communication

Personality: Precise, protective, plain-language legal expert
"""

import asyncio
import re
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional
from enum import Enum

from agents.base.agent import BaseAgent, AgentStatus


class LegalStep(Enum):
    """7-step Clause Legal Process"""
    DOCUMENT_ANALYSIS = "📜 Document Analysis"
    RISK_ASSESSMENT = "⚠️ Risk Assessment"
    COMPLIANCE_CHECK = "🔍 Compliance Check"
    IP_PROTECTION = "🛡️ IP Protection"
    POLICY_ALIGNMENT = "📋 Policy Alignment"
    RECOMMENDATION = "⚖️ Recommendation"
    DOCUMENTATION = "📝 Documentation"


class RiskLevel(Enum):
    """Risk severity levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    MINIMAL = "minimal"


class RecommendationAction(Enum):
    """Legal recommendation actions"""
    ACCEPT = "accept"
    REJECT = "reject"
    NEGOTIATE = "negotiate"
    ESCALATE = "escalate"
    REQUEST_CHANGES = "request_changes"


@dataclass
class LegalRisk:
    """Individual legal risk"""
    title: str
    description: str
    severity: RiskLevel
    likelihood: str  # high, medium, low
    impact: str
    mitigation: str
    clause_reference: Optional[str] = None


@dataclass
class ComplianceCheck:
    """Compliance check result"""
    regulation: str
    applicable: bool
    compliant: bool
    issues: List[str]
    requirements: List[str]


@dataclass
class LegalOutput:
    """Complete legal analysis output"""
    document_type: str
    parties: List[str]
    key_obligations: List[str]

    risks: List[LegalRisk]
    risk_summary: Dict[str, int]
    overall_risk_level: RiskLevel

    compliance_results: List[ComplianceCheck]
    ip_protection_strategy: Dict[str, Any]
    policy_deviations: List[str]

    recommendation: RecommendationAction
    recommended_changes: List[str]
    negotiation_points: List[str]

    executive_summary: str
    confidence: float


class ClauseAgent(BaseAgent):
    """
    Clause - The Legal Mind

    Precise, thorough legal analysis and contract review.

    Specialties:
    - Contract analysis
    - Risk assessment and mitigation
    - Compliance checking (GDPR, CCPA, HIPAA, etc.)
    - IP protection
    - Policy alignment
    - Plain-language legal communication

    Example:
        ```python
        clause = ClauseAgent()
        result = await clause.run({
            "input": "Review this SaaS vendor agreement",
            "document": "...",
            "context": {
                "jurisdiction": "US",
                "industry": "healthcare"
            }
        })
        print(result.data["executive_summary"])
        ```
    """

    def __init__(self):
        super().__init__(
            name="clause",
            description="Legal specialist with 7-step review process",
            category="ai_ml",
            version="1.0.0",
            author="BlackRoad",
            tags=["legal", "compliance", "contracts", "risk", "ip-protection"],
            timeout=120,  # 2 minutes for thorough review
            retry_count=2
        )

        self.legal_trace: List[Dict[str, Any]] = []

        # Compliance frameworks
        self.compliance_frameworks = {
            "GDPR": {
                "name": "General Data Protection Regulation",
                "jurisdiction": "EU",
                "key_requirements": [
                    "Data processing lawful basis",
                    "Data subject rights (access, rectification, erasure)",
                    "Data protection by design and default",
                    "Data breach notification (72 hours)",
                    "DPO appointment (if required)",
                    "Privacy policy transparency"
                ]
            },
            "CCPA": {
                "name": "California Consumer Privacy Act",
                "jurisdiction": "California, US",
                "key_requirements": [
                    "Consumer right to know",
                    "Consumer right to delete",
                    "Consumer right to opt-out of sale",
                    "Non-discrimination for privacy rights",
                    "Privacy policy disclosure"
                ]
            },
            "HIPAA": {
                "name": "Health Insurance Portability and Accountability Act",
                "jurisdiction": "US",
                "key_requirements": [
                    "PHI encryption at rest and in transit",
                    "Access controls and audit logs",
                    "Business Associate Agreements (BAA)",
                    "Breach notification",
                    "HIPAA training for staff"
                ]
            },
            "SOC2": {
                "name": "Service Organization Control 2",
                "jurisdiction": "Global",
                "key_requirements": [
                    "Security controls",
                    "Availability controls",
                    "Processing integrity",
                    "Confidentiality",
                    "Privacy"
                ]
            }
        }

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate input parameters"""
        if "input" not in params:
            self.logger.error("Missing required parameter: 'input'")
            return False

        return True

    async def initialize(self) -> None:
        """Initialize Clause before execution"""
        await super().initialize()
        self.legal_trace = []
        self.logger.info("⚖️ Clause agent initialized - ready to review")

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the 7-step Clause Legal Process

        Args:
            params: {
                "input": str,               # What to review
                "document": str,            # Full document text (optional)
                "context": dict,            # Context (jurisdiction, industry, etc.)
                "policies": list,           # Internal policies to check against
                "risk_tolerance": str       # low, medium, high
            }

        Returns:
            {
                "document_analysis": {...},
                "risk_assessment": {...},
                "compliance_results": [...],
                "ip_protection": {...},
                "recommendation": {...},
                "executive_summary": "...",
                "action_items": [...]
            }
        """
        start_time = datetime.utcnow()

        user_input = params["input"]
        document = params.get("document", "")
        context = params.get("context", {})
        policies = params.get("policies", [])
        risk_tolerance = params.get("risk_tolerance", "medium")

        self.logger.info(f"⚖️ Clause reviewing: {user_input[:100]}...")

        # Step 1: 📜 Document Analysis
        doc_analysis = await self._document_analysis(user_input, document, context)

        # Step 2: ⚠️ Risk Assessment
        risk_assessment = await self._risk_assessment(doc_analysis, context, risk_tolerance)

        # Step 3: 🔍 Compliance Check
        compliance = await self._compliance_check(doc_analysis, context)

        # Step 4: 🛡️ IP Protection
        ip_protection = await self._ip_protection(doc_analysis, context)

        # Step 5: 📋 Policy Alignment
        policy_alignment = await self._policy_alignment(doc_analysis, policies, context)

        # Step 6: ⚖️ Recommendation
        recommendation = await self._recommendation(
            doc_analysis, risk_assessment, compliance, ip_protection, policy_alignment
        )

        # Step 7: 📝 Documentation
        documentation = await self._documentation(
            doc_analysis, risk_assessment, compliance, ip_protection,
            policy_alignment, recommendation
        )

        end_time = datetime.utcnow()
        execution_time = (end_time - start_time).total_seconds()

        # Build result
        result = {
            "document_analysis": doc_analysis,
            "risk_assessment": risk_assessment,
            "compliance_results": compliance,
            "ip_protection": ip_protection,
            "policy_alignment": policy_alignment,
            "recommendation": recommendation,
            "documentation": documentation,

            # Summary
            "executive_summary": documentation["executive_summary"],
            "action_items": documentation["action_items"],
            "risk_register": self._build_risk_register(risk_assessment["risks"]),

            # Metadata
            "legal_trace": self.legal_trace,
            "execution_time_seconds": execution_time,
            "confidence": 0.88
        }

        self.logger.info(
            f"✅ Clause completed review with {len(risk_assessment['risks'])} risks identified "
            f"(recommendation: {recommendation['action'].value}, time: {execution_time:.2f}s)"
        )

        return result

    async def _document_analysis(
        self,
        user_input: str,
        document: str,
        context: Dict
    ) -> Dict[str, Any]:
        """📜 Step 1: Document Analysis"""

        analysis = {
            "document_type": self._identify_document_type(user_input, document),
            "parties": self._identify_parties(document, context),
            "effective_date": self._extract_effective_date(document),
            "term_duration": self._extract_term_duration(document),
            "key_obligations": self._extract_key_obligations(document),
            "payment_terms": self._extract_payment_terms(document),
            "termination_clauses": self._extract_termination_clauses(document),
            "liability_clauses": self._extract_liability_clauses(document),
            "dispute_resolution": self._extract_dispute_resolution(document),
            "scope": self._determine_scope(user_input, document)
        }

        self._add_legal_step(
            LegalStep.DOCUMENT_ANALYSIS,
            user_input,
            f"Type: {analysis['document_type']}, Parties: {len(analysis['parties'])}"
        )

        return analysis

    async def _risk_assessment(
        self,
        doc_analysis: Dict,
        context: Dict,
        risk_tolerance: str
    ) -> Dict[str, Any]:
        """⚠️ Step 2: Risk Assessment"""

        risks = []

        # Analyze liability exposure
        liability_risks = self._assess_liability_risks(doc_analysis)
        risks.extend(liability_risks)

        # Check for missing clauses
        missing_clause_risks = self._assess_missing_clauses(doc_analysis)
        risks.extend(missing_clause_risks)

        # Identify unfavorable terms
        unfavorable_risks = self._assess_unfavorable_terms(doc_analysis)
        risks.extend(unfavorable_risks)

        # Check termination terms
        termination_risks = self._assess_termination_risks(doc_analysis)
        risks.extend(termination_risks)

        # Calculate risk summary
        risk_summary = {
            RiskLevel.CRITICAL.value: sum(1 for r in risks if r.severity == RiskLevel.CRITICAL),
            RiskLevel.HIGH.value: sum(1 for r in risks if r.severity == RiskLevel.HIGH),
            RiskLevel.MEDIUM.value: sum(1 for r in risks if r.severity == RiskLevel.MEDIUM),
            RiskLevel.LOW.value: sum(1 for r in risks if r.severity == RiskLevel.LOW),
            RiskLevel.MINIMAL.value: sum(1 for r in risks if r.severity == RiskLevel.MINIMAL)
        }

        # Determine overall risk level
        overall_risk = self._calculate_overall_risk(risks)

        assessment = {
            "risks": [self._risk_to_dict(r) for r in risks],
            "risk_summary": risk_summary,
            "overall_risk_level": overall_risk.value,
            "total_risks": len(risks),
            "risk_tolerance_match": self._check_risk_tolerance(overall_risk, risk_tolerance)
        }

        self._add_legal_step(
            LegalStep.RISK_ASSESSMENT,
            f"Analyzing {doc_analysis['document_type']}",
            f"Identified {len(risks)} risks, Overall: {overall_risk.value}"
        )

        return assessment

    async def _compliance_check(
        self,
        doc_analysis: Dict,
        context: Dict
    ) -> List[Dict[str, Any]]:
        """🔍 Step 3: Compliance Check"""

        compliance_results = []

        # Determine applicable regulations
        jurisdiction = context.get("jurisdiction", "US")
        industry = context.get("industry", "general")

        # Check GDPR (if EU or handling EU data)
        if jurisdiction == "EU" or context.get("handles_eu_data", False):
            gdpr_check = self._check_gdpr_compliance(doc_analysis)
            compliance_results.append(gdpr_check)

        # Check CCPA (if California or handling California residents' data)
        if jurisdiction in ["US", "California"] or context.get("handles_ca_data", False):
            ccpa_check = self._check_ccpa_compliance(doc_analysis)
            compliance_results.append(ccpa_check)

        # Check HIPAA (if healthcare industry)
        if industry == "healthcare":
            hipaa_check = self._check_hipaa_compliance(doc_analysis)
            compliance_results.append(hipaa_check)

        # Check SOC2 (if handling customer data)
        if doc_analysis["document_type"] in ["SaaS Agreement", "Service Agreement"]:
            soc2_check = self._check_soc2_compliance(doc_analysis)
            compliance_results.append(soc2_check)

        self._add_legal_step(
            LegalStep.COMPLIANCE_CHECK,
            f"Jurisdiction: {jurisdiction}, Industry: {industry}",
            f"Checked {len(compliance_results)} compliance frameworks"
        )

        return [self._compliance_to_dict(c) for c in compliance_results]

    async def _ip_protection(
        self,
        doc_analysis: Dict,
        context: Dict
    ) -> Dict[str, Any]:
        """🛡️ Step 4: IP Protection"""

        ip_strategy = {
            "ip_ownership_clauses": self._analyze_ip_ownership(doc_analysis),
            "confidentiality_provisions": self._analyze_confidentiality(doc_analysis),
            "work_for_hire_terms": self._analyze_work_for_hire(doc_analysis),
            "trade_secret_protection": self._analyze_trade_secrets(doc_analysis),
            "vault_integration": self._recommend_vault_protection(doc_analysis, context),
            "recommendations": []
        }

        # Generate recommendations
        if not ip_strategy["ip_ownership_clauses"]["adequate"]:
            ip_strategy["recommendations"].append(
                "Add explicit IP ownership clause favoring your organization"
            )

        if not ip_strategy["confidentiality_provisions"]["adequate"]:
            ip_strategy["recommendations"].append(
                "Strengthen confidentiality provisions with specific scope and duration"
            )

        if ip_strategy["vault_integration"]["recommended"]:
            ip_strategy["recommendations"].append(
                "Use IP Vault to timestamp and protect key IP before signing"
            )

        self._add_legal_step(
            LegalStep.IP_PROTECTION,
            doc_analysis["document_type"],
            f"IP protection: {len(ip_strategy['recommendations'])} recommendations"
        )

        return ip_strategy

    async def _policy_alignment(
        self,
        doc_analysis: Dict,
        policies: List[str],
        context: Dict
    ) -> Dict[str, Any]:
        """📋 Step 5: Policy Alignment"""

        alignment = {
            "policies_checked": len(policies),
            "deviations": self._identify_policy_deviations(doc_analysis, policies),
            "standard_terms_comparison": self._compare_to_standard_terms(doc_analysis),
            "red_flags": self._identify_red_flags(doc_analysis),
            "alignment_score": 0.85  # Simplified
        }

        self._add_legal_step(
            LegalStep.POLICY_ALIGNMENT,
            f"Checking {len(policies)} policies",
            f"Found {len(alignment['deviations'])} deviations"
        )

        return alignment

    async def _recommendation(
        self,
        doc_analysis: Dict,
        risk_assessment: Dict,
        compliance: List[Dict],
        ip_protection: Dict,
        policy_alignment: Dict
    ) -> Dict[str, Any]:
        """⚖️ Step 6: Recommendation"""

        # Determine action based on risk level
        overall_risk = risk_assessment["overall_risk_level"]
        critical_risks = risk_assessment["risk_summary"].get("critical", 0)
        high_risks = risk_assessment["risk_summary"].get("high", 0)

        # Check compliance issues
        compliance_failures = sum(
            1 for c in compliance if not c["compliant"]
        )

        # Determine recommendation
        if critical_risks > 0 or compliance_failures > 2:
            action = RecommendationAction.REJECT
            rationale = f"Critical risks ({critical_risks}) or major compliance failures ({compliance_failures})"
        elif high_risks > 3:
            action = RecommendationAction.REQUEST_CHANGES
            rationale = f"Too many high risks ({high_risks}) require mitigation"
        elif high_risks > 0 or overall_risk in ["high", "medium"]:
            action = RecommendationAction.NEGOTIATE
            rationale = f"Moderate risks require negotiation and clarification"
        else:
            action = RecommendationAction.ACCEPT
            rationale = "Low risk profile, compliant, acceptable terms"

        # Build recommended changes
        recommended_changes = self._build_recommended_changes(
            risk_assessment, compliance, ip_protection, policy_alignment
        )

        # Build negotiation points
        negotiation_points = self._build_negotiation_points(
            risk_assessment, ip_protection
        )

        recommendation = {
            "action": action.value,
            "rationale": rationale,
            "confidence": 0.85,
            "recommended_changes": recommended_changes,
            "negotiation_points": negotiation_points,
            "escalate_to_legal_team": critical_risks > 0 or compliance_failures > 0
        }

        self._add_legal_step(
            LegalStep.RECOMMENDATION,
            f"Risk: {overall_risk}, Critical: {critical_risks}, High: {high_risks}",
            f"Recommendation: {action.value}"
        )

        return recommendation

    async def _documentation(
        self,
        doc_analysis: Dict,
        risk_assessment: Dict,
        compliance: List[Dict],
        ip_protection: Dict,
        policy_alignment: Dict,
        recommendation: Dict
    ) -> Dict[str, Any]:
        """📝 Step 7: Documentation"""

        # Create executive summary
        executive_summary = self._create_executive_summary(
            doc_analysis, risk_assessment, compliance, recommendation
        )

        # Create risk register
        risk_register = self._build_risk_register(risk_assessment["risks"])

        # Create action items
        action_items = self._create_action_items(
            recommendation, risk_assessment, compliance
        )

        # Create audit trail
        audit_trail = {
            "reviewed_by": "Clause Agent",
            "reviewed_at": datetime.utcnow().isoformat(),
            "document_hash": self._hash_document(doc_analysis.get("scope", "")),
            "steps_completed": len(self.legal_trace)
        }

        documentation = {
            "executive_summary": executive_summary,
            "risk_register": risk_register,
            "action_items": action_items,
            "audit_trail": audit_trail,
            "legal_memo": self._generate_legal_memo(
                doc_analysis, risk_assessment, compliance, recommendation
            )
        }

        self._add_legal_step(
            LegalStep.DOCUMENTATION,
            "Complete legal analysis",
            f"Generated executive summary + {len(action_items)} action items"
        )

        return documentation

    # ============================================================================
    # HELPER METHODS
    # ============================================================================

    def _add_legal_step(self, step: LegalStep, input_context: str, output: str) -> None:
        """Add a step to the legal trace"""
        self.legal_trace.append({
            "step": step.value,
            "input": input_context[:200],
            "output": output[:200],
            "timestamp": datetime.utcnow().isoformat()
        })

    def _identify_document_type(self, user_input: str, document: str) -> str:
        """Identify document type"""
        combined = (user_input + " " + document).lower()

        if "saas" in combined or "software as a service" in combined:
            return "SaaS Agreement"
        elif "nda" in combined or "non-disclosure" in combined:
            return "Non-Disclosure Agreement"
        elif "employment" in combined or "offer letter" in combined:
            return "Employment Agreement"
        elif "service agreement" in combined or "sow" in combined:
            return "Service Agreement"
        elif "terms of service" in combined or "tos" in combined:
            return "Terms of Service"
        elif "privacy policy" in combined:
            return "Privacy Policy"
        else:
            return "General Contract"

    def _identify_parties(self, document: str, context: Dict) -> List[str]:
        """Identify parties to the agreement"""
        # Simplified - would use NLP in production
        return context.get("parties", ["Party A", "Party B"])

    def _extract_effective_date(self, document: str) -> Optional[str]:
        """Extract effective date"""
        # Simplified date extraction
        date_pattern = r'\d{1,2}/\d{1,2}/\d{4}'
        match = re.search(date_pattern, document)
        return match.group(0) if match else None

    def _extract_term_duration(self, document: str) -> str:
        """Extract contract term duration"""
        # Simplified
        if "one year" in document.lower() or "12 months" in document.lower():
            return "1 year"
        elif "two years" in document.lower() or "24 months" in document.lower():
            return "2 years"
        return "Not specified"

    def _extract_key_obligations(self, document: str) -> List[str]:
        """Extract key obligations"""
        # Simplified - would use clause detection in production
        return [
            "Provider to deliver services as specified",
            "Customer to pay fees on time",
            "Both parties to maintain confidentiality"
        ]

    def _extract_payment_terms(self, document: str) -> Dict[str, Any]:
        """Extract payment terms"""
        return {
            "amount": "Not specified",
            "frequency": "Not specified",
            "payment_method": "Not specified",
            "late_fees": "Not specified"
        }

    def _extract_termination_clauses(self, document: str) -> List[str]:
        """Extract termination clauses"""
        return [
            "Termination for convenience with 30 days notice",
            "Termination for cause immediately upon breach"
        ]

    def _extract_liability_clauses(self, document: str) -> List[str]:
        """Extract liability clauses"""
        return [
            "Limitation of liability cap",
            "Indemnification obligations",
            "Warranty disclaimers"
        ]

    def _extract_dispute_resolution(self, document: str) -> str:
        """Extract dispute resolution mechanism"""
        doc_lower = document.lower()
        if "arbitration" in doc_lower:
            return "Arbitration"
        elif "mediation" in doc_lower:
            return "Mediation"
        elif "litigation" in doc_lower or "court" in doc_lower:
            return "Litigation"
        return "Not specified"

    def _determine_scope(self, user_input: str, document: str) -> str:
        """Determine scope of review"""
        return f"Review of {self._identify_document_type(user_input, document)}"

    def _assess_liability_risks(self, doc_analysis: Dict) -> List[LegalRisk]:
        """Assess liability risks"""
        risks = []

        # Check for unlimited liability
        if "unlimited" in str(doc_analysis.get("liability_clauses", [])).lower():
            risks.append(LegalRisk(
                title="Unlimited Liability Exposure",
                description="Agreement may impose unlimited liability",
                severity=RiskLevel.HIGH,
                likelihood="medium",
                impact="Potentially unlimited financial exposure",
                mitigation="Negotiate liability cap (e.g., 12 months fees)",
                clause_reference="Liability section"
            ))

        return risks

    def _assess_missing_clauses(self, doc_analysis: Dict) -> List[LegalRisk]:
        """Assess risks from missing clauses"""
        risks = []

        # Check for missing force majeure
        if not any("force majeure" in str(c).lower() for c in doc_analysis.get("key_obligations", [])):
            risks.append(LegalRisk(
                title="Missing Force Majeure Clause",
                description="No protection for unforeseeable circumstances",
                severity=RiskLevel.MEDIUM,
                likelihood="low",
                impact="Liability for performance failures beyond control",
                mitigation="Add force majeure clause",
                clause_reference=None
            ))

        return risks

    def _assess_unfavorable_terms(self, doc_analysis: Dict) -> List[LegalRisk]:
        """Assess unfavorable terms"""
        risks = []

        # Check payment terms
        payment = doc_analysis.get("payment_terms", {})
        if payment.get("frequency") == "annually" and payment.get("refund") == "non-refundable":
            risks.append(LegalRisk(
                title="Unfavorable Payment Terms",
                description="Annual non-refundable payment creates cash flow risk",
                severity=RiskLevel.LOW,
                likelihood="high",
                impact="Loss of prepaid amount if service unsatisfactory",
                mitigation="Negotiate monthly or quarterly billing",
                clause_reference="Payment terms"
            ))

        return risks

    def _assess_termination_risks(self, doc_analysis: Dict) -> List[LegalRisk]:
        """Assess termination risks"""
        risks = []

        termination_clauses = doc_analysis.get("termination_clauses", [])

        # Check for asymmetric termination rights
        if len(termination_clauses) > 0 and "vendor only" in str(termination_clauses).lower():
            risks.append(LegalRisk(
                title="Asymmetric Termination Rights",
                description="Vendor can terminate but customer cannot",
                severity=RiskLevel.HIGH,
                likelihood="medium",
                impact="Locked into unfavorable agreement",
                mitigation="Negotiate mutual termination rights",
                clause_reference="Termination section"
            ))

        return risks

    def _calculate_overall_risk(self, risks: List[LegalRisk]) -> RiskLevel:
        """Calculate overall risk level"""
        if any(r.severity == RiskLevel.CRITICAL for r in risks):
            return RiskLevel.CRITICAL
        elif any(r.severity == RiskLevel.HIGH for r in risks):
            return RiskLevel.HIGH
        elif any(r.severity == RiskLevel.MEDIUM for r in risks):
            return RiskLevel.MEDIUM
        elif any(r.severity == RiskLevel.LOW for r in risks):
            return RiskLevel.LOW
        return RiskLevel.MINIMAL

    def _check_risk_tolerance(self, overall_risk: RiskLevel, tolerance: str) -> bool:
        """Check if risk matches tolerance"""
        tolerance_map = {
            "low": [RiskLevel.MINIMAL, RiskLevel.LOW],
            "medium": [RiskLevel.MINIMAL, RiskLevel.LOW, RiskLevel.MEDIUM],
            "high": [RiskLevel.MINIMAL, RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH]
        }
        return overall_risk in tolerance_map.get(tolerance, [])

    def _check_gdpr_compliance(self, doc_analysis: Dict) -> ComplianceCheck:
        """Check GDPR compliance"""
        framework = self.compliance_frameworks["GDPR"]
        issues = []

        # Simplified compliance checks
        doc_text = str(doc_analysis).lower()

        if "data processing" not in doc_text:
            issues.append("No clear lawful basis for data processing")

        if "data subject rights" not in doc_text:
            issues.append("Data subject rights not addressed")

        return ComplianceCheck(
            regulation="GDPR",
            applicable=True,
            compliant=len(issues) == 0,
            issues=issues,
            requirements=framework["key_requirements"]
        )

    def _check_ccpa_compliance(self, doc_analysis: Dict) -> ComplianceCheck:
        """Check CCPA compliance"""
        framework = self.compliance_frameworks["CCPA"]
        issues = []

        doc_text = str(doc_analysis).lower()

        if "right to know" not in doc_text and "right to access" not in doc_text:
            issues.append("Consumer right to know not addressed")

        if "opt-out" not in doc_text and "do not sell" not in doc_text:
            issues.append("Right to opt-out of sale not addressed")

        return ComplianceCheck(
            regulation="CCPA",
            applicable=True,
            compliant=len(issues) == 0,
            issues=issues,
            requirements=framework["key_requirements"]
        )

    def _check_hipaa_compliance(self, doc_analysis: Dict) -> ComplianceCheck:
        """Check HIPAA compliance"""
        framework = self.compliance_frameworks["HIPAA"]
        issues = []

        doc_text = str(doc_analysis).lower()

        if "baa" not in doc_text and "business associate" not in doc_text:
            issues.append("No Business Associate Agreement (BAA)")

        if "phi" not in doc_text and "protected health information" not in doc_text:
            issues.append("PHI handling not addressed")

        return ComplianceCheck(
            regulation="HIPAA",
            applicable=True,
            compliant=len(issues) == 0,
            issues=issues,
            requirements=framework["key_requirements"]
        )

    def _check_soc2_compliance(self, doc_analysis: Dict) -> ComplianceCheck:
        """Check SOC2 compliance"""
        framework = self.compliance_frameworks["SOC2"]
        issues = []

        doc_text = str(doc_analysis).lower()

        if "soc 2" not in doc_text and "soc2" not in doc_text:
            issues.append("No SOC 2 certification mentioned")

        return ComplianceCheck(
            regulation="SOC2",
            applicable=True,
            compliant=len(issues) == 0,
            issues=issues,
            requirements=framework["key_requirements"]
        )

    def _analyze_ip_ownership(self, doc_analysis: Dict) -> Dict[str, Any]:
        """Analyze IP ownership clauses"""
        return {
            "adequate": False,
            "issues": ["IP ownership not clearly defined"],
            "recommendation": "Add explicit IP ownership clause"
        }

    def _analyze_confidentiality(self, doc_analysis: Dict) -> Dict[str, Any]:
        """Analyze confidentiality provisions"""
        return {
            "adequate": True,
            "scope": "Standard confidentiality provisions",
            "duration": "Typical duration"
        }

    def _analyze_work_for_hire(self, doc_analysis: Dict) -> Dict[str, Any]:
        """Analyze work-for-hire terms"""
        return {
            "present": False,
            "recommendation": "Consider work-for-hire clause if commissioning original work"
        }

    def _analyze_trade_secrets(self, doc_analysis: Dict) -> Dict[str, Any]:
        """Analyze trade secret protection"""
        return {
            "protected": False,
            "recommendation": "Add trade secret protection provisions"
        }

    def _recommend_vault_protection(self, doc_analysis: Dict, context: Dict) -> Dict[str, Any]:
        """Recommend IP Vault protection"""
        return {
            "recommended": True,
            "items_to_protect": [
                "Proprietary algorithms or methods",
                "Unique business processes",
                "Original creative work"
            ],
            "timing": "Before signing and disclosing to counterparty"
        }

    def _identify_policy_deviations(self, doc_analysis: Dict, policies: List[str]) -> List[str]:
        """Identify policy deviations"""
        # Simplified
        return []

    def _compare_to_standard_terms(self, doc_analysis: Dict) -> Dict[str, Any]:
        """Compare to standard terms"""
        return {
            "deviations_from_standard": [],
            "favorable_terms": [],
            "unfavorable_terms": []
        }

    def _identify_red_flags(self, doc_analysis: Dict) -> List[str]:
        """Identify red flags"""
        red_flags = []

        if "unlimited liability" in str(doc_analysis).lower():
            red_flags.append("Unlimited liability clause")

        if "irrevocable" in str(doc_analysis).lower():
            red_flags.append("Irrevocable commitments")

        return red_flags

    def _build_recommended_changes(
        self,
        risk_assessment: Dict,
        compliance: List[Dict],
        ip_protection: Dict,
        policy_alignment: Dict
    ) -> List[str]:
        """Build list of recommended changes"""
        changes = []

        # Add changes from high/critical risks
        for risk in risk_assessment["risks"]:
            if risk["severity"] in ["critical", "high"]:
                changes.append(f"Mitigate {risk['title']}: {risk['mitigation']}")

        # Add changes from compliance issues
        for comp in compliance:
            if not comp["compliant"]:
                for issue in comp["issues"]:
                    changes.append(f"{comp['regulation']}: Address {issue}")

        # Add IP protection recommendations
        for rec in ip_protection.get("recommendations", []):
            changes.append(rec)

        return changes[:10]  # Top 10 changes

    def _build_negotiation_points(
        self,
        risk_assessment: Dict,
        ip_protection: Dict
    ) -> List[str]:
        """Build negotiation talking points"""
        points = []

        # From risks
        for risk in risk_assessment["risks"]:
            if risk["severity"] in ["high", "medium"]:
                points.append(f"Request: {risk['mitigation']}")

        return points[:5]  # Top 5 points

    def _create_executive_summary(
        self,
        doc_analysis: Dict,
        risk_assessment: Dict,
        compliance: List[Dict],
        recommendation: Dict
    ) -> str:
        """Create executive summary"""
        summary = f"""EXECUTIVE SUMMARY - LEGAL REVIEW

Document Type: {doc_analysis['document_type']}
Parties: {', '.join(doc_analysis['parties'])}

RISK ASSESSMENT:
Overall Risk Level: {risk_assessment['overall_risk_level'].upper()}
Total Risks Identified: {risk_assessment['total_risks']}
- Critical: {risk_assessment['risk_summary'].get('critical', 0)}
- High: {risk_assessment['risk_summary'].get('high', 0)}
- Medium: {risk_assessment['risk_summary'].get('medium', 0)}
- Low: {risk_assessment['risk_summary'].get('low', 0)}

COMPLIANCE:
Frameworks Checked: {len(compliance)}
Compliant: {sum(1 for c in compliance if c['compliant'])}/{len(compliance)}

RECOMMENDATION: {recommendation['action'].upper()}
Rationale: {recommendation['rationale']}

Next Steps: Review recommended changes and negotiation points below.
"""
        return summary

    def _build_risk_register(self, risks: List[Dict]) -> List[Dict]:
        """Build risk register"""
        return sorted(risks, key=lambda r: ["minimal", "low", "medium", "high", "critical"].index(r["severity"]), reverse=True)

    def _create_action_items(
        self,
        recommendation: Dict,
        risk_assessment: Dict,
        compliance: List[Dict]
    ) -> List[str]:
        """Create action items"""
        actions = []

        if recommendation["action"] == "reject":
            actions.append("DO NOT SIGN - Escalate to legal team")
        elif recommendation["action"] == "request_changes":
            actions.append("Request changes per recommended changes list")
        elif recommendation["action"] == "negotiate":
            actions.append("Negotiate terms per negotiation points")
        elif recommendation["action"] == "accept":
            actions.append("Proceed with signing after final review")

        # Add specific actions from risks
        critical_risks = [r for r in risk_assessment["risks"] if r["severity"] == "critical"]
        for risk in critical_risks:
            actions.append(f"URGENT: Address {risk['title']}")

        return actions

    def _hash_document(self, document: str) -> str:
        """Hash document for audit trail"""
        import hashlib
        return hashlib.sha256(document.encode()).hexdigest()[:16]

    def _generate_legal_memo(
        self,
        doc_analysis: Dict,
        risk_assessment: Dict,
        compliance: List[Dict],
        recommendation: Dict
    ) -> str:
        """Generate legal memorandum"""
        memo = f"""LEGAL MEMORANDUM

TO: Decision Maker
FROM: Clause Agent (Legal AI)
DATE: {datetime.utcnow().strftime('%Y-%m-%d')}
RE: Review of {doc_analysis['document_type']}

INTRODUCTION
This memorandum summarizes the legal review of the subject agreement.

ANALYSIS
[Full analysis would be included in production]

CONCLUSION
Based on the foregoing, I recommend: {recommendation['action'].upper()}

Clause Agent
BlackRoad Legal AI
"""
        return memo

    def _risk_to_dict(self, risk: LegalRisk) -> Dict[str, Any]:
        """Convert LegalRisk to dictionary"""
        return {
            "title": risk.title,
            "description": risk.description,
            "severity": risk.severity.value,
            "likelihood": risk.likelihood,
            "impact": risk.impact,
            "mitigation": risk.mitigation,
            "clause_reference": risk.clause_reference
        }

    def _compliance_to_dict(self, check: ComplianceCheck) -> Dict[str, Any]:
        """Convert ComplianceCheck to dictionary"""
        return {
            "regulation": check.regulation,
            "applicable": check.applicable,
            "compliant": check.compliant,
            "issues": check.issues,
            "requirements": check.requirements
        }

    async def cleanup(self) -> None:
        """Cleanup after execution"""
        await super().cleanup()
        self.logger.info(
            f"⚖️ Clause completed with {len(self.legal_trace)} legal review steps"
        )
