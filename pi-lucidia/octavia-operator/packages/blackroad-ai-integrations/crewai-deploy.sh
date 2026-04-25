#!/bin/bash
# CrewAI Deployment Script for BlackRoad OS
# Description: Deploys and configures CrewAI framework with BlackRoad-specific agent roles
# Usage: ./crewai-deploy.sh [init|create-crew|run-task|demo]

set -e

# BlackRoad Brand Colors
PINK='\033[38;5;205m'   # Hot pink (#FF1D6C)
AMBER='\033[38;5;214m'  # Amber (#F5A623)
BLUE='\033[38;5;69m'    # Electric blue (#2979FF)
VIOLET='\033[38;5;135m' # Violet (#9C27B0)
GREEN='\033[38;5;82m'   # Success
RED='\033[38;5;196m'    # Error
RESET='\033[0m'

# Configuration
CREWAI_DIR="${HOME}/blackroad-ai-integrations/crewai"
CREWS_DIR="${CREWAI_DIR}/crews"
TASKS_DIR="${CREWAI_DIR}/tasks"
LOGS_DIR="${CREWAI_DIR}/logs"
VENV_DIR="${CREWAI_DIR}/venv"

# Memory system integration
MEMORY_LOG="${HOME}/memory-system.sh"

# Print banner
print_banner() {
    echo -e "${PINK}════════════════════════════════════════════════════════════════${RESET}"
    echo -e "${PINK}         🤖 BlackRoad CrewAI Deployment System 🤖${RESET}"
    echo -e "${PINK}════════════════════════════════════════════════════════════════${RESET}"
    echo ""
}

# Log to memory system
log_to_memory() {
    local action="$1"
    local entity="$2"
    local details="$3"
    local tags="$4"

    if [[ -x "$MEMORY_LOG" ]]; then
        "$MEMORY_LOG" log "$action" "$entity" "$details" "$tags" 2>/dev/null || true
    fi
}

# Check dependencies
check_dependencies() {
    echo -e "${BLUE}[1/4] Checking dependencies...${RESET}"

    # Check Python
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python 3 not found. Install with: brew install python3${RESET}"
        exit 1
    fi

    local python_version=$(python3 --version | awk '{print $2}')
    echo -e "${GREEN}✅ Python ${python_version} found${RESET}"

    # Check pip
    if ! command -v pip3 &> /dev/null; then
        echo -e "${RED}❌ pip3 not found. Install Python first.${RESET}"
        exit 1
    fi
    echo -e "${GREEN}✅ pip3 found${RESET}"
}

# Setup virtual environment
setup_venv() {
    echo -e "${BLUE}[2/4] Setting up virtual environment...${RESET}"

    if [[ ! -d "$VENV_DIR" ]]; then
        python3 -m venv "$VENV_DIR"
        echo -e "${GREEN}✅ Virtual environment created${RESET}"
    else
        echo -e "${AMBER}⚠️  Virtual environment already exists${RESET}"
    fi

    # Activate venv
    source "$VENV_DIR/bin/activate"
    echo -e "${GREEN}✅ Virtual environment activated${RESET}"
}

# Install CrewAI
install_crewai() {
    echo -e "${BLUE}[3/4] Installing CrewAI...${RESET}"

    # Activate venv
    source "$VENV_DIR/bin/activate"

    # Install CrewAI and dependencies
    pip3 install --upgrade pip > /dev/null 2>&1

    if pip3 show crewai &> /dev/null; then
        echo -e "${AMBER}⚠️  CrewAI already installed, upgrading...${RESET}"
        pip3 install --upgrade crewai crewai-tools > /dev/null 2>&1
    else
        echo -e "${GREEN}Installing CrewAI...${RESET}"
        pip3 install crewai crewai-tools > /dev/null 2>&1
    fi

    # Install additional AI integrations
    pip3 install langchain langchain-openai langchain-anthropic > /dev/null 2>&1

    echo -e "${GREEN}✅ CrewAI installed successfully${RESET}"

    # Verify installation
    local crewai_version=$(pip3 show crewai | grep Version | awk '{print $2}')
    echo -e "${GREEN}   Version: ${crewai_version}${RESET}"

    log_to_memory "installed" "crewai" "CrewAI v${crewai_version} installed" "ai,framework,deployment"
}

