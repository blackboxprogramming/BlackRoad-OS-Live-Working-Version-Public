"""Tests for the RoadC lexer."""

import pytest
from lexer import Lexer, TokenType


class TestLiterals:
    def test_integer(self):
        tokens = Lexer("42").tokenize()
        assert any(t.type == TokenType.INTEGER and t.value == 42 for t in tokens)

    def test_float(self):
        tokens = Lexer("3.14").tokenize()
        assert any(t.type == TokenType.FLOAT and t.value == 3.14 for t in tokens)

    def test_string_double_quotes(self):
        tokens = Lexer('"hello"').tokenize()
        assert any(t.type == TokenType.STRING for t in tokens)

    def test_string_single_quotes(self):
        tokens = Lexer("'hello'").tokenize()
        assert any(t.type == TokenType.STRING for t in tokens)

    def test_boolean_true(self):
        tokens = Lexer("true").tokenize()
        assert any(t.type == TokenType.BOOLEAN and t.value is True for t in tokens)

    def test_boolean_false(self):
        tokens = Lexer("false").tokenize()
        assert any(t.type == TokenType.BOOLEAN and t.value is False for t in tokens)

    def test_color_literal(self):
        tokens = Lexer("#FF1D6C").tokenize()
        assert any(t.type == TokenType.COLOR for t in tokens)


class TestKeywords:
    @pytest.mark.parametrize("keyword,token_type", [
        ("let", TokenType.LET),
        ("var", TokenType.VAR),
        ("const", TokenType.CONST),
        ("fun", TokenType.FUN),
        ("if", TokenType.IF),
        ("elif", TokenType.ELIF),
        ("else", TokenType.ELSE),
        ("while", TokenType.WHILE),
        ("for", TokenType.FOR),
        ("return", TokenType.RETURN),
        ("match", TokenType.MATCH),
    ])
    def test_keyword_recognized(self, keyword, token_type):
        tokens = Lexer(keyword).tokenize()
        assert any(t.type == token_type for t in tokens)

    def test_identifier(self):
        tokens = Lexer("myVar").tokenize()
        assert any(t.type == TokenType.IDENTIFIER and t.value == "myVar" for t in tokens)


class TestOperators:
    @pytest.mark.parametrize("op", ["+", "-", "*", "/", "==", "!=", "<", ">", "<=", ">="])
    def test_operator_tokenized(self, op):
        tokens = Lexer(f"a {op} b").tokenize()
        types = [t.type for t in tokens]
        assert TokenType.IDENTIFIER in types


class TestIndentation:
    def test_indent_dedent(self):
        source = "if true:\n    x = 1\n"
        tokens = Lexer(source).tokenize()
        types = [t.type for t in tokens]
        assert TokenType.INDENT in types

    def test_colon_before_block(self):
        source = "fun main():\n    pass\n"
        tokens = Lexer(source).tokenize()
        types = [t.type for t in tokens]
        assert TokenType.COLON in types


class TestComments:
    def test_comment_ignored(self):
        tokens = Lexer("x = 1 # this is a comment").tokenize()
        values = [t.value for t in tokens if t.type == TokenType.IDENTIFIER]
        assert "comment" not in values
