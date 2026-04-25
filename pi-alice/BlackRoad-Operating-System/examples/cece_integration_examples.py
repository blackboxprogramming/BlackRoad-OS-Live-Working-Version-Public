"""
Cece Cognition Framework - Integration Examples

Complete examples showing how to use the Cece framework:
1. Single agent execution
2. Multi-agent workflows (sequential, parallel, recursive)
3. API integration
4. Real-world scenarios

Run with:
    python examples/cece_integration_examples.py
"""

import asyncio
from typing import Dict, Any


# ============================================================================
# EXAMPLE 1: SINGLE AGENT EXECUTION
# ============================================================================

async def example_1_single_agent():
    """Example 1: Execute Cece for a complex decision"""
    print("\n" + "="*80)
    print("EXAMPLE 1: Single Agent Execution - Cece")
    print("="*80 + "\n")

    from agents.categories.ai_ml.cece_agent import CeceAgent

    # Create Cece instance
    cece = CeceAgent()

    # Run cognition on a complex problem
    result = await cece.run({
        "input": "I have 5 projects with competing deadlines. Project A is due in 2 days but low impact. Project B is high impact but due in 2 weeks. Projects C, D, E are medium priority. My team is burnt out. What should I do?",
        "context": {
            "projects": {
                "A": {"deadline_days": 2, "impact": "low", "effort": "medium"},
                "B": {"deadline_days": 14, "impact": "high", "effort": "high"},
                "C": {"deadline_days": 7, "impact": "medium", "effort": "low"},
                "D": {"deadline_days": 10, "impact": "medium", "effort": "medium"},
                "E": {"deadline_days": 5, "impact": "medium", "effort": "low"}
            },
            "team_status": "burnt_out",
            "available_resources": "limited"
        }
    })

    # Display results
    print("📊 CECE ANALYSIS RESULTS:\n")
    print(f"Status: {result.status.value}")
    print(f"Confidence: {result.data['confidence']:.2%}")
    print(f"Execution Time: {result.duration_seconds:.2f}s\n")

    print("💭 SUMMARY:")
    print(result.data["output"]["summary"])
    print()

    print("📋 ACTION STEPS:")
    for i, step in enumerate(result.data["output"]["action_steps"], 1):
        print(f"{i}. {step}")
    print()

    print("💛 EMOTIONAL GROUNDING:")
    print(result.data["output"]["emotional_grounding"])
    print()

    print("🔄 NEXT CHECK-IN:")
    print(result.data["output"]["next_check_in"])
    print()


# ============================================================================
# EXAMPLE 2: MULTI-AGENT SEQUENTIAL WORKFLOW
# ============================================================================

async def example_2_sequential_workflow():
    """Example 2: Build a feature using multiple agents in sequence"""
    print("\n" + "="*80)
    print("EXAMPLE 2: Multi-Agent Sequential Workflow - Build a Dashboard")
    print("="*80 + "\n")

    from backend.app.services.orchestration import (
        OrchestrationEngine,
        Workflow,
        WorkflowStep,
        ExecutionMode
    )

    # Create orchestration engine
    engine = OrchestrationEngine()

    # Define workflow
    workflow = Workflow(
        id="build-dashboard-001",
        name="Build AI Agent Dashboard",
        steps=[
            WorkflowStep(
                name="architect",
                agent_name="cece",
                input_template="Design a comprehensive dashboard for monitoring AI agent workflows. Include real-time status, performance metrics, and reasoning traces."
            ),
            WorkflowStep(
                name="backend",
                agent_name="codex",
                input_template="Implement backend API for dashboard based on architecture",
                depends_on=["architect"]
            ),
            WorkflowStep(
                name="frontend",
                agent_name="wasp",
                input_template="Design UI for dashboard",
                depends_on=["architect"]
            ),
            WorkflowStep(
                name="review",
                agent_name="cece",
                input_template="Review complete implementation and provide final recommendations",
                depends_on=["backend", "frontend"]
            )
        ],
        mode=ExecutionMode.SEQUENTIAL,
        timeout_seconds=600
    )

    # Execute workflow
    result = await engine.execute_workflow(workflow)

    # Display results
    print(f"📊 WORKFLOW RESULTS:\n")
    print(f"Workflow ID: {result.workflow_id}")
    print(f"Status: {result.status.value}")
    print(f"Total Duration: {result.total_duration_seconds:.2f}s")
    print(f"Steps Completed: {len(result.step_results)}\n")

    for step_name, step_result in result.step_results.items():
        print(f"\n📌 Step: {step_name}")
        print(f"   Confidence: {step_result.get('confidence', 0):.2%}")
        if "summary" in step_result.get("output", {}):
            print(f"   Summary: {step_result['output']['summary'][:100]}...")


# ============================================================================
# EXAMPLE 3: PARALLEL WORKFLOW
# ============================================================================