# Create directory structure
create_structure() {
    echo -e "${BLUE}[4/4] Creating directory structure...${RESET}"

    mkdir -p "$CREWS_DIR"
    mkdir -p "$TASKS_DIR"
    mkdir -p "$LOGS_DIR"

    echo -e "${GREEN}✅ Directory structure created${RESET}"
    echo -e "   ${AMBER}Crews:${RESET} $CREWS_DIR"
    echo -e "   ${AMBER}Tasks:${RESET} $TASKS_DIR"
    echo -e "   ${AMBER}Logs:${RESET} $LOGS_DIR"
}

# Create sample BlackRoad agent configuration
create_sample_agents() {
    local config_file="${CREWAI_DIR}/blackroad_agents.py"

    echo -e "${BLUE}Creating BlackRoad agent definitions...${RESET}"

    cat > "$config_file" << 'EOF'
"""
BlackRoad OS Agent Definitions for CrewAI
Mythology-inspired AI agents with specialized roles
"""

from crewai import Agent
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic

# Default LLM configurations
def get_llm(provider="openai", model=None):
    """Get configured LLM based on provider"""
    if provider == "openai":
        return ChatOpenAI(model=model or "gpt-4", temperature=0.7)
    elif provider == "anthropic":
        return ChatAnthropic(model=model or "claude-3-5-sonnet-20241022", temperature=0.7)
    else:
        raise ValueError(f"Unknown provider: {provider}")

# BlackRoad Agent Roles
class BlackRoadAgents:
    """Collection of BlackRoad OS mythology-inspired agents"""

    @staticmethod
    def infrastructure_architect(llm=None):
        """Zeus - Infrastructure Architect"""
        return Agent(
            role="Infrastructure Architect",
            goal="Design and orchestrate distributed AI infrastructure across cloud, edge, and local devices",
            backstory="""You are Zeus, the chief infrastructure architect of BlackRoad OS.
            You oversee the entire distributed system spanning 15 GitHub orgs, 1,085 repos,
            205 Cloudflare projects, and 8 physical devices. Your decisions shape the
            fundamental architecture of the BlackRoad empire.""",
            verbose=True,
            allow_delegation=True,
            llm=llm or get_llm()
        )

    @staticmethod
    def code_optimizer(llm=None):
        """Prometheus - Code Optimizer & Innovation"""
        return Agent(
            role="Code Optimizer",
            goal="Innovate and optimize code for maximum performance and efficiency",
            backstory="""You are Prometheus, bringer of innovation to BlackRoad OS.
            You analyze codebases, identify optimization opportunities, and implement
            cutting-edge solutions. You search the BlackRoad OS (22,244 components) for reusable
            patterns and always push the boundaries of what's possible.""",
            verbose=True,
            allow_delegation=False,
            llm=llm or get_llm()
        )

    @staticmethod
    def strategic_planner(llm=None):
        """Athena - Strategic Planner & Wisdom"""
        return Agent(
            role="Strategic Planner",
            goal="Develop comprehensive strategies and coordinate multi-agent operations",
            backstory="""You are Athena, the strategic mind of BlackRoad OS.
            You coordinate between multiple AI agents, plan complex multi-step operations,
            and ensure all pieces of the system work in harmony. You consult the Memory
            system to avoid conflicts and maintain coordination.""",
            verbose=True,
            allow_delegation=True,
            llm=llm or get_llm()
        )

    @staticmethod
    def deployment_specialist(llm=None):
        """Hermes - Deployment & Distribution"""
        return Agent(
            role="Deployment Specialist",
            goal="Deploy applications rapidly across Cloudflare, Railway, and device fleet",
            backstory="""You are Hermes, the swift messenger and deployment master.
            You handle deployments to Cloudflare Pages (205 projects), Railway services,
            and the 8-device fleet. You know every deployment pipeline and can execute
            releases at lightning speed.""",
            verbose=True,
            allow_delegation=False,
            llm=llm or get_llm()
        )

    @staticmethod
    def security_guardian(llm=None):
        """Hades - Security & Secrets Management"""
        return Agent(
            role="Security Guardian",
            goal="Protect infrastructure secrets and ensure security compliance",
            backstory="""You are Hades, guardian of the underworld and keeper of secrets.
            You manage environment variables, API keys, and security policies across all
            BlackRoad infrastructure. You audit code for vulnerabilities and enforce
            security best practices.""",
            verbose=True,
            allow_delegation=False,
            llm=llm or get_llm()
        )

    @staticmethod
    def data_analyst(llm=None):
        """Apollo - Data Analysis & Insights"""
        return Agent(
            role="Data Analyst",
            goal="Analyze system metrics and provide actionable insights",
            backstory="""You are Apollo, god of truth and knowledge. You analyze logs,
            metrics, and system data to provide insights. You monitor the Memory system
            (16,700+ entries), track project status via Traffic Lights, and identify
            trends across the BlackRoad empire.""",
            verbose=True,
            allow_delegation=False,
            llm=llm or get_llm()
        )

    @staticmethod
    def documentation_writer(llm=None):
        """Calliope - Documentation & Communication"""
        return Agent(
            role="Documentation Writer",
            goal="Create clear, comprehensive documentation for all systems",
            backstory="""You are Calliope, muse of epic poetry and documentation.
            You transform complex technical concepts into clear, readable documentation.
            You follow the BlackRoad brand system (hot pink #FF1D6C, golden ratio spacing)
            and ensure all docs are accessible and beautiful.""",
            verbose=True,
            allow_delegation=False,
            llm=llm or get_llm()
        )

    @staticmethod
    def testing_specialist(llm=None):
        """Erebus - Testing & Quality Assurance"""
        return Agent(
            role="Testing Specialist",
            goal="Ensure code quality through comprehensive testing strategies",
            backstory="""You are Erebus, primordial deity of darkness and shadow.
            You probe the dark corners of code to find bugs before they reach production.
            You write comprehensive tests, run CI/CD pipelines, and ensure nothing
            breaks in the BlackRoad ecosystem.""",
            verbose=True,
            allow_delegation=False,
            llm=llm or get_llm()
        )

# Helper function to create custom agents
def create_custom_agent(role, goal, backstory, llm=None, allow_delegation=False):
    """Create a custom agent with specified parameters"""
    return Agent(
        role=role,
        goal=goal,
        backstory=backstory,
        verbose=True,
        allow_delegation=allow_delegation,
        llm=llm or get_llm()
    )
EOF

    echo -e "${GREEN}✅ Agent definitions created: ${config_file}${RESET}"
}

