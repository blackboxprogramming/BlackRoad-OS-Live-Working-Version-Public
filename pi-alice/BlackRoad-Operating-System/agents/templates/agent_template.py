"""
Agent Template

Use this template to create new agents for the BlackRoad Agent Library.

Instructions:
1. Copy this file to the appropriate category directory
2. Rename the file to match your agent (e.g., my_agent.py)
3. Update the class name (e.g., MyAgent)
4. Fill in the metadata in __init__
5. Implement the execute() method
6. Optionally override validate_params(), initialize(), and cleanup()
"""

from typing import Any, Dict
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from base import BaseAgent


class TemplateAgent(BaseAgent):
    """
    Brief description of what this agent does.

    This agent performs X, Y, and Z operations to achieve [goal].
    """

    def __init__(self):
        """Initialize the agent with metadata."""
        super().__init__(
            name='template-agent',  # Unique identifier (lowercase, hyphens)
            description='Brief description of the agent',  # One sentence
            category='custom',  # Category: devops, engineering, data, etc.
            version='1.0.0',  # Semantic versioning
            tags=['tag1', 'tag2', 'tag3'],  # Searchable tags
            timeout=300,  # Execution timeout in seconds (optional)
            retry_count=3,  # Number of retries on failure (optional)
            retry_delay=5  # Delay between retries in seconds (optional)
        )

    async def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the agent logic.

        This is the main method that performs the agent's work.

        Args:
            params: Dictionary containing input parameters:
                - param1 (str): Description of param1
                - param2 (int): Description of param2
                - param3 (bool, optional): Description of param3

        Returns:
            Dictionary containing results:
                {
                    'status': 'success|failed',
                    'data': {...},  # Your result data
                    'message': 'Human-readable message',
                    'metrics': {...}  # Optional metrics
                }

        Raises:
            ValueError: If parameters are invalid
            Exception: If execution fails
        """
        # Extract parameters
        param1 = params.get('param1')
        param2 = params.get('param2', 0)  # Default value
        param3 = params.get('param3', False)

        self.logger.info(f"Executing {self.metadata.name} with params: {params}")

        # Your agent logic here
        # Example:
        # result = self._do_something(param1, param2)

        # Mock result for template
        result = {
            'status': 'success',
            'message': f'Successfully processed {param1}',
            'data': {
                'processed_items': 42,
                'output': 'Example output',
                'details': {
                    'param1': param1,
                    'param2': param2,
                    'param3': param3
                }
            },
            'metrics': {
                'execution_time_ms': 123.45,
                'items_processed': 42,
                'success_rate': 1.0
            }
        }

        return result

    def validate_params(self, params: Dict[str, Any]) -> bool:
        """
        Validate input parameters.

        Override this method to add custom validation logic.

        Args:
            params: Parameters to validate

        Returns:
            True if valid, False otherwise
        """
        # Check required parameters
        required_params = ['param1', 'param2']
        for param in required_params:
            if param not in params:
                self.logger.error(f"Missing required parameter: {param}")
                return False

        # Type validation
        if not isinstance(params.get('param1'), str):
            self.logger.error("param1 must be a string")
            return False

        if not isinstance(params.get('param2'), int):
            self.logger.error("param2 must be an integer")
            return False

        # Value validation
        if params.get('param2', 0) < 0:
            self.logger.error("param2 must be non-negative")
            return False

        return True

    async def initialize(self) -> None:
        """
        Initialize the agent before execution.

        Override this method to add custom initialization logic,
        such as:
        - Loading configuration
        - Connecting to databases
        - Setting up resources
        """
        await super().initialize()
        # Your initialization code here
        self.logger.info(f"Initializing {self.metadata.name}")

    async def cleanup(self) -> None:
        """
        Cleanup after agent execution.

        Override this method to add custom cleanup logic,
        such as:
        - Closing connections
        - Releasing resources
        - Saving state
        """
        await super().cleanup()
        # Your cleanup code here
        self.logger.info(f"Cleaning up {self.metadata.name}")


# Example usage
if __name__ == '__main__':
    import asyncio

    async def main():
        # Create agent instance
        agent = TemplateAgent()

        # Print agent info
        info = agent.get_info()
        print(f"Agent: {info['name']}")
        print(f"Description: {info['description']}")
        print(f"Category: {info['category']}")
        print(f"Version: {info['version']}")

        # Execute agent
        result = await agent.run({
            'param1': 'test-value',
            'param2': 42,
            'param3': True
        })

        print(f"\nExecution Result:")
        print(f"Status: {result.status.value}")
        print(f"Duration: {result.duration_seconds:.2f}s")
        print(f"Data: {result.data}")

    asyncio.run(main())
