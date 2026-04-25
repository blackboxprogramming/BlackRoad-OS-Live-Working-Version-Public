"""
Lucidia Agent Mode - Autonomous task execution.

Lucidia isn't just reactive - she can plan and execute multi-step tasks.
Give her a goal, she figures out the steps and does them.

Architecture:
  Goal -> Planner -> Steps -> Executor -> Results
"""

import re
import time
from datetime import datetime
from typing import List, Dict, Optional, Tuple, Callable
from dataclasses import dataclass, field
from enum import Enum

# Import tools
try:
    from tools import ToolExecutor, ToolResult, TOOLS
    TOOLS_AVAILABLE = True
except ImportError:
    TOOLS_AVAILABLE = False
    ToolExecutor = None


# ═══════════════════════════════════════════════════════════════════════════════
# TASK DEFINITIONS
# ═══════════════════════════════════════════════════════════════════════════════

class StepStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class Step:
    """A single step in a task plan."""
    id: int
    description: str
    tool: str
    args: List[str]
    status: StepStatus = StepStatus.PENDING
    result: Optional[str] = None
    duration_ms: int = 0
    depends_on: List[int] = field(default_factory=list)


@dataclass
class TaskPlan:
    """A complete task plan with steps."""
    goal: str
    steps: List[Step] = field(default_factory=list)
    created: str = field(default_factory=lambda: datetime.now().isoformat())
    status: str = "planned"
    current_step: int = 0


# ═══════════════════════════════════════════════════════════════════════════════
# GOAL PATTERNS -> TASK PLANS
# ═══════════════════════════════════════════════════════════════════════════════

# Pattern-based task planning (no LLM needed for common tasks)
TASK_PATTERNS = {
    # Code exploration
    r"explore\s+(?:the\s+)?(?:codebase|code|project)": [
        ("ls", []),
        ("find", ["*.py"]),
        ("find", ["*.js"]),
        ("grep", ["def main", ".", "*.py"]),
        ("grep", ["class ", ".", "*.py"]),
    ],

    r"understand\s+(\S+)": [
        ("read", ["{1}", "100"]),
        ("grep", ["import", "{1}"]),
        ("grep", ["def |class ", "{1}"]),
    ],

    r"find\s+(?:all\s+)?(\w+)\s+(?:in|across)\s+(?:the\s+)?(?:codebase|project|code)": [
        ("grep", ["{1}", "."]),
        ("def", ["{1}"]),
    ],

    # Git operations
    r"(?:show|what.?s)\s+(?:the\s+)?git\s+status": [
        ("git-status", []),
        ("git-branch", []),
    ],

    r"(?:show|what.?s)\s+changed": [
        ("git-status", []),
        ("git-diff", []),
    ],

    r"(?:show|review)\s+recent\s+(?:commits|changes|history)": [
        ("git-log", ["20"]),
        ("git-diff", []),
    ],

    # File operations
    r"list\s+(?:all\s+)?(\w+)\s+files": [
        ("find", ["*.{1}"]),
    ],

    r"read\s+(?:the\s+)?(\S+)": [
        ("read", ["{1}"]),
    ],

    r"search\s+for\s+['\"]?([^'\"]+)['\"]?\s+in\s+(\S+)": [
        ("grep", ["{1}", "{2}"]),
    ],

    # System tasks
    r"(?:show|check)\s+system\s+(?:info|status)": [
        ("sysinfo", []),
        ("shell", ["df -h"]),
        ("ps", ["python"]),
    ],

    r"(?:what|which)\s+processes\s+(?:are\s+)?running": [
        ("ps", []),
    ],

    # Analysis tasks
    r"analyze\s+(?:the\s+)?(\S+)": [
        ("read", ["{1}", "50"]),
        ("shell", ["wc -l {1}"]),
        ("grep", ["TODO|FIXME|XXX", "{1}"]),
        ("grep", ["def |class |function ", "{1}"]),
    ],

    r"count\s+lines?\s+(?:in\s+)?(\S+)": [
        ("shell", ["wc -l {1}"]),
    ],

    r"find\s+todos?\s+(?:in\s+)?(?:the\s+)?(?:codebase|project|code)?": [
        ("grep", ["TODO|FIXME|XXX|HACK", "."]),
    ],
}


