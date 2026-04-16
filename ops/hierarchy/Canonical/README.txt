Canonical hierarchy
===================

What this is
------------
This directory is the normalized operating model for `/Applications/Hierarchy`.
It combines:
- taxonomy: what kind of thing something is
- workflow: what exact state it is in right now

The result is a directory system that is meant to store meaning and movement together.

Core shape
----------
- numbered taxonomy layers
- a shared 27-step `Workflow/` inside each layer
- `TEMPLATE-ITEM.txt` as the standard item pattern
- `move-item.sh` as the movement helper
- `HOW-TO/` as the embedded operating manual

First files to read
-------------------
If you are new, start here:
1. `HOW-TO/21-INDEX-OF-INDEXES.txt`
2. `HOW-TO/20-MANIFESTO.txt`
3. `HOW-TO/19-BOOTSTRAP-SEQUENCE.txt`
4. `WORKFLOW-MODEL.txt`
5. `EXAMPLE-TRACE.txt`

If you need the shortest useful path:
1. `HOW-TO/08-GLOSSARY.txt`
2. `HOW-TO/01-QUICKSTART.txt`
3. `HOW-TO/14-DECISION-TREES.txt`
4. `HOW-TO/18-EXAMPLES-LIBRARY.txt`

Core tools
----------
- `move-item.sh`
  move or copy items between workflow states or layers
- `new-item.sh`
  create a correctly initialized item in `Workflow/01-Intake/` from the template
- `open-guide.sh`
  route common keywords like `start`, `move`, `quality`, or `troubleshoot` to the right guide
- `status-overview.sh`
  summarize intake, review, handoff, transfer, and archive counts across the tree
- `check-integrity.sh`
  detect metadata drift between item files and their actual workflow locations
- `repair-item.sh`
  repair location-derived metadata in place when the file location is the truth
- `trace-item.sh`
  find all copies of an item by filename or `Item ID` and print a lineage summary
- `trace-report.sh`
  generate a saved lineage report under `TRACE-REPORTS/` or a custom output path
- `archive-report.sh`
  generate a saved manifest of everything currently stored in step 27
- `queue-report.sh`
  generate a saved manifest of active work across intake, review, and handoff queues
- `daily-brief.sh`
  run a session-start brief with live doctor output plus saved queue and archive reports
- `weekly-review.sh`
  run a broader maintenance review with doctor, queue, archive, duplicate, and naming artifacts
- `monthly-review.sh`
  run a structural review with doctor, reports, duplicate and naming checks, plus HOW-TO and automation inventories
- `index-item.sh`
  move an item into 26-Index and write a structured sidecar index record
- `handoff-item.sh`
  perform the visible 24 -> 25 -> downstream 01 handoff in one command
- `archive-item.sh`
  ensure step-26 indexing exists, then archive both the item and its index record
- `doctor.sh`
  run a one-command health check across overview and integrity
- `WORKFLOW-MODEL.txt`
  the 27-step shared motion model
- `EXAMPLE-TRACE.txt`
  a live audit-trail style demonstration
- `HOW-TO/00-HOW-TO-INDEX.txt`
  the full operating manual

Core principles
---------------
- keep meaning separate from state
- keep layers stable
- make handoff visible
- preserve traceability when useful
- prefer examples over abstraction
- make the directory self-teaching

