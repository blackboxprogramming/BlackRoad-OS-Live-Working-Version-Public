#!/bin/bash
# RoadPad E2E Test Suite
# Tests all features from setup to execution

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
RED='\033[38;5;196m'
RESET='\033[0m'

echo -e "${PINK}🌌 RoadPad E2E Test Suite${RESET}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test counter
PASSED=0
FAILED=0

test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${RESET}: $2"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${RESET}: $2"
        ((FAILED++))
    fi
}

# Test 1: Module compilation
echo -e "${BLUE}Test 1: Module Compilation${RESET}"
cd ~/roadpad
python3 -m py_compile *.py 2>/dev/null
test_result $? "All Python modules compile"
echo ""

# Test 2: Config manager
echo -e "${BLUE}Test 2: Config Manager${RESET}"
python3 << 'EOF'
import sys
sys.path.insert(0, '/Users/alexa/roadpad')
from config_manager import ConfigManager

# Test loading
config = ConfigManager()
assert config.get('accept_mode') == 0, "Default accept_mode should be 0"
assert config.get('tab_width') == 4, "Default tab_width should be 4"
assert config.get('copilot_enabled') == True, "Copilot should be enabled"
print("✓ Config loads correctly")

# Test setting
config.set('accept_mode', 2)
assert config.get('accept_mode') == 2, "Should update accept_mode"
print("✓ Config set works")

# Test save/load
config.save_config()
config2 = ConfigManager()
assert config2.get('accept_mode') == 2, "Should persist accept_mode"
print("✓ Config persistence works")

# Reset for other tests
config2.reset_to_defaults()
config2.save_config()
print("✓ Config reset works")
EOF
test_result $? "Config manager functionality"
echo ""

# Test 3: Persistence manager
echo -e "${BLUE}Test 3: Persistence Manager${RESET}"
python3 << 'EOF'
import sys
sys.path.insert(0, '/Users/alexa/roadpad')
from persistence import PersistenceManager

pm = PersistenceManager()

# Test history
pm.save_history(["test1", "test2", "test3"])
history = pm.load_history()
assert len(history) >= 3, "Should load history"
print("✓ History persistence works")

# Test recent files
pm.add_recent_file("/tmp/test.txt")
pm.add_recent_file("/tmp/test2.txt")
recent = pm.load_recent_files()
assert len(recent) >= 2, "Should track recent files"
print("✓ Recent files tracking works")

# Cleanup test data
pm.save_history([])
pm.save_recent_files([])
EOF
test_result $? "Persistence manager functionality"
echo ""

# Test 4: Edit manager
echo -e "${BLUE}Test 4: Edit Manager${RESET}"
python3 << 'EOF'
import sys
sys.path.insert(0, '/Users/alexa/roadpad')
from edit_manager import EditManager, Edit

em = EditManager()

# Test adding edits
edit1 = Edit(5, 10, "old text", "new text", "test.txt")
em.add_edit(edit1)
assert len(em.pending_edits) == 1, "Should add edit"
print("✓ Edit addition works")

# Test accepting
em.accept_edit(0)
assert len(em.pending_edits) == 0, "Should accept edit"
print("✓ Edit acceptance works")

# Test rejecting
edit2 = Edit(5, 10, "old", "new", "test.txt")
em.add_edit(edit2)
em.reject_edit(0)
assert len(em.pending_edits) == 0, "Should reject edit"
print("✓ Edit rejection works")
EOF
test_result $? "Edit manager functionality"
echo ""

# Test 5: Buffer operations
echo -e "${BLUE}Test 5: Buffer Operations${RESET}"
python3 << 'EOF'
import sys
sys.path.insert(0, '/Users/alexa/roadpad')
from buffer import Buffer

buf = Buffer()

# Test text operations
buf.insert_char('H')
buf.insert_char('i')
assert buf.get_line(0) == "Hi", "Should insert characters"
print("✓ Character insertion works")

# Test line operations
buf.insert_line()
buf.insert_char('!')
assert len(buf.lines) == 2, "Should create new line"
print("✓ Line operations work")
EOF
test_result $? "Buffer operations"
echo ""

# Test 6: Copilot bridge (if gh available)
echo -e "${BLUE}Test 6: Copilot Bridge${RESET}"
if command -v gh &> /dev/null; then
    python3 << 'EOF'
