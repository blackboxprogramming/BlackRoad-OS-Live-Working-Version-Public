# Cognitive OS - Usage Guide

## Quick Start

```python
from cognitive import CognitiveOS

# Initialize the cognitive layer
cog = CognitiveOS(workspace_path=".")

# Show current state
cog.show_current_state()
```

## Core Concepts

### 1. Intent Graph - WHY Things Happen

The Intent Graph tracks goals, tasks, decisions, and their relationships. Every action has a "why" attached.

```python
# Create a goal
goal = cog.create_goal(
    title="Build user authentication system",
    description="Add login, signup, and password reset functionality",
    rationale="Users need secure access to their accounts"
)

# Create tasks under that goal
task = cog.create_task(
    title="Implement password hashing",
    goal_id=goal.id,
    rationale="Passwords must be securely stored"
)

# Make a decision and record WHY
decision = cog.intent_graph.create_decision(
    title="Use bcrypt for password hashing",
    rationale="Industry standard, proven security, good performance",
    alternatives_considered=[
        "argon2 (newer but less battle-tested)",
        "scrypt (more memory intensive)",
        "pbkdf2 (older, slower)"
    ]
)

# Link decision to task
cog.intent_graph.link_nodes(decision.id, task.id, "related")
```

### 2. Semantic File System - WHAT Files Are

No more "throw it in downloads and hope." Files organize themselves based on what they ARE, not arbitrary folder structures.

```python
# Process a new file
metadata = cog.semantic_fs.index_file("~/Downloads/resume.pdf")

print(f"Document type: {metadata.document_type}")
# Output: Document type: resume

# Get suggested location
suggested = cog.semantic_fs.suggest_location("~/Downloads/resume.pdf")
print(f"Should go here: {suggested}")
# Output: Should go here: documents/career/resumes/resume.pdf

# Auto-organize (actually move the file)
cog.semantic_fs.auto_organize("~/Downloads/resume.pdf", dry_run=False)

# Search semantically
results = cog.semantic_fs.search(
    "technical skills",
    filters={'document_type': DocumentType.RESUME}
)
```

### 3. Living Documents - Self-Updating Docs

Documentation that understands code and updates itself.

```python
# Create API documentation from code
doc = cog.doc_manager.generate_doc(
    doc_type=DocType.API_REFERENCE,
    code_file="src/auth.py",
    output_path="docs/api/auth.md"
)

# Check if docs are out of sync
out_of_sync = cog.doc_manager.check_all_docs()
for doc in out_of_sync:
    print(f"⚠ Needs update: {doc.file_path}")
    # Auto-update it
    doc.update_from_code(doc.code_references.pop())
```

### 4. Context Engine - Right Info, Right Time

Get exactly the context you need based on what you're doing.

```python
# Get context for a task
context = cog.get_context(task_id="task-123")

# See what's relevant
for item in context.get_top_items(10):
    print(f"[{item.type}] {item.title} - relevance: {item.relevance_score}")

# Get context for a file
file_context = cog.get_context(file_path="src/auth.py")
# Returns: related tasks, documentation, decisions, similar files

# Get current context (what's happening now?)
current = cog.get_context()
# Returns: active goals, blocked tasks, recent files, stale docs

# Query-based context
query_context = cog.get_context(query="How does authentication work?")
# Returns: relevant code, docs, decisions about auth
```

### 5. Agent Coordination - Multi-Agent Collaboration

Multiple agents working together without chaos.

```python
# Register agents
coder = AgentInfo(name="CodeWriter", role=AgentRole.CODER)
reviewer = AgentInfo(name="CodeReviewer", role=AgentRole.REVIEWER)

cog.agent_coordinator.register_agent(coder)
cog.agent_coordinator.register_agent(reviewer)

# Create a collaboration session
session = cog.agent_coordinator.create_session(
    goal="Implement user authentication",
    description="Add login, signup, password reset"
)

# Assign task to coder
cog.agent_coordinator.assign_task("implement-login", coder.id)

# When coder is done, handoff to reviewer
handoff = cog.agent_coordinator.create_handoff(
    from_agent_id=coder.id,
    to_agent_id=reviewer.id,
    task_id="implement-login",
    handoff_type=HandoffType.REVIEW,
    message="Login implementation complete, ready for review"
)

# Reviewer accepts and reviews
cog.agent_coordinator.accept_handoff(handoff.id, reviewer.id)
# ... review happens ...
cog.agent_coordinator.complete_handoff(handoff.id, result={"approved": True})

# Get agent context (what should agent know?)
agent_context = cog.agent_coordinator.get_agent_context(coder.id)
# Returns: current task, pending handoffs, session info, task context
```

### 6. Smart Documents - OCR, Templates, Auto-Format

Documents that understand themselves.

```python
# Process a resume with OCR
doc = cog.doc_processor.process_document("~/Downloads/resume.pdf")

# See what was extracted
print(f"Name: {doc.structured_data.fields.get('name')}")
print(f"Email: {doc.structured_data.fields.get('email')}")
print(f"Skills: {doc.structured_data.fields.get('sections', {}).get('skills')}")

# Format as ATS-friendly
ats_content = doc.format_as_ats_friendly()
# Saves a clean, ATS-compatible version

# Create new document from template
cog.doc_processor.create_from_template(
    DocumentTemplate.MEETING_NOTES,
    "meeting_2024_01_15.md",
    data={'date': '2024-01-15'}
)

# Process business plan
biz_plan = cog.doc_processor.process_document("business_plan.pdf")
print(f"Executive summary: {biz_plan.structured_data.fields.get('executive_summary')}")
```

## Complete Workflow Example

