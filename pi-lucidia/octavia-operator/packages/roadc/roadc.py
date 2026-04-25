#!/usr/bin/env python3
"""
RoadC — The BlackRoad Language (Python interpreter)
Usage:
    roadc.py run <file.road>     Run a RoadC source file
    roadc.py repl                Interactive REPL
    roadc.py parse <file.road>   Parse and dump AST
    roadc.py version             Show version
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lexer import Lexer
from parser import Parser
from interpreter import Interpreter

VERSION = "0.1.0"

def run_code(code):
    tokens = Lexer(code).tokenize()
    ast = Parser(tokens).parse_program()
    Interpreter().run(ast)

def run_file(path):
    with open(path) as f:
        run_code(f.read())

def parse_file(path):
    with open(path) as f:
        code = f.read()
    tokens = Lexer(code).tokenize()
    ast = Parser(tokens).parse_program()
    for stmt in ast.statements:
        print(stmt)

def repl():
    print(f"RoadC {VERSION} — type 'exit' to quit")
    interp = Interpreter()
    while True:
        try:
            line = input("road> ")
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if line.strip() in ('exit', 'quit'):
            break
        if not line.strip():
            continue
        try:
            tokens = Lexer(line).tokenize()
            ast = Parser(tokens).parse_program()
            interp.run(ast)
        except Exception as e:
            print(f"Error: {e}")

def main():
    if len(sys.argv) < 2:
        print(__doc__.strip())
        sys.exit(1)

    cmd = sys.argv[1]
    if cmd == 'version':
        print(f"RoadC {VERSION}")
    elif cmd == 'run' and len(sys.argv) > 2:
        run_file(sys.argv[2])
    elif cmd == 'parse' and len(sys.argv) > 2:
        parse_file(sys.argv[2])
    elif cmd == 'repl':
        repl()
    else:
        print(__doc__.strip())
        sys.exit(1)

if __name__ == '__main__':
    main()
