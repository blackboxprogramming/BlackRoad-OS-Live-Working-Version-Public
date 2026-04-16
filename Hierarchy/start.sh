#!/bin/bash
# Front door for the Hierarchy workspace
# Usage: ./start.sh [mode] [args...]

set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
CANONICAL_DIR="$ROOT_DIR/Canonical"
REPORT_DIRS=(
  ARCHIVE-REPORTS
  QUEUE-REPORTS
  TRACE-REPORTS
  DAILY-BRIEFS
  WEEKLY-REVIEWS
  MONTHLY-REVIEWS
)
REVIEW_DIRS=(
  DAILY-BRIEFS
  WEEKLY-REVIEWS
  MONTHLY-REVIEWS
)
BROWSE_ALL_GUIDE_GROUPS=(
  'start, new, move, handoff, archive, index-item'
  'queue-report, archive-report, daily-brief'
  'weekly-review, monthly-review, quality, troubleshoot'
  'manual, glossary, philosophy, decide, examples, doctor'
)
BROWSE_ALL_CORE_TOOLS=(
  'move-item.sh'
  'new-item.sh'
  'status-overview.sh'
  'check-integrity.sh'
  'trace-item.sh'
  'queue-report.sh'
  'archive-report.sh'
)
BROWSE_EXAMPLE_REFERENCE_FILES=(
  'HOW-TO/18-EXAMPLES-LIBRARY.txt'
  'EXAMPLE-TRACE.txt'
)
BROWSE_RECIPE_COMPANION_TOOLS=(
  'new-item.sh'
  'move-item.sh'
  'handoff-item.sh'
  'archive-item.sh'
)
BROWSE_GUIDE_TOPIC_SUMMARIES=(
  'start -> bootstrap sequence'
  'new -> quickstart'
  'move -> moving items'
  'handoff -> handoffs and conveyor'
  'archive -> recipes'
  'index-item -> recipes'
  'queue-report -> operating rhythms'
  'archive-report -> operating rhythms'
  'daily-brief -> bootstrap sequence'
  'weekly-review -> operating rhythms'
  'monthly-review -> operating rhythms'
  'quality -> quality standards'
  'troubleshoot -> troubleshooting'
  'manual -> index of indexes'
)
BROWSE_TOOL_SUMMARIES=(
  'new-item.sh -> create an item in 01-Intake'
  'move-item.sh -> move or copy an item'
  'handoff-item.sh -> perform a visible crossing'
  'index-item.sh -> write a step-26 sidecar record'
  'archive-item.sh -> archive an item with its index'
  'status-overview.sh -> live workflow snapshot'
  'check-integrity.sh -> metadata drift audit'
  'repair-item.sh -> repair location-derived metadata'
  'trace-item.sh -> live lineage lookup'
  'trace-report.sh -> saved lineage artifact'
  'queue-report.sh -> saved active-work manifest'
  'archive-report.sh -> saved archive manifest'
  'daily-brief.sh -> session-start review'
  'weekly-review.sh -> broader maintenance review'
  'monthly-review.sh -> structural review'
)
LIST_COMMAND_FAMILIES=(
  'map'
  'browse'
  'search'
  'status'
  'trace'
  'report'
  'fix'
  'move'
  'review'
  'docs | guide | open | help'
  'create | new'
  'doctor | readme'
)
MAP_SYSTEM_MODEL_LINES=(
  'root'
  '  -> Legacy/      preserved concept history'
  '  -> Canonical/   working operating model'
  '       -> taxonomy layers'
  '       -> shared Workflow/ with 27 steps'
  '       -> HOW-TO/ embedded manual'
)
MAP_FRONT_DOOR_LINES=(
  'understand  -> open | readme | docs | guide | help'
  'discover    -> list | map | where | what | why | search | find | go'
  'inspect     -> status | trace | show ...'
  'act         -> move ... | create/new ... | run ...'
  'stabilize   -> fix ... | doctor'
  'review      -> daily | weekly | monthly | review ...'
)
MAP_QUICK_PICK_LINES=(
  'new here:         ./start.sh open'
  'need orientation: ./start.sh map'
  'need direction:   ./start.sh where <topic>'
  'need rationale:   ./start.sh why <topic>'
  'need live state:  ./start.sh status'
  'need action:      ./start.sh move ...'
)
USAGE_MODE_PREFIX_LINES=(
  'list'
  '  show the main command families and saved artifact directories'
  'map'
  '  show the front-door mental model and command-to-purpose map'
  'browse [section]'
  'where <topic>'
  '  show the best root command or guide target for a common intent'
  'what <topic>'
  '  explain what a root command family is for'
  'why <topic>'
  '  explain the rationale behind the operating model or a command family'
  'search <query>'
  '  search guides, item files, and saved report artifacts'
  'find <query>'
  '  alias for search'
)
USAGE_MODE_MIDDLE_LINES=(
  'go [topic]'
  '  open the README front door or route to root surfaces and guide-like destinations'
)
USAGE_MODE_SUFFIX_LINES=(
  'docs [topic]'
  'open [topic]'
  '  print the README front door or route root topics and guide topics'
  'create <workflow-dir> <name> [title]'
  'help [topic]'
  '  print command usage or route a topic into a guide or command-family explanation'
  'readme'
  '  print the Canonical README front door'
)
USAGE_EXAMPLE_PREFIX_LINES=(
  './start.sh'
  './start.sh list'
  './start.sh map'
  './start.sh browse'
)
USAGE_EXAMPLE_SUFFIX_LINES=(
  './start.sh where start'
  './start.sh what move'
  './start.sh why move'
  './start.sh search demo'
  './start.sh find manifesto'
  './start.sh run status'
  './start.sh run report queue'
  './start.sh show list'
  './start.sh show status'
  './start.sh show search demo'
  './start.sh show trace demo-001'
  './start.sh show where move'
  './start.sh show what browse'
  './start.sh show why move'
  './start.sh go'
  './start.sh go move'
  './start.sh review daily'
  './start.sh review weekly'
  './start.sh review monthly'
  './start.sh open'
  './start.sh open move'
  './start.sh open reports'
  './start.sh open what'
  './start.sh help'
  './start.sh help move'
  './start.sh help reports'
)
ROOT_DISPATCH_TABLE=$(cat <<'EOF'
run:status	script	status-overview.sh
run:report	root	report
run:fix	root	fix
run:move	root	move
show:list	root	list
show:map	root	map
show:browse	root	browse
show:status	root	status
show:readme	root	readme
show:search	root	search
show:find	root	search
show:trace	root	trace
show:where	root	where
show:what	root	what
show:why	root	why
review:daily	script	daily-brief.sh
review:weekly	script	weekly-review.sh
review:monthly	script	monthly-review.sh
EOF
)
CANONICAL_SCRIPT_TABLE=$(cat <<'EOF'
top:status	status-overview.sh
top:trace	trace-item.sh
top:daily	daily-brief.sh
top:weekly	weekly-review.sh
top:monthly	monthly-review.sh
top:docs	open-guide.sh
top:guide	open-guide.sh
top:create	new-item.sh
top:new	new-item.sh
top:doctor	doctor.sh
report:queue	queue-report.sh
report:archive	archive-report.sh
report:trace	trace-report.sh
fix:doctor	doctor.sh
fix:integrity	check-integrity.sh
fix:repair	repair-item.sh
move:item	move-item.sh
move:handoff	handoff-item.sh
move:index	index-item.sh
move:archive	archive-item.sh
EOF
)
BROWSE_WHAT_TABLE=$(cat <<'EOF'
browse	browse	lists real guide topics, taxonomy layers, workflow states, vocabulary, decision trees, examples, recipes, core tools, report buckets, and recent review artifacts.	
recipes	recipes	lists practical playbooks for common actions in the Canonical hierarchy.	recipes
tools	tools	lists the core Canonical scripts and the operational job each one performs.	tools
reports	reports	shows the saved artifact buckets for queue, trace, archive, and review outputs.	reports
reviews	reviews	shows the recent daily, weekly, and monthly review directories from the live system.	reviews
EOF
)
SUBCOMMAND_VALIDATION_TABLE=$(cat <<'EOF'
report:trace	range	1	2	report trace requires <filename-or-item-id> [output-file]
fix:repair	exact	1	-	fix repair requires exactly one item file
move:handoff	exact	2	-	move handoff requires <item-file> <target-workflow-dir>
move:index	exact	1	-	move index requires exactly one item file
move:archive	exact	1	-	move archive requires exactly one item file
EOF
)
BROWSE_TABLE=$(cat <<'EOF'
all	renderer	render_browse_all
guides	renderer	render_browse_guides
layers	renderer	render_browse_layers
workflow	renderer	render_browse_workflow
lifecycle	awk	Hierarchy browse lifecycle	=========================	Lifecycle maps	--------------	/^Map [0-9]+:/ { print "- " $0 }	HOW-TO/13-LIFECYCLE-MAPS.txt	Use: ./start.sh guide examples | ./start.sh guide move
bootstrap	awk	Hierarchy browse bootstrap	=========================	Bootstrap phases	----------------	/^Phase [0-9]+:/ { print "- " $0 } /^Fast bootstrap path$/ { print "- " $0 } /^Teaching bootstrap path$/ { print "- " $0 }	HOW-TO/19-BOOTSTRAP-SEQUENCE.txt	Use: ./start.sh open | ./start.sh guide start
glossary	awk	Hierarchy browse glossary	=========================	Canonical vocabulary	--------------------	/^[A-Za-z0-9-][A-Za-z0-9 .-]*$/ { heading=$0; getline; if ($0 ~ /^-+$/) print "- " heading }	HOW-TO/08-GLOSSARY.txt	Use: ./start.sh guide glossary
decisions	awk	Hierarchy browse decisions	==========================	Decision trees	--------------	/^Tree [0-9]+:/ { print "- " $0 }	HOW-TO/14-DECISION-TREES.txt	Use: ./start.sh guide decide
principles	awk	Hierarchy browse principles	===========================	Design principles	-----------------	/^[0-9]+\./ { print "- " $0 }	HOW-TO/09-DESIGN-PRINCIPLES.txt	Use: ./start.sh guide philosophy
anti-patterns	awk	Hierarchy browse anti-patterns	===============================	Common mistakes	---------------	/^[0-9]+\./ { print "- " $0 }	HOW-TO/10-ANTI-PATTERNS.txt	Use: ./start.sh guide troubleshoot
checklists	awk	Hierarchy browse checklists	============================	Operator checklists	-------------------	/^Checklist [0-9]+:/ { print "- " $0 }	HOW-TO/11-CHECKLISTS.txt	Use: ./start.sh guide new | ./start.sh guide move
troubleshooting	awk	Hierarchy browse troubleshooting	================================	Common problems	---------------	/^Problem [0-9]+:/ { print "- " $0 }	HOW-TO/17-TROUBLESHOOTING.txt	Use: ./start.sh guide troubleshoot | ./start.sh fix doctor
roles	awk	Hierarchy browse roles	======================	Role modes	----------	/^Role [0-9]+:/ { print "- " $0 }	HOW-TO/12-ROLE-MODES.txt	Use: ./start.sh guide roles
rhythms	awk	Hierarchy browse rhythms	========================	Operating rhythms	-----------------	/^[A-Za-z-][A-Za-z -]*rhythm$/ { print "- " $0 }	HOW-TO/15-OPERATING-RHYTHMS.txt	Use: ./start.sh guide rhythms | ./start.sh review daily|weekly|monthly
examples	renderer	render_browse_examples
recipes	renderer	render_browse_recipes
tools	renderer	render_browse_tools
reports	renderer	render_browse_reports
reviews	renderer	render_browse_reviews
EOF
)

