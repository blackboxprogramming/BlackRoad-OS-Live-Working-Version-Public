"""
QLM Demo Script - Shows QLM in action

This script demonstrates the core QLM functionality:
1. Recording Operator intent
2. Recording agent executions
3. Detecting QI emergence
4. Querying state
5. Generating Operator summaries

Run: python -m qlm_lab.demo
"""

import logging
from datetime import datetime, timedelta

from qlm_lab.api import QLMInterface
from qlm_lab.models import ActorRole, EventType

# Setup logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)


def demo_basic_workflow():
    """Demonstrate basic QLM workflow"""
    print("=" * 60)
    print("QLM Demo: Basic Workflow")
    print("=" * 60)
    print()

    # Initialize QLM
    qlm = QLMInterface()
    print("✓ QLM initialized")
    print()

    # Register agents
    agent1 = qlm.register_agent(
        agent_id="agent-coder-001",
        name="CodeWriter",
        role=ActorRole.CODER,
        capabilities=["python", "javascript", "testing"],
    )
    print(f"✓ Registered agent: {agent1.name}")

    agent2 = qlm.register_agent(
        agent_id="agent-reviewer-001",
        name="CodeReviewer",
        role=ActorRole.REVIEWER,
        capabilities=["code_review", "security_audit"],
    )
    print(f"✓ Registered agent: {agent2.name}")
    print()

    # Operator defines intent
    print("👤 Operator: 'Build authentication feature'")
    intent_event = qlm.record_operator_intent(
        intent="Build authentication feature",
        description="Implement login, signup, and password reset",
        intent_node_id="intent-auth-001",
    )
    print(f"✓ Intent recorded (event: {intent_event.id[:8]}...)")
    print()

    # Agent executes
    print("🤖 Agent CodeWriter: Starting implementation...")
    exec_event = qlm.record_agent_execution(
        agent_id="agent-coder-001",
        task_description="Implement login endpoint",
        task_id="task-login-001",
        intent_node_id="intent-auth-001",
    )
    print(f"✓ Execution recorded (event: {exec_event.id[:8]}...)")
    print()

    # Agent completes
    print("🤖 Agent CodeWriter: Completed!")
    completion_event = qlm.record_agent_completion(
        agent_id="agent-coder-001",
        task_id="task-login-001",
        success=True,
        result={"files_modified": ["auth.py", "routes.py"], "tests_added": 5},
        intent_node_id="intent-auth-001",
    )
    print(f"✓ Completion recorded (event: {completion_event.id[:8]}...)")
    print()

    # Operator approves
    print("👤 Operator: 'Looks good!'")
    approval_event = qlm.record_operator_approval(
        what_approved="Login implementation",
        intent_node_id="intent-auth-001",
        task_id="task-login-001",
    )
    print(f"✓ Approval recorded (event: {approval_event.id[:8]}...)")
    print()

    # Query state
    print("📊 Query: Active actors")
    active = qlm.get_active_actors()
    print(f"  Active actors: {len(active)}")
    for actor in active:
        print(f"    - {actor.name} ({actor.role.value})")
    print()

    # Alignment
    print("🎯 Calculating HI-AI alignment...")
    alignment = qlm.get_alignment_score()
    print(f"  Alignment: {alignment:.1%}")
    print()

    # Summary
    print("📝 Operator Summary:")
    print("-" * 60)
    summary = qlm.get_summary(days=1)
    print(summary)
    print()


def demo_qi_emergence():
    """Demonstrate QI emergence detection"""
    print("=" * 60)
    print("QLM Demo: QI Emergence Detection")
    print("=" * 60)
    print()

    qlm = QLMInterface()
    qlm.register_agent("agent-001", "Agent1", ActorRole.EXECUTOR)

    # Operator intent
    qlm.record_operator_intent(
        intent="Fix database connection bug",
        intent_node_id="intent-bugfix-001",
    )

    # Agent hits error
    print("🤖 Agent encounters error...")
    qlm.record_agent_error(
        agent_id="agent-001",
        task_id="task-bugfix-001",
        error="Database connection refused",
        intent_node_id="intent-bugfix-001",
    )

    # Agent self-corrects (QI emergence!)
    print("🤖 Agent self-corrects (trying alternative approach)...")
    qlm.record_agent_execution(
        agent_id="agent-001",
        task_description="Fix database connection bug (retry with connection pool)",
        task_id="task-bugfix-001",
        intent_node_id="intent-bugfix-001",
    )

    qlm.record_agent_completion(
        agent_id="agent-001",
        task_id="task-bugfix-001",
        success=True,
        result={"approach": "connection_pool", "self_corrected": True},
        intent_node_id="intent-bugfix-001",
    )

    print()
    print("✨ QI Emergence Detection:")
    emergences = qlm.get_recent_emergences()
    if emergences:
        for em in emergences:
            print(f"  Pattern: {em.pattern_name}")
            print(f"  Explanation: {em.explanation}")
            print(f"  Confidence: {em.confidence:.0%}")
            print(f"  Impact: {em.impact_score:.1f}/1.0")
    else:
        print("  (No emergence detected - pattern matching may need tuning)")
    print()


