# RoadC

[![CI](https://github.com/blackboxprogramming/roadc/actions/workflows/ci.yml/badge.svg)](https://github.com/blackboxprogramming/roadc/actions/workflows/ci.yml)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-3776AB.svg)](https://python.org)
[![C99](https://img.shields.io/badge/C99-zero_deps-A8B9CC.svg)](https://en.wikipedia.org/wiki/C99)
[![License](https://img.shields.io/badge/license-Proprietary-9c27b0)](LICENSE)

A programming language with Python-style indentation, built from scratch. Two implementations: a tree-walking interpreter in Python, and a zero-dependency C99 compiler.

## What Works Today

The Python interpreter supports:

- **Variables**: `let`, `var`, `const` with optional type annotations
- **Functions**: `fun` keyword, parameters, `return`, recursion, closures
- **Control flow**: `if`/`elif`/`else`, `while`, `for`/`in`, `break`, `continue`
- **Types**: integers, floats, strings (with `{var}` interpolation), booleans, colors (`#FF1D6C`)
- **Collections**: lists, dicts, sets, tuples, ranges
- **Operators**: arithmetic, comparison, logical, bitwise, compound assignment
- **Builtins**: `print`, `len`, `range`, `str`, `int`, `abs`, `min`, `max`, `sorted`, `input`, and more
- **Member access**: string/list/dict methods (`.upper()`, `.append()`, `.keys()`)

```road
fun fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

let result = fibonacci(10)
print(result)  # 55
```

```road
let name = "world"
let msg = "hello {name}"
print(msg)  # hello world

let xs = [1, 2, 3, 4, 5]
let total = 0
for x in xs:
    total += x
print(total)  # 15
```

## Architecture

```
source.road
    |
    v
  Lexer (lexer.py, 462 LOC)
    |  Tokens: keywords, literals, operators, INDENT/DEDENT
    v
  Parser (parser.py, 826 LOC)
    |  AST nodes defined in ast_nodes.py (462 LOC)
    v
  Interpreter (interpreter.py, 320 LOC)
       Tree-walking execution with Environment chain
```

The C compiler (`roadc.c`, 618 LOC) is a separate implementation that compiles `.road` files to native executables. Zero external dependencies — just a C99 compiler.

```bash
gcc -std=c99 -O2 -o roadc roadc.c
./roadc program.road
```

## Development

```bash
# Run a .road file
python roadc.py examples/fibonacci.road

# Run tests (30+ tests)
pytest tests/ -v

# Build C compiler
gcc -std=c99 -O2 -o roadc roadc.c

# Start REPL
python roadc.py
```

## Roadmap

- [ ] Type checker (static analysis pass between parser and interpreter)
- [ ] Bytecode VM (replace tree-walking for performance)
- [ ] Standard library (file I/O, math, networking)
- [ ] 3D scene graph (`space`, `cube`, `sphere` keywords — lexer ready, runtime not yet)
- [ ] Package manager
- [ ] Self-hosting compiler

## License

Proprietary — BlackRoad OS, Inc.