print_artifact_directories() {
  for dir_name in "${REPORT_DIRS[@]}"; do
    dir_path="$CANONICAL_DIR/$dir_name"
    if [[ -d "$dir_path" ]]; then
      file_count=$(find "$dir_path" -type f | wc -l | tr -d ' ')
      printf '%s -> present (%s files)\n' "$dir_name" "$file_count"
    else
      printf '%s -> absent\n' "$dir_name"
    fi
  done
}

print_recent_review_directories() {
  local dir_index=0
  local dir_count=${#REVIEW_DIRS[@]}

  for dir_name in "${REVIEW_DIRS[@]}"; do
    dir_path="$CANONICAL_DIR/$dir_name"
    printf '%s\n' "$dir_name"
    printf '%s\n' '----------------'
    if [[ -d "$dir_path" ]]; then
      entries=$(find "$dir_path" -mindepth 1 -maxdepth 1 -type d | sort | tail -n 5)
      if [[ -n "$entries" ]]; then
        while IFS= read -r entry; do
          [[ -n "$entry" ]] || continue
          printf '%s\n' "- $(basename "$entry")"
        done <<<"$entries"
      else
        printf '%s\n' '- none'
      fi
    else
      printf '%s\n' '- absent'
    fi
    dir_index=$((dir_index + 1))
    if [[ $dir_index -lt $dir_count ]]; then
      printf '\n'
    fi
  done
}

print_browse_sections() {
  local section_name
  while IFS= read -r section_name; do
    [[ -n "$section_name" ]] || continue
    printf '%s\n' "- $section_name"
  done < <(list_browse_sections)
}

print_browse_next_steps() {
  local section_name
  while IFS= read -r section_name; do
    [[ -n "$section_name" ]] || continue
    printf '%s\n' "- ./start.sh browse $section_name"
  done < <(list_browse_sections)
}

print_dash_list() {
  local item
  for item in "$@"; do
    printf '%s\n' "- $item"
  done
}

print_plain_list() {
  local item
  for item in "$@"; do
    printf '%s\n' "$item"
  done
}

join_with_pipe() {
  local IFS='|'
  printf '%s' "$*"
}

join_with_conjunction() {
  local conjunction=$1
  shift
  local items=("$@")
  local count=${#items[@]}
  local index
  local result

  case $count in
    0)
      return 0
      ;;
    1)
      printf '%s' "${items[0]}"
      return 0
      ;;
    2)
      printf '%s %s %s' "${items[0]}" "$conjunction" "${items[1]}"
      return 0
      ;;
  esac

  result=${items[0]}
  for ((index = 1; index < count; index++)); do
    if [[ $index -eq $((count - 1)) ]]; then
      result+=", $conjunction ${items[$index]}"
    else
      result+=", ${items[$index]}"
    fi
  done

  printf '%s' "$result"
}

list_root_dispatch_subcommands() {
  local namespace=$1
  local key
  local target_kind
  local target_value
  local unused

  while IFS=$'\t' read -r key target_kind target_value unused; do
    [[ -n "$key" ]] || continue
    [[ "$key" == "$namespace:"* ]] || continue
    printf '%s\n' "${key#*:}"
  done <<<"$ROOT_DISPATCH_TABLE"
}

root_dispatch_subcommands_phrase() {
  local namespace=$1
  local conjunction=${2:-or}
  local subcommands=()
  local subcommand

  while IFS= read -r subcommand; do
    [[ -n "$subcommand" ]] || continue
    subcommands+=("$subcommand")
  done < <(list_root_dispatch_subcommands "$namespace")

  join_with_conjunction "$conjunction" "${subcommands[@]}"
}

root_dispatch_command_pattern() {
  local namespace=$1
  local subcommands=()
  local subcommand

  while IFS= read -r subcommand; do
    [[ -n "$subcommand" ]] || continue
    subcommands+=("$subcommand")
  done < <(list_root_dispatch_subcommands "$namespace")

  printf './start.sh %s %s ...' "$namespace" "$(join_with_pipe "${subcommands[@]}")"
}

list_canonical_script_subcommands() {
  local namespace=$1
  local key
  local script_name
  local unused

  while IFS=$'\t' read -r key script_name unused; do
    [[ -n "$key" ]] || continue
    [[ "$key" == "$namespace:"* ]] || continue
    printf '%s\n' "${key#*:}"
  done <<<"$CANONICAL_SCRIPT_TABLE"
}

canonical_script_subcommands_phrase() {
  local namespace=$1
  local conjunction=${2:-or}
  local subcommands=()
  local subcommand

  while IFS= read -r subcommand; do
    [[ -n "$subcommand" ]] || continue
    subcommands+=("$subcommand")
  done < <(list_canonical_script_subcommands "$namespace")

  join_with_conjunction "$conjunction" "${subcommands[@]}"
}

canonical_script_command_pattern() {
  local namespace=$1
  local subcommands=()
  local subcommand

  while IFS= read -r subcommand; do
    [[ -n "$subcommand" ]] || continue
    subcommands+=("$subcommand")
  done < <(list_canonical_script_subcommands "$namespace")

  printf './start.sh %s %s ...' "$namespace" "$(join_with_pipe "${subcommands[@]}")"
}

canonical_script_usage_synopsis() {
  local namespace=$1
  local subcommand=$2

  case "$namespace:$subcommand" in
    report:queue) printf '%s\n' 'report queue [output-file]' ;;
    report:archive) printf '%s\n' 'report archive [output-file]' ;;
    report:trace) printf '%s\n' 'report trace <filename-or-item-id> [output-file]' ;;
    fix:doctor) printf '%s\n' 'fix doctor' ;;
    fix:integrity) printf '%s\n' 'fix integrity' ;;
    fix:repair) printf '%s\n' 'fix repair <item-file>' ;;
    move:item) printf '%s\n' 'move item [--copy] <item-file> <target-step> [target-workflow-dir]' ;;
    move:handoff) printf '%s\n' 'move handoff <item-file> <target-workflow-dir>' ;;
    move:index) printf '%s\n' 'move index <item-file>' ;;
    move:archive) printf '%s\n' 'move archive <item-file>' ;;
    *)
      return 1
      ;;
  esac
}

canonical_script_usage_description() {
  local namespace=$1
  local subcommand=$2

  case "$namespace:$subcommand" in
    report:queue) printf '%s\n' 'write the Canonical active-work manifest' ;;
    report:archive) printf '%s\n' 'write the Canonical archive manifest' ;;
    report:trace) printf '%s\n' 'write the Canonical lineage report for one item' ;;
    fix:doctor) printf '%s\n' 'run the Canonical one-command health check' ;;
    fix:integrity) printf '%s\n' 'run the Canonical metadata integrity check' ;;
    fix:repair) printf '%s\n' 'repair location-derived metadata for one item' ;;
    move:item) printf '%s\n' 'move or copy one item between workflow states or layers' ;;
    move:handoff) printf '%s\n' 'perform the visible 24 -> 25 -> downstream 01 handoff' ;;
    move:index) printf '%s\n' 'move one item into 26-Index and write its sidecar index record' ;;
    move:archive) printf '%s\n' 'archive one item with its step-26 index sidecar' ;;
    *)
      return 1
      ;;
  esac
}

print_canonical_script_usage_lines() {
  local namespace=$1
  local subcommand

  while IFS= read -r subcommand; do
    [[ -n "$subcommand" ]] || continue
    printf '%s\n' "  $(canonical_script_usage_synopsis "$namespace" "$subcommand")"
    printf '%s\n' "    $(canonical_script_usage_description "$namespace" "$subcommand")"
  done < <(list_canonical_script_subcommands "$namespace")
}

render_root_dispatch_where_topic() {
  local namespace=$1
  local guide_topic
  local why_text

  case "$namespace" in
    run)
      guide_topic='manual'
      why_text='groups action-style commands behind one root-level umbrella.'
      ;;
    show)
      guide_topic='manual'
      why_text='groups the read-only inspection and explanation surfaces behind one root-level umbrella.'
      ;;
    review)
      guide_topic='rhythms'
      why_text='routes into the right level of recurring operational review.'
      ;;
    *)
      return 1
      ;;
  esac

  print_where_result "$(root_dispatch_command_pattern "$namespace")" "$guide_topic" "$why_text"
}

render_canonical_script_family_where_topic() {
  local namespace=$1
  local guide_topic
  local why_text

  case "$namespace" in
    report)
      guide_topic='queue-report'
      why_text='writes a saved report instead of only printing live state.'
      ;;
    fix)
      guide_topic='troubleshoot'
      why_text='groups health checks and repair actions behind one root-level umbrella.'
      ;;
    move)
      guide_topic='move'
      why_text='handles the main operational state changes from the root front door.'
      ;;
    *)
      return 1
      ;;
  esac

  print_where_result "$(canonical_script_command_pattern "$namespace")" "$guide_topic" "$why_text"
}

render_root_dispatch_what_topic() {
  local namespace=$1

  case "$namespace" in
    run)
      print_what_result 'run' "groups action-style commands like $(root_dispatch_subcommands_phrase run and)." "$(root_dispatch_command_pattern run)"
      ;;
    show)
      print_what_result 'show' "groups read-only inspection and explanation commands like $(root_dispatch_subcommands_phrase show and)." "$(root_dispatch_command_pattern show)"
      ;;
    review)
      print_what_result 'review' "runs recurring $(root_dispatch_subcommands_phrase review or) operational reviews." "$(root_dispatch_command_pattern review)"
      ;;
    *)
      return 1
      ;;
  esac
}