Here's how it all works together:

```python
from cognitive import CognitiveOS, AgentRole, DocumentTemplate

# 1. Initialize
cog = CognitiveOS(workspace_path="~/projects/my_startup")

# 2. Create a business goal
goal = cog.create_goal(
    title="Launch MVP by Q2",
    description="Build and ship minimum viable product",
    rationale="Need to validate product-market fit with real users"
)

# 3. Create tasks
task1 = cog.create_task(
    "Write technical specification",
    goal_id=goal.id,
    rationale="Team needs clarity on what to build"
)

task2 = cog.create_task(
    "Implement core features",
    goal_id=goal.id,
    rationale="MVP needs basic functionality"
)

# 4. Create spec document from template
spec_path = cog.doc_processor.create_from_template(
    DocumentTemplate.TECHNICAL_SPEC,
    "docs/mvp_spec.md"
)

# 5. Link document to task
cog.intent_graph.link_artifact(task1.id, spec_path)

# 6. Create collaboration session with agents
session = cog.agent_coordinator.create_session(
    goal="Build MVP",
    coordinator_id="human-founder"
)

# 7. Process incoming documents (investor deck, market research)
cog.process_new_file("~/Downloads/market_research.pdf")
cog.process_new_file("~/Downloads/investor_deck.pptx")
# These auto-organize into correct folders

# 8. Get context when working on implementation
context = cog.get_context(task_id=task2.id)
print("Here's what you need to know:")
for item in context.get_top_items(5):
    print(f"  - [{item.type}] {item.title}")

# 9. Make decisions and record them
decision = cog.intent_graph.create_decision(
    title="Use React for frontend",
    rationale="Team knows it, large ecosystem, good performance",
    alternatives_considered=["Vue.js", "Svelte", "Angular"]
)
cog.intent_graph.link_nodes(decision.id, task2.id, "related")

# 10. Check overall progress
cog.show_current_state()
```

## Integration with Existing Tools

### Git Integration

```python
# When you make a commit
commit_hash = "abc123"

# Link it to task
cog.intent_graph.link_artifact(
    task_id="implement-auth",
    artifact_path="src/auth.py",
    commit_hash=commit_hash
)

# Now you can always find: why was this code written?
tasks = cog.intent_graph.find_by_artifact("src/auth.py")
for task in tasks:
    print(f"This file exists because: {task.rationale}")
```

### IDE Integration

```python
# When you open a file in your IDE
file_path = "src/auth.py"

# Get full context
context = cog.get_context(file_path=file_path)

# Show in IDE sidebar:
# - Why this file exists (linked tasks)
# - What documentation exists
# - Recent decisions about this code
# - Related files
```

### Document Management

```python
# Watch downloads folder
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class DownloadHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory:
            print(f"New file detected: {event.src_path}")
            cog.process_new_file(event.src_path)

# Auto-process new downloads
observer = Observer()
observer.schedule(DownloadHandler(), "~/Downloads", recursive=False)
observer.start()
```

## Best Practices

### 1. Always Capture Intent

```python
# ❌ Bad - no context
task = cog.create_task("Refactor auth module")

# ✅ Good - clear intent
task = cog.create_task(
    "Refactor auth module to use dependency injection",
    rationale="Current tight coupling makes testing difficult. DI will improve testability and modularity."
)
```

### 2. Link Everything

```python
# Create task
task = cog.create_task("Add user profile page")

# Link the code
cog.intent_graph.link_artifact(task.id, "src/components/UserProfile.tsx")

# Link the docs
cog.intent_graph.link_artifact(task.id, "docs/features/user_profile.md")

# Link the design
cog.intent_graph.link_artifact(task.id, "designs/user_profile.fig")

# Now it's all connected!
```

### 3. Use Context Proactively

```python
# Before starting work, get context
context = cog.get_context(task_id="current-task")

# Check for blockers
if context.filter_by_type("blocker"):
    print("⚠ There are blockers - resolve these first")

# Check for relevant decisions
decisions = context.filter_by_type("decision")
for decision in decisions:
    print(f"Remember: {decision.title} - {decision.content}")
```

### 4. Let Documents Organize Themselves

```python
# ❌ Bad - manual organization
# User manually moves file to "somewhere logical"

# ✅ Good - semantic organization
metadata = cog.semantic_fs.index_file(file_path)
suggested = cog.semantic_fs.suggest_location(file_path)
print(f"This belongs in: {suggested}")

# Optional: auto-organize
if input("Auto-organize? (y/n): ") == 'y':
    cog.semantic_fs.auto_organize(file_path, dry_run=False)
```

### 5. Keep Docs in Sync

```python
# Regularly check doc status
out_of_sync = cog.doc_manager.check_all_docs()

if out_of_sync:
    print(f"⚠ {len(out_of_sync)} documents need updating")
    for doc in out_of_sync:
        # Review and update
        doc.update_from_code(next(iter(doc.code_references)))
```

## What Makes This Different?

### Traditional Approach
- Files in arbitrary folders
- Context lives in people's heads
- Docs get out of sync
- Multi-agent chaos
- Downloads folder anarchy

### Cognitive OS Approach
- Files organize by meaning and purpose
- Context is captured and connected
- Docs update themselves
- Agents coordinate cleanly
- Everything auto-organizes

## The Big Picture

The Cognitive OS solves the fundamental problem: **information silos and context loss**.

Instead of:
- Searching for files by name
- Wondering why code exists
- Docs that lie
- Duplicate work
- Lost decisions

You get:
- Files that know what they are
- Code linked to purpose
- Docs that update themselves
- Clear collaboration
- Preserved context

This is how AI + humans should have been working all along.
