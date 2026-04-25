"""
RoadPad Circuits - Routing and chaining prompts through tunnels.

Circuits define how prompts flow through tunnels:
- chain: A -> B -> C (sequential, each refines the previous)
- parallel: [A, B, C] -> merge (run all, combine results)
- fallback: A || B || C (try until one succeeds)
- transform: apply function before/after tunnel
"""

from dataclasses import dataclass, field
from typing import Callable
from tunnels import get_registry, TunnelResult


@dataclass
class CircuitResult:
    """Result from a circuit execution."""
    circuit: str
    prompt: str
    response: str
    success: bool
    steps: list[TunnelResult] = field(default_factory=list)
    error: str | None = None


class Circuit:
    """Base circuit - sends to a single tunnel."""

    def __init__(self, name: str, tunnel: str):
        self.name = name
        self.tunnel = tunnel

    def execute(self, prompt: str) -> CircuitResult:
        registry = get_registry()
        result = registry.send(self.tunnel, prompt)
        return CircuitResult(
            circuit=self.name,
            prompt=prompt,
            response=result.response,
            success=result.success,
            steps=[result],
            error=result.error
        )


class ChainCircuit:
    """Chain circuit - sequential processing through multiple tunnels."""

    def __init__(self, name: str, tunnels: list[str],
                 transform: Callable[[str, str], str] | None = None):
        """
        Args:
            name: Circuit name
            tunnels: List of tunnel names to chain
            transform: Optional (prev_response, current_prompt) -> new_prompt
        """
        self.name = name
        self.tunnels = tunnels
        self.transform = transform or self._default_transform

    def _default_transform(self, prev_response: str, original_prompt: str) -> str:
        """Default: append previous response as context."""
        return f"Context:\n{prev_response}\n\nQuestion: {original_prompt}"

    def execute(self, prompt: str) -> CircuitResult:
        registry = get_registry()
        steps = []
        current_prompt = prompt
        last_response = ""

        for tunnel_name in self.tunnels:
            # Transform prompt based on previous response
            if last_response:
                current_prompt = self.transform(last_response, prompt)

            result = registry.send(tunnel_name, current_prompt)
            steps.append(result)

            if not result.success:
                return CircuitResult(
                    circuit=self.name,
                    prompt=prompt,
                    response=last_response,
                    success=False,
                    steps=steps,
                    error=f"Failed at {tunnel_name}: {result.error}"
                )

            last_response = result.response

        return CircuitResult(
            circuit=self.name,
            prompt=prompt,
            response=last_response,
            success=True,
            steps=steps
        )


class ParallelCircuit:
    """Parallel circuit - run multiple tunnels simultaneously, merge results."""

    def __init__(self, name: str, tunnels: list[str],
                 merge: Callable[[list[str]], str] | None = None):
        """
        Args:
            name: Circuit name
            tunnels: List of tunnel names to run in parallel
            merge: Optional function to merge responses
        """
        self.name = name
        self.tunnels = tunnels
        self.merge = merge or self._default_merge

    def _default_merge(self, responses: list[str]) -> str:
        """Default: concatenate with headers."""
        parts = []
        for i, resp in enumerate(responses):
            parts.append(f"[Response {i+1}]\n{resp}")
        return "\n\n".join(parts)

    def execute(self, prompt: str) -> CircuitResult:
        registry = get_registry()
        steps = []
        responses = []

        # TODO: Actually parallelize with threading
        for tunnel_name in self.tunnels:
            result = registry.send(tunnel_name, prompt)
            steps.append(result)
            if result.success:
                responses.append(result.response)

        if not responses:
            return CircuitResult(
                circuit=self.name,
                prompt=prompt,
                response="",
                success=False,
                steps=steps,
                error="All tunnels failed"
            )

        merged = self.merge(responses)
        return CircuitResult(
            circuit=self.name,
            prompt=prompt,
            response=merged,
            success=True,
            steps=steps
        )


class FallbackCircuit:
    """Fallback circuit - try tunnels until one succeeds."""

    def __init__(self, name: str, tunnels: list[str]):
        self.name = name
        self.tunnels = tunnels

    def execute(self, prompt: str) -> CircuitResult:
        registry = get_registry()
        steps = []

        for tunnel_name in self.tunnels:
            result = registry.send(tunnel_name, prompt)
            steps.append(result)

            if result.success and result.response:
                return CircuitResult(
                    circuit=self.name,
                    prompt=prompt,
                    response=result.response,
                    success=True,
                    steps=steps
                )

        return CircuitResult(
            circuit=self.name,
            prompt=prompt,
            response="",
            success=False,
            steps=steps,
            error="All fallbacks exhausted"
        )


class CircuitRegistry:
    """Registry of all available circuits."""

    def __init__(self):
        self.circuits: dict[str, Circuit | ChainCircuit | ParallelCircuit | FallbackCircuit] = {}
        self._init_defaults()

    def _init_defaults(self):
        """Initialize default circuits."""
        # Direct tunnels as circuits
        self.register(Circuit("copilot", "copilot"))
        self.register(Circuit("echo", "echo"))
        self.register(Circuit("claude", "claude"))
        self.register(Circuit("local", "ollama@localhost"))

        # Pi fleet circuits
        self.register(Circuit("cecilia", "ollama@cecilia"))
        self.register(Circuit("lucidia", "ollama@lucidia"))

        # Chain: draft with ollama, polish with copilot
        self.register(ChainCircuit(
            "refine",
            ["ollama@cecilia", "copilot"],
            lambda prev, orig: f"Please improve this response:\n\n{prev}\n\nOriginal question was: {orig}"
        ))

        # Parallel: get multiple perspectives
        self.register(ParallelCircuit(
            "consensus",
            ["copilot", "ollama@cecilia"]
        ))

        # Fallback: try copilot, then local ollama, then any pi
        self.register(FallbackCircuit(
            "auto",
            ["copilot", "ollama@localhost", "ollama@cecilia", "ollama@lucidia"]
        ))

        # Code review chain
        self.register(ChainCircuit(
            "review",
            ["copilot", "ollama@cecilia"],
            lambda prev, orig: f"Review this code suggestion for issues:\n\n{prev}"
        ))

    def register(self, circuit) -> None:
        """Register a circuit."""
        self.circuits[circuit.name] = circuit

    def get(self, name: str):
        """Get circuit by name."""
        return self.circuits.get(name)

    def list_all(self) -> list[str]:
        """List all circuit names."""
        return list(self.circuits.keys())

    def execute(self, circuit_name: str, prompt: str) -> CircuitResult:
        """Execute a named circuit."""
        circuit = self.get(circuit_name)
        if not circuit:
            return CircuitResult(
                circuit=circuit_name,
                prompt=prompt,
                response="",
                success=False,
                error=f"Unknown circuit: {circuit_name}"
            )
        return circuit.execute(prompt)


# Global registry
_registry: CircuitRegistry | None = None

def get_circuit_registry() -> CircuitRegistry:
    """Get the global circuit registry."""
    global _registry
    if _registry is None:
        _registry = CircuitRegistry()
    return _registry


def route(prompt: str, circuit: str = "auto") -> str:
    """High-level routing function."""
    registry = get_circuit_registry()
    result = registry.execute(circuit, prompt)
    return result.response if result.success else f"[{result.error}]"