render_canonical_script_family_what_topic() {
  local namespace=$1

  case "$namespace" in
    report)
      print_what_result 'report' 'writes saved queue, archive, or lineage artifacts.' "$(canonical_script_command_pattern report)"
      ;;
    fix)
      print_what_result 'fix' 'runs health checks and repairs metadata drift when location is the truth.' "$(canonical_script_command_pattern fix)"
      ;;
    move)
      print_what_result 'move' 'advances items, performs handoffs, indexes, and archives from the root front door.' "$(canonical_script_command_pattern move)"
      ;;
    *)
      return 1
      ;;
  esac
}

top_script_usage_synopsis() {
  local mode_name=$1

  case "$mode_name" in
    trace) printf '%s\n' 'trace <filename-or-item-id>' ;;
    daily) printf '%s\n' 'daily [brief-dir]' ;;
    weekly) printf '%s\n' 'weekly [review-dir]' ;;
    monthly) printf '%s\n' 'monthly [review-dir]' ;;
    doctor) printf '%s\n' 'doctor' ;;
    *)
      return 1
      ;;
  esac
}

top_script_usage_description() {
  local mode_name=$1
  local record
  local script_name
  local unused

  record=$(lookup_table_row "top:$mode_name" "$CANONICAL_SCRIPT_TABLE") || return 1
  IFS=$'\t' read -r script_name unused unused <<<"$record"

  case "$mode_name" in
    trace) printf '%s\n' 'print the Canonical lineage view for one item' ;;
    daily) printf '%s\n' 'run the Canonical daily brief' ;;
    weekly) printf '%s\n' 'run the Canonical weekly review' ;;
    monthly) printf '%s\n' 'run the Canonical monthly review' ;;
    doctor) printf '%s\n' 'run the Canonical health check' ;;
    *)
      return 1
      ;;
  esac
}

print_top_script_usage_line() {
  local mode_name=$1
  printf '%s\n' "  $(top_script_usage_synopsis "$mode_name")"
  printf '%s\n' "    $(top_script_usage_description "$mode_name")"
}

print_usage_mode_lines() {
  local line
  for line in "${USAGE_MODE_PREFIX_LINES[@]}"; do
    printf '%s\n' "  $line"
    if [[ "$line" == 'browse [section]' ]]; then
      print_browse_mode_description
    fi
  done
  print_root_dispatch_usage_lines run
  print_root_dispatch_usage_lines show
  for line in "${USAGE_MODE_MIDDLE_LINES[@]}"; do
    printf '%s\n' "  $line"
  done
  print_top_script_usage_line trace
  print_canonical_script_usage_lines report
  print_canonical_script_usage_lines fix
  print_canonical_script_usage_lines move
  print_root_dispatch_usage_lines review
  print_top_script_usage_line daily
  print_top_script_usage_line weekly
  print_top_script_usage_line monthly
  for line in "${USAGE_MODE_SUFFIX_LINES[@]}"; do
    printf '%s\n' "  $line"
    if [[ "$line" == 'docs [topic]' ]]; then
      print_top_primary_usage_lines docs
    elif [[ "$line" == 'create <workflow-dir> <name> [title]' ]]; then
      print_top_primary_usage_lines create
    elif [[ "$line" == '  print command usage or route a topic into a guide or command-family explanation' ]]; then
      print_top_script_usage_line doctor
    fi
  done
}

root_dispatch_usage_synopsis() {
  local namespace=$1
  local subcommand=$2

  case "$namespace:$subcommand" in
    run:status) printf '%s\n' 'run status' ;;
    run:*) printf '%s\n' "run $subcommand ..." ;;
    show:browse) printf '%s\n' 'show browse [section]' ;;
    show:search|show:find) printf '%s\n' "show $subcommand <query>" ;;
    show:trace) printf '%s\n' 'show trace <filename-or-item-id>' ;;
    show:where|show:what|show:why) printf '%s\n' "show $subcommand <topic>" ;;
    show:*) printf '%s\n' "show $subcommand" ;;
    review:daily) printf '%s\n' 'review daily [brief-dir]' ;;
    review:weekly) printf '%s\n' 'review weekly [review-dir]' ;;
    review:monthly) printf '%s\n' 'review monthly [review-dir]' ;;
    *)
      return 1
      ;;
  esac
}

root_dispatch_usage_description() {
  local namespace=$1
  local subcommand=$2
  local record
  local target_kind
  local target_value
  local unused

  record=$(lookup_table_row "$namespace:$subcommand" "$ROOT_DISPATCH_TABLE") || return 1
  IFS=$'\t' read -r target_kind target_value unused <<<"$record"

  case "$namespace:$subcommand" in
    review:daily) printf '%s\n' 'alias for the Canonical daily brief' ;;
    review:weekly) printf '%s\n' 'alias for the Canonical weekly review' ;;
    review:monthly) printf '%s\n' 'alias for the Canonical monthly review' ;;
    run:status) printf '%s\n' 'alias for the Canonical live status overview' ;;
    *)
      [[ "$target_kind" == 'root' ]] || return 1
      printf '%s\n' "alias for $target_value"
      ;;
  esac
}

print_root_dispatch_usage_lines() {
  local namespace=$1
  local subcommand

  while IFS= read -r subcommand; do
    [[ -n "$subcommand" ]] || continue
    printf '%s\n' "  $(root_dispatch_usage_synopsis "$namespace" "$subcommand")"
    printf '%s\n' "    $(root_dispatch_usage_description "$namespace" "$subcommand")"
  done < <(list_root_dispatch_subcommands "$namespace")
}

top_alias_usage_synopsis() {
  local primary=$1
  local alias_name=$2

  case "$primary:$alias_name" in
    docs:guide) printf '%s\n' 'guide [topic]' ;;
    create:new) printf '%s\n' 'new <workflow-dir> <name> [title]' ;;
    *)
      return 1
      ;;
  esac
}

lookup_top_alias_name() {
  local primary=$1
  local record
  local script_name
  local key
  local candidate_script
  local unused
  local alias_name=

  record=$(lookup_table_row "top:$primary" "$CANONICAL_SCRIPT_TABLE") || return 1
  IFS=$'\t' read -r script_name unused unused <<<"$record"

  while IFS=$'\t' read -r key candidate_script unused; do
    [[ "$key" == top:* ]] || continue
    [[ "$key" == "top:$primary" ]] && continue
    if [[ "$candidate_script" == "$script_name" ]]; then
      alias_name=${key#top:}
      break
    fi
  done <<<"$CANONICAL_SCRIPT_TABLE"

  [[ -n "$alias_name" ]] || return 1
  printf '%s\n' "$alias_name"
}

print_top_alias_usage_line() {
  local primary=$1
  local alias_name

  alias_name=$(lookup_top_alias_name "$primary") || return 1
  printf '%s\n' "  $(top_alias_usage_synopsis "$primary" "$alias_name")"
  printf '%s\n' "    alias for $primary"
}

top_primary_usage_description() {
  local primary=$1
  local record
  local script_name
  local unused

  record=$(lookup_table_row "top:$primary" "$CANONICAL_SCRIPT_TABLE") || return 1
  IFS=$'\t' read -r script_name unused unused <<<"$record"

  case "$primary" in
    docs) printf '%s\n' "open a guide topic through Canonical/$script_name" ;;
    create) printf '%s\n' "create a new item through Canonical/$script_name" ;;
    *)
      return 1
      ;;
  esac
}

print_top_primary_usage_lines() {
  local primary=$1
  printf '%s\n' "    $(top_primary_usage_description "$primary")"
  print_top_alias_usage_line "$primary"
}

top_primary_example_tail() {
  local primary=$1
  case "$primary" in
    docs)
      printf '%s\n' 'start'
      ;;
    create)
      printf '%s\n' '/Applications/Hierarchy/Canonical/01-Enterprise/Workflow my-item "My Item"'
      ;;
    *)
      return 1
      ;;
  esac
}

top_alias_example_tail() {
  local primary=$1
  case "$primary" in
    docs)
      printf '%s\n' 'move'
      ;;
    create)
      top_primary_example_tail "$primary"
      ;;
    *)
      return 1
      ;;
  esac
}

print_top_primary_example_line() {
  local primary=$1
  printf '%s\n' "  ./start.sh $primary $(top_primary_example_tail "$primary")"
}

print_top_alias_example_line() {
  local primary=$1
  local alias_name

  alias_name=$(lookup_top_alias_name "$primary") || return 1
  printf '%s\n' "  ./start.sh $alias_name $(top_alias_example_tail "$primary")"
}

print_top_primary_example_lines() {
  local primary=$1
  print_top_primary_example_line "$primary"
  print_top_alias_example_line "$primary"
}

canonical_script_example_line() {
  local namespace=$1
  local subcommand=$2

  case "$namespace:$subcommand" in
    report:queue) printf '%s\n' '  ./start.sh report queue' ;;
    report:archive) printf '%s\n' '  ./start.sh report archive' ;;
    report:trace) printf '%s\n' '  ./start.sh report trace demo-001' ;;
    fix:doctor) printf '%s\n' '  ./start.sh fix doctor' ;;
    fix:integrity) printf '%s\n' '  ./start.sh fix integrity' ;;
    fix:repair) printf '%s\n' '  ./start.sh fix repair /Applications/Hierarchy/Canonical/.../Workflow/18-Review/example.item.txt' ;;
    move:item) printf '%s\n' '  ./start.sh move item /Applications/Hierarchy/Canonical/.../Workflow/01-Intake/example.item.txt 02-Register' ;;
    move:handoff) printf '%s\n' '  ./start.sh move handoff /Applications/Hierarchy/Canonical/.../Workflow/24-Conveyor-Belt/example.item.txt /Applications/Hierarchy/Canonical/01-Enterprise/Workflow' ;;
    move:index) printf '%s\n' '  ./start.sh move index /Applications/Hierarchy/Canonical/.../Workflow/18-Review/example.item.txt' ;;
    move:archive) printf '%s\n' '  ./start.sh move archive /Applications/Hierarchy/Canonical/.../Workflow/26-Index/example.item.txt' ;;
    *)
      return 1
      ;;
  esac
}

print_canonical_script_example_lines() {
  local namespace=$1
  local subcommand

  while IFS= read -r subcommand; do
    [[ -n "$subcommand" ]] || continue
    canonical_script_example_line "$namespace" "$subcommand"
  done < <(list_canonical_script_subcommands "$namespace")
}

top_script_example_line() {
  local mode_name=$1

  case "$mode_name" in
    trace) printf '%s\n' '  ./start.sh trace demo-001' ;;
    daily) printf '%s\n' '  ./start.sh daily' ;;
    weekly) printf '%s\n' '  ./start.sh weekly' ;;
    monthly) printf '%s\n' '  ./start.sh monthly' ;;
    doctor) printf '%s\n' '  ./start.sh doctor' ;;
    *)
      return 1
      ;;
  esac
}

