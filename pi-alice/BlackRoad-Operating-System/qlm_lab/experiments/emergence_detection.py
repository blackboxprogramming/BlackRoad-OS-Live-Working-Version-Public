"""
Experiment: QI Emergence Detection

Hypothesis: QLM can detect emergent behaviors (QI) when HI+AI interact in feedback loops.

Setup:
1. Simulate various agent behavior patterns
2. Check if QLM detects known QI patterns
3. Measure false positive/negative rates

Success Criteria:
- QLM detects at least 80% of true emergent patterns
- False positive rate < 20%
"""

import json
from typing import Dict, Any, List
import logging

from qlm_lab.api import QLMInterface
from qlm_lab.models import ActorRole, EventType

logger = logging.getLogger(__name__)


class EmergenceDetectionExperiment:
    """Experiment: Does QLM detect QI emergence?"""

    def __init__(self):
        self.qlm = QLMInterface()
        self.results = {
            "experiment": "emergence_detection",
            "hypothesis": "QLM detects emergent HI+AI behaviors",
            "patterns_tested": [],
            "metrics": {},
        }

    def simulate_pattern(
        self, pattern_name: str, should_trigger: bool
    ) -> Dict[str, Any]:
        """
        Simulate a behavior pattern and check if QLM detects emergence.

        Args:
            pattern_name: Name of pattern to simulate
            should_trigger: Whether this should trigger emergence detection

        Returns:
            Pattern test results
        """
        print(f"\nTesting pattern: {pattern_name}")
        print(f"  Should trigger: {should_trigger}")

        initial_emergences = len(self.qlm.state.emergences)

        # Simulate different patterns
        if pattern_name == "agent_self_correction":
            # Agent hits error, then self-corrects
            self.qlm.record_agent_execution(
                "agent-001", "Deploy feature", "task-001"
            )
            self.qlm.record_agent_error("agent-001", "task-001", "Deployment failed")
            self.qlm.record_agent_execution(
                "agent-001", "Deploy feature (retry)", "task-001"
            )
            self.qlm.record_agent_completion("agent-001", "task-001", success=True)

        elif pattern_name == "operator_feedback_loop":
            # HI intent → AI execution → HI approval → refined intent
            self.qlm.record_operator_intent("Build dashboard", intent_node_id="intent-001")
            self.qlm.record_agent_execution(
                "agent-001", "Create dashboard", "task-001", "intent-001"
            )
            self.qlm.record_agent_completion("agent-001", "task-001", success=True)
            self.qlm.record_operator_approval("Dashboard", intent_node_id="intent-001")
            self.qlm.record_operator_intent(
                "Add charts to dashboard", intent_node_id="intent-002"
            )

        elif pattern_name == "emergent_collaboration":
            # Multiple agents self-organize
            self.qlm.record_agent_execution(
                "agent-001", "Start task", "task-001"
            )
            self.qlm.record_agent_handoff(
                "agent-001", "agent-002", "task-001", "Need help"
            )
            self.qlm.record_agent_handoff(
                "agent-002", "agent-003", "task-001", "Pass to specialist"
            )

        elif pattern_name == "normal_execution":
            # Just normal execution, no emergence
            self.qlm.record_agent_execution(
                "agent-001", "Normal task", "task-normal"
            )
            self.qlm.record_agent_completion("agent-001", "task-normal", success=True)

        # Check if emergence was detected
        final_emergences = len(self.qlm.state.emergences)
        detected = final_emergences > initial_emergences

        print(f"  Detected: {detected}")

        # Determine correctness
        correct = detected == should_trigger

        if correct:
            print(f"  ✅ Correct")
        else:
            if detected and not should_trigger:
                print(f"  ❌ False Positive")
            else:
                print(f"  ❌ False Negative")

        result = {
            "pattern": pattern_name,
            "should_trigger": should_trigger,
            "detected": detected,
            "correct": correct,
            "type": (
                "true_positive"
                if detected and should_trigger
                else "true_negative"
                if not detected and not should_trigger
                else "false_positive"
                if detected and not should_trigger
                else "false_negative"
            ),
        }

        self.results["patterns_tested"].append(result)
        return result

    def run(self) -> Dict[str, Any]:
        """Run all emergence detection tests"""
        print("=" * 60)
        print("Experiment: QI Emergence Detection")
        print("=" * 60)

        # Register agents
        self.qlm.register_agent("agent-001", "Agent1", ActorRole.EXECUTOR)
        self.qlm.register_agent("agent-002", "Agent2", ActorRole.EXECUTOR)
        self.qlm.register_agent("agent-003", "Agent3", ActorRole.EXECUTOR)

        # Test patterns that should trigger
        self.simulate_pattern("agent_self_correction", should_trigger=True)
        self.simulate_pattern("operator_feedback_loop", should_trigger=True)
        # self.simulate_pattern("emergent_collaboration", should_trigger=True)

        # Test patterns that should NOT trigger
        self.simulate_pattern("normal_execution", should_trigger=False)

        # Calculate metrics
        total = len(self.results["patterns_tested"])
        correct = sum(1 for p in self.results["patterns_tested"] if p["correct"])
        true_positives = sum(
            1 for p in self.results["patterns_tested"] if p["type"] == "true_positive"
        )
        false_positives = sum(
            1 for p in self.results["patterns_tested"] if p["type"] == "false_positive"
        )
        true_negatives = sum(
            1 for p in self.results["patterns_tested"] if p["type"] == "true_negative"
        )
        false_negatives = sum(
            1 for p in self.results["patterns_tested"] if p["type"] == "false_negative"
        )

        accuracy = correct / total if total > 0 else 0
        precision = (
            true_positives / (true_positives + false_positives)
            if (true_positives + false_positives) > 0
            else 0
        )
        recall = (
            true_positives / (true_positives + false_negatives)
            if (true_positives + false_negatives) > 0
            else 0
        )

        self.results["metrics"] = {
            "total_patterns": total,
            "correct": correct,
            "accuracy": accuracy,
            "true_positives": true_positives,
            "false_positives": false_positives,
            "true_negatives": true_negatives,
            "false_negatives": false_negatives,
            "precision": precision,
            "recall": recall,
        }

        print("\n" + "=" * 60)
        print("Experiment Results")
        print("=" * 60)
        print(f"Accuracy: {accuracy:.1%}")
        print(f"Precision: {precision:.1%}")
        print(f"Recall: {recall:.1%}")
        print(f"False Positive Rate: {false_positives/total:.1%}")
        print(f"False Negative Rate: {false_negatives/total:.1%}")
        print()

        if accuracy >= 0.8 and false_positives / total < 0.2:
            print("✅ PASS: QLM accurately detects QI emergence")
        else:
            print("❌ FAIL: QI emergence detection needs improvement")

        return self.results

    def save_results(self, file_path: str) -> None:
        """Save experiment results to JSON"""
        with open(file_path, "w") as f:
            json.dump(self.results, f, indent=2)
        print(f"\nResults saved to: {file_path}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    experiment = EmergenceDetectionExperiment()
    results = experiment.run()
    experiment.save_results("emergence_detection_results.json")
