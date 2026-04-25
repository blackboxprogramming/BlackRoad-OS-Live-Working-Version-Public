"""Tests for RoadPad EditManager."""

import os
import sys
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from edit_manager import Edit, EditManager


class TestEdit:
    def test_create(self):
        e = Edit("fix typo", "corrected text")
        assert e.query == "fix typo"
        assert e.response == "corrected text"
        assert not e.applied
        assert not e.rejected
        assert e.timestamp is not None

    def test_repr_pending(self):
        e = Edit("fix typo in variable name here", "fixed")
        assert "pending" in repr(e)

    def test_repr_applied(self):
        e = Edit("query", "response")
        e.applied = True
        assert "applied" in repr(e)

    def test_repr_rejected(self):
        e = Edit("query", "response")
        e.rejected = True
        assert "rejected" in repr(e)


class TestEditManager:
    def test_add_edit(self):
        em = EditManager()
        edit = em.add_edit("query", "response")
        assert em.get_pending_count() == 1
        assert edit.query == "query"

    def test_accept_edit(self):
        em = EditManager()
        edit = em.add_edit("q", "r")
        result = em.accept_edit(edit)
        assert result is True
        assert edit.applied is True
        assert em.get_pending_count() == 0
        assert len(em.applied_edits) == 1

    def test_reject_edit(self):
        em = EditManager()
        edit = em.add_edit("q", "r")
        result = em.reject_edit(edit)
        assert result is True
        assert edit.rejected is True
        assert em.get_pending_count() == 0
        assert len(em.rejected_edits) == 1

    def test_accept_already_rejected(self):
        em = EditManager()
        edit = em.add_edit("q", "r")
        em.reject_edit(edit)
        result = em.accept_edit(edit)
        assert result is False  # not in pending anymore

    def test_accept_all(self):
        em = EditManager()
        em.add_edit("q1", "r1")
        em.add_edit("q2", "r2")
        em.add_edit("q3", "r3")
        count = em.accept_all()
        assert count == 3
        assert em.get_pending_count() == 0
        assert len(em.applied_edits) == 3

    def test_reject_all(self):
        em = EditManager()
        em.add_edit("q1", "r1")
        em.add_edit("q2", "r2")
        count = em.reject_all()
        assert count == 2
        assert len(em.rejected_edits) == 2

    def test_clear_pending(self):
        em = EditManager()
        em.add_edit("q", "r")
        em.clear_pending()
        assert em.get_pending_count() == 0

    def test_get_next_edit(self):
        em = EditManager()
        assert em.get_next_edit() is None
        e1 = em.add_edit("first", "r1")
        em.add_edit("second", "r2")
        assert em.get_next_edit() is e1

    def test_diff_preview(self):
        em = EditManager()
        edit = em.add_edit("fix bug", "line1\nline2")
        preview = em.get_diff_preview(edit)
        assert "fix bug" in preview
        assert "+ line1" in preview
        assert "+ line2" in preview
        assert "Ctrl+Y" in preview

    def test_status_text_manual(self):
        em = EditManager()
        assert em.get_status_text(0) == "manual"
        em.add_edit("q", "r")
        assert em.get_status_text(0) == "manual (1 pending)"

    def test_status_text_on_save(self):
        em = EditManager()
        em.add_edit("q", "r")
        assert "on save" in em.get_status_text(1)

    def test_status_text_always(self):
        em = EditManager()
        assert em.get_status_text(2) == "always"

    def test_apply_edits_to_buffer(self):
        em = EditManager()
        e1 = em.add_edit("fix", "corrected text")
        em.accept_edit(e1)

        class MockBuffer:
            def __init__(self):
                self.lines = []

        buf = MockBuffer()
        count = em.apply_edits_to_buffer(buf, em.applied_edits)
        assert count == 1
        assert any("corrected text" in line for line in buf.lines)

    def test_apply_rejected_edits_skipped(self):
        em = EditManager()
        e1 = em.add_edit("fix", "text")
        e1.applied = False
        e1.rejected = True

        class MockBuffer:
            def __init__(self):
                self.lines = []

        buf = MockBuffer()
        count = em.apply_edits_to_buffer(buf, [e1])
        assert count == 0