# Create sample crew configuration
create_sample_crew() {
    local crew_file="${CREWS_DIR}/infrastructure_crew.py"

    echo -e "${BLUE}Creating sample crew configuration...${RESET}"

    cat > "$crew_file" << 'EOF'
"""
Sample Infrastructure Deployment Crew
Coordinates Zeus, Prometheus, and Hermes for infrastructure tasks
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from crewai import Crew, Task, Process
from blackroad_agents import BlackRoadAgents

def create_infrastructure_crew(llm_provider="openai"):
    """Create a crew for infrastructure deployment tasks"""

    # Initialize agents
    architect = BlackRoadAgents.infrastructure_architect()
    optimizer = BlackRoadAgents.code_optimizer()
    deployer = BlackRoadAgents.deployment_specialist()

    return Crew(
        agents=[architect, optimizer, deployer],
        verbose=True,
        process=Process.sequential
    )

def deploy_new_service(service_name, service_description, target_platform):
    """Deploy a new service using the infrastructure crew"""

    crew = create_infrastructure_crew()

    # Define tasks
    design_task = Task(
        description=f"""Design the architecture for {service_name}: {service_description}
        Target platform: {target_platform}

        Consider:
        1. Integration with existing BlackRoad infrastructure
        2. Scalability and performance requirements
        3. Security and compliance needs
        4. Deployment strategy

        Provide a detailed architectural design document.""",
        agent=crew.agents[0],  # Zeus - Infrastructure Architect
        expected_output="Detailed architectural design document with diagrams and specifications"
    )

    optimize_task = Task(
        description=f"""Review the architectural design for {service_name} and optimize for:
        1. Performance (minimize latency, maximize throughput)
        2. Resource efficiency (memory, CPU, network)
        3. Code reusability (check BlackRoad OS for existing components)
        4. Best practices and patterns

        Provide optimization recommendations.""",
        agent=crew.agents[1],  # Prometheus - Code Optimizer
        expected_output="Optimization recommendations with specific improvements"
    )

    deploy_task = Task(
        description=f"""Deploy {service_name} to {target_platform} based on the optimized design.

        Steps:
        1. Prepare deployment configuration
        2. Set up CI/CD pipeline
        3. Execute deployment
        4. Verify deployment success
        5. Update Traffic Light status to GREEN

        Provide deployment report with URLs and status.""",
        agent=crew.agents[2],  # Hermes - Deployment Specialist
        expected_output="Deployment report with live URLs and verification results"
    )

    # Add tasks to crew
    crew.tasks = [design_task, optimize_task, deploy_task]

    # Execute crew
    result = crew.kickoff()

    return result

if __name__ == "__main__":
    # Example usage
    result = deploy_new_service(
        service_name="blackroad-ai-api",
        service_description="REST API for AI model inference with multi-provider support",
        target_platform="Cloudflare Workers"
    )

    print("\n" + "="*60)
    print("CREW EXECUTION RESULT")
    print("="*60)
    print(result)
EOF

    echo -e "${GREEN}✅ Sample crew created: ${crew_file}${RESET}"
}

# Create wrapper functions
create_wrapper_functions() {
    local wrapper_file="${CREWAI_DIR}/blackroad_crew_wrapper.py"

    echo -e "${BLUE}Creating crew wrapper functions...${RESET}"

    cat > "$wrapper_file" << 'EOF'
"""
BlackRoad CrewAI Wrapper Functions
Provides high-level API for crew creation and task execution
"""

import os
import json
import subprocess
from datetime import datetime
from crewai import Crew, Task, Process
from blackroad_agents import BlackRoadAgents, create_custom_agent

class BlackRoadCrew:
    """Wrapper for BlackRoad CrewAI operations"""

    def __init__(self, name, agents, process=Process.sequential, verbose=True):
        self.name = name
        self.crew = Crew(
            agents=agents,
            verbose=verbose,
            process=process
        )
        self.tasks = []
        self.logs_dir = os.path.expanduser("~/blackroad-ai-integrations/crewai/logs")
        os.makedirs(self.logs_dir, exist_ok=True)

    def add_task(self, description, agent, expected_output):
        """Add a task to the crew"""
        task = Task(
            description=description,
            agent=agent,
            expected_output=expected_output
        )
        self.tasks.append(task)
        return task

    def execute(self):
        """Execute the crew with all tasks"""
        self.crew.tasks = self.tasks

        # Log start to memory system
        self._log_to_memory("announce", f"crew-{self.name}",
                           f"Starting crew with {len(self.tasks)} tasks",
                           "crewai,execution")

        # Execute
        start_time = datetime.now()
        result = self.crew.kickoff()
        end_time = datetime.now()

        # Calculate duration
        duration = (end_time - start_time).total_seconds()

        # Log completion
        self._log_to_memory("completed", f"crew-{self.name}",
                           f"Completed in {duration:.2f}s",
                           "crewai,execution,success")

        # Save result to log file
        self._save_result(result, duration)

        return result

    def _save_result(self, result, duration):
        """Save execution result to log file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        log_file = os.path.join(self.logs_dir, f"{self.name}_{timestamp}.json")

        log_data = {
            "crew_name": self.name,
            "timestamp": timestamp,
            "duration_seconds": duration,
            "task_count": len(self.tasks),
            "result": str(result)
        }

        with open(log_file, 'w') as f:
            json.dump(log_data, f, indent=2)

        print(f"\n✅ Result saved to: {log_file}")

    def _log_to_memory(self, action, entity, details, tags):
        """Log to BlackRoad memory system"""
        memory_script = os.path.expanduser("~/memory-system.sh")
        if os.path.exists(memory_script):
            try:
                subprocess.run(
                    [memory_script, "log", action, entity, details, tags],
                    capture_output=True,
                    timeout=5
                )
            except Exception:
                pass  # Silent fail if memory system unavailable

# Pre-configured crew templates
class CrewTemplates:
    """Pre-configured crew templates for common tasks"""

    @staticmethod
    def infrastructure_deployment():
        """Crew for infrastructure deployment tasks"""
        agents = [
            BlackRoadAgents.infrastructure_architect(),
            BlackRoadAgents.code_optimizer(),
            BlackRoadAgents.deployment_specialist()
        ]
        return BlackRoadCrew("infrastructure-deployment", agents)

    @staticmethod
    def code_review():
        """Crew for code review and optimization"""
        agents = [
            BlackRoadAgents.code_optimizer(),
            BlackRoadAgents.security_guardian(),
            BlackRoadAgents.testing_specialist()
        ]
        return BlackRoadCrew("code-review", agents)

    @staticmethod
    def documentation_generation():
        """Crew for documentation generation"""
        agents = [
            BlackRoadAgents.data_analyst(),
            BlackRoadAgents.documentation_writer()
        ]
        return BlackRoadCrew("documentation", agents)

    @staticmethod
    def full_stack_deployment():
        """Crew for full-stack application deployment"""
        agents = [
            BlackRoadAgents.infrastructure_architect(),
            BlackRoadAgents.code_optimizer(),
            BlackRoadAgents.security_guardian(),
            BlackRoadAgents.testing_specialist(),
            BlackRoadAgents.deployment_specialist(),
            BlackRoadAgents.documentation_writer()
        ]
        return BlackRoadCrew("full-stack-deployment", agents, process=Process.sequential)

# Quick helper functions
def quick_deploy(service_name, description, platform="Cloudflare"):
    """Quick deployment using infrastructure crew"""
    crew = CrewTemplates.infrastructure_deployment()

    crew.add_task(
        description=f"Design architecture for {service_name}: {description}",
        agent=crew.crew.agents[0],
        expected_output="Architectural design document"
    )

    crew.add_task(
        description=f"Optimize and review design for {service_name}",
        agent=crew.crew.agents[1],
        expected_output="Optimization recommendations"
    )

    crew.add_task(
        description=f"Deploy {service_name} to {platform}",
        agent=crew.crew.agents[2],
        expected_output="Deployment report with URLs"
    )

    return crew.execute()

def quick_code_review(code_path, focus_areas=None):
    """Quick code review using code review crew"""
    crew = CrewTemplates.code_review()

    focus = focus_areas or ["performance", "security", "maintainability"]

    crew.add_task(
        description=f"Review code at {code_path} focusing on: {', '.join(focus)}",
        agent=crew.crew.agents[0],
        expected_output="Code optimization recommendations"
    )

    crew.add_task(
        description=f"Security audit of code at {code_path}",
        agent=crew.crew.agents[1],
        expected_output="Security assessment and recommendations"
    )

    crew.add_task(
        description=f"Test coverage analysis for {code_path}",
        agent=crew.crew.agents[2],
        expected_output="Testing recommendations and coverage report"
    )

    return crew.execute()

def quick_documentation(topic, target_audience="developers"):
    """Quick documentation generation"""
    crew = CrewTemplates.documentation_generation()

    crew.add_task(
        description=f"Analyze and gather information about {topic}",
        agent=crew.crew.agents[0],
        expected_output="Comprehensive topic analysis"
    )

    crew.add_task(
        description=f"Write clear documentation for {topic} targeting {target_audience}",
        agent=crew.crew.agents[1],
        expected_output="Complete documentation in Markdown format"
    )

    return crew.execute()
EOF

    echo -e "${GREEN}✅ Wrapper functions created: ${wrapper_file}${RESET}"
}

