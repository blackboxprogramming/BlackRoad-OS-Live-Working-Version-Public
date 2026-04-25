"""
BlackRoad OS Language Parser
Transforms tokens into an Abstract Syntax Tree (AST)
"""

from typing import List, Optional, Union
from lexer import Token, TokenType, lex
from ast_nodes import *

class Parser:
    """Recursive descent parser for BlackRoad language"""

    def __init__(self, tokens: List[Token]):
        self.tokens = tokens
        self.pos = 0

    def current_token(self) -> Token:
        """Get current token"""
        if self.pos >= len(self.tokens):
            return self.tokens[-1]  # EOF
        return self.tokens[self.pos]

    def peek_token(self, offset: int = 1) -> Token:
        """Look ahead at token"""
        pos = self.pos + offset
        if pos >= len(self.tokens):
            return self.tokens[-1]  # EOF
        return self.tokens[pos]

    def advance(self) -> Token:
        """Move to next token"""
        token = self.current_token()
        if token.type != TokenType.EOF:
            self.pos += 1
        return token

    def expect(self, token_type: TokenType) -> Token:
        """Expect a specific token type"""
        token = self.current_token()
        if token.type != token_type:
            raise SyntaxError(f"Expected {token_type.name}, got {token.type.name} at {token.line}:{token.column}")
        return self.advance()

    def match(self, *token_types: TokenType) -> bool:
        """Check if current token matches any of the given types"""
        return self.current_token().type in token_types

    def skip_newlines(self):
        """Skip NEWLINE tokens"""
        while self.match(TokenType.NEWLINE):
            self.advance()

    # ========================================================================
    # Program & Statements
    # ========================================================================

    def parse_program(self) -> Program:
        """Parse entire program"""
        statements = []
        self.skip_newlines()

        while not self.match(TokenType.EOF):
            stmt = self.parse_statement()
            if stmt:
                statements.append(stmt)
            self.skip_newlines()

        token = self.current_token()
        return Program(statements, line=token.line, column=token.column)

    def parse_statement(self) -> Optional[Statement]:
        """Parse a statement"""
        self.skip_newlines()

        # Module declaration
        if self.match(TokenType.MODULE):
            return self.parse_module_declaration()

        # Import statement
        if self.match(TokenType.IMPORT, TokenType.FROM):
            return self.parse_import_statement()

        # Function definition
        if self.match(TokenType.FUN, TokenType.ASYNC):
            return self.parse_function_definition()

        # Type definition
        if self.match(TokenType.TYPE):
            return self.parse_type_definition()

        # Space definition (3D)
        if self.match(TokenType.SPACE):
            return self.parse_space_definition()

        # Variable declaration
        if self.match(TokenType.LET, TokenType.VAR, TokenType.CONST):
            return self.parse_variable_declaration()

        # Control flow
        if self.match(TokenType.IF):
            return self.parse_if_statement()

        if self.match(TokenType.MATCH):
            return self.parse_match_statement()

        if self.match(TokenType.FOR):
            return self.parse_for_loop()

        if self.match(TokenType.WHILE):
            return self.parse_while_loop()

        # Return, break, continue
        if self.match(TokenType.RETURN):
            return self.parse_return_statement()

        if self.match(TokenType.BREAK):
            token = self.advance()
            return BreakStatement(line=token.line, column=token.column)

        if self.match(TokenType.CONTINUE):
            token = self.advance()
            return ContinueStatement(line=token.line, column=token.column)

        # Spawn (concurrency)
        if self.match(TokenType.SPAWN):
            return self.parse_spawn_statement()

        # Export
        if self.match(TokenType.EXPORT):
            token = self.advance()
            stmt = self.parse_statement()
            return ExportStatement(stmt, line=token.line, column=token.column)

        # Expression statement or assignment
        return self.parse_expression_or_assignment()

    def parse_module_declaration(self) -> ModuleDeclaration:
        """Parse module declaration: module math"""
        token = self.expect(TokenType.MODULE)
        name_token = self.expect(TokenType.IDENTIFIER)
        return ModuleDeclaration(name_token.value, line=token.line, column=token.column)

    def parse_import_statement(self) -> ImportStatement:
        """Parse import statement"""
        token = self.current_token()

        if self.match(TokenType.FROM):
            # from math import factorial, fibonacci
            self.advance()
            module_token = self.expect(TokenType.IDENTIFIER)
            self.expect(TokenType.IMPORT)

            items = []
            items.append(self.expect(TokenType.IDENTIFIER).value)
            while self.match(TokenType.COMMA):
                self.advance()
                items.append(self.expect(TokenType.IDENTIFIER).value)

            return ImportStatement(module_token.value, None, items, line=token.line, column=token.column)
        else:
            # import math or import http as network
            self.expect(TokenType.IMPORT)
            module_token = self.expect(TokenType.IDENTIFIER)

            alias = None
            if self.match(TokenType.IDENTIFIER) and self.current_token().value == 'as':
                self.advance()
                alias = self.expect(TokenType.IDENTIFIER).value

            return ImportStatement(module_token.value, alias, None, line=token.line, column=token.column)

    def parse_variable_declaration(self) -> VariableDeclaration:
        """Parse variable declaration: let x: int = 42"""
        token = self.current_token()
        is_const = self.match(TokenType.CONST)
        is_mutable = self.match(TokenType.VAR)
        self.advance()  # let, var, or const

        name_token = self.expect(TokenType.IDENTIFIER)
        name = name_token.value

        # Optional type annotation
        type_annotation = None
        if self.match(TokenType.COLON):
            self.advance()
            type_annotation = self.parse_type()

        # Optional initializer
        initializer = None
        if self.match(TokenType.ASSIGN):
            self.advance()
            initializer = self.parse_expression()

        return VariableDeclaration(
            name, type_annotation, initializer,
            is_mutable, is_const,
            line=token.line, column=token.column
        )

    def parse_function_definition(self) -> FunctionDefinition:
        """Parse function definition"""
        token = self.current_token()
        is_async = False

        if self.match(TokenType.ASYNC):
            is_async = True
            self.advance()

        self.expect(TokenType.FUN)
        name_token = self.expect(TokenType.IDENTIFIER)
        name = name_token.value

        # Parameters
        self.expect(TokenType.LPAREN)
        parameters = self.parse_parameters()
        self.expect(TokenType.RPAREN)

        # Return type
        return_type = None
        if self.match(TokenType.ARROW):
            self.advance()
            return_type = self.parse_type()

        # Body
        self.expect(TokenType.COLON)
        self.skip_newlines()
        self.expect(TokenType.INDENT)
        body = self.parse_block()
        self.expect(TokenType.DEDENT)

        return FunctionDefinition(
            name, parameters, return_type, body, is_async, False,
            line=token.line, column=token.column
        )

    def parse_parameters(self) -> List[Parameter]:
        """Parse function parameters"""
        parameters = []

        if self.match(TokenType.RPAREN):
            return parameters

        while True:
            param_token = self.current_token()

            # Check for variadic parameter
            is_variadic = False
            if self.match(TokenType.TRIPLE_DOT):
                is_variadic = True
                self.advance()

            name = self.expect(TokenType.IDENTIFIER).value

            # Optional type annotation
            type_annotation = None
            if self.match(TokenType.COLON):
                self.advance()
                type_annotation = self.parse_type()

            # Optional default value
            default_value = None
            if self.match(TokenType.ASSIGN):
                self.advance()
                default_value = self.parse_expression()

            parameters.append(Parameter(
                name, type_annotation, default_value, is_variadic,
                line=param_token.line, column=param_token.column
            ))

            if not self.match(TokenType.COMMA):
                break
            self.advance()

        return parameters

    def parse_block(self) -> List[Statement]:
        """Parse a block of statements"""
        statements = []
        self.skip_newlines()

        while not self.match(TokenType.DEDENT, TokenType.EOF):
            stmt = self.parse_statement()
            if stmt:
                statements.append(stmt)
            self.skip_newlines()

        return statements

    def parse_if_statement(self) -> IfStatement:
        """Parse if statement"""
        token = self.expect(TokenType.IF)
        condition = self.parse_expression()
        self.expect(TokenType.COLON)
        self.skip_newlines()
        self.expect(TokenType.INDENT)
        then_block = self.parse_block()
        self.expect(TokenType.DEDENT)

        # Elif blocks
        elif_blocks = []
        while self.match(TokenType.ELIF):
            self.advance()
            elif_condition = self.parse_expression()
            self.expect(TokenType.COLON)
            self.skip_newlines()
            self.expect(TokenType.INDENT)
            elif_block = self.parse_block()
            self.expect(TokenType.DEDENT)
            elif_blocks.append((elif_condition, elif_block))

        # Else block
        else_block = None
        if self.match(TokenType.ELSE):
            self.advance()
            self.expect(TokenType.COLON)
            self.skip_newlines()
            self.expect(TokenType.INDENT)
            else_block = self.parse_block()
            self.expect(TokenType.DEDENT)

        return IfStatement(condition, then_block, elif_blocks, else_block, line=token.line, column=token.column)

    def parse_for_loop(self) -> ForLoop:
        """Parse for loop"""
        token = self.expect(TokenType.FOR)
        variable = self.expect(TokenType.IDENTIFIER).value

        # Check for 'in' keyword
        if not (self.match(TokenType.IDENTIFIER) and self.current_token().value == 'in'):
            raise SyntaxError(f"Expected 'in' in for loop at {self.current_token().line}:{self.current_token().column}")
        self.advance()

        iterable = self.parse_expression()
        self.expect(TokenType.COLON)
        self.skip_newlines()
        self.expect(TokenType.INDENT)
        body = self.parse_block()
        self.expect(TokenType.DEDENT)

        return ForLoop(variable, iterable, body, line=token.line, column=token.column)

    def parse_while_loop(self) -> WhileLoop:
        """Parse while loop"""
        token = self.expect(TokenType.WHILE)
        condition = self.parse_expression()
        self.expect(TokenType.COLON)
        self.skip_newlines()
        self.expect(TokenType.INDENT)
        body = self.parse_block()
        self.expect(TokenType.DEDENT)

        return WhileLoop(condition, body, line=token.line, column=token.column)

    def parse_return_statement(self) -> ReturnStatement:
        """Parse return statement"""
        token = self.expect(TokenType.RETURN)

        value = None
        if not self.match(TokenType.NEWLINE, TokenType.EOF, TokenType.DEDENT):
            value = self.parse_expression()

        return ReturnStatement(value, line=token.line, column=token.column)

    def parse_expression_or_assignment(self) -> Union[ExpressionStatement, Assignment, CompoundAssignment]:
        """Parse expression statement or assignment"""
        expr = self.parse_expression()

        # Check for assignment
        if self.match(TokenType.ASSIGN):
            token = self.advance()
            value = self.parse_expression()
            return Assignment(expr, value, line=token.line, column=token.column)

        # Check for compound assignment
        if self.match(TokenType.PLUS_ASSIGN, TokenType.MINUS_ASSIGN,
                      TokenType.STAR_ASSIGN, TokenType.SLASH_ASSIGN):
            token = self.advance()
            value = self.parse_expression()
            return CompoundAssignment(expr, token.value, value, line=token.line, column=token.column)

        return ExpressionStatement(expr, line=expr.line, column=expr.column)

    # ========================================================================
    # Type Parsing
    # ========================================================================

    def parse_type(self) -> TypeNode:
        """Parse type annotation"""
        token = self.current_token()

        # Primitive types
        if self.match(TokenType.INT, TokenType.FLOAT_TYPE, TokenType.STRING_TYPE,
                      TokenType.BOOL_TYPE, TokenType.BYTE, TokenType.CHAR,
                      TokenType.COLOR_TYPE, TokenType.ANY):
            name = self.advance().value
            return PrimitiveType(name, line=token.line, column=token.column)

        # Vector types
        if self.match(TokenType.VEC2):
            self.advance()
            return VectorType(2, line=token.line, column=token.column)
        if self.match(TokenType.VEC3):
            self.advance()
            return VectorType(3, line=token.line, column=token.column)
        if self.match(TokenType.VEC4):
            self.advance()
            return VectorType(4, line=token.line, column=token.column)

        # Collection types
        if self.match(TokenType.LIST):
            self.advance()
            self.expect(TokenType.LBRACKET)
            element_type = self.parse_type()
            self.expect(TokenType.RBRACKET)
            return ListType(element_type, line=token.line, column=token.column)

        if self.match(TokenType.DICT):
            self.advance()
            self.expect(TokenType.LBRACKET)
            key_type = self.parse_type()
            self.expect(TokenType.COMMA)
            value_type = self.parse_type()
            self.expect(TokenType.RBRACKET)
            return DictType(key_type, value_type, line=token.line, column=token.column)

        if self.match(TokenType.SET):
            self.advance()
            self.expect(TokenType.LBRACKET)
            element_type = self.parse_type()
            self.expect(TokenType.RBRACKET)
            return SetType(element_type, line=token.line, column=token.column)

        # Custom type
        if self.match(TokenType.IDENTIFIER):
            name = self.advance().value
            return CustomType(name, line=token.line, column=token.column)

        raise SyntaxError(f"Expected type at {token.line}:{token.column}")

    # ========================================================================
    # Expression Parsing (Operator Precedence)
    # ========================================================================

    def parse_expression(self) -> Expression:
        """Parse expression (top level - lowest precedence)"""
        return self.parse_or_expression()

    def parse_or_expression(self) -> Expression:
        """Parse logical OR expression"""
        left = self.parse_and_expression()

        while self.match(TokenType.OR):
            op_token = self.advance()
            right = self.parse_and_expression()
            left = BinaryOp(left, 'or', right, line=op_token.line, column=op_token.column)

        return left

    def parse_and_expression(self) -> Expression:
        """Parse logical AND expression"""
        left = self.parse_not_expression()

        while self.match(TokenType.AND):
            op_token = self.advance()
            right = self.parse_not_expression()
            left = BinaryOp(left, 'and', right, line=op_token.line, column=op_token.column)

        return left

    def parse_not_expression(self) -> Expression:
        """Parse logical NOT expression"""
        if self.match(TokenType.NOT):
            op_token = self.advance()
            operand = self.parse_not_expression()
            return UnaryOp('not', operand, line=op_token.line, column=op_token.column)

        return self.parse_comparison_expression()

    def parse_comparison_expression(self) -> Expression:
        """Parse comparison expression"""
        left = self.parse_additive_expression()

        while self.match(TokenType.EQ, TokenType.NE, TokenType.LT,
                          TokenType.GT, TokenType.LE, TokenType.GE):
            op_token = self.advance()
            right = self.parse_additive_expression()
            left = BinaryOp(left, op_token.value, right, line=op_token.line, column=op_token.column)

        return left

    def parse_additive_expression(self) -> Expression:
        """Parse addition/subtraction expression"""
        left = self.parse_multiplicative_expression()

        while self.match(TokenType.PLUS, TokenType.MINUS):
            op_token = self.advance()
            right = self.parse_multiplicative_expression()
            left = BinaryOp(left, op_token.value, right, line=op_token.line, column=op_token.column)

        return left

    def parse_multiplicative_expression(self) -> Expression:
        """Parse multiplication/division expression"""
        left = self.parse_power_expression()

        while self.match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT):
            op_token = self.advance()
            right = self.parse_power_expression()
            left = BinaryOp(left, op_token.value, right, line=op_token.line, column=op_token.column)

        return left

    def parse_power_expression(self) -> Expression:
        """Parse exponentiation (right-associative)"""
        base = self.parse_unary_expression()

        if self.match(TokenType.POWER):
            op_token = self.advance()
            exponent = self.parse_power_expression()  # right-associative
            return BinaryOp(base, op_token.value, exponent, line=op_token.line, column=op_token.column)

        return base

    def parse_unary_expression(self) -> Expression:
        """Parse unary expression"""
        if self.match(TokenType.MINUS, TokenType.PLUS):
            op_token = self.advance()
            operand = self.parse_unary_expression()
            return UnaryOp(op_token.value, operand, line=op_token.line, column=op_token.column)

        # Await expression
        if self.match(TokenType.AWAIT):
            op_token = self.advance()
            operand = self.parse_unary_expression()
            return AwaitExpression(operand, line=op_token.line, column=op_token.column)

        return self.parse_postfix_expression()

    def parse_postfix_expression(self) -> Expression:
        """Parse postfix expression (function call, member access, indexing)"""
        expr = self.parse_primary_expression()

        while True:
            # Function call
            if self.match(TokenType.LPAREN):
                token = self.advance()
                arguments = self.parse_arguments()
                self.expect(TokenType.RPAREN)
                expr = FunctionCall(expr, arguments, line=token.line, column=token.column)

            # Member access
            elif self.match(TokenType.DOT):
                token = self.advance()
                member = self.expect(TokenType.IDENTIFIER).value
                expr = MemberAccess(expr, member, line=token.line, column=token.column)

            # Index access
            elif self.match(TokenType.LBRACKET):
                token = self.advance()
                index = self.parse_expression()
                self.expect(TokenType.RBRACKET)
                expr = IndexAccess(expr, index, line=token.line, column=token.column)

            else:
                break

        return expr

    def parse_arguments(self) -> List[Expression]:
        """Parse function call arguments"""
        arguments = []

        if self.match(TokenType.RPAREN):
            return arguments

        while True:
            arguments.append(self.parse_expression())

            if not self.match(TokenType.COMMA):
                break
            self.advance()

        return arguments

    def parse_primary_expression(self) -> Expression:
        """Parse primary expression (literals, identifiers, parenthesized)"""
        token = self.current_token()

        # Integer literal
        if self.match(TokenType.INTEGER):
            self.advance()
            return IntegerLiteral(token.value, line=token.line, column=token.column)

        # Float literal
        if self.match(TokenType.FLOAT):
            self.advance()
            return FloatLiteral(token.value, line=token.line, column=token.column)

        # String literal
        if self.match(TokenType.STRING):
            self.advance()
            return StringLiteral(token.value, line=token.line, column=token.column)

        # Boolean literal
        if self.match(TokenType.BOOLEAN):
            self.advance()
            return BooleanLiteral(token.value, line=token.line, column=token.column)

        # Color literal
        if self.match(TokenType.COLOR):
            self.advance()
            return ColorLiteral(token.value, line=token.line, column=token.column)

        # Vector constructor: vec3(1, 2, 3)
        if self.match(TokenType.VEC2, TokenType.VEC3, TokenType.VEC4):
            vec_token = self.advance()
            dimension = {'vec2': 2, 'vec3': 3, 'vec4': 4}[vec_token.value]
            self.expect(TokenType.LPAREN)
            components = []
            while not self.match(TokenType.RPAREN):
                components.append(self.parse_expression())
                if self.match(TokenType.COMMA):
                    self.advance()
            self.expect(TokenType.RPAREN)
            return VectorLiteral(dimension, components, line=vec_token.line, column=vec_token.column)

        # List literal: [1, 2, 3]
        if self.match(TokenType.LBRACKET):
            self.advance()
            elements = []
            while not self.match(TokenType.RBRACKET):
                elements.append(self.parse_expression())
                if self.match(TokenType.COMMA):
                    self.advance()
            self.expect(TokenType.RBRACKET)
            return ListLiteral(elements, line=token.line, column=token.column)

        # Dict literal: {key: value} or Set literal: {1, 2, 3}
        if self.match(TokenType.LBRACE):
            self.advance()

            # Empty dict
            if self.match(TokenType.RBRACE):
                self.advance()
                return DictLiteral([], line=token.line, column=token.column)

            # Check first element
            first_expr = self.parse_expression()

            # Dictionary (has colon)
            if self.match(TokenType.COLON):
                self.advance()
                first_value = self.parse_expression()
                pairs = [(first_expr, first_value)]

                while self.match(TokenType.COMMA):
                    self.advance()
                    key = self.parse_expression()
                    self.expect(TokenType.COLON)
                    value = self.parse_expression()
                    pairs.append((key, value))

                self.expect(TokenType.RBRACE)
                return DictLiteral(pairs, line=token.line, column=token.column)

            # Set (no colon)
            else:
                elements = [first_expr]
                while self.match(TokenType.COMMA):
                    self.advance()
                    elements.append(self.parse_expression())

                self.expect(TokenType.RBRACE)
                return SetLiteral(elements, line=token.line, column=token.column)

        # Parenthesized expression or tuple: (expr) or (1, 2, 3)
        if self.match(TokenType.LPAREN):
            self.advance()

            # Empty tuple
            if self.match(TokenType.RPAREN):
                self.advance()
                return TupleLiteral([], line=token.line, column=token.column)

            first_expr = self.parse_expression()

            # Tuple (has comma)
            if self.match(TokenType.COMMA):
                elements = [first_expr]
                while self.match(TokenType.COMMA):
                    self.advance()
                    if not self.match(TokenType.RPAREN):
                        elements.append(self.parse_expression())
                self.expect(TokenType.RPAREN)
                return TupleLiteral(elements, line=token.line, column=token.column)

            # Just parenthesized expression
            self.expect(TokenType.RPAREN)
            return first_expr

        # Range: 0..10
        if self.match(TokenType.INTEGER):
            start = IntegerLiteral(token.value, line=token.line, column=token.column)
            self.advance()
            if self.match(TokenType.DOUBLE_DOT):
                self.advance()
                end_token = self.expect(TokenType.INTEGER)
                end = IntegerLiteral(end_token.value, line=end_token.line, column=end_token.column)
                return RangeExpression(start, end, line=token.line, column=token.column)
            return start

        # Identifier
        if self.match(TokenType.IDENTIFIER):
            self.advance()
            return Identifier(token.value, line=token.line, column=token.column)

        raise SyntaxError(f"Unexpected token {token.type.name} at {token.line}:{token.column}")

    # ========================================================================
    # 3D/Spatial Parsing
    # ========================================================================

    def parse_space_definition(self) -> SpaceDefinition:
        """Parse 3D space definition"""
        token = self.expect(TokenType.SPACE)
        name = self.expect(TokenType.IDENTIFIER).value
        self.expect(TokenType.COLON)
        self.skip_newlines()
        self.expect(TokenType.INDENT)

        objects = []
        while not self.match(TokenType.DEDENT, TokenType.EOF):
            self.skip_newlines()
            if self.match(TokenType.CUBE, TokenType.SPHERE, TokenType.PLANE,
                          TokenType.LIGHT, TokenType.CAMERA):
                objects.append(self.parse_3d_object())
            else:
                break

        self.expect(TokenType.DEDENT)
        return SpaceDefinition(name, objects, line=token.line, column=token.column)

    def parse_3d_object(self) -> Object3D:
        """Parse 3D object"""
        token = self.current_token()
        obj_type = self.advance().type
        name = self.expect(TokenType.IDENTIFIER).value
        self.expect(TokenType.COLON)
        self.skip_newlines()
        self.expect(TokenType.INDENT)

        properties = []
        while not self.match(TokenType.DEDENT, TokenType.EOF):
            self.skip_newlines()
            # Accept identifiers or type keywords as property names
            if self.match(TokenType.IDENTIFIER, TokenType.COLOR_TYPE, TokenType.INT,
                          TokenType.FLOAT_TYPE, TokenType.STRING_TYPE, TokenType.BOOL_TYPE,
                          TokenType.VEC2, TokenType.VEC3, TokenType.VEC4):
                prop_name_token = self.advance()
                prop_name = prop_name_token.value
                self.expect(TokenType.COLON)
                prop_value = self.parse_expression()
                properties.append(Property3D(prop_name, prop_value, line=prop_name_token.line, column=prop_name_token.column))
                self.skip_newlines()
            else:
                break

        self.expect(TokenType.DEDENT)

        # Create appropriate object type
        if obj_type == TokenType.CUBE:
            return CubeObject(name, properties, line=token.line, column=token.column)
        elif obj_type == TokenType.SPHERE:
            return SphereObject(name, properties, line=token.line, column=token.column)
        elif obj_type == TokenType.PLANE:
            return PlaneObject(name, properties, line=token.line, column=token.column)
        elif obj_type == TokenType.LIGHT:
            return LightObject(name, properties, line=token.line, column=token.column)
        elif obj_type == TokenType.CAMERA:
            return CameraObject(name, properties, line=token.line, column=token.column)

    # Stubs for other complex features
    def parse_type_definition(self) -> TypeDefinition:
        """Parse type definition (stub)"""
        # TODO: Implement full type definition parsing
        pass

    def parse_match_statement(self) -> MatchStatement:
        """Parse match statement (stub)"""
        # TODO: Implement match statement parsing
        pass

    def parse_spawn_statement(self) -> SpawnStatement:
        """Parse spawn statement (stub)"""
        # TODO: Implement spawn statement parsing
        pass


def parse(source: str, filename: str = "<stdin>") -> Program:
    """Convenience function to parse source code"""
    tokens = lex(source, filename)
    parser = Parser(tokens)
    return parser.parse_program()


# Example usage
if __name__ == "__main__":
    test_code = '''
let x: int = 42
let name = "BlackRoad"

fun greet(name: string) -> string:
    return "Hello, {name}!"

space MyScene:
    cube Box1:
        position: vec3(0, 0, 0)
        color: #FF1D6C
'''

    ast = parse(test_code)
    print("AST generated successfully!")
    print(f"Program has {len(ast.statements)} statements")
    for i, stmt in enumerate(ast.statements):
        print(f"{i+1}. {stmt.__class__.__name__}")
