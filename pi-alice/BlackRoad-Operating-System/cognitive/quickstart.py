#!/usr/bin/env python3
"""
Cognitive OS - Quick Start Script

This demonstrates the Cognitive OS in action.
Run this to see what it can do!
"""

from cognitive import CognitiveOS, AgentRole, DocumentTemplate


def main():
    print("\n" + "=" * 70)
    print(" " * 20 + "COGNITIVE OS - QUICK START")
    print("=" * 70 + "\n")

    print("Initializing Cognitive Operating System...")
    cog = CognitiveOS(workspace_path=".")
    print("✓ Cognitive OS initialized\n")

    # Demo 1: Intent Graph
    print("-" * 70)
    print("DEMO 1: Intent Graph - Tracking Goals, Tasks, and WHY")
    print("-" * 70)

    goal = cog.create_goal(
        title="Build a smart document management system",
        description="Create a system that understands documents and organizes them automatically",
        rationale="Current file management is chaos. Downloads folder anarchy. Need semantic organization."
    )

    task1 = cog.create_task(
        "Implement OCR for document scanning",
        goal_id=goal.id,
        rationale="Need to extract structured data from PDFs and images"
    )

    task2 = cog.create_task(
        "Build auto-filing system",
        goal_id=goal.id,
        rationale="Documents should organize themselves based on content"
    )

    decision = cog.intent_graph.create_decision(
        title="Use Tesseract for OCR",
        rationale="Open source, well-maintained, good accuracy, supports multiple languages",
        alternatives_considered=[
            "Google Cloud Vision API (too expensive for local-first OS)",
            "AWS Textract (vendor lock-in)",
            "Azure Computer Vision (vendor lock-in)"
        ]
    )

    cog.intent_graph.link_nodes(decision.id, task1.id, "related")
    print()

    # Demo 2: Semantic File System
    print("-" * 70)
    print("DEMO 2: Semantic File System - Files That Know What They Are")
    print("-" * 70)

    print("\nExample: If you had a resume in downloads...")
    print("  Traditional: ~/Downloads/john_resume_final_v2_FINAL.pdf")
    print("  Cognitive OS suggests: documents/career/resumes/john_resume_final_v2_FINAL.pdf")
    print("\nBased on content analysis, not filename!")
    print()

    # Demo 3: Context Engine
    print("-" * 70)
    print("DEMO 3: Context Engine - Right Info at Right Time")
    print("-" * 70)

    print(f"\nGetting context for task: '{task1.title}'")
    context = cog.get_context(task_id=task1.id)

    print("\nRelevant context:")
    for item in context.get_top_items(5):
        print(f"  [{item.type:15s}] {item.title}")
        if item.metadata.get('rationale'):
            print(f"                   → Why: {item.metadata['rationale']}")

    print()

    # Demo 4: Agent Coordination
    print("-" * 70)
    print("DEMO 4: Agent Coordination - Multi-Agent Collaboration")
    print("-" * 70)

    from cognitive.agent_coordination import AgentInfo, HandoffType

    # Register agents
    coder = AgentInfo(name="CodeWriter", role=AgentRole.CODER)
    reviewer = AgentInfo(name="CodeReviewer", role=AgentRole.REVIEWER)

    cog.agent_coordinator.register_agent(coder)
    cog.agent_coordinator.register_agent(reviewer)

    print(f"\n✓ Registered agent: {coder.name} ({coder.role.value})")
    print(f"✓ Registered agent: {reviewer.name} ({reviewer.role.value})")

    # Create collaboration session
    session = cog.agent_coordinator.create_session(
        goal="Implement OCR feature",
        description="Add OCR capability to document processor"
    )

    print(f"\n✓ Created collaboration session: {session.goal}")

    # Assign task
    cog.agent_coordinator.assign_task(task1.id, coder.id)
    print(f"✓ Assigned task to {coder.name}")

    # Create handoff
    handoff = cog.agent_coordinator.create_handoff(
        from_agent_id=coder.id,
        to_agent_id=reviewer.id,
        task_id=task1.id,
        handoff_type=HandoffType.REVIEW,
        message="OCR implementation complete, ready for review"
    )

    print(f"✓ Created handoff: {coder.name} → {reviewer.name} (for review)")
    print()

    # Demo 5: Smart Documents
    print("-" * 70)
    print("DEMO 5: Smart Documents - Templates and Auto-Formatting")
    print("-" * 70)

    print("\nAvailable templates:")
    print("  ✓ ATS-friendly Resume (beats applicant tracking systems)")
    print("  ✓ Business Plan (executive summary, financials, market analysis)")
    print("  ✓ Meeting Notes (structured with action items)")
    print("  ✓ Technical Spec (architecture, requirements, API docs)")
    print("  ✓ And more...")

    print("\nDocuments can:")
    print("  • Extract text via OCR from images/PDFs")
    print("  • Identify what type of document they are")
    print("  • Auto-format for specific purposes (ATS, business, etc.)")
    print("  • Organize themselves into correct folders")
    print()

    # Show overall state
    print("-" * 70)
    print("CURRENT STATE")
    print("-" * 70)
    print(cog.intent_graph.get_summary())

    # Next steps
    print("\n" + "=" * 70)
    print("NEXT STEPS")
    print("=" * 70)
    print("""
1. Try it yourself:
   from cognitive import CognitiveOS
   cog = CognitiveOS()
   goal = cog.create_goal("Your goal here", rationale="Why you're doing this")

2. Process a document:
   cog.process_new_file("path/to/your/document.pdf")

3. Get context for your work:
   context = cog.get_context(query="What am I working on?")

4. Check the full usage guide:
   See cognitive/USAGE.md for complete examples

5. Integrate with your workflow:
   - Connect to your IDE
   - Watch your downloads folder
   - Link to git commits
   - Coordinate multiple agents

This is what AI collaboration should have been from day one.
No more context loss. No more file chaos. No more docs out of sync.

Welcome to the Cognitive OS.
""")

    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