print_usage_example_lines() {
  local line
  for line in "${USAGE_EXAMPLE_PREFIX_LINES[@]}"; do
    printf '%s\n' "  $line"
  done
  while IFS= read -r line; do
    [[ -n "$line" ]] || continue
    printf '%s\n' "  ./start.sh browse $line"
  done < <(list_browse_sections)
  print_top_primary_example_lines docs
  for line in "${USAGE_EXAMPLE_SUFFIX_LINES[@]}"; do
    printf '%s\n' "  $line"
    if [[ "$line" == './start.sh status' ]]; then
      top_script_example_line trace
      top_script_example_line doctor
    elif [[ "$line" == './start.sh review monthly' ]]; then
      top_script_example_line daily
      top_script_example_line weekly
      top_script_example_line monthly
    fi
  done
  print_canonical_script_example_lines report
  print_canonical_script_example_lines fix
  print_canonical_script_example_lines move
  print_top_primary_example_lines create
}

fail_usage() {
  echo "Error: $1" >&2
  usage >&2
  exit 1
}

require_exact_args() {
  local actual=$1
  local expected=$2
  local message=$3
  [[ $actual -eq $expected ]] || fail_usage "$message"
}

require_min_args() {
  local actual=$1
  local minimum=$2
  local message=$3
  [[ $actual -ge $minimum ]] || fail_usage "$message"
}

require_arg_range() {
  local actual=$1
  local minimum=$2
  local maximum=$3
  local message=$4
  [[ $actual -ge $minimum && $actual -le $maximum ]] || fail_usage "$message"
}

print_browse_command_line() {
  local prefix=$1
  printf '%s ./start.sh browse [%s]\n' "$prefix" "$(browse_sections_pipe)"
}

print_browse_entry_line() {
  local browse_topic=$1
  printf '%s\n' "Best entry: ./start.sh browse $browse_topic"
}

print_browse_what_result() {
  local family=$1
  local what_text=$2
  local browse_target=${3:-}

  printf '%s\n' "Command family: $family"
  printf '%s\n' "What it does: $what_text"
  if [[ -n "$browse_target" ]]; then
    print_browse_entry_line "$browse_target"
  else
    print_browse_command_line 'Best entry:'
  fi
}

print_browse_where_result() {
  local why_text=$1
  print_browse_command_line 'Best command:'
  printf '%s\n' 'Guide topic: manual'
  printf '%s\n' "Why: $why_text"
}

print_browse_awk_section() {
  local title=$1
  local underline=$2
  local heading=$3
  local heading_underline=$4
  local awk_program=$5
  local source_file=$6
  local use_line=$7

  print_page_header "$title" "$underline"
  print_section_heading "$heading" "$heading_underline"
  awk "$awk_program" "$source_file"
  printf '\n%s\n' "$use_line"
}

print_browse_static_list_page() {
  local title=$1
  local underline=$2
  local heading=$3
  local heading_underline=$4
  local use_line=$5
  shift 5

  print_page_header "$title" "$underline"
  print_section_heading "$heading" "$heading_underline"
  print_dash_list "$@"
  if [[ -n "$use_line" ]]; then
    print_browse_use_line "$use_line"
  fi
}

print_browse_file_list_page() {
  local title=$1
  local underline=$2
  local heading=$3
  local heading_underline=$4
  local awk_program=$5
  local source_file=$6
  local extra_heading=$7
  local extra_heading_underline=$8
  local use_line=$9
  shift 9

  print_page_header "$title" "$underline"
  print_section_heading "$heading" "$heading_underline"
  awk "$awk_program" "$source_file"
  if [[ -n "$extra_heading" ]]; then
    print_section_block "$extra_heading" "$extra_heading_underline"
    print_dash_list "$@"
  fi
  if [[ -n "$use_line" ]]; then
    print_browse_use_line "$use_line"
  fi
}

print_browse_renderer_page() {
  local title=$1
  local underline=$2
  local heading=$3
  local heading_underline=$4
  local renderer=$5
  local use_line=$6
  shift 6

  print_page_header "$title" "$underline"
  if [[ -n "$heading" ]]; then
    print_section_heading "$heading" "$heading_underline"
  fi
  "$renderer" "$@"
  if [[ -n "$use_line" ]]; then
    print_browse_use_line "$use_line"
  fi
}

render_browse_all() {
  print_page_header 'Hierarchy browse' '================'
  print_section_heading 'Available sections' '------------------'
  print_browse_sections
  print_section_block 'Guide topics' '------------'
  print_dash_list "${BROWSE_ALL_GUIDE_GROUPS[@]}"
  print_section_block 'Core tools' '----------'
  print_dash_list "${BROWSE_ALL_CORE_TOOLS[@]}"
  print_section_block 'Saved artifacts' '---------------'
  print_artifact_directories
  print_section_block 'Next steps' '----------'
  print_browse_next_steps
}

render_browse_layers() {
  local current_dir
  local next_dir

  print_page_header 'Hierarchy browse layers' '======================='
  print_section_heading 'Canonical layer guide' '---------------------'
  awk '/^[0-9][0-9]-/ { print "- " $1 " -> " substr($0, index($0,$2)) }' "$CANONICAL_DIR/CANONICAL-HIERARCHY.txt"
  print_section_block 'Current live chain' '------------------'
  current_dir="$CANONICAL_DIR"
  while true; do
    next_dir=$(find "$current_dir" -mindepth 1 -maxdepth 1 -type d -name '[0-9][0-9]-*' | sort | head -n 1)
    if [[ -z "$next_dir" ]]; then
      break
    fi
    printf '%s\n' "- ${next_dir#$CANONICAL_DIR/}"
    current_dir="$next_dir"
  done
  print_browse_use_line 'Use: ./start.sh new <workflow-dir> <name> [title]'
}

render_browse_workflow() {
  print_page_header 'Hierarchy browse workflow' '========================='
  print_section_heading 'Shared 27-step workflow' '-----------------------'
  sed -n '6,32p' "$CANONICAL_DIR/WORKFLOW-MODEL.txt" | sed 's/^/- /'
  print_section_block 'Phase groupings' '---------------'
  sed -n '42,47p' "$CANONICAL_DIR/WORKFLOW-MODEL.txt" | sed 's/^/- /'
  print_section_block 'Live workflow path example' '--------------------------'
  find "$CANONICAL_DIR/01-Enterprise/Workflow" -mindepth 1 -maxdepth 1 \( -type d -o -name 'TEMPLATE-ITEM.txt' \) | sort | sed "s#^$CANONICAL_DIR/##" | sed 's/^/- /'
  print_browse_use_line 'Use: ./start.sh move item <item-file> <target-step> [target-workflow-dir]'
}

render_browse_examples() {
  print_browse_file_list_page \
    'Hierarchy browse examples' \
    '=========================' \
    'Examples library' \
    '----------------' \
    '/^Example [0-9]+:/ { print "- " $0 }' \
    "$CANONICAL_DIR/HOW-TO/18-EXAMPLES-LIBRARY.txt" \
    'Reference files' \
    '---------------' \
    'Use: ./start.sh guide examples' \
    "${BROWSE_EXAMPLE_REFERENCE_FILES[@]}"
}

render_browse_recipes() {
  print_browse_file_list_page \
    'Hierarchy browse recipes' \
    '========================' \
    'Recipe library' \
    '--------------' \
    '/^Recipe [0-9]+:/ { print "- " $0 }' \
    "$CANONICAL_DIR/HOW-TO/07-RECIPES.txt" \
    'Companion tools' \
    '---------------' \
    'Use: ./start.sh guide archive | ./start.sh guide move' \
    "${BROWSE_RECIPE_COMPANION_TOOLS[@]}"
}

render_browse_guides() {
  print_browse_static_list_page \
    'Hierarchy browse guides' \
    '=======================' \
    'Common guide topics' \
    '-------------------' \
    'Use: ./start.sh guide <topic>' \
    "${BROWSE_GUIDE_TOPIC_SUMMARIES[@]}"
}

render_browse_tools() {
  print_browse_static_list_page \
    'Hierarchy browse tools' \
    '======================' \
    'Core Canonical tools' \
    '--------------------' \
    '' \
    "${BROWSE_TOOL_SUMMARIES[@]}"
}

render_browse_reports() {
  print_browse_renderer_page \
    'Hierarchy browse reports' \
    '========================' \
    'Artifact directories' \
    '--------------------' \
    print_artifact_directories \
    'Use: ./start.sh report queue|archive|trace ...'
}

render_browse_reviews() {
  print_browse_renderer_page \
    'Hierarchy browse reviews' \
    '========================' \
    '' \
    '' \
    print_recent_review_directories \
    'Use: ./start.sh daily | weekly | monthly'
}

render_browse_topic() {
  local topic=$1
  local key
  local kind
  local first
  local second
  local third
  local fourth
  local fifth
  local sixth
  local seventh

  while IFS=$'\t' read -r key kind first second third fourth fifth sixth seventh; do
    [[ -n "$key" ]] || continue
    if [[ "$key" == "$topic" ]]; then
      case "$kind" in
        renderer)
          "$first"
          ;;
        awk)
          print_browse_awk_section "$first" "$second" "$third" "$fourth" "$fifth" "$CANONICAL_DIR/$sixth" "$seventh"
          ;;
        *)
          fail_usage "invalid browse registry kind: $kind"
          ;;
      esac
      return 0
    fi
  done <<<"$BROWSE_TABLE"

  return 1
}

list_browse_sections() {
  local key
  local kind
  local first
  local second
  local third
  local fourth
  local fifth
  local sixth
  local seventh

  while IFS=$'\t' read -r key kind first second third fourth fifth sixth seventh; do
    [[ -n "$key" ]] || continue
    [[ "$key" == 'all' ]] && continue
    printf '%s\n' "$key"
  done <<<"$BROWSE_TABLE"
}

browse_sections_pipe() {
  local browse_sections=()
  local section_name
  while IFS= read -r section_name; do
    [[ -n "$section_name" ]] || continue
    browse_sections+=("$section_name")
  done < <(list_browse_sections)
  join_with_pipe "${browse_sections[@]}"
}

print_browse_mode_description() {
  local browse_sections=()
  local section_name
  while IFS= read -r section_name; do
    [[ -n "$section_name" ]] || continue
    browse_sections+=("$section_name")
  done < <(list_browse_sections)
  printf '%s\n' "  browse $(join_with_conjunction and "${browse_sections[@]}") from the live registry"
}

print_page_header() {
  local title=$1
  local underline=$2
  print_surface_header "$title" "$underline"
}

print_section_heading() {
  local heading=$1
  local underline=$2
  printf '%s\n' "$heading"
  printf '%s\n' "$underline"
}

print_section_block() {
  local heading=$1
  local underline=$2
  printf '\n'
  print_section_heading "$heading" "$underline"
}

print_browse_use_line() {
  local use_line=$1
  printf '\n%s\n' "$use_line"
}