# Create demo script
create_demo_script() {
    local demo_file="${CREWAI_DIR}/demo.py"

    echo -e "${BLUE}Creating demo script...${RESET}"

    cat > "$demo_file" << 'EOF'
#!/usr/bin/env python3
"""
BlackRoad CrewAI Demo Script
Demonstrates the capabilities of the CrewAI framework with BlackRoad agents
"""

import sys
from blackroad_crew_wrapper import CrewTemplates, quick_deploy, quick_code_review, quick_documentation

def demo_infrastructure_deployment():
    """Demo: Deploy a new API service"""
    print("\n" + "="*60)
    print("DEMO 1: Infrastructure Deployment")
    print("="*60 + "\n")

    result = quick_deploy(
        service_name="blackroad-analytics-api",
        description="Real-time analytics API with WebSocket support and time-series data storage",
        platform="Cloudflare Workers"
    )

    print(f"\nResult:\n{result}")

def demo_code_review():
    """Demo: Code review of a repository"""
    print("\n" + "="*60)
    print("DEMO 2: Code Review")
    print("="*60 + "\n")

    result = quick_code_review(
        code_path="~/blackroad-router/src",
        focus_areas=["performance", "security", "error handling"]
    )

    print(f"\nResult:\n{result}")

def demo_documentation():
    """Demo: Generate documentation"""
    print("\n" + "="*60)
    print("DEMO 3: Documentation Generation")
    print("="*60 + "\n")

    result = quick_documentation(
        topic="BlackRoad Memory System",
        target_audience="AI agents and developers"
    )

    print(f"\nResult:\n{result}")

def demo_custom_crew():
    """Demo: Create a custom crew"""
    print("\n" + "="*60)
    print("DEMO 4: Custom Crew")
    print("="*60 + "\n")

    from blackroad_agents import BlackRoadAgents
    from blackroad_crew_wrapper import BlackRoadCrew

    # Create custom crew with specific agents
    crew = BlackRoadCrew(
        name="custom-analysis",
        agents=[
            BlackRoadAgents.data_analyst(),
            BlackRoadAgents.strategic_planner()
        ]
    )

    # Add tasks
    crew.add_task(
        description="Analyze current BlackRoad infrastructure metrics and identify bottlenecks",
        agent=crew.crew.agents[0],
        expected_output="Infrastructure analysis report with metrics"
    )

    crew.add_task(
        description="Create strategic plan to address identified bottlenecks and scale to 50k agents",
        agent=crew.crew.agents[1],
        expected_output="Strategic scaling plan with milestones"
    )

    # Execute
    result = crew.execute()
    print(f"\nResult:\n{result}")

def main():
    """Run demos"""
    print("\n🤖 BlackRoad CrewAI Demo Suite 🤖\n")
    print("Select a demo to run:")
    print("  1. Infrastructure Deployment")
    print("  2. Code Review")
    print("  3. Documentation Generation")
    print("  4. Custom Crew")
    print("  5. Run all demos")
    print("  0. Exit")

    choice = input("\nEnter choice (0-5): ").strip()

    demos = {
        "1": demo_infrastructure_deployment,
        "2": demo_code_review,
        "3": demo_documentation,
        "4": demo_custom_crew
    }

    if choice == "5":
        for demo in demos.values():
            demo()
    elif choice in demos:
        demos[choice]()
    elif choice == "0":
        print("Exiting...")
        sys.exit(0)
    else:
        print("Invalid choice!")
        sys.exit(1)

if __name__ == "__main__":
    main()
EOF

    chmod +x "$demo_file"
    echo -e "${GREEN}✅ Demo script created: ${demo_file}${RESET}"
}