async def example_3_parallel_workflow():
    """Example 3: Launch product with parallel agent execution"""
    print("\n" + "="*80)
    print("EXAMPLE 3: Parallel Workflow - Launch SaaS Product")
    print("="*80 + "\n")

    from backend.app.services.orchestration import (
        OrchestrationEngine,
        Workflow,
        WorkflowStep,
        ExecutionMode
    )

    engine = OrchestrationEngine()

    workflow = Workflow(
        id="launch-product-001",
        name="Launch SaaS Product",
        steps=[
            # Phase 1: Strategic planning (sequential)
            WorkflowStep(
                name="strategy",
                agent_name="cece",
                input_template="Create launch strategy for AI-powered task management SaaS"
            ),

            # Phase 2: Parallel execution (legal, backend, frontend)
            WorkflowStep(
                name="legal",
                agent_name="clause",
                input_template="Draft terms of service and privacy policy",
                depends_on=["strategy"],
                parallel_with=["backend", "frontend"]
            ),
            WorkflowStep(
                name="backend",
                agent_name="codex",
                input_template="Implement backend infrastructure",
                depends_on=["strategy"],
                parallel_with=["legal", "frontend"]
            ),
            WorkflowStep(
                name="frontend",
                agent_name="wasp",
                input_template="Design and implement UI",
                depends_on=["strategy"],
                parallel_with=["legal", "backend"]
            ),

            # Phase 3: Integration review (sequential after parallel)
            WorkflowStep(
                name="final_review",
                agent_name="cece",
                input_template="Review all outputs and create launch checklist",
                depends_on=["legal", "backend", "frontend"]
            )
        ],
        mode=ExecutionMode.PARALLEL,
        timeout_seconds=900
    )

    result = await engine.execute_workflow(workflow)

    print(f"📊 PARALLEL WORKFLOW RESULTS:\n")
    print(f"Status: {result.status.value}")
    print(f"Total Duration: {result.total_duration_seconds:.2f}s")
    print(f"(Note: Parallel execution can be faster than sequential!)\n")


# ============================================================================
# EXAMPLE 4: RECURSIVE REFINEMENT
# ============================================================================

async def example_4_recursive_refinement():
    """Example 4: Iterative optimization with recursive workflow"""
    print("\n" + "="*80)
    print("EXAMPLE 4: Recursive Workflow - Algorithm Optimization")
    print("="*80 + "\n")

    from backend.app.services.orchestration import (
        OrchestrationEngine,
        Workflow,
        WorkflowStep,
        ExecutionMode
    )

    engine = OrchestrationEngine()

    workflow = Workflow(
        id="optimize-algorithm-001",
        name="Optimize Algorithm Performance",
        steps=[
            WorkflowStep(
                name="implement",
                agent_name="codex",
                input_template="Implement sorting algorithm optimization"
            ),
            WorkflowStep(
                name="review",
                agent_name="cece",
                input_template="Review implementation and suggest optimizations"
            )
        ],
        mode=ExecutionMode.RECURSIVE,  # Will iterate until convergence
        timeout_seconds=300
    )

    result = await engine.execute_workflow(workflow)

    print(f"📊 RECURSIVE WORKFLOW RESULTS:\n")
    print(f"Status: {result.status.value}")
    print(f"Iterations: {len([r for r in result.reasoning_trace if 'iter' in r.get('step', '')])}")
    print(f"Final Confidence: {result.memory.get('final_confidence', 0):.2%}\n")


# ============================================================================
# EXAMPLE 5: API INTEGRATION
# ============================================================================

async def example_5_api_integration():
    """Example 5: Use Cece via REST API"""
    print("\n" + "="*80)
    print("EXAMPLE 5: API Integration")
    print("="*80 + "\n")

    print("💡 API EXAMPLES:\n")

    print("1️⃣ Execute Single Agent:")
    print("""
    POST /api/cognition/execute
    Content-Type: application/json

    {
      "agent": "cece",
      "input": "Should I refactor my monolithic app to microservices?",
      "context": {
        "current_scale": "1M requests/day",
        "team_size": 5,
        "timeline": "3 months"
      }
    }
    """)

    print("\n2️⃣ Execute Workflow:")
    print("""
    POST /api/cognition/workflows
    Content-Type: application/json

    {
      "name": "Build Feature",
      "mode": "sequential",
      "steps": [
        {
          "name": "architect",
          "agent_name": "cece",
          "input_template": "Design authentication system"
        },
        {
          "name": "implement",
          "agent_name": "codex",
          "input_template": "${architect.architecture}",
          "depends_on": ["architect"]
        }
      ]
    }
    """)

    print("\n3️⃣ Get Reasoning Trace:")
    print("""
    GET /api/cognition/reasoning-trace/{workflow_id}

    Response:
    {
      "workflow_id": "uuid",
      "trace": [
        {
          "step": "🚨 Not ok",
          "input": "...",
          "output": "...",
          "confidence": 0.95
        },
        ...
      ]
    }
    """)


# ============================================================================
# EXAMPLE 6: REAL-WORLD SCENARIO - CODE REVIEW
# ============================================================================