dispatch_root_target() {
  local namespace=$1
  local subcommand=$2
  local target_kind
  local target_value
  local unused
  local record
  shift 2

  if ! record=$(lookup_table_row "$namespace:$subcommand" "$ROOT_DISPATCH_TABLE"); then
    return 1
  fi

  IFS=$'\t' read -r target_kind target_value unused <<<"$record"
  case "$target_kind" in
    root)
      exec "$0" "$target_value" "$@"
      ;;
    script)
      exec "$CANONICAL_DIR/$target_value" "$@"
      ;;
    *)
      return 1
      ;;
  esac
}

exec_canonical_script() {
  local script_name=$1
  shift
  exec "$CANONICAL_DIR/$script_name" "$@"
}

dispatch_canonical_script() {
  local namespace=$1
  local subcommand=$2
  local record
  local script_name
  local unused_one
  local unused_two
  shift 2

  if ! record=$(lookup_table_row "$namespace:$subcommand" "$CANONICAL_SCRIPT_TABLE"); then
    return 1
  fi

  IFS=$'\t' read -r script_name unused_one unused_two <<<"$record"
  exec_canonical_script "$script_name" "$@"
}

dispatch_validated_subcommand() {
  local namespace=$1
  local subcommand=$2
  local unknown_message=$3
  shift 3

  validate_subcommand_args "$namespace" "$subcommand" $#
  if ! dispatch_canonical_script "$namespace" "$subcommand" "$@"; then
    fail_usage "$unknown_message: $subcommand"
  fi
}

render_browse_what_topic() {
  local topic=$1
  local record
  local family
  local what_text
  local browse_target

  if ! record=$(lookup_table_row "$topic" "$BROWSE_WHAT_TABLE"); then
    return 1
  fi

  IFS=$'\t' read -r family what_text browse_target <<<"$record"
  print_browse_what_result "$family" "$what_text" "$browse_target"
}

handle_optional_topic_mode() {
  local mode_name=$1
  local zero_action=$2
  local single_action=$3
  shift 3

  if [[ $# -eq 0 ]]; then
    case "$zero_action" in
      route-open)
        exec "$0" open
        ;;
      print-readme)
        print_readme
        exit 0
        ;;
      print-usage)
        usage
        exit 0
        ;;
      *)
        fail_usage "invalid zero-action rule: $mode_name"
        ;;
    esac
  fi

  if [[ $# -eq 1 ]]; then
    local raw_topic=$1
    local normalized_topic
    normalized_topic=$(normalize_topic "$raw_topic")

    case "$single_action" in
      go-soft-route)
        if ! route_soft_navigation_topic "$normalized_topic" open; then
          exec "$0" guide "$raw_topic"
        fi
        ;;
      open-soft-route)
        if ! route_soft_navigation_topic "$normalized_topic" readme; then
          dispatch_canonical_script top docs "$raw_topic"
        fi
        ;;
      help-topic-route)
        if help_routes_to_what_surface "$normalized_topic"; then
          exec "$0" what "$normalized_topic"
        fi
        dispatch_canonical_script top docs "$raw_topic"
        ;;
      *)
        fail_usage "invalid single-action rule: $mode_name"
        ;;
    esac
  fi

  fail_usage "$mode_name mode accepts zero or one topic"
}

validate_subcommand_args() {
  local namespace=$1
  local subcommand=$2
  local actual=$3
  local record
  local validation_type
  local first_value
  local second_value
  local message

  if ! record=$(lookup_table_row "$namespace:$subcommand" "$SUBCOMMAND_VALIDATION_TABLE"); then
    return 0
  fi

  IFS=$'\t' read -r validation_type first_value second_value message <<<"$record"
  case "$validation_type" in
    exact)
      require_exact_args "$actual" "$first_value" "$message"
      ;;
    range)
      require_arg_range "$actual" "$first_value" "$second_value" "$message"
      ;;
    *)
      fail_usage "invalid validation rule: $namespace:$subcommand"
      ;;
  esac
}

normalize_topic() {
  printf '%s' "$1" | tr '[:upper:]' '[:lower:]'
}

canonicalize_browse_topic() {
  case "$1" in
    guides) printf '%s\n' 'guides' ;;
    layers) printf '%s\n' 'layers' ;;
    workflow|states) printf '%s\n' 'workflow' ;;
    lifecycle|maps) printf '%s\n' 'lifecycle' ;;
    bootstrap) printf '%s\n' 'bootstrap' ;;
    glossary) printf '%s\n' 'glossary' ;;
    decisions|decide) printf '%s\n' 'decisions' ;;
    principles) printf '%s\n' 'principles' ;;
    anti-patterns|antipatterns) printf '%s\n' 'anti-patterns' ;;
    checklists) printf '%s\n' 'checklists' ;;
    troubleshooting|troubleshoot) printf '%s\n' 'troubleshooting' ;;
    roles|role) printf '%s\n' 'roles' ;;
    rhythms|cadence) printf '%s\n' 'rhythms' ;;
    examples) printf '%s\n' 'examples' ;;
    recipes) printf '%s\n' 'recipes' ;;
    tools) printf '%s\n' 'tools' ;;
    reports) printf '%s\n' 'reports' ;;
    reviews) printf '%s\n' 'reviews' ;;
    *) return 1 ;;
  esac
}

route_soft_navigation_topic() {
  local topic=$1
  local readme_target=$2
  local browse_topic

  if browse_topic=$(canonicalize_browse_topic "$topic" 2>/dev/null); then
    exec "$0" browse "$browse_topic"
  fi

  case "$topic" in
    start|bootstrap|begin|manual|index|readme)
      exec "$0" "$readme_target"
      ;;
    list|map|browse)
      exec "$0" "$topic"
      ;;
    where|what|why|show|run|search|find|go|help)
      exec "$0" what "$topic"
      ;;
    status|trace|report|fix|move|review|docs|guide|open|create|new)
      exec "$0" where "$topic"
      ;;
    *)
      return 1
      ;;
  esac
}

help_routes_to_what_surface() {
  local topic=$1
  local canonical_topic

  if lookup_table_row "$topic" "$BROWSE_WHAT_TABLE" >/dev/null; then
    return 0
  fi

  if canonical_topic=$(canonicalize_browse_topic "$topic" 2>/dev/null) && lookup_table_row "$canonical_topic" "$BROWSE_WHAT_TABLE" >/dev/null; then
    return 0
  fi

  if ! canonical_topic=$(canonicalize_what_topic "$topic" 2>/dev/null); then
    return 1
  fi

  case "$canonical_topic" in
    list|map|where|what|why|show|run|search|go|help)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

print_readme() {
  sed -n '1,200p' "$CANONICAL_DIR/README.txt"
}

print_surface_header() {
  local title=$1
  local underline=$2
  printf '%s\n' "$title"
  printf '%s\n\n' "$underline"
}

print_where_result() {
  local best_command=$1
  local guide_topic=$2
  local why_text=$3
  printf '%s\n' "Best command: $best_command"
  printf '%s\n' "Guide topic: $guide_topic"
  printf '%s\n' "Why: $why_text"
}

print_what_result() {
  local family=$1
  local what_text=$2
  local best_entry=$3
  printf '%s\n' "Command family: $family"
  printf '%s\n' "What it does: $what_text"
  printf '%s\n' "Best entry: $best_entry"
}

print_why_result() {
  local why_title=$1
  local rationale=$2
  local consequence=$3
  printf '%s\n' "$why_title"
  printf '%s\n' "Rationale: $rationale"
  printf '%s\n' "Consequence: $consequence"
}

lookup_table_row() {
  local query=$1
  local table=$2
  local key
  local first
  local second
  local third

  while IFS=$'\t' read -r key first second third; do
    [[ -n "$key" ]] || continue
    if [[ "$key" == "$query" ]]; then
      printf '%s\t%s\t%s\n' "$first" "$second" "$third"
      return 0
    fi
  done <<<"$table"

  return 1
}

canonicalize_where_topic() {
  case "$1" in
    start|bootstrap|begin) printf '%s\n' 'start' ;;
    quickstart) printf '%s\n' 'quickstart' ;;
    list|index-of-commands|command-families) printf '%s\n' 'list' ;;
    map|structure|mental-model) printf '%s\n' 'map' ;;
    manual) printf '%s\n' 'manual' ;;
    philosophy|manifesto) printf '%s\n' 'philosophy' ;;
    glossary|vocabulary|terms) printf '%s\n' 'glossary' ;;
    status|overview|snapshot) printf '%s\n' 'status' ;;
    trace|lineage|traces) printf '%s\n' 'trace' ;;
    trace-report) printf '%s\n' 'trace-report' ;;
    trace-tool) printf '%s\n' 'trace-tool' ;;
    quality|standards) printf '%s\n' 'quality' ;;
    search|find) printf '%s\n' 'search' ;;
    report) printf '%s\n' 'report' ;;
    queue|queue-report|queue-manifest) printf '%s\n' 'queue' ;;
    archive-report|archive-manifest) printf '%s\n' 'archive-report' ;;
    run) printf '%s\n' 'run' ;;
    fix) printf '%s\n' 'fix' ;;
    integrity|audit) printf '%s\n' 'integrity' ;;
    repair|fix-metadata) printf '%s\n' 'repair' ;;
    doctor|health) printf '%s\n' 'doctor' ;;
    move|moving) printf '%s\n' 'move' ;;
    handoff|handoffs|conveyor) printf '%s\n' 'handoff' ;;
    handoff-tool|transfer) printf '%s\n' 'transfer' ;;
    index|indexing|index-item|index-record) printf '%s\n' 'index' ;;
    archive|archive-item|reference) printf '%s\n' 'archive' ;;
    review) printf '%s\n' 'review' ;;
    daily) printf '%s\n' 'daily' ;;
    brief) printf '%s\n' 'brief' ;;
    daily-brief) printf '%s\n' 'daily-brief' ;;
    weekly|weekly-review) printf '%s\n' 'weekly' ;;
    monthly|monthly-review) printf '%s\n' 'monthly' ;;
    show) printf '%s\n' 'show' ;;
    decide|decision) printf '%s\n' 'decision' ;;
    examples|example|patterns) printf '%s\n' 'examples' ;;
    what) printf '%s\n' 'what' ;;
    why) printf '%s\n' 'why' ;;
    go) printf '%s\n' 'go' ;;
    docs|guide|help|open) printf '%s\n' 'docs' ;;
    readme) printf '%s\n' 'readme' ;;
    create|new) printf '%s\n' 'create' ;;
    *) return 1 ;;
  esac
}

