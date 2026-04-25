"""
BlackRoad OS Language - AST Node Definitions
Abstract Syntax Tree node classes for representing program structure
"""

from dataclasses import dataclass, field
from typing import List, Optional, Union, Any
from enum import Enum

# ============================================================================
# Base Node Classes
# ============================================================================

@dataclass
class ASTNode:
    """Base class for all AST nodes"""
    line: int = field(default=0, kw_only=True)
    column: int = field(default=0, kw_only=True)

# ============================================================================
# Type Nodes
# ============================================================================

@dataclass
class TypeNode(ASTNode):
    """Base class for type annotations"""
    pass

@dataclass
class PrimitiveType(TypeNode):
    """Primitive types: int, float, string, bool, etc."""
    name: str

@dataclass
class VectorType(TypeNode):
    """Vector types: vec2, vec3, vec4"""
    dimension: int  # 2, 3, or 4

@dataclass
class ListType(TypeNode):
    """List type: list[T]"""
    element_type: TypeNode

@dataclass
class DictType(TypeNode):
    """Dictionary type: dict[K, V]"""
    key_type: TypeNode
    value_type: TypeNode

@dataclass
class SetType(TypeNode):
    """Set type: set[T]"""
    element_type: TypeNode

@dataclass
class TupleType(TypeNode):
    """Tuple type: (T1, T2, ...)"""
    element_types: List[TypeNode]

@dataclass
class FunctionType(TypeNode):
    """Function type: (Args...) -> Return"""
    param_types: List[TypeNode]
    return_type: TypeNode

@dataclass
class CustomType(TypeNode):
    """User-defined type"""
    name: str

# ============================================================================
# Expression Nodes
# ============================================================================

@dataclass
class Expression(ASTNode):
    """Base class for expressions"""
    pass

@dataclass
class IntegerLiteral(Expression):
    """Integer literal: 42"""
    value: int

@dataclass
class FloatLiteral(Expression):
    """Float literal: 3.14"""
    value: float

@dataclass
class StringLiteral(Expression):
    """String literal: "hello" """
    value: str

@dataclass
class BooleanLiteral(Expression):
    """Boolean literal: true/false"""
    value: bool

@dataclass
class ColorLiteral(Expression):
    """Color literal: #FF1D6C"""
    value: str

@dataclass
class VectorLiteral(Expression):
    """Vector literal: vec3(1, 2, 3)"""
    dimension: int
    components: List[Expression]

@dataclass
class ListLiteral(Expression):
    """List literal: [1, 2, 3]"""
    elements: List[Expression]

@dataclass
class DictLiteral(Expression):
    """Dictionary literal: {key: value}"""
    pairs: List[tuple[Expression, Expression]]

@dataclass
class SetLiteral(Expression):
    """Set literal: {1, 2, 3}"""
    elements: List[Expression]

@dataclass
class TupleLiteral(Expression):
    """Tuple literal: (1, 2, 3)"""
    elements: List[Expression]

@dataclass
class Identifier(Expression):
    """Variable reference: x"""
    name: str

@dataclass
class BinaryOp(Expression):
    """Binary operation: a + b"""
    left: Expression
    operator: str
    right: Expression

@dataclass
class UnaryOp(Expression):
    """Unary operation: -x, not y"""
    operator: str
    operand: Expression

@dataclass
class FunctionCall(Expression):
    """Function call: foo(a, b, c)"""
    function: Expression
    arguments: List[Expression]

@dataclass
class MemberAccess(Expression):
    """Member access: obj.field"""
    object: Expression
    member: str

@dataclass
class IndexAccess(Expression):
    """Index access: arr[i]"""
    object: Expression
    index: Expression

@dataclass
class LambdaExpression(Expression):
    """Lambda: (x, y) -> x + y"""
    parameters: List['Parameter']
    body: Expression

@dataclass
class RangeExpression(Expression):
    """Range: 0..10"""
    start: Expression
    end: Expression

@dataclass
class MatchExpression(Expression):
    """Match expression: match x: ..."""
    value: Expression
    cases: List['MatchCase']

# ============================================================================
# Statement Nodes
# ============================================================================

@dataclass
class Statement(ASTNode):
    """Base class for statements"""
    pass

@dataclass
class VariableDeclaration(Statement):
    """Variable declaration: let x: int = 42"""
    name: str
    type_annotation: Optional[TypeNode]
    initializer: Optional[Expression]
    is_mutable: bool  # var vs let
    is_const: bool    # const

@dataclass
class Assignment(Statement):
    """Assignment: x = 42"""
    target: Expression  # Can be Identifier, MemberAccess, or IndexAccess
    value: Expression

@dataclass
class CompoundAssignment(Statement):
    """Compound assignment: x += 1"""
    target: Expression
    operator: str  # +=, -=, *=, /=
    value: Expression

@dataclass
class ExpressionStatement(Statement):
    """Expression as statement"""
    expression: Expression

@dataclass
class ReturnStatement(Statement):
    """Return statement: return x"""
    value: Optional[Expression]

@dataclass
class BreakStatement(Statement):
    """Break statement"""
    pass