def match_goal_to_plan(goal: str) -> Optional[TaskPlan]:
    """
    Match a natural language goal to a task plan.
    Returns None if no pattern matches.
    """
    goal_lower = goal.lower().strip()

    for pattern, steps_template in TASK_PATTERNS.items():
        match = re.search(pattern, goal_lower, re.IGNORECASE)
        if match:
            plan = TaskPlan(goal=goal)

            for i, (tool, args_template) in enumerate(steps_template):
                # Substitute captured groups into args
                args = []
                for arg in args_template:
                    if "{" in arg:
                        # Replace {1}, {2}, etc. with captured groups
                        for j, group in enumerate(match.groups(), 1):
                            arg = arg.replace(f"{{{j}}}", group or "")
                        args.append(arg)
                    else:
                        args.append(arg)

                step = Step(
                    id=i + 1,
                    description=f"{tool} {' '.join(args)}".strip(),
                    tool=tool,
                    args=args
                )
                plan.steps.append(step)

            return plan

    return None


# ═══════════════════════════════════════════════════════════════════════════════
# AGENT EXECUTOR
# ═══════════════════════════════════════════════════════════════════════════════

class AgentExecutor:
    """
    Executes task plans autonomously.
    Reports progress as it goes.
    """

    def __init__(self, on_progress: Callable[[str], None] = None):
        self.tool_executor = ToolExecutor() if TOOLS_AVAILABLE else None
        self.on_progress = on_progress or print
        self.history: List[TaskPlan] = []
        self.max_steps = 20  # Safety limit

    def plan(self, goal: str) -> Optional[TaskPlan]:
        """Create a plan for a goal."""
        return match_goal_to_plan(goal)

    def execute_step(self, step: Step) -> bool:
        """Execute a single step."""
        if not self.tool_executor:
            step.status = StepStatus.FAILED
            step.result = "Tools not available"
            return False

        step.status = StepStatus.RUNNING
        self.on_progress(f"  ▸ Step {step.id}: {step.description}")

        start = time.time()

        try:
            result = self.tool_executor.execute(step.tool, step.args)
            step.duration_ms = int((time.time() - start) * 1000)

            if result.success:
                step.status = StepStatus.SUCCESS
                step.result = result.output

                # Show truncated output
                lines = result.output.split('\n')
                if len(lines) > 5:
                    preview = '\n'.join(lines[:5]) + f"\n    ... ({len(lines) - 5} more lines)"
                else:
                    preview = result.output

                self.on_progress(f"    ✓ ({step.duration_ms}ms)")
                for line in preview.split('\n')[:8]:
                    self.on_progress(f"      {line}")
                return True
            else:
                step.status = StepStatus.FAILED
                step.result = result.output
                self.on_progress(f"    ✗ {result.output[:100]}")
                return False

        except Exception as e:
            step.status = StepStatus.FAILED
            step.result = str(e)
            self.on_progress(f"    ✗ Error: {e}")
            return False

    def execute(self, plan: TaskPlan, stop_on_failure: bool = False) -> TaskPlan:
        """Execute a complete plan."""
        self.on_progress(f"\n  ▣═▣ Agent Mode: {plan.goal}")
        self.on_progress(f"  ────────────────────────────────────")
        self.on_progress(f"  Plan: {len(plan.steps)} step(s)")

        plan.status = "running"

        for step in plan.steps[:self.max_steps]:
            plan.current_step = step.id

            success = self.execute_step(step)

            if not success and stop_on_failure:
                plan.status = "failed"
                self.on_progress(f"\n  ✗ Stopped at step {step.id}")
                break

        # Summary
        succeeded = sum(1 for s in plan.steps if s.status == StepStatus.SUCCESS)
        failed = sum(1 for s in plan.steps if s.status == StepStatus.FAILED)

        if failed == 0:
            plan.status = "completed"
            self.on_progress(f"\n  ✓ Completed {succeeded}/{len(plan.steps)} steps")
        else:
            plan.status = "partial"
            self.on_progress(f"\n  ⚠ Completed {succeeded}/{len(plan.steps)} steps ({failed} failed)")

        self.history.append(plan)
        return plan

    def run(self, goal: str, stop_on_failure: bool = False) -> Optional[TaskPlan]:
        """Plan and execute a goal."""
        plan = self.plan(goal)

        if not plan:
            self.on_progress(f"\n  ? Unknown task pattern: {goal}")
            self.on_progress("  Try: 'explore the codebase', 'find todos', 'analyze <file>'")
            return None

        return self.execute(plan, stop_on_failure)

    def get_stats(self) -> Dict:
        """Get agent statistics."""
        total_steps = sum(len(p.steps) for p in self.history)
        successful_steps = sum(
            sum(1 for s in p.steps if s.status == StepStatus.SUCCESS)
            for p in self.history
        )

        return {
            "tasks_run": len(self.history),
            "total_steps": total_steps,
            "successful_steps": successful_steps,
            "success_rate": f"{successful_steps/total_steps*100:.1f}%" if total_steps > 0 else "N/A"
        }