canonicalize_what_topic() {
  case "$1" in
    list) printf '%s\n' 'list' ;;
    map) printf '%s\n' 'map' ;;
    manual) printf '%s\n' 'manual' ;;
    layers) printf '%s\n' 'layers' ;;
    workflow|states) printf '%s\n' 'workflow' ;;
    lifecycle|maps) printf '%s\n' 'lifecycle' ;;
    bootstrap|start) printf '%s\n' 'bootstrap' ;;
    quickstart) printf '%s\n' 'quickstart' ;;
    philosophy|manifesto) printf '%s\n' 'philosophy' ;;
    glossary) printf '%s\n' 'glossary' ;;
    vocabulary|terms) printf '%s\n' 'vocabulary' ;;
    decisions|decide) printf '%s\n' 'decisions' ;;
    decision) printf '%s\n' 'decision' ;;
    principles) printf '%s\n' 'principles' ;;
    anti-patterns|antipatterns) printf '%s\n' 'anti-patterns' ;;
    checklists) printf '%s\n' 'checklists' ;;
    troubleshooting|troubleshoot) printf '%s\n' 'troubleshooting' ;;
    roles|role) printf '%s\n' 'roles' ;;
    rhythms|cadence) printf '%s\n' 'rhythms' ;;
    examples) printf '%s\n' 'examples' ;;
    patterns|example) printf '%s\n' 'patterns' ;;
    queue|queue-report|queue-manifest) printf '%s\n' 'queue-report' ;;
    archive-report|archive-manifest) printf '%s\n' 'archive-report' ;;
    where) printf '%s\n' 'where' ;;
    what) printf '%s\n' 'what' ;;
    why) printf '%s\n' 'why' ;;
    search|find) printf '%s\n' 'search' ;;
    run) printf '%s\n' 'run' ;;
    show) printf '%s\n' 'show' ;;
    go) printf '%s\n' 'go' ;;
    help) printf '%s\n' 'help' ;;
    status|overview|snapshot) printf '%s\n' 'status' ;;
    trace|traces|lineage) printf '%s\n' 'trace' ;;
    report) printf '%s\n' 'report' ;;
    trace-report) printf '%s\n' 'trace-report' ;;
    trace-tool) printf '%s\n' 'trace-tool' ;;
    quality|standards) printf '%s\n' 'quality' ;;
    handoff-tool|transfer) printf '%s\n' 'transfer' ;;
    handoff|handoffs|conveyor) printf '%s\n' 'handoff' ;;
    index|indexing|index-item|index-record) printf '%s\n' 'index' ;;
    archive|archive-item|reference) printf '%s\n' 'archive' ;;
    integrity|audit) printf '%s\n' 'integrity' ;;
    repair|fix-metadata) printf '%s\n' 'repair' ;;
    doctor|health) printf '%s\n' 'doctor' ;;
    fix) printf '%s\n' 'fix' ;;
    move|moving) printf '%s\n' 'move' ;;
    review) printf '%s\n' 'review' ;;
    daily|daily-brief|brief) printf '%s\n' 'daily' ;;
    weekly|weekly-review) printf '%s\n' 'weekly' ;;
    monthly|monthly-review) printf '%s\n' 'monthly' ;;
    docs|guide|open) printf '%s\n' 'docs' ;;
    create|new) printf '%s\n' 'create' ;;
    readme) printf '%s\n' 'readme' ;;
    *) return 1 ;;
  esac
}

canonicalize_why_topic() {
  case "$1" in
    hierarchy|model|system|start) printf '%s\n' 'hierarchy' ;;
    layers|taxonomy) printf '%s\n' 'layers' ;;
    workflow|states) printf '%s\n' 'workflow' ;;
    lifecycle|maps|bootstrap|glossary|decisions|decide|principles|anti-patterns|antipatterns|checklists|troubleshooting|troubleshoot|roles|role|rhythms|cadence) printf '%s\n' 'orientation' ;;
    quickstart) printf '%s\n' 'quickstart' ;;
    philosophy|manifesto) printf '%s\n' 'philosophy' ;;
    vocabulary|terms) printf '%s\n' 'vocabulary' ;;
    quality|standards) printf '%s\n' 'quality' ;;
    handoff-tool|transfer) printf '%s\n' 'transfer' ;;
    decision) printf '%s\n' 'decision' ;;
    examples|recipes) printf '%s\n' 'examples' ;;
    patterns|example) printf '%s\n' 'patterns' ;;
    tools) printf '%s\n' 'tools' ;;
    reports|reviews) printf '%s\n' 'reports' ;;
    queue|queue-report|queue-manifest) printf '%s\n' 'queue' ;;
    archive-report|archive-manifest) printf '%s\n' 'archive-report' ;;
    handoff|handoffs|conveyor) printf '%s\n' 'handoff' ;;
    index|indexing|index-item|index-record) printf '%s\n' 'index' ;;
    archive|archive-item|reference) printf '%s\n' 'archive' ;;
    move|moving) printf '%s\n' 'move' ;;
    trace|traces|lineage|report|search|find) printf '%s\n' 'discovery' ;;
    trace-report) printf '%s\n' 'trace-report' ;;
    trace-tool) printf '%s\n' 'trace-tool' ;;
    integrity|audit) printf '%s\n' 'integrity' ;;
    repair|fix-metadata) printf '%s\n' 'repair' ;;
    doctor|health) printf '%s\n' 'doctor' ;;
    fix) printf '%s\n' 'fix' ;;
    status|overview|snapshot) printf '%s\n' 'status' ;;
    review) printf '%s\n' 'review' ;;
    daily|daily-brief|brief) printf '%s\n' 'daily' ;;
    weekly|weekly-review) printf '%s\n' 'weekly' ;;
    monthly|monthly-review) printf '%s\n' 'monthly' ;;
    map|where|what|why|browse) printf '%s\n' 'explanation' ;;
    docs|guide|open|help|readme|manual) printf '%s\n' 'docs' ;;
    create|new) printf '%s\n' 'create' ;;
    *) return 1 ;;
  esac
}

WHERE_TABLE=$(cat <<'EOF'
start	./start.sh open	start	opens the front door and points you into the bootstrap material.
quickstart	./start.sh open quickstart	start	opens the shortest practical onboarding path when you want to get moving quickly.
list	./start.sh list	manual	gives the safest root-level index of command families and saved artifact buckets.
map	./start.sh map	manual	shows the top-level model and command families in one place.
manual	./start.sh open manual	manual	opens the guide index when you want the human-readable documentation map.
philosophy	./start.sh open philosophy	philosophy	opens the design-intent layer when you want the deeper model rationale.
glossary	./start.sh open glossary	glossary	normalizes language before you start making decisions or extending the structure.
status	./start.sh status	status	gives the fastest live workflow snapshot without writing files.
trace	./start.sh trace <filename-or-item-id>	trace	finds every live copy of an item across the hierarchy.
trace-report	./start.sh report trace <filename-or-item-id> [output-file]	trace	writes a saved lineage artifact when you want a persistent trace report.
trace-tool	./start.sh trace <filename-or-item-id>	trace	runs the live lineage lookup directly when you want the interactive trace view.
quality	./start.sh open quality	quality	opens the quality standards when you need a benchmark for good structure and output.
search	./start.sh search <query>	manual	finds matching guides, item files, and saved reports from one root-level query.
queue	./start.sh report queue [output-file]	queue-report	writes the active-work manifest for intake, review, and handoff queues.
archive-report	./start.sh report archive [output-file]	archive-report	writes a saved manifest of archived material instead of only printing live state.
integrity	./start.sh fix integrity	troubleshoot	runs the metadata drift audit directly when you want a truthfulness check.
repair	./start.sh fix repair <item-file>	troubleshoot	repairs one item when location is the source of truth and metadata needs to catch up.
doctor	./start.sh doctor	troubleshoot	routes you into health checks and metadata repair actions.
handoff	./start.sh move handoff <item-file> <target-workflow-dir>	handoff	performs the visible 24 -> 25 -> downstream 01 crossing directly when you know the target workflow.
transfer	./start.sh open transfer	handoff	opens the handoff recipe layer when you want the operational pattern before executing the move.
index	./start.sh move index <item-file>	index-item	writes the step-26 sidecar index record directly for one item.
archive	./start.sh move archive <item-file>	archive	archives one item cleanly with its step-26 record when you are finishing the operational lifecycle.
daily	./start.sh daily [brief-dir]	daily-brief	runs the session-start brief directly when you want the daily re-entry checkpoint.
brief	./start.sh daily [brief-dir]	daily-brief	runs the session-start brief directly when you want the quick re-entry checkpoint.
daily-brief	./start.sh daily [brief-dir]	daily-brief	runs the session-start review directly when you want doctor output plus queue and archive context.
weekly	./start.sh weekly [review-dir]	weekly-review	runs the broader maintenance review directly when you want the weekly checkpoint.
monthly	./start.sh monthly [review-dir]	monthly-review	runs the structural review directly when you want the monthly system sweep.
decision	./start.sh browse decisions	decide	opens the decision-tree layer when you need branching judgment help.
examples	./start.sh browse examples	examples	exposes reusable working forms when you want a copyable pattern instead of pure theory.
what	./start.sh what <topic>	manual	explains what a root command family does and points you to its best entry.
why	./start.sh why <topic>	manual	explains the rationale behind a root command family or operating concept.
go	./start.sh go [topic]	manual	gives a softer navigation verb for reaching root surfaces and guide suggestions.
docs	./start.sh open [topic]	manual	browse the README, reach root-native surfaces, or jump directly into the right guide.
readme	./start.sh readme	manual	prints the Canonical README front door directly when you want the human-readable root overview.
create	./start.sh new <workflow-dir> <name> [title]	new	creates a correctly initialized item in Workflow/01-Intake/.
EOF
)

