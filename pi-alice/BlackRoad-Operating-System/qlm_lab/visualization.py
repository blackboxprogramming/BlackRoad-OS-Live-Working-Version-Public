"""
QLM Visualization - Visual tools for understanding QLM state

Provides:
- Event timeline view
- Actor activity graph
- QI emergence patterns
- Alignment trends over time
"""

from datetime import datetime, timedelta
from typing import List, Optional
import json

try:
    import matplotlib.pyplot as plt
    import matplotlib.dates as mdates
    from matplotlib.patches import Rectangle
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False

try:
    import networkx as nx
    NETWORKX_AVAILABLE = True
except ImportError:
    NETWORKX_AVAILABLE = False

from qlm_lab.api import QLMInterface
from qlm_lab.models import IntelligenceType, EventType, QLMEvent


class QLMVisualizer:
    """
    Visualize QLM state and events.

    Usage:
        viz = QLMVisualizer(qlm_interface)
        viz.plot_event_timeline()
        viz.plot_actor_graph()
        viz.plot_alignment_over_time()
    """

    def __init__(self, qlm: QLMInterface):
        """
        Args:
            qlm: QLMInterface instance
        """
        self.qlm = qlm

    def plot_event_timeline(self, save_path: Optional[str] = None) -> None:
        """
        Plot events on a timeline colored by intelligence layer.

        Args:
            save_path: Optional path to save figure
        """
        if not MATPLOTLIB_AVAILABLE:
            print("❌ matplotlib not available. Install with: pip install matplotlib")
            return

        events = self.qlm.state.events

        if not events:
            print("No events to visualize")
            return

        fig, ax = plt.subplots(figsize=(14, 6))

        # Group events by layer
        layer_events = {
            IntelligenceType.HI: [],
            IntelligenceType.AI: [],
            IntelligenceType.QI: [],
        }

        for event in events:
            layer_events[event.source_layer].append(event)

        # Plot each layer
        colors = {
            IntelligenceType.HI: "#FF6B6B",  # Red for HI (Operator)
            IntelligenceType.AI: "#4ECDC4",  # Teal for AI (Agents)
            IntelligenceType.QI: "#FFE66D",  # Yellow for QI (Emergence)
        }

        y_positions = {
            IntelligenceType.HI: 3,
            IntelligenceType.AI: 2,
            IntelligenceType.QI: 1,
        }

        for layer, events_in_layer in layer_events.items():
            if not events_in_layer:
                continue

            times = [e.timestamp for e in events_in_layer]
            y = [y_positions[layer]] * len(times)

            ax.scatter(
                times, y, c=colors[layer], s=100, alpha=0.6, label=layer.value, zorder=3
            )

        # Format
        ax.set_yticks([1, 2, 3])
        ax.set_yticklabels(["QI (Emergence)", "AI (Agents)", "HI (Operator)"])
        ax.set_xlabel("Time")
        ax.set_title("QLM Event Timeline")
        ax.grid(True, alpha=0.3)
        ax.legend()

        # Format x-axis dates
        ax.xaxis.set_major_formatter(mdates.DateFormatter("%H:%M:%S"))
        plt.xticks(rotation=45)

        plt.tight_layout()

        if save_path:
            plt.savefig(save_path, dpi=150)
            print(f"Timeline saved to: {save_path}")
        else:
            plt.show()

    def plot_actor_graph(self, save_path: Optional[str] = None) -> None:
        """
        Plot actor interaction graph showing agent handoffs and coordination.

        Args:
            save_path: Optional path to save figure
        """
        if not MATPLOTLIB_AVAILABLE or not NETWORKX_AVAILABLE:
            print(
                "❌ matplotlib or networkx not available. "
                "Install with: pip install matplotlib networkx"
            )
            return

        # Build graph from events
        G = nx.DiGraph()

        # Add actors as nodes
        for layer in self.qlm.state.layers.values():
            for actor in layer.actors.values():
                G.add_node(
                    actor.id,
                    label=actor.name,
                    type=actor.actor_type.value,
                    role=actor.role.value,
                )

        # Add handoffs as edges
        handoff_events = [
            e for e in self.qlm.state.events if e.event_type == EventType.AGENT_HANDOFF
        ]

        for event in handoff_events:
            from_agent = event.actor_id
            to_agent = event.data.get("to_agent")
            if to_agent and from_agent in G and to_agent in G:
                if G.has_edge(from_agent, to_agent):
                    G[from_agent][to_agent]["weight"] += 1
                else:
                    G.add_edge(from_agent, to_agent, weight=1)

        if not G.nodes():
            print("No actors to visualize")
            return

        # Plot
        fig, ax = plt.subplots(figsize=(12, 8))

        # Layout
        pos = nx.spring_layout(G, k=2, iterations=50)

        # Node colors by type
        node_colors = []
        for node in G.nodes():
            node_type = G.nodes[node].get("type", "agent")
            if node_type == "human":
                node_colors.append("#FF6B6B")  # Red for humans
            elif node_type == "agent":
                node_colors.append("#4ECDC4")  # Teal for agents
            else:
                node_colors.append("#95E1D3")  # Light green for system

        # Draw
        nx.draw_networkx_nodes(
            G, pos, node_color=node_colors, node_size=2000, alpha=0.7, ax=ax
        )

        nx.draw_networkx_labels(
            G, pos, {n: G.nodes[n].get("label", n) for n in G.nodes()}, font_size=10, ax=ax
        )

        # Draw edges with width based on weight
        edges = G.edges()
        weights = [G[u][v].get("weight", 1) for u, v in edges]

        nx.draw_networkx_edges(
            G, pos, width=[w * 2 for w in weights], alpha=0.5, arrows=True, arrowsize=20, ax=ax
        )

        ax.set_title("QLM Actor Interaction Graph")
        ax.axis("off")

        plt.tight_layout()

        if save_path:
            plt.savefig(save_path, dpi=150)
            print(f"Actor graph saved to: {save_path}")
        else:
            plt.show()

    def plot_alignment_over_time(
        self, window_size: int = 10, save_path: Optional[str] = None
    ) -> None:
        """
        Plot HI-AI alignment trend over time.

        Args:
            window_size: Number of events per alignment calculation window
            save_path: Optional path to save figure
        """
        if not MATPLOTLIB_AVAILABLE:
            print("❌ matplotlib not available. Install with: pip install matplotlib")
            return

        events = self.qlm.state.events

        if len(events) < window_size:
            print(f"Not enough events (need at least {window_size})")
            return

        # Calculate alignment in sliding windows
        alignments = []
        timestamps = []

        # This is a simplified version - real implementation would calculate
        # alignment for each window
        for i in range(window_size, len(events), window_size // 2):
            window_events = events[i - window_size : i]
            timestamp = window_events[-1].timestamp

            # Count approvals vs vetoes in window
            approvals = sum(
                1
                for e in window_events
                if e.event_type == EventType.OPERATOR_APPROVAL
            )
            vetoes = sum(
                1 for e in window_events if e.event_type == EventType.OPERATOR_VETO
            )

            total_feedback = approvals + vetoes
            if total_feedback > 0:
                alignment = approvals / total_feedback
                alignments.append(alignment)
                timestamps.append(timestamp)

        if not alignments:
            print("No alignment data to plot")
            return

        # Plot
        fig, ax = plt.subplots(figsize=(12, 6))

        ax.plot(timestamps, alignments, marker="o", linewidth=2, markersize=8)
        ax.axhline(y=0.8, color="g", linestyle="--", alpha=0.5, label="Good (80%)")
        ax.axhline(y=0.6, color="orange", linestyle="--", alpha=0.5, label="Warning (60%)")
        ax.axhline(y=0.4, color="r", linestyle="--", alpha=0.5, label="Poor (40%)")

        ax.set_xlabel("Time")
        ax.set_ylabel("HI-AI Alignment")
        ax.set_title("HI-AI Alignment Over Time")
        ax.set_ylim(0, 1)
        ax.grid(True, alpha=0.3)
        ax.legend()

        # Format x-axis dates
        ax.xaxis.set_major_formatter(mdates.DateFormatter("%H:%M"))
        plt.xticks(rotation=45)

        plt.tight_layout()

        if save_path:
            plt.savefig(save_path, dpi=150)
            print(f"Alignment plot saved to: {save_path}")
        else:
            plt.show()

    def plot_emergence_patterns(self, save_path: Optional[str] = None) -> None:
        """
        Plot QI emergence patterns detected.

        Args:
            save_path: Optional path to save figure
        """
        if not MATPLOTLIB_AVAILABLE:
            print("❌ matplotlib not available. Install with: pip install matplotlib")
            return

        emergences = self.qlm.state.emergences

        if not emergences:
            print("No emergence patterns to visualize")
            return

        # Count patterns
        pattern_counts = {}
        for em in emergences:
            pattern_counts[em.pattern_name] = pattern_counts.get(em.pattern_name, 0) + 1

        # Plot
        fig, ax = plt.subplots(figsize=(10, 6))

        patterns = list(pattern_counts.keys())
        counts = list(pattern_counts.values())

        bars = ax.barh(patterns, counts, color="#FFE66D", alpha=0.8)

        # Add value labels
        for bar in bars:
            width = bar.get_width()
            ax.text(
                width,
                bar.get_y() + bar.get_height() / 2,
                f" {int(width)}",
                va="center",
                fontsize=10,
            )

        ax.set_xlabel("Count")
        ax.set_title("QI Emergence Patterns Detected")
        ax.grid(True, alpha=0.3, axis="x")

        plt.tight_layout()

        if save_path:
            plt.savefig(save_path, dpi=150)
            print(f"Emergence patterns saved to: {save_path}")
        else:
            plt.show()

    def export_dashboard(self, output_dir: str = ".") -> None:
        """
        Export complete visualization dashboard.

        Args:
            output_dir: Directory to save visualizations
        """
        print("Generating QLM visualization dashboard...")

        self.plot_event_timeline(save_path=f"{output_dir}/qlm_timeline.png")
        self.plot_actor_graph(save_path=f"{output_dir}/qlm_actors.png")
        self.plot_alignment_over_time(save_path=f"{output_dir}/qlm_alignment.png")
        self.plot_emergence_patterns(save_path=f"{output_dir}/qlm_emergence.png")

        print(f"\n✅ Dashboard exported to: {output_dir}/")
        print("Files:")
        print("  - qlm_timeline.png")
        print("  - qlm_actors.png")
        print("  - qlm_alignment.png")
        print("  - qlm_emergence.png")


def demo_visualization():
    """Demo visualization with sample data"""
    from qlm_lab.models import ActorRole

    print("QLM Visualization Demo")
    print("=" * 60)

    # Create sample QLM state
    qlm = QLMInterface()

    # Register agents
    qlm.register_agent("agent-1", "Coder", ActorRole.CODER)
    qlm.register_agent("agent-2", "Reviewer", ActorRole.REVIEWER)
    qlm.register_agent("agent-3", "Tester", ActorRole.TESTER)

    # Simulate activity
    qlm.record_operator_intent("Build feature X", intent_node_id="intent-1")
    qlm.record_agent_execution("agent-1", "Implement feature", "task-1", "intent-1")
    qlm.record_agent_completion("agent-1", "task-1", True)
    qlm.record_agent_handoff("agent-1", "agent-2", "task-1", "Ready for review")
    qlm.record_agent_execution("agent-2", "Review code", "task-2")
    qlm.record_agent_completion("agent-2", "task-2", True)
    qlm.record_operator_approval("Feature implementation", intent_node_id="intent-1")

    # Generate visualizations
    viz = QLMVisualizer(qlm)

    if MATPLOTLIB_AVAILABLE:
        print("\nGenerating visualizations...")
        viz.export_dashboard(".")
    else:
        print("\n⚠️  Install visualization dependencies:")
        print("  pip install matplotlib networkx")


if __name__ == "__main__":
    demo_visualization()
