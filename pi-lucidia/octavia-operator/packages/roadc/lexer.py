"""
BlackRoad OS Language Lexer
Transforms source code into tokens for parsing
"""

import re
from enum import Enum, auto
from dataclasses import dataclass
from typing import List, Optional

class TokenType(Enum):
    """All possible token types in BlackRoad language"""

    # Literals
    INTEGER = auto()
    FLOAT = auto()
    STRING = auto()
    BOOLEAN = auto()
    COLOR = auto()

    # Identifiers & Keywords
    IDENTIFIER = auto()

    # Keywords - Control Flow
    IF = auto()
    ELIF = auto()
    ELSE = auto()
    MATCH = auto()
    FOR = auto()
    WHILE = auto()
    BREAK = auto()
    CONTINUE = auto()
    RETURN = auto()

    # Keywords - Declarations
    LET = auto()
    VAR = auto()
    CONST = auto()
    FUN = auto()
    ASYNC = auto()
    TYPE = auto()
    MODULE = auto()
    IMPORT = auto()
    FROM = auto()
    EXPORT = auto()

    # Keywords - 3D/Spatial
    SPACE = auto()
    CUBE = auto()
    SPHERE = auto()
    PLANE = auto()
    LIGHT = auto()
    CAMERA = auto()
    RENDER = auto()

    # Keywords - Concurrency
    SPAWN = auto()
    AWAIT = auto()
    CHAN = auto()
    SELECT = auto()
    CASE = auto()

    # Keywords - Memory
    MUT = auto()

    # Keywords - Metaprogramming
    MACRO = auto()
    COMPTIME = auto()
    ASM = auto()

    # Types
    INT = auto()
    FLOAT_TYPE = auto()
    STRING_TYPE = auto()
    BOOL_TYPE = auto()
    BYTE = auto()
    CHAR = auto()
    VEC2 = auto()
    VEC3 = auto()
    VEC4 = auto()
    COLOR_TYPE = auto()
    LIST = auto()
    DICT = auto()
    SET = auto()
    ANY = auto()

    # Operators
    PLUS = auto()           # +
    MINUS = auto()          # -
    STAR = auto()           # *
    SLASH = auto()          # /
    PERCENT = auto()        # %
    POWER = auto()          # **

    ASSIGN = auto()         # =
    PLUS_ASSIGN = auto()    # +=
    MINUS_ASSIGN = auto()   # -=
    STAR_ASSIGN = auto()    # *=
    SLASH_ASSIGN = auto()   # /=

    EQ = auto()             # ==
    NE = auto()             # !=
    LT = auto()             # <
    GT = auto()             # >
    LE = auto()             # <=
    GE = auto()             # >=

    AND = auto()            # and
    OR = auto()             # or
    NOT = auto()            # not

    AMPERSAND = auto()      # &
    PIPE = auto()           # |
    CARET = auto()          # ^
    TILDE = auto()          # ~

    # Delimiters
    LPAREN = auto()         # (
    RPAREN = auto()         # )
    LBRACKET = auto()       # [
    RBRACKET = auto()       # ]
    LBRACE = auto()         # {
    RBRACE = auto()         # }

    COLON = auto()          # :
    SEMICOLON = auto()      # ;
    COMMA = auto()          # ,
    DOT = auto()            # .
    ARROW = auto()          # ->
    DOUBLE_DOT = auto()     # ..
    TRIPLE_DOT = auto()     # ...
    AT = auto()             # @
    HASH = auto()           # #
    QUESTION = auto()       # ?
    DOLLAR = auto()         # $

    # Special
    NEWLINE = auto()
    INDENT = auto()
    DEDENT = auto()
    EOF = auto()

    # HTML-like tags for 3D
    LT_SLASH = auto()       # </
    SLASH_GT = auto()       # />

@dataclass
class Token:
    """Represents a single token"""
    type: TokenType
    value: any
    line: int
    column: int

    def __repr__(self):
        return f"Token({self.type.name}, {self.value!r}, {self.line}:{self.column})"

