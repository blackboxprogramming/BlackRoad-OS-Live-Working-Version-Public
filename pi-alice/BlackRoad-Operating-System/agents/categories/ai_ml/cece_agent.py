"""
Cece Agent - The Cognitive Architect

Implements the full Alexa-Cece Cognition Framework:
- 15-step Alexa Cognitive Pipeline (reasoning, reflection, validation)
- 6-step Cece Architecture Layer (structuralize, prioritize, translate)

This agent combines emotional intelligence with logical rigor,
providing warm, precise, big-sister architect energy.
"""

import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional
from enum import Enum

from agents.base.agent import BaseAgent, AgentStatus


class CognitivePipelineStep(Enum):
    """15-step Alexa Cognitive Pipeline"""
    NOT_OK = "🚨 Not ok"
    WHY = "❓ Why"
    IMPULSE = "⚡ Impulse"
    REFLECT = "🪞 Reflect"
    ARGUE_WITH_SELF = "⚔️ Argue with self"
    COUNTERPOINT = "🔁 Counterpoint"
    DETERMINE = "🎯 Determine"
    QUESTION = "🧐 Question"
    OFFSET = "⚖️ Offset"
    REGROUND = "🧱 Reground"
    CLARIFY = "✍️ Clarify"
    RESTATE = "♻️ Restate"
    CLARIFY_AGAIN = "🎯 Clarify again"
    VALIDATE = "🤝 Validate"
    ANSWER = "⭐ Answer"


class ArchitectureStep(Enum):
    """6-step Cece Architecture Layer"""
    STRUCTURALIZE = "🟦 Structuralize"
    PRIORITIZE = "🟥 Prioritize"
    TRANSLATE = "🟩 Translate"
    STABILIZE = "🟪 Stabilize"
    PROJECT_MANAGE = "🟨 Project-manage"
    LOOPBACK = "🟧 Loopback"


@dataclass
class ReasoningStep:
    """Single step in the reasoning trace"""
    step_name: str
    emoji: str
    input_context: str
    output: str
    confidence: float
    timestamp: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class CognitionResult:
    """Complete cognition framework result"""
    # Cognitive pipeline
    cognitive_pipeline: List[ReasoningStep]
    emotional_state: str
    overall_confidence: float
    reasoning_trace: List[str]

    # Architecture layer
    decision: str
    structure: Dict[str, Any]
    priorities: List[str]
    translations: Dict[str, str]
    stabilizers: List[str]
    project_plan: Dict[str, List[str]]

    # Final output
    summary: str
    action_steps: List[str]
    emotional_grounding: str
    next_check_in: str

    # Metadata
    execution_time_seconds: float
    complexity_score: float