async def example_6_code_review_workflow():
    """Example 6: Automated code review with legal compliance check"""
    print("\n" + "="*80)
    print("EXAMPLE 6: Real-World - Automated Code Review + Compliance")
    print("="*80 + "\n")

    from backend.app.services.orchestration import (
        OrchestrationEngine,
        Workflow,
        WorkflowStep,
        ExecutionMode
    )

    engine = OrchestrationEngine()

    workflow = Workflow(
        id="code-review-001",
        name="Full Code Review with Compliance Check",
        steps=[
            WorkflowStep(
                name="architecture_review",
                agent_name="cece",
                input_template="Review system architecture and identify issues"
            ),
            WorkflowStep(
                name="code_security",
                agent_name="codex",
                input_template="Security audit of codebase",
                parallel_with=["legal_compliance"]
            ),
            WorkflowStep(
                name="legal_compliance",
                agent_name="clause",
                input_template="Check GDPR/CCPA compliance",
                parallel_with=["code_security"]
            ),
            WorkflowStep(
                name="ui_accessibility",
                agent_name="wasp",
                input_template="Audit UI accessibility (WCAG 2.1 AA)"
            ),
            WorkflowStep(
                name="final_report",
                agent_name="cece",
                input_template="Synthesize findings and create action plan",
                depends_on=["architecture_review", "code_security", "legal_compliance", "ui_accessibility"]
            )
        ],
        mode=ExecutionMode.PARALLEL
    )

    result = await engine.execute_workflow(workflow)

    print(f"📊 CODE REVIEW RESULTS:\n")
    print(f"Status: {result.status.value}")
    print(f"Total Checks: {len(result.step_results)}")
    print(f"\nFull report available in workflow memory.\n")


# ============================================================================
# EXAMPLE 7: MEMORY SHARING
# ============================================================================

async def example_7_memory_sharing():
    """Example 7: Demonstrate memory sharing between agents"""
    print("\n" + "="*80)
    print("EXAMPLE 7: Memory Sharing Across Agents")
    print("="*80 + "\n")

    from backend.app.services.orchestration import (
        OrchestrationEngine,
        Workflow,
        WorkflowStep,
        ExecutionMode
    )

    engine = OrchestrationEngine()

    # Provide initial context that all agents can access
    initial_context = {
        "project_name": "BlackRoad OS",
        "tech_stack": {"backend": "FastAPI", "frontend": "Vanilla JS", "db": "PostgreSQL"},
        "team_preferences": {"coding_style": "async-first", "test_coverage": 80}
    }

    workflow = Workflow(
        id="memory-demo-001",
        name="Memory Sharing Demo",
        steps=[
            WorkflowStep(
                name="analyze",
                agent_name="cece",
                input_template="Analyze project requirements"
            ),
            WorkflowStep(
                name="implement",
                agent_name="codex",
                input_template="Implement based on analysis (will have access to memory)",
                depends_on=["analyze"]
            )
        ]
    )

    result = await engine.execute_workflow(workflow, initial_context=initial_context)

    print("📊 MEMORY SHARING DEMO:\n")
    print(f"Initial Context: {initial_context}")
    print(f"\nFinal Memory includes:")
    print(f"- Original context")
    print(f"- Outputs from each agent")
    print(f"- Confidence scores")
    print(f"- Reasoning traces\n")


# ============================================================================
# MAIN RUNNER
# ============================================================================

async def main():
    """Run all examples"""
    print("\n" + "🟣" * 40)
    print("CECE COGNITION FRAMEWORK - INTEGRATION EXAMPLES")
    print("🟣" * 40)

    examples = [
        ("Single Agent", example_1_single_agent),
        ("Sequential Workflow", example_2_sequential_workflow),
        ("Parallel Workflow", example_3_parallel_workflow),
        ("Recursive Refinement", example_4_recursive_refinement),
        ("API Integration", example_5_api_integration),
        ("Code Review Workflow", example_6_code_review_workflow),
        ("Memory Sharing", example_7_memory_sharing)
    ]

    print("\n📚 AVAILABLE EXAMPLES:\n")
    for i, (name, _) in enumerate(examples, 1):
        print(f"{i}. {name}")

    print("\n" + "-"*80)
    print("Running all examples... (this may take a few minutes)")
    print("-"*80)

    for name, example_func in examples:
        try:
            await example_func()
        except Exception as e:
            print(f"\n❌ Error in '{name}': {str(e)}\n")

    print("\n" + "🟣" * 40)
    print("ALL EXAMPLES COMPLETED!")
    print("🟣" * 40 + "\n")

    print("📖 NEXT STEPS:\n")
    print("1. Try modifying the examples above")
    print("2. Create your own workflows")
    print("3. Integrate with your application")
    print("4. Check out CECE_FRAMEWORK.md for full documentation")
    print("5. Read PROMPT_SYSTEM.md for prompt engineering guide\n")


if __name__ == "__main__":
    asyncio.run(main())
