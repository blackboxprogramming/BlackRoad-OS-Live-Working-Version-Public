"""Tests for lab.trinary_logic — TrinaryLogicEngine."""

import numpy as np
import pytest
from lab.trinary_logic import TrinaryLogicEngine, SimpleDiGraph, SimpleEdge, TRIT_VALUES


OPERATORS = {
    "AND": {
        "-1": {"-1": -1, "0": -1, "1": -1},
        "0": {"-1": -1, "0": 0, "1": 0},
        "1": {"-1": -1, "0": 0, "1": 1},
    },
    "OR": {
        "-1": {"-1": -1, "0": 0, "1": 1},
        "0": {"-1": 0, "0": 0, "1": 1},
        "1": {"-1": 1, "0": 1, "1": 1},
    },
    "NOT": {"-1": 1, "0": 0, "1": -1},
}


@pytest.fixture
def engine():
    return TrinaryLogicEngine(OPERATORS)


class TestTrinaryLogicEngine:
    def test_and_operation(self, engine):
        assert engine.operate("AND", 1, 1) == 1
        assert engine.operate("AND", 1, -1) == -1
        assert engine.operate("AND", 0, 0) == 0

    def test_or_operation(self, engine):
        assert engine.operate("OR", -1, 1) == 1
        assert engine.operate("OR", -1, -1) == -1

    def test_not_operation(self, engine):
        assert engine.operate("NOT", 1) == -1
        assert engine.operate("NOT", -1) == 1
        assert engine.operate("NOT", 0) == 0

    def test_not_with_two_args_raises(self, engine):
        with pytest.raises(ValueError, match="single argument"):
            engine.operate("NOT", 1, 0)

    def test_binary_missing_b_raises(self, engine):
        with pytest.raises(ValueError, match="two arguments"):
            engine.operate("AND", 1)

    def test_unknown_operator_raises(self, engine):
        with pytest.raises(KeyError, match="Unknown"):
            engine.operate("XOR", 1, 0)

    def test_truth_table_and(self, engine):
        table = engine.truth_table("AND")
        assert table.shape == (3, 3)
        assert table[2, 2] == 1   # AND(1, 1) = 1

    def test_truth_table_not(self, engine):
        table = engine.truth_table("NOT")
        assert table.shape == (3, 2)
        assert table[0, 1] == 1   # NOT(-1) = 1

    def test_truth_table_ascii(self, engine):
        ascii_out = engine.truth_table_ascii("AND")
        assert isinstance(ascii_out, str)
        assert "\n" in ascii_out

    def test_to_graph_simple(self, engine):
        graph = engine.to_graph("AND", prefer_networkx=False)
        assert isinstance(graph, SimpleDiGraph)
        assert len(graph.edges) == 9  # 3×3 combinations

    def test_to_graph_not(self, engine):
        graph = engine.to_graph("NOT", prefer_networkx=False)
        assert isinstance(graph, SimpleDiGraph)
        assert len(graph.edges) == 3


class TestSimpleDiGraph:
    def test_add_edge(self):
        g = SimpleDiGraph()
        g.add_edge("a", "b", weight=1)
        assert len(g.edges) == 1
        assert g.edges[0] == SimpleEdge("a", "b", {"weight": 1})
