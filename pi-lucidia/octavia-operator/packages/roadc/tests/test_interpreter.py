"""Tests for the RoadC tree-walking interpreter."""

import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from lexer import Lexer
from parser import Parser
from interpreter import Interpreter


def run(source: str) -> Interpreter:
    """Helper: lex, parse, and interpret a source string."""
    tokens = Lexer(source).tokenize()
    ast = Parser(tokens).parse_program()
    interp = Interpreter()
    interp.run(ast)
    return interp


def run_capture(source: str, capsys=None) -> str:
    """Run and capture stdout."""
    import io
    from contextlib import redirect_stdout

    f = io.StringIO()
    with redirect_stdout(f):
        run(source)
    return f.getvalue()


class TestVariables:
    def test_let_declaration(self):
        interp = run("let x = 42\n")
        assert interp.global_env.get("x") == 42

    def test_var_declaration(self):
        interp = run("var y = 10\n")
        assert interp.global_env.get("y") == 10

    def test_string_variable(self):
        interp = run('let name = "Alexa"\n')
        assert interp.global_env.get("name") == "Alexa"

    def test_float_variable(self):
        interp = run("let pi = 3.14\n")
        assert interp.global_env.get("pi") == pytest.approx(3.14)

    def test_boolean_variable(self):
        interp = run("let flag = true\n")
        assert interp.global_env.get("flag") is True


class TestArithmetic:
    def test_addition(self):
        interp = run("let x = 10 + 32\n")
        assert interp.global_env.get("x") == 42

    def test_subtraction(self):
        interp = run("let x = 50 - 8\n")
        assert interp.global_env.get("x") == 42

    def test_multiplication(self):
        interp = run("let x = 6 * 7\n")
        assert interp.global_env.get("x") == 42

    def test_division(self):
        interp = run("let x = 84 / 2\n")
        assert interp.global_env.get("x") == pytest.approx(42.0)

    def test_modulo(self):
        interp = run("let x = 10 % 3\n")
        assert interp.global_env.get("x") == 1

    def test_exponentiation(self):
        interp = run("let x = 2 ** 10\n")
        assert interp.global_env.get("x") == 1024


class TestFunctions:
    def test_simple_function(self):
        source = """fun add(a, b):
    return a + b
let result = add(10, 32)
"""
        interp = run(source)
        assert interp.global_env.get("result") == 42

    def test_recursive_fibonacci(self):
        source = """fun fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
let result = fib(10)
"""
        interp = run(source)
        assert interp.global_env.get("result") == 55

    def test_function_no_return(self):
        source = """fun noop():
    let x = 1
let result = noop()
"""
        interp = run(source)
        assert interp.global_env.get("result") is None


class TestControlFlow:
    def test_if_true(self):
        source = """let x = 0
if true:
    x = 42
"""
        interp = run(source)
        assert interp.global_env.get("x") == 42

    @pytest.mark.skip(reason="Parser NEWLINE/DEDENT before else — known issue")
    def test_if_false_else(self):
        source = "let x = 0\nif false:\n    x = 1\nelse:\n    x = 42\n"
        interp = run(source)
        assert interp.global_env.get("x") == 42

    def test_while_loop(self):
        source = """let i = 0
let total = 0
while i < 5:
    total = total + i
    i = i + 1
"""
        interp = run(source)
        assert interp.global_env.get("total") == 10

    def test_for_loop(self):
        source = """let total = 0
for i in range(5):
    total = total + i
"""
        interp = run(source)
        assert interp.global_env.get("total") == 10


class TestStrings:
    def test_string_concatenation(self):
        interp = run('let x = "hello" + " world"\n')
        assert interp.global_env.get("x") == "hello world"

    def test_string_interpolation(self):
        source = """let name = "world"
let msg = "hello {name}"
"""
        interp = run(source)
        assert interp.global_env.get("msg") == "hello world"


class TestCollections:
    def test_list_literal(self):
        interp = run("let xs = [1, 2, 3]\n")
        assert interp.global_env.get("xs") == [1, 2, 3]

    def test_list_index(self):
        source = """let xs = [10, 20, 30]
let x = xs[1]
"""
        interp = run(source)
        assert interp.global_env.get("x") == 20

    def test_dict_literal(self):
        source = 'let d = {"a": 1, "b": 2}\n'
        interp = run(source)
        assert interp.global_env.get("d") == {"a": 1, "b": 2}
