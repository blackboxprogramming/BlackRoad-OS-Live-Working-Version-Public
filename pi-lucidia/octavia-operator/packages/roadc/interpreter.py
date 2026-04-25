"""
RoadC Language - Tree-Walking Interpreter
Executes AST nodes produced by the parser
"""

from ast_nodes import *


class ReturnSignal(Exception):
    def __init__(self, value):
        self.value = value


class BreakSignal(Exception):
    pass


class ContinueSignal(Exception):
    pass


class Environment:
    def __init__(self, parent=None):
        self.vars = {}
        self.parent = parent

    def get(self, name):
        if name in self.vars:
            return self.vars[name]
        if self.parent:
            return self.parent.get(name)
        raise NameError(f"Undefined variable '{name}'")

    def set(self, name, value):
        self.vars[name] = value

    def assign(self, name, value):
        if name in self.vars:
            self.vars[name] = value
            return
        if self.parent:
            self.parent.assign(name, value)
            return
        raise NameError(f"Undefined variable '{name}'")


class Interpreter:
    def __init__(self):
        self.global_env = Environment()

    def run(self, program):
        for stmt in program.statements:
            self.exec_statement(stmt, self.global_env)

    def exec_statement(self, stmt, env):
        if isinstance(stmt, VariableDeclaration):
            value = None
            if stmt.initializer:
                value = self.eval_expr(stmt.initializer, env)
            env.set(stmt.name, value)

        elif isinstance(stmt, Assignment):
            value = self.eval_expr(stmt.value, env)
            if isinstance(stmt.target, Identifier):
                env.assign(stmt.target.name, value)
            elif isinstance(stmt.target, IndexAccess):
                obj = self.eval_expr(stmt.target.object, env)
                index = self.eval_expr(stmt.target.index, env)
                obj[index] = value
            elif isinstance(stmt.target, MemberAccess):
                obj = self.eval_expr(stmt.target.object, env)
                if isinstance(obj, dict):
                    obj[stmt.target.member] = value

        elif isinstance(stmt, CompoundAssignment):
            if isinstance(stmt.target, Identifier):
                old = env.get(stmt.target.name)
                rhs = self.eval_expr(stmt.value, env)
                op = stmt.operator
                ops = {'+=': lambda a, b: a+b, '-=': lambda a, b: a-b,
                       '*=': lambda a, b: a*b, '/=': lambda a, b: a/b}
                env.assign(stmt.target.name, ops[op](old, rhs))

        elif isinstance(stmt, ExpressionStatement):
            self.eval_expr(stmt.expression, env)

        elif isinstance(stmt, FunctionDefinition):
            # Capture the defining environment for closures
            stmt._closure_env = env
            env.set(stmt.name, stmt)

        elif isinstance(stmt, ReturnStatement):
            value = self.eval_expr(stmt.value, env) if stmt.value else None
            raise ReturnSignal(value)

        elif isinstance(stmt, BreakStatement):
            raise BreakSignal()

        elif isinstance(stmt, ContinueStatement):
            raise ContinueSignal()

        elif isinstance(stmt, IfStatement):
            self.exec_if(stmt, env)

        elif isinstance(stmt, WhileLoop):
            self.exec_while(stmt, env)

        elif isinstance(stmt, ForLoop):
            self.exec_for(stmt, env)

    def exec_if(self, stmt, env):
        if self.eval_expr(stmt.condition, env):
            self.exec_block(stmt.then_block, env)
            return
        for condition, block in stmt.elif_blocks:
            if self.eval_expr(condition, env):
                self.exec_block(block, env)
                return
        if stmt.else_block:
            self.exec_block(stmt.else_block, env)

    def exec_while(self, stmt, env):
        while self.eval_expr(stmt.condition, env):
            try:
                self.exec_block(stmt.body, env)
            except BreakSignal:
                break
            except ContinueSignal:
                continue

    def exec_for(self, stmt, env):
        iterable = self.eval_expr(stmt.iterable, env)
        for item in iterable:
            env.set(stmt.variable, item)
            try:
                self.exec_block(stmt.body, env)
            except BreakSignal:
                break
            except ContinueSignal:
                continue

    def exec_block(self, statements, env):
        for stmt in statements:
            self.exec_statement(stmt, env)

    def eval_expr(self, expr, env):
        if isinstance(expr, IntegerLiteral):
            return expr.value
        if isinstance(expr, FloatLiteral):
            return expr.value
        if isinstance(expr, StringLiteral):
            return self.interpolate_string(expr.value, env)
        if isinstance(expr, BooleanLiteral):
            return expr.value
        if isinstance(expr, ColorLiteral):
            return expr.value
        if isinstance(expr, Identifier):
            return env.get(expr.name)
        if isinstance(expr, BinaryOp):
            return self.eval_binary(expr, env)
        if isinstance(expr, UnaryOp):
            operand = self.eval_expr(expr.operand, env)
            if expr.operator == '-':
                return -operand
            if expr.operator == 'not':
                return not operand
            if expr.operator == '~':
                return ~operand
            return +operand
        if isinstance(expr, FunctionCall):
            return self.eval_call(expr, env)
        if isinstance(expr, ListLiteral):
            return [self.eval_expr(e, env) for e in expr.elements]
        if isinstance(expr, DictLiteral):
            return {self.eval_expr(k, env): self.eval_expr(v, env) for k, v in expr.pairs}
        if isinstance(expr, SetLiteral):
            return {self.eval_expr(e, env) for e in expr.elements}
        if isinstance(expr, TupleLiteral):
            return tuple(self.eval_expr(e, env) for e in expr.elements)
        if isinstance(expr, RangeExpression):
            start = self.eval_expr(expr.start, env)
            end = self.eval_expr(expr.end, env)
            return range(start, end)
        if isinstance(expr, MemberAccess):
            obj = self.eval_expr(expr.object, env)
            name = expr.member
            # Support dict dot access and built-in methods
            if isinstance(obj, dict):
                if name == 'keys':
                    return lambda: list(obj.keys())
                if name == 'values':
                    return lambda: list(obj.values())
                if name == 'items':
                    return lambda: list(obj.items())
                if name in obj:
                    return obj[name]
            if isinstance(obj, list):
                if name == 'append':
                    return lambda val: obj.append(val)
                if name == 'pop':
                    return lambda: obj.pop()
                if name == 'length':
                    return len(obj)
            if isinstance(obj, str):
                if name == 'length':
                    return len(obj)
                if name == 'upper':
                    return lambda: obj.upper()
                if name == 'lower':
                    return lambda: obj.lower()
                if name == 'split':
                    return lambda sep=" ": obj.split(sep)
                if name == 'strip':
                    return lambda: obj.strip()
                if name == 'replace':
                    return lambda old, new: obj.replace(old, new)
                if name == 'startswith':
                    return lambda prefix: obj.startswith(prefix)
                if name == 'endswith':
                    return lambda suffix: obj.endswith(suffix)
                if name == 'contains':
                    return lambda sub: sub in obj
            raise AttributeError(f"'{type(obj).__name__}' has no attribute '{name}'")
        if isinstance(expr, IndexAccess):
            obj = self.eval_expr(expr.object, env)
            index = self.eval_expr(expr.index, env)
            return obj[index]
        if isinstance(expr, VectorLiteral):
            return tuple(self.eval_expr(c, env) for c in expr.components)
        raise RuntimeError(f"Unknown expression: {type(expr).__name__}")

    def eval_binary(self, expr, env):
        left = self.eval_expr(expr.left, env)
        right = self.eval_expr(expr.right, env)
        op = expr.operator
        ops = {
            '+': lambda a, b: a+b, '-': lambda a, b: a-b,
            '*': lambda a, b: a*b, '/': lambda a, b: a/b,
            '%': lambda a, b: a%b, '**': lambda a, b: a**b,
            '==': lambda a, b: a==b, '!=': lambda a, b: a!=b,
            '<': lambda a, b: a<b, '>': lambda a, b: a>b,
            '<=': lambda a, b: a<=b, '>=': lambda a, b: a>=b,
            'and': lambda a, b: a and b, 'or': lambda a, b: a or b,
            '&': lambda a, b: a & b, '|': lambda a, b: a | b,
            '^': lambda a, b: a ^ b,
        }
        if op in ops:
            return ops[op](left, right)
        raise RuntimeError(f"Unknown operator: {op}")

    def interpolate_string(self, s, env):
        """Handle {var} interpolation in strings"""
        import re
        def replacer(match):
            varname = match.group(1)
            try:
                return str(env.get(varname))
            except NameError:
                return match.group(0)
        return re.sub(r'\{(\w+)\}', replacer, s)

    def eval_call(self, expr, env):
        if isinstance(expr.function, Identifier):
            name = expr.function.name
            builtins = {
                'print': lambda args: print(*args),
                'len': lambda args: len(args[0]),
                'range': lambda args: range(*args),
                'str': lambda args: str(args[0]),
                'int': lambda args: int(args[0]),
                'float': lambda args: float(args[0]),
                'bool': lambda args: bool(args[0]),
                'type': lambda args: type(args[0]).__name__,
                'abs': lambda args: abs(args[0]),
                'min': lambda args: min(*args) if len(args) > 1 else min(args[0]),
                'max': lambda args: max(*args) if len(args) > 1 else max(args[0]),
                'sum': lambda args: sum(args[0]),
                'sorted': lambda args: sorted(args[0]),
                'reversed': lambda args: list(reversed(args[0])),
                'enumerate': lambda args: list(enumerate(args[0])),
                'zip': lambda args: list(zip(*args)),
                'map': lambda args: list(map(args[0], args[1])),
                'filter': lambda args: list(filter(args[0], args[1])),
                'input': lambda args: input(args[0] if args else ''),
                'list': lambda args: list(args[0]) if args else [],
                'dict': lambda args: dict(args[0]) if args else {},
                'set': lambda args: set(args[0]) if args else set(),
                'round': lambda args: round(args[0], args[1] if len(args) > 1 else 0),
                'chr': lambda args: chr(args[0]),
                'ord': lambda args: ord(args[0]),
                'hex': lambda args: hex(args[0]),
                'bin': lambda args: bin(args[0]),
                'isinstance': lambda args: isinstance(args[0], args[1]),
            }
            if name in builtins:
                args = [self.eval_expr(a, env) for a in expr.arguments]
                return builtins[name](args)

        func = self.eval_expr(expr.function, env)

        # Handle lambda-like callables from member access
        if callable(func):
            args = [self.eval_expr(a, env) for a in expr.arguments]
            return func(*args)

        if not isinstance(func, FunctionDefinition):
            raise RuntimeError(f"'{func}' is not callable")

        args = [self.eval_expr(a, env) for a in expr.arguments]
        # Use closure environment if available, otherwise global
        parent_env = getattr(func, '_closure_env', self.global_env)
        call_env = Environment(parent=parent_env)
        for param, arg in zip(func.parameters, args):
            call_env.set(param.name, arg)

        try:
            self.exec_block(func.body, call_env)
        except ReturnSignal as ret:
            return ret.value
        return None