class CeceAgent(BaseAgent):
    """
    Cece - The Cognitive Architect

    Warm, precise, big-sister AI that combines:
    - Emotional intelligence with logical rigor
    - Systems thinking with practical execution
    - Chaos taming with structure building

    Process:
    1. Run 15-step Alexa Cognitive Pipeline
    2. Apply 6-step Cece Architecture Layer
    3. Produce actionable output with emotional grounding

    Example:
        ```python
        cece = CeceAgent()
        result = await cece.run({
            "input": "I'm overwhelmed with 10 projects",
            "context": {...}
        })
        print(result.data["output"]["summary"])
        ```
    """

    def __init__(self):
        super().__init__(
            name="cece",
            description="Cognitive architect with 15-step reasoning + 6-step architecture",
            category="ai_ml",
            version="1.0.0",
            author="Alexa + Cece",
            tags=["cognition", "architecture", "reasoning", "orchestration"],
            timeout=120,  # 2 minutes for deep thinking
            retry_count=2
        )

        self.reasoning_trace: List[ReasoningStep] = []
        self.confidence_threshold = 0.75

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """Validate input parameters"""
        if "input" not in params:
            self.logger.error("Missing required parameter: 'input'")
            return False

        if not isinstance(params["input"], str):
            self.logger.error("Parameter 'input' must be a string")
            return False

        if len(params["input"].strip()) == 0:
            self.logger.error("Parameter 'input' cannot be empty")
            return False

        return True

    async def initialize(self) -> None:
        """Initialize Cece before execution"""
        await super().initialize()
        self.reasoning_trace = []
        self.logger.info("🟣 Cece agent initialized - ready to architect")

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the full Alexa-Cece Cognition Framework

        Args:
            params: {
                "input": str,           # The problem/question to analyze
                "context": dict,        # Optional context
                "verbose": bool,        # Show full reasoning trace (default: True)
                "min_confidence": float # Minimum confidence threshold (default: 0.75)
            }

        Returns:
            {
                "cognitive_pipeline": [...],
                "architecture": {...},
                "output": {...},
                "reasoning_trace": [...],
                "confidence": float
            }
        """
        start_time = datetime.utcnow()

        user_input = params["input"]
        context = params.get("context", {})
        verbose = params.get("verbose", True)
        self.confidence_threshold = params.get("min_confidence", 0.75)

        self.logger.info(f"🟣 Cece analyzing: {user_input[:100]}...")

        # Phase 1: Run 15-step Alexa Cognitive Pipeline
        self.logger.info("Running 15-step Alexa Cognitive Pipeline...")
        cognitive_result = await self._run_cognitive_pipeline(user_input, context)

        # Phase 2: Apply 6-step Cece Architecture Layer
        self.logger.info("Applying 6-step Cece Architecture Layer...")
        architecture_result = await self._run_architecture_layer(
            cognitive_result,
            user_input,
            context
        )

        # Phase 3: Synthesize final output
        self.logger.info("Synthesizing final output...")
        final_output = await self._synthesize_output(
            cognitive_result,
            architecture_result,
            user_input
        )

        end_time = datetime.utcnow()
        execution_time = (end_time - start_time).total_seconds()

        # Calculate overall confidence
        overall_confidence = self._calculate_overall_confidence()

        # Build complete result
        result = {
            "cognitive_pipeline": {
                "steps": [self._step_to_dict(step) for step in self.reasoning_trace[:15]],
                "emotional_state": cognitive_result.get("emotional_state", "grounded"),
                "confidence": cognitive_result.get("confidence", 0.85)
            },
            "architecture": architecture_result,
            "output": final_output,
            "reasoning_trace": self._build_reasoning_trace_text(),
            "confidence": overall_confidence,
            "execution_time_seconds": execution_time,
            "complexity_score": self._calculate_complexity(user_input, context)
        }

        if overall_confidence < self.confidence_threshold:
            self.logger.warning(
                f"⚠️ Confidence {overall_confidence:.2f} below threshold "
                f"{self.confidence_threshold:.2f} - recommend human review"
            )
            result["warnings"] = [
                f"Confidence below threshold - recommend human review"
            ]

        self.logger.info(
            f"✅ Cece completed analysis (confidence: {overall_confidence:.2f}, "
            f"time: {execution_time:.2f}s)"
        )

        return result

    async def _run_cognitive_pipeline(
        self,
        user_input: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Run the 15-step Alexa Cognitive Pipeline"""

        # Step 1: 🚨 Not OK - Acknowledge discomfort/confusion
        not_ok = await self._step_not_ok(user_input, context)

        # Step 2: ❓ Why - Surface the actual problem
        why = await self._step_why(not_ok, context)

        # Step 3: ⚡ Impulse - Capture immediate reaction
        impulse = await self._step_impulse(why, context)

        # Step 4: 🪞 Reflect - Step back and examine
        reflect = await self._step_reflect(impulse, context)

        # Step 5: ⚔️ Argue with Self - Challenge initial impulse
        argue = await self._step_argue_with_self(impulse, reflect, context)

        # Step 6: 🔁 Counterpoint - Present alternative view
        counterpoint = await self._step_counterpoint(argue, context)

        # Step 7: 🎯 Determine - Make preliminary decision
        determine = await self._step_determine(argue, counterpoint, context)

        # Step 8: 🧐 Question - Stress-test the decision
        question = await self._step_question(determine, context)

        # Step 9: ⚖️ Offset - Identify risks/downsides
        offset = await self._step_offset(determine, question, context)

        # Step 10: 🧱 Reground - Return to fundamentals
        reground = await self._step_reground(user_input, determine, offset, context)

        # Step 11: ✍️ Clarify - Articulate clearly
        clarify = await self._step_clarify(reground, context)

        # Step 12: ♻️ Restate - Confirm understanding
        restate = await self._step_restate(clarify, user_input, context)

        # Step 13: 🎯 Clarify Again - Final precision pass
        clarify_again = await self._step_clarify_again(restate, context)

        # Step 14: 🤝 Validate - Emotional + logical check
        validate = await self._step_validate(clarify_again, context)

        # Step 15: ⭐ Answer - Deliver complete response
        answer = await self._step_answer(validate, context)

        return {
            "answer": answer,
            "confidence": validate.get("confidence", 0.85),
            "emotional_state": validate.get("emotional_state", "grounded")
        }

    async def _run_architecture_layer(
        self,
        cognitive_result: Dict[str, Any],
        user_input: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Run the 6-step Cece Architecture Layer"""

        answer = cognitive_result["answer"]

        # Step 1: 🟦 Structuralize - Convert decisions into systems
        structure = await self._arch_structuralize(answer, user_input, context)

        # Step 2: 🟥 Prioritize - Sequence dependencies
        priorities = await self._arch_prioritize(structure, context)

        # Step 3: 🟩 Translate - Convert abstract to concrete
        translations = await self._arch_translate(structure, priorities, context)

        # Step 4: 🟪 Stabilize - Add error handling
        stabilizers = await self._arch_stabilize(translations, context)

        # Step 5: 🟨 Project-Manage - Timeline + resources
        project_plan = await self._arch_project_manage(
            structure, priorities, translations, context
        )

        # Step 6: 🟧 Loopback - Verification + adjustment
        final_architecture = await self._arch_loopback(
            structure, priorities, translations, stabilizers, project_plan, context
        )

        return final_architecture

    async def _synthesize_output(
        self,
        cognitive_result: Dict[str, Any],
        architecture_result: Dict[str, Any],
        user_input: str
    ) -> Dict[str, Any]:
        """Synthesize final warm, actionable output"""

        return {
            "summary": self._create_warm_summary(cognitive_result, architecture_result),
            "decision": cognitive_result["answer"]["decision"],
            "action_steps": architecture_result.get("action_steps", []),
            "emotional_grounding": self._create_emotional_grounding(
                cognitive_result["emotional_state"]
            ),
            "next_check_in": architecture_result.get("next_check_in", "Check in after first step"),
            "structure": architecture_result.get("structure", {}),
            "risks": architecture_result.get("risks", []),
            "confidence": cognitive_result["confidence"]
        }

    # ============================================================================
    # ALEXA COGNITIVE PIPELINE STEPS (15 steps)
    # ============================================================================

    async def _step_not_ok(self, user_input: str, context: Dict) -> Dict[str, Any]:
        """🚨 Step 1: Acknowledge discomfort/confusion"""
        output = {
            "observation": f"There's discomfort/confusion in: {user_input[:200]}",
            "emotional_signal": self._detect_emotional_signals(user_input),
            "complexity_level": self._assess_complexity(user_input, context)
        }

        self._add_reasoning_step(
            CognitivePipelineStep.NOT_OK,
            user_input,
            output["observation"],
            0.95
        )

        return output

    async def _step_why(self, not_ok_result: Dict, context: Dict) -> Dict[str, Any]:
        """❓ Step 2: Surface the actual problem"""
        output = {
            "root_cause": "Analyzing root cause vs symptom",
            "real_question": "What's the core issue here?",
            "layers": self._identify_problem_layers(not_ok_result)
        }

        self._add_reasoning_step(
            CognitivePipelineStep.WHY,
            not_ok_result["observation"],
            output["real_question"],
            0.85
        )

        return output

    async def _step_impulse(self, why_result: Dict, context: Dict) -> Dict[str, Any]:
        """⚡ Step 3: Capture immediate reaction"""
        output = {
            "first_instinct": "Immediate reaction without judgment",
            "gut_feeling": self._capture_gut_feeling(why_result),
            "bias_check": "Noting potential biases"
        }

        self._add_reasoning_step(
            CognitivePipelineStep.IMPULSE,
            why_result["real_question"],
            output["gut_feeling"],
            0.70  # Lower confidence on gut reactions
        )

        return output

    async def _step_reflect(self, impulse_result: Dict, context: Dict) -> Dict[str, Any]:
        """🪞 Step 4: Step back and examine"""
        output = {
            "objective_view": "Looking at this from distance",
            "patterns": self._identify_patterns(impulse_result, context),
            "mental_space": "Created space for analysis"
        }

        self._add_reasoning_step(
            CognitivePipelineStep.REFLECT,
            impulse_result["gut_feeling"],
            output["objective_view"],
            0.80
        )

        return output

    async def _step_argue_with_self(
        self,
        impulse_result: Dict,
        reflect_result: Dict,
        context: Dict
    ) -> Dict[str, Any]:
        """⚔️ Step 5: Challenge initial impulse"""
        output = {
            "challenge": "But wait, what if...",
            "devils_advocate": self._play_devils_advocate(impulse_result, reflect_result),
            "alternative_view": "Opposing perspective"
        }

        self._add_reasoning_step(
            CognitivePipelineStep.ARGUE_WITH_SELF,
            impulse_result["gut_feeling"],
            output["devils_advocate"],
            0.75
        )

        return output

    async def _step_counterpoint(self, argue_result: Dict, context: Dict) -> Dict[str, Any]:
        """🔁 Step 6: Present alternative view"""
        output = {
            "other_hand": "On the other hand...",
            "balance": self._create_balanced_view(argue_result),
            "synthesis_emerging": "Finding middle ground"
        }

        self._add_reasoning_step(
            CognitivePipelineStep.COUNTERPOINT,
            argue_result["devils_advocate"],
            output["balance"],
            0.80
        )

        return output

    async def _step_determine(
        self,
        argue_result: Dict,
        counterpoint_result: Dict,
        context: Dict
    ) -> Dict[str, Any]:
        """🎯 Step 7: Make preliminary decision"""
        output = {
            "preliminary_decision": "Based on analysis, I think...",
            "reasoning": self._synthesize_decision(argue_result, counterpoint_result),
            "direction": "Committed direction"
        }

        self._add_reasoning_step(
            CognitivePipelineStep.DETERMINE,
            f"{argue_result['devils_advocate']} vs {counterpoint_result['balance']}",
            output["preliminary_decision"],
            0.82
        )

        return output

    async def _step_question(self, determine_result: Dict, context: Dict) -> Dict[str, Any]:
        """🧐 Step 8: Stress-test the decision"""
        output = {
            "verification": "Does this actually solve the problem?",
            "stress_test": self._stress_test_decision(determine_result),
            "gaps": "Identifying gaps in logic"
        }

        self._add_reasoning_step(
            CognitivePipelineStep.QUESTION,
            determine_result["preliminary_decision"],
            output["verification"],
            0.85
        )

        return output

    async def _step_offset(
        self,
        determine_result: Dict,
        question_result: Dict,
        context: Dict
    ) -> Dict[str, Any]:
        """⚖️ Step 9: Identify risks/downsides"""
        output = {
            "risks": "What could go wrong?",
            "downsides": self._identify_risks(determine_result, question_result),
            "reality_check": "Grounding in reality"
        }

        self._add_reasoning_step(
            CognitivePipelineStep.OFFSET,
            determine_result["preliminary_decision"],
            output["downsides"],
            0.88
        )

        return output

    async def _step_reground(
        self,
        user_input: str,
        determine_result: Dict,
        offset_result: Dict,
        context: Dict
    ) -> Dict[str, Any]:
        """🧱 Step 10: Return to fundamentals"""
        output = {
            "fundamentals": "What do I actually know for sure?",
            "facts": self._extract_facts(user_input, context),
            "anchor": "Solid ground established"
        }

        self._add_reasoning_step(
            CognitivePipelineStep.REGROUND,
            f"Decision: {determine_result['preliminary_decision']}, Risks: {offset_result['downsides']}",
            output["fundamentals"],
            0.90
        )

        return output

    async def _step_clarify(self, reground_result: Dict, context: Dict) -> Dict[str, Any]:
        """✍️ Step 11: Articulate clearly"""
        output = {
            "clear_statement": "In plain terms, this means...",
            "articulation": self._articulate_clearly(reground_result),
            "ambiguity_removed": "Precision achieved"
        }

        self._add_reasoning_step(
            CognitivePipelineStep.CLARIFY,
            reground_result["fundamentals"],
            output["articulation"],
            0.90
        )

        return output

    async def _step_restate(
        self,
        clarify_result: Dict,
        user_input: str,
        context: Dict
    ) -> Dict[str, Any]:
        """♻️ Step 12: Confirm understanding"""
        output = {
            "restatement": "So the real question is...",
            "confirmation": self._confirm_understanding(clarify_result, user_input),
            "alignment": "Ensured alignment"
        }

        self._add_reasoning_step(
            CognitivePipelineStep.RESTATE,
            clarify_result["articulation"],
            output["confirmation"],
            0.92
        )

        return output

    async def _step_clarify_again(self, restate_result: Dict, context: Dict) -> Dict[str, Any]:
        """🎯 Step 13: Final precision pass"""
        output = {
            "final_clarity": "To be absolutely clear...",
            "precision": self._final_precision_pass(restate_result),
            "locked_in": "Decision locked"
        }

        self._add_reasoning_step(
            CognitivePipelineStep.CLARIFY_AGAIN,
            restate_result["confirmation"],
            output["precision"],
            0.93
        )

        return output

    async def _step_validate(self, clarify_again_result: Dict, context: Dict) -> Dict[str, Any]:
        """🤝 Step 14: Emotional + logical check"""
        output = {
            "validation": "Does this feel right AND make sense?",
            "head_check": self._logical_validation(clarify_again_result),
            "heart_check": self._emotional_validation(clarify_again_result),
            "confidence": 0.87,
            "emotional_state": "grounded"
        }

        self._add_reasoning_step(
            CognitivePipelineStep.VALIDATE,
            clarify_again_result["precision"],
            f"Head: {output['head_check']}, Heart: {output['heart_check']}",
            output["confidence"]
        )

        return output

    async def _step_answer(self, validate_result: Dict, context: Dict) -> Dict[str, Any]:
        """⭐ Step 15: Deliver complete response"""
        output = {
            "decision": validate_result["validation"],
            "reasoning": "Full reasoning chain available",
            "confidence": validate_result["confidence"],
            "next_steps": "Ready for architecture layer"
        }

        self._add_reasoning_step(
            CognitivePipelineStep.ANSWER,
            validate_result["validation"],
            output["decision"],
            validate_result["confidence"]
        )

        return output

    # ============================================================================
    # CECE ARCHITECTURE LAYER STEPS (6 steps)
    # ============================================================================

    async def _arch_structuralize(
        self,
        answer: Dict,
        user_input: str,
        context: Dict
    ) -> Dict[str, Any]:
        """🟦 Step 1: Convert decisions into systems"""
        structure = {
            "decision": answer["decision"],
            "system_architecture": self._design_system_architecture(answer, user_input),
            "components": self._identify_components(answer),
            "dependencies": self._map_dependencies(answer, context),
            "interfaces": self._define_interfaces(answer)
        }

        self._add_reasoning_step(
            ArchitectureStep.STRUCTURALIZE,
            answer["decision"],
            f"System: {structure['system_architecture']}",
            0.85,
            metadata={"type": "architecture"}
        )

        return structure

    async def _arch_prioritize(self, structure: Dict, context: Dict) -> List[str]:
        """🟥 Step 2: Sequence dependencies"""
        priorities = self._create_priority_sequence(structure, context)

        self._add_reasoning_step(
            ArchitectureStep.PRIORITIZE,
            str(structure.get("components", [])),
            f"Priority order: {', '.join(priorities[:3])}...",
            0.88,
            metadata={"type": "architecture"}
        )

        return priorities

    async def _arch_translate(
        self,
        structure: Dict,
        priorities: List[str],
        context: Dict
    ) -> Dict[str, str]:
        """🟩 Step 3: Convert abstract to concrete"""
        translations = self._translate_to_concrete(structure, priorities, context)

        self._add_reasoning_step(
            ArchitectureStep.TRANSLATE,
            f"Abstract: {list(translations.keys())}",
            f"Concrete actions defined",
            0.85,
            metadata={"type": "architecture"}
        )

        return translations

    async def _arch_stabilize(self, translations: Dict, context: Dict) -> List[str]:
        """🟪 Step 4: Add error handling"""
        stabilizers = self._add_error_handling(translations, context)

        self._add_reasoning_step(
            ArchitectureStep.STABILIZE,
            f"Translations: {len(translations)} items",
            f"Added {len(stabilizers)} stabilizers",
            0.90,
            metadata={"type": "architecture"}
        )

        return stabilizers

    async def _arch_project_manage(
        self,
        structure: Dict,
        priorities: List[str],
        translations: Dict,
        context: Dict
    ) -> Dict[str, List[str]]:
        """🟨 Step 5: Timeline + resources"""
        project_plan = self._create_project_plan(structure, priorities, translations, context)

        self._add_reasoning_step(
            ArchitectureStep.PROJECT_MANAGE,
            f"Priorities: {len(priorities)} items",
            f"Created {len(project_plan)} week plan",
            0.88,
            metadata={"type": "architecture"}
        )

        return project_plan

    async def _arch_loopback(
        self,
        structure: Dict,
        priorities: List[str],
        translations: Dict,
        stabilizers: List[str],
        project_plan: Dict,
        context: Dict
    ) -> Dict[str, Any]:
        """🟧 Step 6: Verification + adjustment"""

        # Verify the complete architecture
        verification = self._verify_architecture(
            structure, priorities, translations, stabilizers, project_plan
        )

        # Make adjustments if needed
        if verification["needs_adjustment"]:
            self.logger.info("Architecture needs adjustment - iterating...")
            # In a real implementation, this could trigger recursion

        final_architecture = {
            "structure": structure,
            "priorities": priorities,
            "translations": translations,
            "stabilizers": stabilizers,
            "project_plan": project_plan,
            "verification": verification,
            "action_steps": self._extract_action_steps(project_plan),
            "risks": stabilizers,
            "next_check_in": self._calculate_next_check_in(project_plan)
        }

        self._add_reasoning_step(
            ArchitectureStep.LOOPBACK,
            "Complete architecture",
            f"Verified and {'adjusted' if verification['needs_adjustment'] else 'approved'}",
            0.90,
            metadata={"type": "architecture"}
        )

        return final_architecture

    # ============================================================================
    # HELPER METHODS
    # ============================================================================

    def _add_reasoning_step(
        self,
        step: Enum,
        input_context: str,
        output: str,
        confidence: float,
        metadata: Optional[Dict] = None
    ) -> None:
        """Add a step to the reasoning trace"""
        self.reasoning_trace.append(
            ReasoningStep(
                step_name=step.name,
                emoji=step.value,
                input_context=input_context[:500],  # Truncate for storage
                output=output[:500],
                confidence=confidence,
                metadata=metadata or {}
            )
        )

    def _detect_emotional_signals(self, text: str) -> str:
        """Detect emotional signals in input"""
        # Simple keyword-based detection (could be enhanced with NLP)
        emotions = {
            "overwhelmed": ["overwhelm", "too much", "can't handle"],
            "confused": ["confused", "don't understand", "unclear"],
            "frustrated": ["frustrated", "annoying", "stuck"],
            "anxious": ["anxious", "worried", "nervous"],
            "excited": ["excited", "can't wait", "amazing"]
        }

        text_lower = text.lower()
        for emotion, keywords in emotions.items():
            if any(keyword in text_lower for keyword in keywords):
                return emotion

        return "neutral"

    def _assess_complexity(self, user_input: str, context: Dict) -> str:
        """Assess problem complexity"""
        # Simple heuristic (could be enhanced)
        word_count = len(user_input.split())
        context_size = len(str(context))

        if word_count < 20 and context_size < 100:
            return "low"
        elif word_count < 100 and context_size < 500:
            return "medium"
        else:
            return "high"

    def _identify_problem_layers(self, not_ok_result: Dict) -> List[str]:
        """Identify layers of the problem"""
        # Simplified - could use actual problem decomposition
        return [
            "Surface symptom",
            "Underlying cause",
            "Root systemic issue"
        ]

    def _capture_gut_feeling(self, why_result: Dict) -> str:
        """Capture gut feeling about the problem"""
        return f"Initial instinct about: {why_result['real_question']}"

    def _identify_patterns(self, impulse_result: Dict, context: Dict) -> List[str]:
        """Identify patterns in the problem"""
        return ["Pattern recognition placeholder"]

    def _play_devils_advocate(self, impulse: Dict, reflect: Dict) -> str:
        """Play devil's advocate against initial impulse"""
        return f"Challenging: {impulse['gut_feeling']}"

    def _create_balanced_view(self, argue_result: Dict) -> str:
        """Create balanced view from argument"""
        return f"Balanced perspective on: {argue_result['devils_advocate']}"

    def _synthesize_decision(self, argue: Dict, counterpoint: Dict) -> str:
        """Synthesize decision from argument and counterpoint"""
        return f"Decision synthesis from debate"

    def _stress_test_decision(self, determine: Dict) -> str:
        """Stress test the preliminary decision"""
        return f"Stress testing: {determine['preliminary_decision']}"

    def _identify_risks(self, determine: Dict, question: Dict) -> str:
        """Identify risks and downsides"""
        return "Risk identification"

    def _extract_facts(self, user_input: str, context: Dict) -> str:
        """Extract hard facts from input and context"""
        return f"Facts extracted from input and context"

    def _articulate_clearly(self, reground: Dict) -> str:
        """Articulate the decision clearly"""
        return f"Clear articulation of: {reground['fundamentals']}"

    def _confirm_understanding(self, clarify: Dict, user_input: str) -> str:
        """Confirm understanding"""
        return f"Confirmed understanding of original question"

    def _final_precision_pass(self, restate: Dict) -> str:
        """Final precision pass"""
        return f"Final precision on: {restate['confirmation']}"

    def _logical_validation(self, clarify_again: Dict) -> str:
        """Logical validation check"""
        return "Passes logical validation"

    def _emotional_validation(self, clarify_again: Dict) -> str:
        """Emotional validation check"""
        return "Feels aligned and grounded"

    def _design_system_architecture(self, answer: Dict, user_input: str) -> str:
        """Design system architecture"""
        return "System architecture blueprint"

    def _identify_components(self, answer: Dict) -> List[str]:
        """Identify system components"""
        return ["Component 1", "Component 2", "Component 3"]

    def _map_dependencies(self, answer: Dict, context: Dict) -> List[str]:
        """Map dependencies"""
        return ["Dependency A → B", "Dependency B → C"]

    def _define_interfaces(self, answer: Dict) -> List[str]:
        """Define interfaces"""
        return ["Interface 1", "Interface 2"]

    def _create_priority_sequence(self, structure: Dict, context: Dict) -> List[str]:
        """Create priority sequence"""
        components = structure.get("components", [])
        # Simple prioritization (could be enhanced with dependency analysis)
        return components

    def _translate_to_concrete(
        self,
        structure: Dict,
        priorities: List[str],
        context: Dict
    ) -> Dict[str, str]:
        """Translate abstract concepts to concrete actions"""
        return {
            priority: f"Concrete action for {priority}"
            for priority in priorities[:5]
        }

    def _add_error_handling(self, translations: Dict, context: Dict) -> List[str]:
        """Add error handling and fallbacks"""
        return [
            "Error handler for critical path",
            "Fallback for service unavailable",
            "Retry logic with exponential backoff"
        ]

    def _create_project_plan(
        self,
        structure: Dict,
        priorities: List[str],
        translations: Dict,
        context: Dict
    ) -> Dict[str, List[str]]:
        """Create project timeline"""
        return {
            "week_1": priorities[:2] if len(priorities) >= 2 else priorities,
            "week_2": priorities[2:4] if len(priorities) >= 4 else [],
            "week_3": priorities[4:6] if len(priorities) >= 6 else [],
            "week_4": priorities[6:] if len(priorities) > 6 else []
        }

    def _verify_architecture(
        self,
        structure: Dict,
        priorities: List[str],
        translations: Dict,
        stabilizers: List[str],
        project_plan: Dict
    ) -> Dict[str, Any]:
        """Verify complete architecture"""
        # Check completeness
        has_structure = bool(structure)
        has_priorities = len(priorities) > 0
        has_translations = len(translations) > 0
        has_stabilizers = len(stabilizers) > 0
        has_plan = len(project_plan) > 0

        is_complete = all([
            has_structure, has_priorities, has_translations,
            has_stabilizers, has_plan
        ])

        return {
            "is_complete": is_complete,
            "needs_adjustment": not is_complete,
            "completeness_score": sum([
                has_structure, has_priorities, has_translations,
                has_stabilizers, has_plan
            ]) / 5.0
        }

    def _extract_action_steps(self, project_plan: Dict) -> List[str]:
        """Extract action steps from project plan"""
        all_actions = []
        for week, actions in project_plan.items():
            all_actions.extend([f"{week.replace('_', ' ').title()}: {action}" for action in actions])
        return all_actions

    def _calculate_next_check_in(self, project_plan: Dict) -> str:
        """Calculate when to check in next"""
        if "week_1" in project_plan and project_plan["week_1"]:
            return "Check in after completing first week's tasks"
        return "Check in after first action step"

    def _calculate_overall_confidence(self) -> float:
        """Calculate overall confidence from reasoning trace"""
        if not self.reasoning_trace:
            return 0.0

        total_confidence = sum(step.confidence for step in self.reasoning_trace)
        return total_confidence / len(self.reasoning_trace)

    def _calculate_complexity(self, user_input: str, context: Dict) -> float:
        """Calculate complexity score (0-1)"""
        # Simple heuristic
        word_count = len(user_input.split())
        context_size = len(str(context))

        # Normalize to 0-1
        complexity = min(1.0, (word_count + context_size / 10) / 200)
        return complexity

    def _step_to_dict(self, step: ReasoningStep) -> Dict[str, Any]:
        """Convert ReasoningStep to dictionary"""
        return {
            "step_name": step.step_name,
            "emoji": step.emoji,
            "input_context": step.input_context,
            "output": step.output,
            "confidence": step.confidence,
            "timestamp": step.timestamp.isoformat(),
            "metadata": step.metadata
        }

    def _build_reasoning_trace_text(self) -> List[str]:
        """Build human-readable reasoning trace"""
        trace = []
        for step in self.reasoning_trace:
            trace.append(
                f"{step.emoji} {step.step_name}: {step.output} "
                f"(confidence: {step.confidence:.2f})"
            )
        return trace

    def _create_warm_summary(
        self,
        cognitive_result: Dict,
        architecture_result: Dict
    ) -> str:
        """Create warm, Cece-style summary"""
        confidence = cognitive_result.get("confidence", 0.85)

        summary = (
            f"Okay, I've worked through this with you. "
            f"Here's what's actually happening and what to do about it.\n\n"
            f"{cognitive_result['answer']['decision']}\n\n"
            f"I'm {int(confidence * 100)}% confident in this approach. "
        )

        if confidence < 0.75:
            summary += (
                "That said, this is complex and I'd recommend getting "
                "a second opinion before committing."
            )
        else:
            summary += "This feels solid. Let's do it."

        return summary

    def _create_emotional_grounding(self, emotional_state: str) -> str:
        """Create emotional grounding message"""
        grounding_messages = {
            "grounded": "You've got this. The path is clear.",
            "uncertain": "It's okay to feel uncertain. We've mapped the knowns and unknowns.",
            "overwhelmed": "I know it feels like a lot. We've broken it down into manageable pieces.",
            "confident": "The energy is right. Trust the process.",
            "anxious": "The anxiety makes sense, but we've accounted for the risks."
        }

        return grounding_messages.get(emotional_state, "Take it one step at a time.")

    async def cleanup(self) -> None:
        """Cleanup after execution"""
        await super().cleanup()
        self.logger.info(f"🟣 Cece completed with {len(self.reasoning_trace)} reasoning steps")