def demo_operator_queries():
    """Demonstrate natural language queries"""
    print("=" * 60)
    print("QLM Demo: Operator Queries")
    print("=" * 60)
    print()

    qlm = QLMInterface()

    # Setup some activity
    qlm.register_agent("agent-001", "Agent1", ActorRole.EXECUTOR)
    qlm.record_operator_intent("Test operator queries")
    qlm.record_agent_execution("agent-001", "Do something", task_id="task-001")
    qlm.record_agent_completion("agent-001", "task-001", success=True)
    qlm.record_operator_approval("Agent work", task_id="task-001")

    # Ask questions
    questions = [
        "What did agents do today?",
        "Are we aligned with my intent?",
        "What's the status?",
    ]

    for question in questions:
        print(f"👤 Operator: '{question}'")
        print("-" * 60)
        answer = qlm.ask(question)
        print(answer)
        print()


def demo_full_scenario():
    """Demonstrate a complete multi-agent workflow"""
    print("=" * 60)
    print("QLM Demo: Full Multi-Agent Scenario")
    print("=" * 60)
    print()

    qlm = QLMInterface()

    # Register agents
    coder = qlm.register_agent("coder", "CodeWriter", ActorRole.CODER)
    reviewer = qlm.register_agent("reviewer", "CodeReviewer", ActorRole.REVIEWER)
    tester = qlm.register_agent("tester", "TestRunner", ActorRole.TESTER)

    print(f"✓ Registered 3 agents: {coder.name}, {reviewer.name}, {tester.name}")
    print()

    # Operator intent
    print("👤 Operator: 'Ship payment integration'")
    intent = qlm.record_operator_intent(
        intent="Ship payment integration",
        description="Integrate Stripe, add tests, deploy",
        intent_node_id="intent-payment-001",
    )
    print()

    # Coder implements
    print("🤖 CodeWriter: Implementing...")
    qlm.record_agent_execution(
        "coder", "Implement Stripe integration", "task-001", "intent-payment-001"
    )
    qlm.record_agent_completion("coder", "task-001", True)
    print("  ✓ Completed")
    print()

    # Handoff to reviewer
    print("🤖 CodeWriter → CodeReviewer")
    qlm.record_agent_handoff(
        "coder", "reviewer", "task-001", "Ready for review"
    )
    print()

    # Reviewer reviews
    print("🤖 CodeReviewer: Reviewing code...")
    qlm.record_agent_execution("reviewer", "Review Stripe code", "task-002")
    qlm.record_agent_completion("reviewer", "task-002", True)
    print("  ✓ Approved")
    print()

    # Handoff to tester
    print("🤖 CodeReviewer → TestRunner")
    qlm.record_agent_handoff("reviewer", "tester", "task-002", "Ready for testing")
    print()

    # Tester runs tests
    print("🤖 TestRunner: Running tests...")
    qlm.record_system_event(
        EventType.SYSTEM_TEST,
        "Payment integration tests",
        task_id="task-003",
        metadata={"passed": True, "test_count": 15},
    )
    print("  ✓ All tests passed")
    print()

    # Operator approves
    print("👤 Operator: 'Ship it!'")
    qlm.record_operator_approval(
        "Payment integration", intent_node_id="intent-payment-001"
    )
    print()

    # Deploy
    print("🚀 Deploying...")
    qlm.record_system_event(
        EventType.SYSTEM_DEPLOY,
        "Deployed payment feature to production",
        metadata={"environment": "production", "version": "v1.2.0"},
    )
    print("  ✓ Deployed")
    print()

    # Show results
    print("=" * 60)
    print("📊 Final State")
    print("=" * 60)
    print()

    print("Metrics:")
    print(f"  Total events: {len(qlm.state.events)}")
    print(f"  HI events: {qlm.state.metrics.hi_events}")
    print(f"  AI events: {qlm.state.metrics.ai_events}")
    print(f"  System events: {qlm.state.metrics.system_events}")
    print(f"  Alignment: {qlm.get_alignment_score():.1%}")
    print()

    print("Event Timeline:")
    for event in qlm.state.events:
        print(f"  [{event.timestamp.strftime('%H:%M:%S')}] {event.event_type.value}: {event.data}")
    print()


def main():
    """Run all demos"""
    print("\n🌟 QLM (Quantum Language Model) Demo Suite 🌟\n")

    try:
        demo_basic_workflow()
        input("Press Enter to continue to next demo...")
        print("\n")

        demo_qi_emergence()
        input("Press Enter to continue to next demo...")
        print("\n")

        demo_operator_queries()
        input("Press Enter to continue to next demo...")
        print("\n")

        demo_full_scenario()

    except KeyboardInterrupt:
        print("\n\nDemo interrupted by user.")
    except Exception as e:
        print(f"\n\n❌ Demo error: {e}")
        import traceback

        traceback.print_exc()

    print("\n✨ Demo complete! ✨\n")
    print("Next steps:")
    print("  1. Run experiments: python -m qlm_lab.experiments.run_all")
    print("  2. Read docs: docs/QLM.md")
    print("  3. Integrate with your system!")
    print()


if __name__ == "__main__":
    main()