What to do next
---------------
- if you want one obvious entry command from the hierarchy root, run `/Applications/Hierarchy/start.sh`
- if you want a root-level index of command families and artifact buckets, run `/Applications/Hierarchy/start.sh list`
- if you want a root-level mental model of the system and command surface, run `/Applications/Hierarchy/start.sh map`
- if you want a root-level browser for guides, layers, workflow, lifecycle, bootstrap, glossary, decisions, principles, anti-patterns, checklists, troubleshooting, roles, rhythms, examples, recipes, tools, reports, and recent reviews, run `/Applications/Hierarchy/start.sh browse [guides|layers|workflow|lifecycle|bootstrap|glossary|decisions|principles|anti-patterns|checklists|troubleshooting|roles|rhythms|examples|recipes|tools|reports|reviews]`
- if you want the numbered taxonomy chain plus the current live layer path, run `/Applications/Hierarchy/start.sh browse layers`
- if you want the shared 27-step workflow plus its phase groupings, run `/Applications/Hierarchy/start.sh browse workflow`
- if you want whole journey maps through the hierarchy, run `/Applications/Hierarchy/start.sh browse lifecycle`
- if you want the recommended learning sequence, run `/Applications/Hierarchy/start.sh browse bootstrap`
- if you want canonical vocabulary, run `/Applications/Hierarchy/start.sh browse glossary`
- if you want decision help for common operating choices, run `/Applications/Hierarchy/start.sh browse decisions`
- if you want design values for extending the model, run `/Applications/Hierarchy/start.sh browse principles`
- if you want common mistakes to avoid, run `/Applications/Hierarchy/start.sh browse anti-patterns`
- if you want operator safeguards, run `/Applications/Hierarchy/start.sh browse checklists`
- if you want fast fixes for common problems, run `/Applications/Hierarchy/start.sh browse troubleshooting`
- if you want role-specific emphasis, run `/Applications/Hierarchy/start.sh browse roles`
- if you want recurring operating timing, run `/Applications/Hierarchy/start.sh browse rhythms`
- if you want reusable example patterns, run `/Applications/Hierarchy/start.sh browse examples`
- if you want practical playbooks for common actions, run `/Applications/Hierarchy/start.sh browse recipes`
- if you want the root command to tell you where to go for a task, run `/Applications/Hierarchy/start.sh where <topic>`
- if you want the root command to explain what a command family does, run `/Applications/Hierarchy/start.sh what <topic>`
- if you want the root command to explain the rationale behind a family, run `/Applications/Hierarchy/start.sh why <topic>`
- if you want a root-level finder across guides, items, and reports, run `/Applications/Hierarchy/start.sh search <query>`
- if you want a natural finder alias, run `/Applications/Hierarchy/start.sh find <query>`
- if you want a root-level action umbrella, run `/Applications/Hierarchy/start.sh run status|report|fix|move ...`
- if you want a root-level read-only umbrella, run `/Applications/Hierarchy/start.sh show list|map|browse|status|readme|search|trace|where|what|why ...`
- if you want the read-only umbrella for search or lineage specifically, run `/Applications/Hierarchy/start.sh show search <query>` or `/Applications/Hierarchy/start.sh show trace <filename-or-item-id>`
- if you want a root-level navigation umbrella, run `/Applications/Hierarchy/start.sh go [topic]`
- if you want the quickest root-level live snapshot, run `/Applications/Hierarchy/start.sh status`
- if you want a root-level lineage lookup, run `/Applications/Hierarchy/start.sh trace <filename-or-item-id>`
- if you want a root-level saved report, run `/Applications/Hierarchy/start.sh report queue|archive|trace ...`
- if you want a root-level recovery action, run `/Applications/Hierarchy/start.sh fix doctor|integrity|repair ...`
- if you want a root-level movement action, run `/Applications/Hierarchy/start.sh move item|handoff|index|archive ...`
- if you want a root-level guide lookup, run `/Applications/Hierarchy/start.sh guide <topic>`
- if you want a root-level front-door open command that can route both root-native surfaces and guide topics, run `/Applications/Hierarchy/start.sh open [topic]`
- if you already know the exact operational action you need, run `/Applications/Hierarchy/start.sh doctor`, `/Applications/Hierarchy/start.sh fix integrity`, `/Applications/Hierarchy/start.sh fix repair <item-file>`, `/Applications/Hierarchy/start.sh move handoff <item-file> <target-workflow-dir>`, `/Applications/Hierarchy/start.sh move index <item-file>`, or `/Applications/Hierarchy/start.sh move archive <item-file>`
- if you want a root-level item creation alias, run `/Applications/Hierarchy/start.sh new <workflow-dir> <name> [title]`
- if you want root-level contextual help, run `/Applications/Hierarchy/start.sh help [topic]`
- if you want a root-level review alias, run `/Applications/Hierarchy/start.sh review daily|weekly|monthly ...`
- if you want philosophy, read `HOW-TO/20-MANIFESTO.txt`
- if you want onboarding, read `HOW-TO/19-BOOTSTRAP-SEQUENCE.txt`
- if you want operational decisions, read `HOW-TO/14-DECISION-TREES.txt`
- if you want copyable patterns, read `HOW-TO/18-EXAMPLES-LIBRARY.txt`
- if you want the full map, read `HOW-TO/21-INDEX-OF-INDEXES.txt`
- if you want keyword-based routing, run `./open-guide.sh start` or `./open-guide.sh move`
- if you want to create a new item fast, run `./new-item.sh <workflow-dir> <name> [title]`
- if you want a quick operational snapshot, run `./status-overview.sh`
- if you want to audit metadata truthfulness, run `./check-integrity.sh`
- if you want to repair metadata to match a correct location, run `./repair-item.sh <item-file>`
- if you want to trace one item across the tree, run `./trace-item.sh <filename-or-item-id>`
- if you want a saved lineage artifact, run `./trace-report.sh <filename-or-item-id> [output-file]`
- if you want a saved archive manifest, run `./archive-report.sh [output-file]`
- if you want a saved active-work manifest, run `./queue-report.sh [output-file]`
- if you want a session-start snapshot, run `./daily-brief.sh [brief-dir]`
- if you want a weekly maintenance snapshot, run `./weekly-review.sh [review-dir]`
- if you want a monthly structural snapshot, run `./monthly-review.sh [review-dir]`
- if you want a structured step-26 record, run `./index-item.sh <item-file>`
- if you want to execute a full visible crossing, run `./handoff-item.sh <item-file> <target-workflow-dir>`
- if you want to archive an item cleanly with its step-26 record, run `./archive-item.sh <item-file>`
- if you want a one-command health check, run `./doctor.sh`