@dataclass
class ContinueStatement(Statement):
    """Continue statement"""
    pass

@dataclass
class IfStatement(Statement):
    """If statement: if cond: ..."""
    condition: Expression
    then_block: List[Statement]
    elif_blocks: List[tuple[Expression, List[Statement]]]
    else_block: Optional[List[Statement]]

@dataclass
class MatchStatement(Statement):
    """Match statement: match x: ..."""
    value: Expression
    cases: List['MatchCase']

@dataclass
class MatchCase(ASTNode):
    """Match case: pattern -> body"""
    pattern: 'Pattern'
    body: List[Statement]

@dataclass
class Pattern(ASTNode):
    """Pattern for match statement"""
    pass

@dataclass
class LiteralPattern(Pattern):
    """Literal pattern: 42, "hello" """
    value: Expression

@dataclass
class RangePattern(Pattern):
    """Range pattern: 1..10"""
    start: Expression
    end: Expression

@dataclass
class WildcardPattern(Pattern):
    """Wildcard pattern: _"""
    pass

@dataclass
class IdentifierPattern(Pattern):
    """Identifier pattern: x (binds value to x)"""
    name: str

@dataclass
class ConstructorPattern(Pattern):
    """Constructor pattern: Status.Active(id)"""
    type_name: str
    variant: str
    fields: List[Pattern]

@dataclass
class ForLoop(Statement):
    """For loop: for x in items: ..."""
    variable: str
    iterable: Expression
    body: List[Statement]

@dataclass
class WhileLoop(Statement):
    """While loop: while cond: ..."""
    condition: Expression
    body: List[Statement]

# ============================================================================
# Function & Type Definitions
# ============================================================================

@dataclass
class Parameter(ASTNode):
    """Function parameter"""
    name: str
    type_annotation: Optional[TypeNode]
    default_value: Optional[Expression]
    is_variadic: bool  # ...args

@dataclass
class FunctionDefinition(Statement):
    """Function definition: fun foo(x: int) -> int: ..."""
    name: str
    parameters: List[Parameter]
    return_type: Optional[TypeNode]
    body: List[Statement]
    is_async: bool
    is_exported: bool

@dataclass
class TypeDefinition(Statement):
    """Type definition: type User: ..."""
    name: str
    fields: List['TypeField']
    is_exported: bool

@dataclass
class TypeField(ASTNode):
    """Field in type definition"""
    name: str
    type_annotation: TypeNode
    default_value: Optional[Expression]

@dataclass
class EnumVariant(ASTNode):
    """Variant in enum definition"""
    name: str
    fields: Optional[List[TypeField]]

# ============================================================================
# 3D/Spatial Nodes
# ============================================================================

@dataclass
class SpaceDefinition(Statement):
    """3D space definition: space MyScene: ..."""
    name: str
    objects: List['Object3D']

@dataclass
class Object3D(ASTNode):
    """Base class for 3D objects"""
    name: str
    properties: List['Property3D']

@dataclass
class CubeObject(Object3D):
    """Cube object"""
    pass

@dataclass
class SphereObject(Object3D):
    """Sphere object"""
    pass

@dataclass
class PlaneObject(Object3D):
    """Plane object"""
    pass

@dataclass
class LightObject(Object3D):
    """Light object"""
    pass

@dataclass
class CameraObject(Object3D):
    """Camera object"""
    pass

@dataclass
class Property3D(ASTNode):
    """Property of 3D object"""
    name: str
    value: Expression

# ============================================================================
# Module System
# ============================================================================

@dataclass
class ModuleDeclaration(Statement):
    """Module declaration: module math"""
    name: str

@dataclass
class ImportStatement(Statement):
    """Import statement: import math"""
    module_path: str
    alias: Optional[str]
    items: Optional[List[str]]  # For 'from x import y, z'

@dataclass
class ExportStatement(Statement):
    """Export statement: export fun foo(): ..."""
    statement: Statement

# ============================================================================
# Concurrency
# ============================================================================

@dataclass
class SpawnStatement(Statement):
    """Spawn concurrent task: spawn: ..."""
    body: List[Statement]

@dataclass
class AwaitExpression(Expression):
    """Await expression: await foo()"""
    expression: Expression

@dataclass
class SelectStatement(Statement):
    """Select statement: select: case ..."""
    cases: List['SelectCase']

@dataclass
class SelectCase(ASTNode):
    """Select case: case x = <-ch: ..."""
    variable: Optional[str]
    channel: Expression
    body: List[Statement]

# ============================================================================
# Program Root
# ============================================================================

@dataclass
class Program(ASTNode):
    """Root program node"""
    statements: List[Statement]

# ============================================================================
# Visitor Pattern (for AST traversal)
# ============================================================================

class ASTVisitor:
    """Base class for AST visitors"""

    def visit(self, node: ASTNode):
        """Visit a node"""
        method_name = f'visit_{node.__class__.__name__}'
        visitor = getattr(self, method_name, self.generic_visit)
        return visitor(node)

    def generic_visit(self, node: ASTNode):
        """Generic visit method"""
        raise Exception(f'No visit_{node.__class__.__name__} method')