import sys
sys.path.insert(0, '/Users/alexa/roadpad')
from bridge import CopilotBridge

bridge = CopilotBridge()
print("✓ Bridge initializes")

# Note: Not testing actual Copilot call as it requires interactive auth
# Just verify the module works
assert hasattr(bridge, 'send_prompt'), "Should have send_prompt method"
assert hasattr(bridge, 'send_task'), "Should have send_task method"
print("✓ Bridge API available")
EOF
    test_result $? "Copilot bridge initialization"
else
    echo "⚠️  SKIP: gh CLI not available"
fi
echo ""

# Test 7: CLI argument parsing
echo -e "${BLUE}Test 7: CLI Argument Parsing${RESET}"
python3 << 'EOF'
import sys
sys.path.insert(0, '/Users/alexa/roadpad')

# Simulate CLI args
sys.argv = ['roadpad', '--no-copilot', '--accept-mode=always', '--tab-width=2']

# Import and test (this will run parse_args)
import roadpad
from config_manager import ConfigManager

config = ConfigManager()
config.apply_cli_args({
    'no_copilot': True,
    'accept_mode': 'always',
    'tab_width': 2
})

assert config.get('copilot_enabled') == False, "Should disable copilot"
assert config.get('accept_mode') == 2, "Should set always mode"
assert config.get('tab_width') == 2, "Should set tab width"
print("✓ CLI argument parsing works")

# Reset
config.reset_to_defaults()
config.save_config()
EOF
test_result $? "CLI argument parsing"
echo ""

# Test 8: Environment variable overrides
echo -e "${BLUE}Test 8: Environment Variables${RESET}"
ROADPAD_ACCEPT_MODE=always ROADPAD_TAB_WIDTH=8 python3 << 'EOF'
import sys
sys.path.insert(0, '/Users/alexa/roadpad')
from config_manager import ConfigManager

config = ConfigManager()
config.apply_env_overrides()

assert config.get('accept_mode') == 2, "Should read ROADPAD_ACCEPT_MODE"
assert config.get('tab_width') == 8, "Should read ROADPAD_TAB_WIDTH"
print("✓ Environment variable overrides work")
EOF
test_result $? "Environment variable handling"
echo ""

# Test 9: State directory structure
echo -e "${BLUE}Test 9: State Directory${RESET}"
if [ -d ~/.roadpad ]; then
    echo "✓ State directory exists"
    
    if [ -f ~/.roadpad/config.json ]; then
        echo "✓ Config file exists"
    else
        echo "⚠️  Config file missing"
    fi
    
    test_result 0 "State directory structure"
else
    test_result 1 "State directory structure"
fi
echo ""

# Test 10: Setup script
echo -e "${BLUE}Test 10: Setup Script${RESET}"
if [ -f ~/roadpad/roadpad-setup.sh ]; then
    echo "✓ Setup script exists"
    
    if [ -x ~/roadpad/roadpad-setup.sh ]; then
        echo "✓ Setup script is executable"
        test_result 0 "Setup script"
    else
        test_result 1 "Setup script not executable"
    fi
else
    test_result 1 "Setup script missing"
fi
echo ""

# Test 11: Integration test (dry run)
echo -e "${BLUE}Test 11: Full Integration (Dry Run)${RESET}"
python3 << 'EOF'
import sys
sys.path.insert(0, '/Users/alexa/roadpad')

# Import all modules to verify integration
from roadpad import RoadPad
from buffer import Buffer
from renderer import Renderer
from bridge import CopilotBridge
from edit_manager import EditManager
from persistence import PersistenceManager
from config_manager import ConfigManager

print("✓ All modules import successfully")

# Verify class instantiation (without curses)
config = ConfigManager()
bridge = CopilotBridge()
edit_manager = EditManager()
persistence = PersistenceManager()
buffer = Buffer()

print("✓ All classes instantiate")
print("✓ Integration successful")
EOF
test_result $? "Full integration test"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${PINK}Test Results${RESET}"
echo ""
echo -e "${GREEN}Passed: $PASSED${RESET}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED${RESET}"
else
    echo -e "${GREEN}Failed: 0${RESET}"
fi
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! RoadPad is ready to ship!${RESET}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Review output above.${RESET}"
    exit 1
fi