# ═══════════════════════════════════════════════════════════════════════════════
# INTERACTIVE AGENT
# ═══════════════════════════════════════════════════════════════════════════════

class InteractiveAgent:
    """
    Interactive agent that can be directed by the user.
    Supports plan preview, step-by-step execution, etc.
    """

    def __init__(self):
        self.executor = AgentExecutor()
        self.current_plan: Optional[TaskPlan] = None

    def preview(self, goal: str) -> str:
        """Preview the plan without executing."""
        plan = self.executor.plan(goal)

        if not plan:
            return f"No plan available for: {goal}"

        self.current_plan = plan

        lines = [f"Plan for: {goal}", ""]
        for step in plan.steps:
            lines.append(f"  {step.id}. @{step.tool} {' '.join(step.args)}")
        lines.append("")
        lines.append("Run '/agent go' to execute or '/agent step' for step-by-step")

        return "\n".join(lines)

    def go(self) -> str:
        """Execute the current plan."""
        if not self.current_plan:
            return "No plan loaded. Use '/agent <goal>' to create one."

        output_lines = []
        def capture(line):
            output_lines.append(line)

        old_callback = self.executor.on_progress
        self.executor.on_progress = capture

        self.executor.execute(self.current_plan)

        self.executor.on_progress = old_callback
        self.current_plan = None

        return "\n".join(output_lines)

    def step(self) -> str:
        """Execute one step of the current plan."""
        if not self.current_plan:
            return "No plan loaded."

        # Find next pending step
        next_step = None
        for step in self.current_plan.steps:
            if step.status == StepStatus.PENDING:
                next_step = step
                break

        if not next_step:
            self.current_plan = None
            return "Plan completed."

        output_lines = []
        def capture(line):
            output_lines.append(line)

        old_callback = self.executor.on_progress
        self.executor.on_progress = capture

        self.executor.execute_step(next_step)

        self.executor.on_progress = old_callback

        # Show remaining steps
        remaining = sum(1 for s in self.current_plan.steps if s.status == StepStatus.PENDING)
        if remaining > 0:
            output_lines.append(f"\n  {remaining} step(s) remaining. '/agent step' for next.")
        else:
            self.current_plan = None
            output_lines.append("\n  Plan completed.")

        return "\n".join(output_lines)

    def run(self, goal: str) -> str:
        """Plan and execute a goal immediately."""
        output_lines = []
        def capture(line):
            output_lines.append(line)

        old_callback = self.executor.on_progress
        self.executor.on_progress = capture

        self.executor.run(goal)

        self.executor.on_progress = old_callback

        return "\n".join(output_lines)

    def help(self) -> str:
        """Show agent help."""
        return """Agent Mode Commands:
  /agent <goal>      - Preview plan for a goal
  /agent go          - Execute current plan
  /agent step        - Execute one step
  /agent stats       - Show agent statistics

Example Goals:
  "explore the codebase"
  "understand lucidia.py"
  "find todos in the project"
  "show what's changed"
  "analyze security.py"
  "search for 'def main' in *.py"
  "list all python files"
  "check system status"
"""