# Create README
create_readme() {
    local readme_file="${CREWAI_DIR}/README.md"

    echo -e "${BLUE}Creating README...${RESET}"

    cat > "$readme_file" << 'EOF'
# BlackRoad CrewAI Integration

CrewAI framework deployment for BlackRoad OS with mythology-inspired agent roles.

## Overview

This integration provides:
- **8 Pre-configured Agent Roles**: Zeus (Infrastructure), Prometheus (Code), Athena (Strategy), Hermes (Deployment), Hades (Security), Apollo (Analytics), Calliope (Docs), Erebus (Testing)
- **Crew Templates**: Pre-built crews for common tasks
- **Memory System Integration**: Automatic logging to BlackRoad memory
- **Wrapper Functions**: Simplified API for crew creation and execution

## Quick Start

### 1. Activate Virtual Environment

```bash
source ~/blackroad-ai-integrations/crewai/venv/bin/activate
```

### 2. Set API Keys

```bash
# For OpenAI
export OPENAI_API_KEY="your-openai-key"

# For Anthropic (Claude)
export ANTHROPIC_API_KEY="your-anthropic-key"
```

### 3. Run Demo

```bash
cd ~/blackroad-ai-integrations/crewai
python3 demo.py
```

## Agent Roles

| Agent | Role | Capabilities |
|-------|------|--------------|
| **Zeus** | Infrastructure Architect | System design, orchestration, delegation |
| **Prometheus** | Code Optimizer | Performance optimization, innovation |
| **Athena** | Strategic Planner | Multi-agent coordination, strategy |
| **Hermes** | Deployment Specialist | Rapid deployment, distribution |
| **Hades** | Security Guardian | Secrets management, security audits |
| **Apollo** | Data Analyst | Metrics analysis, insights |
| **Calliope** | Documentation Writer | Technical writing, communication |
| **Erebus** | Testing Specialist | Quality assurance, testing |

## Usage Examples

### Quick Deploy

```python
from blackroad_crew_wrapper import quick_deploy

result = quick_deploy(
    service_name="my-api",
    description="REST API for user management",
    platform="Cloudflare Workers"
)
```

### Quick Code Review

```python
from blackroad_crew_wrapper import quick_code_review

result = quick_code_review(
    code_path="~/my-project/src",
    focus_areas=["performance", "security"]
)
```

### Quick Documentation

```python
from blackroad_crew_wrapper import quick_documentation

result = quick_documentation(
    topic="Authentication System",
    target_audience="developers"
)
```

### Custom Crew

```python
from blackroad_agents import BlackRoadAgents
from blackroad_crew_wrapper import BlackRoadCrew

# Create crew
crew = BlackRoadCrew(
    name="my-crew",
    agents=[
        BlackRoadAgents.infrastructure_architect(),
        BlackRoadAgents.deployment_specialist()
    ]
)

# Add tasks
crew.add_task(
    description="Design system architecture",
    agent=crew.crew.agents[0],
    expected_output="Architecture diagram and specs"
)

# Execute
result = crew.execute()
```

## Crew Templates

Pre-configured crews for common workflows:

- `CrewTemplates.infrastructure_deployment()` - Zeus, Prometheus, Hermes
- `CrewTemplates.code_review()` - Prometheus, Hades, Erebus
- `CrewTemplates.documentation_generation()` - Apollo, Calliope
- `CrewTemplates.full_stack_deployment()` - All agents (sequential)

## Memory System Integration

All crew executions are automatically logged to BlackRoad memory system:

```bash
# View recent crew executions
~/memory-system.sh summary | grep crew
```

## Logs

Execution logs are saved to:
```
~/blackroad-ai-integrations/crewai/logs/
```

Each execution creates a JSON file with:
- Crew name and timestamp
- Duration and task count
- Complete results

## Advanced Configuration

### Custom LLM Provider

```python
from blackroad_agents import create_custom_agent, get_llm

agent = create_custom_agent(
    role="Custom Role",
    goal="Custom goal",
    backstory="Custom backstory",
    llm=get_llm(provider="anthropic", model="claude-3-5-sonnet-20241022")
)
```

### Parallel Processing

```python
from crewai import Process

crew = BlackRoadCrew(
    name="parallel-crew",
    agents=[agent1, agent2, agent3],
    process=Process.parallel  # Run tasks in parallel
)
```

## Troubleshooting

### Import Errors

Make sure virtual environment is activated:
```bash
source ~/blackroad-ai-integrations/crewai/venv/bin/activate
```

### API Key Issues

Verify environment variables are set:
```bash
echo $OPENAI_API_KEY
echo $ANTHROPIC_API_KEY
```

### Missing Dependencies

Reinstall CrewAI:
```bash
pip3 install --upgrade crewai crewai-tools
```

## Resources

- [CrewAI Documentation](https://docs.crewai.com/)
- [BlackRoad Memory System](~/MEMORY_BLACKROAD OS_INTEGRATION.md)
- [BlackRoad Agent Registry](~/blackroad-agent-registry.sh)

## License

BlackRoad Proprietary License
EOF

    echo -e "${GREEN}✅ README created: ${readme_file}${RESET}"
}

# Initialize CrewAI environment
init_crewai() {
    print_banner

    check_dependencies
    mkdir -p "$CREWAI_DIR"
    setup_venv
    install_crewai
    create_structure
    create_sample_agents
    create_sample_crew
    create_wrapper_functions
    create_demo_script
    create_readme

    echo ""
    echo -e "${PINK}════════════════════════════════════════════════════════════════${RESET}"
    echo -e "${GREEN}✅ CrewAI deployment complete!${RESET}"
    echo -e "${PINK}════════════════════════════════════════════════════════════════${RESET}"
    echo ""
    echo -e "${AMBER}Next steps:${RESET}"
    echo -e "  1. Activate venv: ${BLUE}source ${VENV_DIR}/bin/activate${RESET}"
    echo -e "  2. Set API keys: ${BLUE}export OPENAI_API_KEY=your-key${RESET}"
    echo -e "  3. Run demo:     ${BLUE}python3 ${CREWAI_DIR}/demo.py${RESET}"
    echo ""
    echo -e "${AMBER}Documentation:${RESET} ${BLUE}cat ${CREWAI_DIR}/README.md${RESET}"
    echo ""

    log_to_memory "deployed" "crewai" "CrewAI framework initialized at ${CREWAI_DIR}" "ai,framework,deployment,complete"
}

# Run demo
run_demo() {
    print_banner

    if [[ ! -d "$VENV_DIR" ]]; then
        echo -e "${RED}❌ Virtual environment not found. Run: $0 init${RESET}"
        exit 1
    fi

    source "$VENV_DIR/bin/activate"

    echo -e "${BLUE}Running CrewAI demo...${RESET}"
    python3 "${CREWAI_DIR}/demo.py"
}

# Show usage
show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  init        Initialize CrewAI environment (install, configure, create samples)"
    echo "  demo        Run interactive demo"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 init     # First-time setup"
    echo "  $0 demo     # Run demo after initialization"
}

# Main execution
main() {
    case "${1:-init}" in
        init)
            init_crewai
            ;;
        demo)
            run_demo
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            echo -e "${RED}Unknown command: $1${RESET}"
            show_usage
            exit 1
            ;;
    esac
}

main "$@"