WHAT_TABLE=$(cat <<'EOF'
list	list	shows the command map and saved artifact buckets.	./start.sh list
map	map	shows the mental model of the hierarchy and the root command families.	./start.sh map
manual	manual	opens the guide index so you can browse the human-readable documentation map.	./start.sh open manual
layers	layers	shows the numbered taxonomy chain and the current live layer path.	./start.sh browse layers
workflow	workflow	shows the shared 27 workflow states, phase groupings, and a live Workflow/ path example.	./start.sh browse workflow
lifecycle	lifecycle	lists end-to-end journey maps across layers and workflow states.	./start.sh browse lifecycle
bootstrap	bootstrap	lists the recommended learning and onboarding sequence for entering the hierarchy.	./start.sh browse bootstrap
quickstart	quickstart	opens the shortest practical onboarding path for getting started fast.	./start.sh open quickstart
philosophy	philosophy	opens the design-intent layer that explains why the hierarchy is shaped this way.	./start.sh open philosophy
glossary	glossary	lists the canonical vocabulary used across items, guides, and scripts.	./start.sh browse glossary
vocabulary	vocabulary	opens the canonical vocabulary guide so language stays consistent across the system.	./start.sh open glossary
decisions	decisions	lists decision trees for choosing moves, handoffs, archive, and documentation actions.	./start.sh browse decisions
decision	decision	opens the decision-tree layer for one branching choice at a time.	./start.sh browse decisions
principles	principles	lists the design principles that shape the Canonical hierarchy.	./start.sh browse principles
anti-patterns	anti-patterns	lists common mistakes that weaken the Canonical hierarchy.	./start.sh browse anti-patterns
checklists	checklists	lists operator safeguards for creation, movement, handoff, archive, docs, and structure changes.	./start.sh browse checklists
troubleshooting	troubleshooting	lists common problems and fast fixes for drift, duplication, skipped handoffs, and messy archives.	./start.sh browse troubleshooting
roles	roles	lists the role modes for creators, operators, agents, auditors, architects, and teachers.	./start.sh browse roles
rhythms	rhythms	lists the recurring operating rhythms for daily flow, sessions, handoffs, documentation, and review.	./start.sh browse rhythms
examples	examples	lists reusable example patterns and the live demonstration reference.	./start.sh browse examples
patterns	patterns	opens reusable working forms you can copy instead of inventing from scratch.	./start.sh browse examples
queue-report	queue report	writes the active-work manifest for intake, review, and handoff queues.	./start.sh report queue [output-file]
archive-report	archive report	writes a saved manifest of archived material.	./start.sh report archive [output-file]
where	where	recommends the best command and guide topic for a task.	./start.sh where <topic>
what	what	explains what a root command family is for and points to its best entry.	./start.sh what <topic>
why	why	explains the rationale behind a root command family or operating concept.	./start.sh why <topic>
search	search	finds matching guides, item files, and saved reports by query.	./start.sh search <query>
go	go	gives a softer navigation verb for opening the README, routing to root-native surfaces, or reaching guide suggestions.	./start.sh go [topic]
help	help	provides usage at the root or routes a topic into the best guide, root surface, or command-family explanation.	./start.sh help [topic]
status	status	prints the live workflow snapshot without creating files.	./start.sh status
trace	trace	prints the live lineage view for one item across the hierarchy.	./start.sh trace <filename-or-item-id>
trace-report	trace report	writes a saved lineage artifact for one item.	./start.sh report trace <filename-or-item-id> [output-file]
trace-tool	trace tool	runs the live lineage lookup for one item across the hierarchy.	./start.sh trace <filename-or-item-id>
quality	quality	opens the quality standards for judging structure, clarity, and output shape.	./start.sh open quality
transfer	transfer	opens the handoff recipe layer before you execute a crossing.	./start.sh open transfer
handoff	handoff	performs the visible 24 -> 25 -> downstream 01 crossing for one item.	./start.sh move handoff <item-file> <target-workflow-dir>
index	index	writes the step-26 sidecar index record for one item.	./start.sh move index <item-file>
archive	archive	archives one item cleanly with its step-26 record.	./start.sh move archive <item-file>
integrity	integrity	runs the metadata drift audit directly when you want a truthfulness check.	./start.sh fix integrity
repair	repair	repairs one item when location is the source of truth and metadata needs to catch up.	./start.sh fix repair <item-file>
doctor	doctor	runs the one-command health check across overview and integrity.	./start.sh doctor
daily	daily brief	runs the session-start review with live doctor output plus saved queue and archive reports.	./start.sh daily [brief-dir]
weekly	weekly review	runs the broader maintenance review for the weekly checkpoint.	./start.sh weekly [review-dir]
monthly	monthly review	runs the structural review for the monthly system sweep.	./start.sh monthly [review-dir]
docs	docs	opens the README, routes root-native topics, routes to guides, and provides contextual help.	./start.sh open [topic]
create	create	creates a correctly initialized item in Workflow/01-Intake/.	./start.sh new <workflow-dir> <name> [title]
readme	readme	prints the Canonical README front door.	./start.sh readme
EOF
)

WHY_TABLE=$(cat <<'EOF'
hierarchy	Why this exists: to keep meaning and movement legible at the same time.	taxonomy answers what something is, workflow answers what state it is in.	items can move without their meaning becoming ambiguous.
layers	Why layers exist: stable meaning needs a stable address system.	the taxonomy chain keeps kind-of-thing separate from state-of-work.	you can inspect movement without losing what the item fundamentally is.
workflow	Why workflow exists: movement needs a shared grammar, not just a destination tree.	the 27-step model gives every layer the same precise motion language.	progress, handoff, and archive stay comparable everywhere in the hierarchy.
orientation	Why orientation and guidance exist: shared journeys, learning paths, language, judgment, safeguards, roles, rhythms, and repair paths reduce structural drift.	lifecycle maps align the whole path, bootstrap aligns entry, the glossary aligns meanings, decision trees align choices, principles align direction, anti-patterns align avoidance, checklists align execution, troubleshooting aligns recovery, roles align emphasis, and rhythms align timing.	operators interpret the model consistently and extend it with less guesswork.
quickstart	Why quickstart exists: many people need a useful first move before they need the whole theory.	a short onboarding path lowers the cost of entering the system correctly.	more work starts in the right shape instead of improvising from the edge.
philosophy	Why philosophy exists: systems become brittle when people only know the rules and not the reasons.	the design-intent layer explains the deeper logic behind the hierarchy.	extensions stay more faithful to the model instead of copying surface patterns blindly.
vocabulary	Why vocabulary exists: shared language is the cheapest way to reduce structural misunderstanding.	naming things consistently makes movement, review, and teaching line up.	operators spend less time translating shared intent.
quality	Why quality standards exist: a structure this rich needs a visible definition of what good looks like.	standards turn taste and guesswork into something teachable and reviewable.	outputs become easier to compare, improve, and trust.
transfer	Why transfer guidance exists: crossings fail when people know they must hand off but not how to do it cleanly.	recipe-style guidance turns an abstract handoff into a repeatable operational move.	fewer crossings get improvised in inconsistent ways.
decision	Why decision guidance exists: branching moments are where operators most often invent local rules.	decision trees compress recurring judgment into something reusable.	similar situations get handled more consistently across time and people.
examples	Why examples and recipes exist: a system becomes usable faster when people can copy working forms.	examples show good shapes while recipes show repeatable actions.	adoption gets easier and fewer operators invent their own inconsistent patterns.
patterns	Why patterns exist: people learn structure faster from reusable forms than from abstract instruction alone.	copyable examples turn the model into something practical at the moment of use.	fewer newcomers invent malformed versions of already-solved shapes.
tools	Why the tools surface exists: operators need one place to see which script owns which action.	naming the tools and their jobs reduces guesswork and script-hopping.	people can move from intent to the right operational tool faster.
reports	Why report and review surfaces exist: recurring work should leave visible artifacts, not vanish into memory.	report buckets preserve outputs while review directories preserve cadence and checkpoints.	operators can audit recent activity and re-enter the system without reconstructing context from scratch.
queue	Why queue reporting exists: active work becomes hard to steer when queues are only inferred from folders.	a saved queue manifest turns intake, review, and handoff pressure into something visible and shareable.	operators can rebalance work and re-enter context without re-scanning the tree manually.
archive-report	Why archive reporting exists: completed material still needs a legible inventory.	a saved archive manifest makes the long tail of finished work searchable and auditable.	historical reference stays useful instead of disappearing into deep storage.
handoff	Why handoff exists: the most dangerous moment in a workflow is the crossing between owners or layers.	making the 24 -> 25 -> downstream 01 crossing explicit preserves responsibility and timing.	transitions stay visible instead of being guessed from missing files.
index	Why indexing exists: archive without a structured lookup record becomes hard to trust later.	the step-26 sidecar turns a moved file into a findable reference object with explicit lineage.	archived work remains navigable instead of becoming opaque storage.
archive	Why archive exists: finished work still needs a clean ending state, not just disappearance from active folders.	archiving with its index record closes the lifecycle while preserving traceability.	completion becomes legible and historical retrieval stays sane.
move	Why move exists: transitions are where confusion usually enters a system.	explicit movement, handoff, indexing, and archive steps preserve truth and lineage.	crossings stay visible instead of disappearing into assumption.
discovery	Why discovery exists: a system is only useful if people can inspect and recover context quickly.	traces, reports, and search turn the hierarchy into navigable memory, not just storage.	newcomers and future agents can reconstruct what happened.
trace-report	Why trace reporting exists: some lineage checks need to survive the moment of inspection.	a saved trace artifact turns one live lookup into something shareable, reviewable, and archivable.	lineage can be handed off or revisited without rerunning the same investigation from scratch.
trace-tool	Why the trace tool exists: people often need the live answer before they need a saved artifact.	direct lineage lookup keeps investigation fast when you are following one item through the tree.	traceability stays practical enough to use during normal work, not just audits.
integrity	Why integrity checks exist: the model stops being trustworthy when metadata and location disagree.	a direct drift audit catches silent divergence before it spreads into movement and reporting errors.	operators can trust the hierarchy as a source of truth instead of second-guessing it.
repair	Why repair exists: once drift is found, the system needs a precise way to reconcile metadata back to reality.	targeted repair lets location-derived truth reassert itself without broad manual cleanup.	one broken item does not force doubt about the rest of the hierarchy.
doctor	Why doctor exists: the front door should have one fast confidence check before deeper work begins.	combining overview and integrity into one command reduces friction at session start.	more operators actually verify system health before acting.
fix	Why repair exists: structure becomes untrustworthy when metadata and location drift apart.	health checks and repairs restore the most honest relationship between file, state, and meaning.	the hierarchy stays reliable enough to operate as a system, not just a folder pile.
status	Why status exists: operators need a quick live picture before they decide what to do next.	a concise snapshot lowers the cost of checking reality instead of acting from assumption.	more work begins from the current state of the hierarchy rather than memory.
review	Why reviews exist: legibility decays unless the system is revisited at the right rhythm.	daily, weekly, and monthly passes catch different kinds of drift and different levels of structure.	the model remains teachable instead of slowly turning noisy or stale.
daily	Why the daily brief exists: each session needs a fast re-entry path into system health and active queues.	combining doctor output with queue and archive artifacts reduces the cost of orienting at the start of work.	operators re-enter the hierarchy with context instead of rebuilding it from memory.
weekly	Why the weekly review exists: some drift only becomes visible across several sessions of work.	a broader maintenance checkpoint catches accumulation that a daily brief would miss.	the system stays healthier over medium time horizons, not just day to day.
monthly	Why the monthly review exists: structural problems need a slower, wider lens than daily or weekly flow.	a monthly system sweep makes room for pattern-level corrections and architecture hygiene.	the hierarchy remains governable as it grows instead of only locally maintained.
explanation	Why explanation modes exist: users should not need to memorize the whole command surface.	map shows the shape, browse lists the real destinations, where suggests the next place, what defines the family, and why explains the reason behind it.	the front door can teach as well as route.
docs	Why docs live here: documentation is strongest when it sits inside the system it explains.	the guide stack, README, and help paths make the hierarchy self-teaching.	operation and explanation stay close together instead of drifting apart.
create	Why creation is templated: the first step of a system sets the quality of everything after it.	new items should begin with honest metadata and a known workflow entry point.	intake stays consistent and later automation can trust the shape of items.
EOF
)

