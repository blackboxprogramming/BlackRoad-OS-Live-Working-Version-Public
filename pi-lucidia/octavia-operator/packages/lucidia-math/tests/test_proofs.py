"""Tests for forge.proofs — ProofNode, ProofEngine."""

import json
import pytest
from unittest.mock import patch
from forge.proofs import ProofNode, ProofEngine, log_contradiction


class TestProofNode:
    def test_create(self):
        node = ProofNode("x > 0", "assumption")
        assert node.statement == "x > 0"
        assert node.reason == "assumption"
        assert node.children == []

    def test_to_dict(self):
        child = ProofNode("q", "inference")
        parent = ProofNode("p", "assumption", [child])
        d = parent.to_dict()
        assert d["statement"] == "p"
        assert len(d["children"]) == 1
        assert d["children"][0]["statement"] == "q"

    def test_str(self):
        node = ProofNode("p", "assumption")
        assert "p (assumption)" in str(node)

    def test_nested_str(self):
        child = ProofNode("q", "inference")
        parent = ProofNode("p", "assumption", [child])
        text = str(parent)
        assert "p (assumption)" in text
        assert "  q (inference)" in text


class TestProofEngine:
    def test_assume(self):
        engine = ProofEngine()
        node = engine.assume("p")
        assert node.reason == "assumption"
        assert engine.prove("p") is node

    def test_infer(self):
        engine = ProofEngine()
        engine.assume("p")
        q = engine.infer("q", "p")
        assert q.reason == "inference"
        assert len(q.children) == 1

    def test_prove_missing(self):
        engine = ProofEngine()
        assert engine.prove("nonexistent") is None

    @patch("forge.proofs.log_contradiction")
    def test_contradiction_on_assume(self, mock_log):
        engine = ProofEngine()
        engine.assume("not p")
        engine.assume("p")
        mock_log.assert_called_once()

    @patch("forge.proofs.log_contradiction")
    def test_contradiction_on_infer(self, mock_log):
        engine = ProofEngine()
        engine.assume("not q")
        engine.assume("p")
        engine.infer("q", "p")
        mock_log.assert_called_once()