class Lexer:
    """BlackRoad OS Language Lexer"""

    KEYWORDS = {
        # Control flow
        'if': TokenType.IF,
        'elif': TokenType.ELIF,
        'else': TokenType.ELSE,
        'match': TokenType.MATCH,
        'for': TokenType.FOR,
        'while': TokenType.WHILE,
        'break': TokenType.BREAK,
        'continue': TokenType.CONTINUE,
        'return': TokenType.RETURN,

        # Declarations
        'let': TokenType.LET,
        'var': TokenType.VAR,
        'const': TokenType.CONST,
        'fun': TokenType.FUN,
        'async': TokenType.ASYNC,
        'type': TokenType.TYPE,
        'module': TokenType.MODULE,
        'import': TokenType.IMPORT,
        'from': TokenType.FROM,
        'export': TokenType.EXPORT,

        # 3D/Spatial
        'space': TokenType.SPACE,
        'cube': TokenType.CUBE,
        'sphere': TokenType.SPHERE,
        'plane': TokenType.PLANE,
        'light': TokenType.LIGHT,
        'camera': TokenType.CAMERA,
        'render': TokenType.RENDER,

        # Concurrency
        'spawn': TokenType.SPAWN,
        'await': TokenType.AWAIT,
        'chan': TokenType.CHAN,
        'select': TokenType.SELECT,
        'case': TokenType.CASE,

        # Memory
        'mut': TokenType.MUT,

        # Metaprogramming
        'macro': TokenType.MACRO,
        'comptime': TokenType.COMPTIME,
        'asm': TokenType.ASM,

        # Boolean literals
        'true': TokenType.BOOLEAN,
        'false': TokenType.BOOLEAN,

        # Logical operators
        'and': TokenType.AND,
        'or': TokenType.OR,
        'not': TokenType.NOT,

        # Types
        'int': TokenType.INT,
        'float': TokenType.FLOAT_TYPE,
        'string': TokenType.STRING_TYPE,
        'bool': TokenType.BOOL_TYPE,
        'byte': TokenType.BYTE,
        'char': TokenType.CHAR,
        'vec2': TokenType.VEC2,
        'vec3': TokenType.VEC3,
        'vec4': TokenType.VEC4,
        'color': TokenType.COLOR_TYPE,
        'list': TokenType.LIST,
        'dict': TokenType.DICT,
        'set': TokenType.SET,
        'any': TokenType.ANY,
    }

    def __init__(self, source: str, filename: str = "<stdin>"):
        self.source = source
        self.filename = filename
        self.pos = 0
        self.line = 1
        self.column = 1
        self.tokens: List[Token] = []
        self.indent_stack = [0]  # Track indentation levels

    def current_char(self) -> Optional[str]:
        """Get current character without advancing"""
        if self.pos >= len(self.source):
            return None
        return self.source[self.pos]

    def peek_char(self, offset: int = 1) -> Optional[str]:
        """Look ahead at character"""
        pos = self.pos + offset
        if pos >= len(self.source):
            return None
        return self.source[pos]

    def advance(self) -> Optional[str]:
        """Move to next character"""
        char = self.current_char()
        if char == '\n':
            self.line += 1
            self.column = 1
        else:
            self.column += 1
        self.pos += 1
        return char

    def skip_whitespace(self, skip_newlines: bool = False):
        """Skip whitespace (but preserve newlines for indentation unless skip_newlines=True)"""
        while self.current_char() in ' \t\r' or (skip_newlines and self.current_char() == '\n'):
            self.advance()

    def skip_comment(self):
        """Skip single-line comments starting with #"""
        if self.current_char() == '#':
            # Check for multi-line comment #[ ]#
            if self.peek_char() == '[':
                self.advance()  # #
                self.advance()  # [
                while True:
                    if self.current_char() is None:
                        raise SyntaxError(f"Unterminated multi-line comment at {self.line}:{self.column}")
                    if self.current_char() == ']' and self.peek_char() == '#':
                        self.advance()  # ]
                        self.advance()  # #
                        break
                    self.advance()
            else:
                # Single-line comment
                while self.current_char() not in ['\n', None]:
                    self.advance()

    def tokenize_number(self) -> Token:
        """Tokenize integer or float"""
        start_line = self.line
        start_column = self.column
        num_str = ''

        while self.current_char() and (self.current_char().isdigit() or self.current_char() == '.'):
            num_str += self.current_char()
            self.advance()

        # Check for scientific notation
        if self.current_char() in ['e', 'E']:
            num_str += self.current_char()
            self.advance()
            if self.current_char() in ['+', '-']:
                num_str += self.current_char()
                self.advance()
            while self.current_char() and self.current_char().isdigit():
                num_str += self.current_char()
                self.advance()

        if '.' in num_str or 'e' in num_str or 'E' in num_str:
            return Token(TokenType.FLOAT, float(num_str), start_line, start_column)
        else:
            return Token(TokenType.INTEGER, int(num_str), start_line, start_column)

    def tokenize_string(self) -> Token:
        """Tokenize string literal"""
        start_line = self.line
        start_column = self.column
        quote_char = self.current_char()
        self.advance()  # Skip opening quote

        string_value = ''
        while self.current_char() and self.current_char() != quote_char:
            if self.current_char() == '\\':
                self.advance()
                # Handle escape sequences
                escape_char = self.current_char()
                if escape_char == 'n':
                    string_value += '\n'
                elif escape_char == 't':
                    string_value += '\t'
                elif escape_char == 'r':
                    string_value += '\r'
                elif escape_char == '\\':
                    string_value += '\\'
                elif escape_char == quote_char:
                    string_value += quote_char
                else:
                    string_value += escape_char
                self.advance()
            else:
                string_value += self.current_char()
                self.advance()

        if self.current_char() != quote_char:
            raise SyntaxError(f"Unterminated string at {start_line}:{start_column}")

        self.advance()  # Skip closing quote
        return Token(TokenType.STRING, string_value, start_line, start_column)

    def tokenize_color(self) -> Token:
        """Tokenize color literal like #FF1D6C"""
        start_line = self.line
        start_column = self.column
        self.advance()  # Skip #

        color_code = '#'
        while self.current_char() and self.current_char() in '0123456789ABCDEFabcdef':
            color_code += self.current_char()
            self.advance()

        if len(color_code) not in [4, 7, 9]:  # #RGB, #RRGGBB, #RRGGBBAA
            raise SyntaxError(f"Invalid color code {color_code} at {start_line}:{start_column}")

        return Token(TokenType.COLOR, color_code, start_line, start_column)

    def tokenize_identifier(self) -> Token:
        """Tokenize identifier or keyword"""
        start_line = self.line
        start_column = self.column
        identifier = ''

        while self.current_char() and (self.current_char().isalnum() or self.current_char() == '_'):
            identifier += self.current_char()
            self.advance()

        # Check if it's a keyword
        token_type = self.KEYWORDS.get(identifier, TokenType.IDENTIFIER)

        # Special handling for boolean literals
        if token_type == TokenType.BOOLEAN:
            value = identifier == 'true'
            return Token(token_type, value, start_line, start_column)

        return Token(token_type, identifier, start_line, start_column)

    def handle_indentation(self, indent_level: int):
        """Generate INDENT/DEDENT tokens based on indentation"""
        if indent_level > self.indent_stack[-1]:
            self.indent_stack.append(indent_level)
            self.tokens.append(Token(TokenType.INDENT, indent_level, self.line, self.column))
        elif indent_level < self.indent_stack[-1]:
            while self.indent_stack and indent_level < self.indent_stack[-1]:
                self.indent_stack.pop()
                self.tokens.append(Token(TokenType.DEDENT, indent_level, self.line, self.column))
            if indent_level != self.indent_stack[-1]:
                raise SyntaxError(f"Inconsistent indentation at {self.line}:{self.column}")

    def tokenize(self) -> List[Token]:
        """Main tokenization loop"""
        while self.pos < len(self.source):
            # Handle newlines and indentation
            if self.current_char() == '\n':
                # Skip empty lines and comments
                self.advance()

                # Measure indentation on next line
                indent_level = 0
                while self.current_char() and self.current_char() in ' \t':
                    if self.current_char() == ' ':
                        indent_level += 1
                    elif self.current_char() == '\t':
                        indent_level += 4  # Tab = 4 spaces
                    self.advance()

                # Skip blank lines and comment-only lines
                if self.current_char() == '\n' or self.current_char() == '#':
                    continue

                # Handle indentation
                if self.current_char() is not None:
                    self.handle_indentation(indent_level)
                    self.tokens.append(Token(TokenType.NEWLINE, '\n', self.line, self.column))
                continue

            # Skip whitespace (but not newlines)
            if self.current_char() in ' \t\r':
                self.skip_whitespace()
                continue

            # Skip comments
            if self.current_char() == '#':
                # Check if it's a color code
                if self.peek_char() and self.peek_char() in '0123456789ABCDEFabcdef':
                    self.tokens.append(self.tokenize_color())
                else:
                    self.skip_comment()
                continue

            # Numbers
            if self.current_char().isdigit():
                self.tokens.append(self.tokenize_number())
                continue

            # Strings
            if self.current_char() in ['"', "'"]:
                self.tokens.append(self.tokenize_string())
                continue

            # Identifiers and keywords
            if self.current_char().isalpha() or self.current_char() == '_':
                self.tokens.append(self.tokenize_identifier())
                continue

            # Operators and delimiters
            char = self.current_char()
            line = self.line
            col = self.column

            # Two-character operators
            if char == '-' and self.peek_char() == '>':
                self.advance()
                self.advance()
                self.tokens.append(Token(TokenType.ARROW, '->', line, col))
                continue

            if char == '.' and self.peek_char() == '.':
                self.advance()
                self.advance()
                if self.current_char() == '.':
                    self.advance()
                    self.tokens.append(Token(TokenType.TRIPLE_DOT, '...', line, col))
                else:
                    self.tokens.append(Token(TokenType.DOUBLE_DOT, '..', line, col))
                continue

            if char == '=' and self.peek_char() == '=':
                self.advance()
                self.advance()
                self.tokens.append(Token(TokenType.EQ, '==', line, col))
                continue

            if char == '!' and self.peek_char() == '=':
                self.advance()
                self.advance()
                self.tokens.append(Token(TokenType.NE, '!=', line, col))
                continue

            if char == '<' and self.peek_char() == '=':
                self.advance()
                self.advance()
                self.tokens.append(Token(TokenType.LE, '<=', line, col))
                continue

            if char == '>' and self.peek_char() == '=':
                self.advance()
                self.advance()
                self.tokens.append(Token(TokenType.GE, '>=', line, col))
                continue

            if char == '<' and self.peek_char() == '/':
                self.advance()
                self.advance()
                self.tokens.append(Token(TokenType.LT_SLASH, '</', line, col))
                continue

            if char == '/' and self.peek_char() == '>':
                self.advance()
                self.advance()
                self.tokens.append(Token(TokenType.SLASH_GT, '/>', line, col))
                continue

            if char == '*' and self.peek_char() == '*':
                self.advance()
                self.advance()
                self.tokens.append(Token(TokenType.POWER, '**', line, col))
                continue

            # Assignment operators
            if char == '+' and self.peek_char() == '=':
                self.advance()
                self.advance()
                self.tokens.append(Token(TokenType.PLUS_ASSIGN, '+=', line, col))
                continue

            if char == '-' and self.peek_char() == '=':
                self.advance()
                self.advance()
                self.tokens.append(Token(TokenType.MINUS_ASSIGN, '-=', line, col))
                continue

            if char == '*' and self.peek_char() == '=':
                self.advance()
                self.advance()
                self.tokens.append(Token(TokenType.STAR_ASSIGN, '*=', line, col))
                continue

            if char == '/' and self.peek_char() == '=':
                self.advance()
                self.advance()
                self.tokens.append(Token(TokenType.SLASH_ASSIGN, '/=', line, col))
                continue

            # Single-character tokens
            single_char_tokens = {
                '+': TokenType.PLUS,
                '-': TokenType.MINUS,
                '*': TokenType.STAR,
                '/': TokenType.SLASH,
                '%': TokenType.PERCENT,
                '=': TokenType.ASSIGN,
                '<': TokenType.LT,
                '>': TokenType.GT,
                '(': TokenType.LPAREN,
                ')': TokenType.RPAREN,
                '[': TokenType.LBRACKET,
                ']': TokenType.RBRACKET,
                '{': TokenType.LBRACE,
                '}': TokenType.RBRACE,
                ':': TokenType.COLON,
                ';': TokenType.SEMICOLON,
                ',': TokenType.COMMA,
                '.': TokenType.DOT,
                '@': TokenType.AT,
                '?': TokenType.QUESTION,
                '$': TokenType.DOLLAR,
                '&': TokenType.AMPERSAND,
                '|': TokenType.PIPE,
                '^': TokenType.CARET,
                '~': TokenType.TILDE,
            }

            if char in single_char_tokens:
                self.advance()
                self.tokens.append(Token(single_char_tokens[char], char, line, col))
                continue

            # Unknown character
            raise SyntaxError(f"Unexpected character '{char}' at {line}:{col}")

        # Handle remaining dedents
        while len(self.indent_stack) > 1:
            self.indent_stack.pop()
            self.tokens.append(Token(TokenType.DEDENT, 0, self.line, self.column))

        # Add EOF token
        self.tokens.append(Token(TokenType.EOF, None, self.line, self.column))
        return self.tokens

def lex(source: str, filename: str = "<stdin>") -> List[Token]:
    """Convenience function to tokenize source code"""
    lexer = Lexer(source, filename)
    return lexer.tokenize()

# Example usage
if __name__ == "__main__":
    test_code = '''
# This is a test
let x: int = 42
let name = "BlackRoad"
let color = #FF1D6C

fun greet(name: string) -> string:
    return "Hello, {name}!"

space MyScene:
    cube Box1:
        position: vec3(0, 0, 0)
        color: #F5A623
'''

    tokens = lex(test_code)
    for token in tokens:
        print(token)