usage() {
  cat <<'EOF'
Usage:
  ./start.sh [mode] [args...]

Modes:
EOF
  print_usage_mode_lines
  cat <<'EOF'

Examples:
EOF
  print_usage_example_lines
  cat <<'EOF'

What it does:
  Gives `/Applications/Hierarchy` one obvious command entry point.
EOF
}

mode=${1:-daily}

case "$mode" in
  list)
    shift || true
    require_exact_args $# 0 'list mode does not accept extra arguments'
    print_page_header 'Hierarchy start list' '===================='
    print_section_heading 'Command families' '----------------'
    print_dash_list "${LIST_COMMAND_FAMILIES[@]}"
    print_section_block 'Saved artifact directories' '------------------------'
    print_artifact_directories
    ;;
  map)
    shift || true
    require_exact_args $# 0 'map mode does not accept extra arguments'
    print_page_header 'Hierarchy map' '============='
    print_section_heading 'System model' '------------'
    print_plain_list "${MAP_SYSTEM_MODEL_LINES[@]}"
    print_section_block 'Front-door map' '--------------'
    print_plain_list "${MAP_FRONT_DOOR_LINES[@]}"
    print_section_block 'Quick picks' '-----------'
    print_dash_list "${MAP_QUICK_PICK_LINES[@]}"
    ;;
  browse)
    shift || true
    require_arg_range $# 0 1 'browse mode accepts zero or one section'
    browse_section=$(printf '%s' "${1:-all}" | tr '[:upper:]' '[:lower:]')
    if [[ "$browse_section" == 'start' ]]; then
      browse_section='bootstrap'
    elif [[ "$browse_section" != 'all' ]] && canonical_browse_section=$(canonicalize_browse_topic "$browse_section" 2>/dev/null); then
      browse_section=$canonical_browse_section
    fi
    if render_browse_topic "$browse_section"; then
      :
    else
      fail_usage "unknown browse section: $browse_section"
    fi
    ;;
  where)
    shift || true
    require_exact_args $# 1 'where mode requires exactly one topic'
    topic=$(normalize_topic "$1")
    print_surface_header 'Hierarchy where' '==============='
    if [[ "$topic" == 'browse' ]]; then
      print_browse_where_result 'exposes real destinations and artifacts instead of only describing the system.'
    elif canonical_topic=$(canonicalize_where_topic "$topic" 2>/dev/null); then
      if render_root_dispatch_where_topic "$canonical_topic"; then
        :
      elif render_canonical_script_family_where_topic "$canonical_topic"; then
        :
      elif where_record=$(lookup_table_row "$canonical_topic" "$WHERE_TABLE"); then
        IFS=$'\t' read -r best_command guide_topic why_text <<<"$where_record"
        print_where_result "$best_command" "$guide_topic" "$why_text"
      else
        print_where_result './start.sh list' 'manual' 'this topic is not mapped yet, so list and the manual are the safest next stop.'
      fi
    elif browse_topic=$(canonicalize_browse_topic "$topic" 2>/dev/null); then
      print_browse_where_result 'exposes real destinations and artifacts instead of only describing the system.'
    else
      print_where_result './start.sh list' 'manual' 'this topic is not mapped yet, so list and the manual are the safest next stop.'
    fi
    ;;
  what)
    shift || true
    require_exact_args $# 1 'what mode requires exactly one topic'
    topic=$(normalize_topic "$1")
    if browse_topic=$(canonicalize_browse_topic "$topic" 2>/dev/null); then
      topic=$browse_topic
    fi
    print_surface_header 'Hierarchy what' '=============='
    if canonical_topic=$(canonicalize_what_topic "$topic" 2>/dev/null); then
      if render_root_dispatch_what_topic "$canonical_topic"; then
        :
      elif render_canonical_script_family_what_topic "$canonical_topic"; then
        :
      elif what_record=$(lookup_table_row "$canonical_topic" "$WHAT_TABLE"); then
        IFS=$'\t' read -r family what_text best_entry <<<"$what_record"
        print_what_result "$family" "$what_text" "$best_entry"
      else
        print_what_result 'unknown' 'this topic is not mapped yet.' './start.sh where <topic>'
      fi
    elif render_browse_what_topic "$topic"; then
      :
    else
      print_what_result 'unknown' 'this topic is not mapped yet.' './start.sh where <topic>'
    fi
    ;;
  why)
    shift || true
    require_exact_args $# 1 'why mode requires exactly one topic'
    topic=$(normalize_topic "$1")
    if browse_topic=$(canonicalize_browse_topic "$topic" 2>/dev/null); then
      topic=$browse_topic
    fi
    print_surface_header 'Hierarchy why' '============='
    if canonical_topic=$(canonicalize_why_topic "$topic" 2>/dev/null) && why_record=$(lookup_table_row "$canonical_topic" "$WHY_TABLE"); then
      IFS=$'\t' read -r why_title rationale consequence <<<"$why_record"
      print_why_result "$why_title" "$rationale" "$consequence"
    else
      print_why_result 'Why this is not mapped yet: the rationale layer is still intentionally compact.' 'only the most important operating ideas are explained directly right now.' 'use ./start.sh what <topic> or ./start.sh where <topic> for the nearest practical entry.'
    fi
    ;;
  search|find)
    shift || true
    require_exact_args $# 1 'search/find mode requires exactly one query'
    python3 - "$CANONICAL_DIR" "$1" <<'PY'
from pathlib import Path
import sys

root = Path(sys.argv[1])
query = sys.argv[2].lower()

guide_files = []
for path in sorted((root / "HOW-TO").glob("*.txt")):
    guide_files.append(path)
for extra in ["README.txt", "WORKFLOW-MODEL.txt", "EXAMPLE-TRACE.txt"]:
    path = root / extra
    if path.exists():
        guide_files.append(path)

item_files = [
    path for path in sorted(root.rglob("*.item.txt"))
    if path.name != "TEMPLATE-ITEM.txt"
]

report_files = []
for folder_name in [
    "ARCHIVE-REPORTS",
    "QUEUE-REPORTS",
    "TRACE-REPORTS",
    "DAILY-BRIEFS",
    "WEEKLY-REVIEWS",
    "MONTHLY-REVIEWS",
]:
    folder = root / folder_name
    if folder.exists():
        report_files.extend(sorted(p for p in folder.rglob("*") if p.is_file()))

def matches(paths):
    return [
        str(path.relative_to(root))
        for path in paths
        if query in str(path.relative_to(root)).lower()
    ]

guide_matches = matches(guide_files)
item_matches = matches(item_files)
report_matches = matches(report_files)

print("Hierarchy search")
print("================")
print()
print(f"Query: {sys.argv[2]}")
print()

def print_section(title, values):
    print(title)
    print("-" * len(title))
    print(f"Matches: {len(values)}")
    if values:
        for value in values[:20]:
            print(f"- {value}")
        if len(values) > 20:
            print(f"- ... {len(values) - 20} more")
    else:
        print("- none")
    print()

print_section("Guide files", guide_matches)
print_section("Item files", item_matches)
print_section("Report files", report_matches)
PY
    ;;
  run)
    shift || true
    require_min_args $# 1 "run mode requires $(root_dispatch_subcommands_phrase run or)"
    run_type=$1
    shift || true
    if ! dispatch_root_target run "$run_type" "$@"; then
      fail_usage "unknown run type: $run_type"
    fi
    ;;
  show)
    shift || true
    require_min_args $# 1 "show mode requires $(root_dispatch_subcommands_phrase show or)"
    show_type=$1
    shift || true
    if ! dispatch_root_target show "$show_type" "$@"; then
      fail_usage "unknown show type: $show_type"
    fi
    ;;
  go)
    shift || true
    handle_optional_topic_mode go route-open go-soft-route "$@"
    ;;
  status)
    shift || true
    dispatch_canonical_script top status "$@"
    ;;
  trace)
    shift || true
    require_exact_args $# 1 'trace mode requires exactly one filename or item id'
    dispatch_canonical_script top trace "$1"
    ;;
  report)
    shift || true
    require_min_args $# 1 "report mode requires $(canonical_script_subcommands_phrase report or)"
    report_type=$1
    shift || true
    dispatch_validated_subcommand report "$report_type" 'unknown report type' "$@"
    ;;
  fix)
    shift || true
    require_min_args $# 1 "fix mode requires $(canonical_script_subcommands_phrase fix or)"
    fix_type=$1
    shift || true
    dispatch_validated_subcommand fix "$fix_type" 'unknown fix type' "$@"
    ;;
  move)
    shift || true
    require_min_args $# 1 "move mode requires $(canonical_script_subcommands_phrase move or)"
    move_type=$1
    shift || true
    dispatch_validated_subcommand move "$move_type" 'unknown move type' "$@"
    ;;
  review)
    shift || true
    require_min_args $# 1 "review mode requires $(root_dispatch_subcommands_phrase review or)"
    review_type=$1
    shift || true
    if ! dispatch_root_target review "$review_type" "$@"; then
      fail_usage "unknown review type: $review_type"
    fi
    ;;
  daily)
    shift || true
    dispatch_canonical_script top daily "$@"
    ;;
  weekly)
    shift || true
    dispatch_canonical_script top weekly "$@"
    ;;
  monthly)
    shift || true
    dispatch_canonical_script top monthly "$@"
    ;;
  docs|guide)
    shift || true
    require_exact_args $# 1 'docs/guide mode requires exactly one topic'
    dispatch_canonical_script top "$mode" "$1"
    ;;
  open)
    shift || true
    handle_optional_topic_mode open print-readme open-soft-route "$@"
    ;;
  create|new)
    shift || true
    require_arg_range $# 2 3 'create/new mode requires <workflow-dir> <name> [title]'
    dispatch_canonical_script top "$mode" "$@"
    ;;
  doctor)
    shift || true
    dispatch_canonical_script top doctor "$@"
    ;;
  readme)
    shift || true
    print_readme
    exit 0
    ;;
  help|-h|--help)
    shift || true
    handle_optional_topic_mode help print-usage help-topic-route "$@"
    ;;
  *)
    echo "Error: unknown mode: $mode" >&2
    echo >&2
    usage >&2
    exit 1
    ;;
esac
