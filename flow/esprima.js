interface Node {
  type: string;
}

interface Node {
  type: string;
  range?: [number, number];
  loc?: SourceLocation;
}

interface Position {
  line: number;
  column: number;
}

interface SourceLocation {
  start: Position;
  end: Position;
  source?: string | null;
}

type BindingPattern = ArrayPattern | ObjectPattern;

type Expression = ThisExpression | Identifier | Literal |
  ArrayExpression | ObjectExpression | FunctionExpression | ArrowFunctionExpression | ClassExpression |
  TaggedTemplateExpression | MemberExpression | Super | MetaProperty |
  NewExpression | CallExpression | UpdateExpression | AwaitExpression | UnaryExpression |
  BinaryExpression | LogicalExpression | ConditionalExpression |
  YieldExpression | AssignmentExpression | SequenceExpression;

interface ArrayPattern {
  type: 'ArrayPattern';
  elements: ArrayPatternElement[];
}

type ArrayPatternElement = AssignmentPattern | Identifier | BindingPattern | RestElement | null;

interface RestElement {
  type: 'RestElement';
  argument: Identifier | BindingPattern;
}

interface AssignmentPattern {
  type: 'AssignmentPattern';
  left: Identifier | BindingPattern;
  right: Expression;
}

interface ObjectPattern {
  type: 'ObjectPattern';
  properties: Property[];
}

interface ThisExpression {
  type: 'ThisExpression';
}

interface Identifier {
  type: 'Identifier';
  name: string;
}

interface Literal {
  type: 'Literal';
  value: boolean | number | string | RegExp | null;
  raw: string;
  regex?: { pattern: string, flags: string };
}

interface ArrayExpression {
  type: 'ArrayExpression';
  elements: ArrayExpressionElement[];
}

type ArrayExpressionElement = Expression | SpreadElement;

interface ObjectExpression {
  type: 'ObjectExpression';
  properties: Property[];
}

interface Property {
  type: 'Property';
  key: Identifier | Literal;
  computed: boolean;
  value: AssignmentPattern | Identifier | BindingPattern | FunctionExpression | null;
  kind: 'get' | 'set' | 'init';
  method: false;
  shorthand: boolean;
}

interface FunctionExpression {
  type: 'FunctionExpression';
  id: Identifier | null;
  params: FunctionParameter[];
  body: BlockStatement;
  generator: boolean;
  async: boolean;
  expression: boolean;
}

type FunctionParameter = AssignmentPattern | Identifier | BindingPattern;

interface FunctionExpression {
  type: 'ArrowFunctionExpression';
  id: Identifier | null;
  params: FunctionParameter[];
  body: BlockStatement | Expression;
  generator: boolean;
  async: boolean;
  expression: false;
}

interface ClassExpression {
  type: 'ClassExpression';
  id: Identifier | null;
  superClass: Identifier | null;
  body: ClassBody;
}
interface ClassBody {
  type: 'ClassBody';
  body: MethodDefinition[];
}

interface MethodDefinition {
  type: 'MethodDefinition';
  key: Expression | null;
  computed: boolean;
  value: FunctionExpression | null;
  kind: 'method' | 'constructor';
  static: boolean;
}

interface TaggedTemplateExpression {
  type: 'TaggedTemplateExpression';
  tag: Expression;
  quasi: TemplateLiteral;
}

interface TemplateElement {
  type: 'TemplateElement';
  value: { cooked: string; raw: string };
  tail: boolean;
}

interface TemplateLiteral {
  type: 'TemplateLiteral';
  quasis: TemplateElement[];
  expressions: Expression[];
}

interface MemberExpression {
  type: 'MemberExpression';
  computed: boolean;
  object: Expression;
  property: Expression;
}

interface Super {
  type: 'Super';
}

interface MetaProperty {
  type: 'MetaProperty';
  meta: Identifier;
  property: Identifier;
}

interface CallExpression {
  type: 'CallExpression';
  callee: Expression | Import;
  arguments: ArgumentListElement[];
}

interface NewExpression {
  type: 'NewExpression';
  callee: Expression;
  arguments: ArgumentListElement[];
}

interface Import {
  type: 'Import';
}

type ArgumentListElement = Expression | SpreadElement;

interface SpreadElement {
  type: 'SpreadElement';
  argument: Expression;
}

interface UpdateExpression {
  type: 'UpdateExpression';
  operator: '++' | '--';
  argument: Expression;
  prefix: boolean;
}

interface AwaitExpression {
  type: 'AwaitExpression';
  argument: Expression;
}

interface UnaryExpression {
  type: 'UnaryExpression';
  operator: '+' | '-' | '~' | '!' | 'delete' | 'void' | 'typeof';
  argument: Expression;
  prefix: true;
}

interface BinaryExpression {
  type: 'BinaryExpression';
  operator: 'instanceof' | 'in' | '+' | '-' | '*' | '/' | '%' | '**' |
    '|' | '^' | '&' | '==' | '!=' | '===' | '!==' |
    '<' | '>' | '<=' | '<<' | '>>' | '>>>';
  left: Expression;
  right: Expression;
}

interface LogicalExpression {
  type: 'LogicalExpression';
  operator: '||' | '&&';
  left: Expression;
  right: Expression;
}

interface ConditionalExpression {
  type: 'ConditionalExpression';
  test: Expression;
  consequent: Statement;
  alternate?: Statement;
}

interface YieldExpression {
  type: 'YieldExpression';
  argument: Expression | null;
  delegate: boolean;
}

interface AssignmentExpression {
  type: 'AssignmentExpression';
  operator: '=' | '*=' | '**=' | '/=' | '%=' | '+=' | '-=' |
    '<<=' | '>>=' | '>>>=' | '&=' | '^=' | '|=';
  left: Expression;
  right: Expression;
}

interface SequenceExpression {
  type: 'SequenceExpression';
  expressions: Expression[];
}

type Statement = BlockStatement | BreakStatement | ContinueStatement |
  DebuggerStatement | DoWhileStatement | EmptyStatement |
  ExpressionStatement | ForStatement | ForInStatement |
  ForOfStatement | FunctionDeclaration | IfStatement |
  LabeledStatement | ReturnStatement | SwitchStatement |
  ThrowStatement | TryStatement | VariableDeclaration |
  WhileStatement | WithStatement;

type Declaration = ClassDeclaration | FunctionDeclaration |  VariableDeclaration;

type StatementListItem = Declaration | Statement;

interface BlockStatement {
  type: 'BlockStatement';
  body: StatementListItem[];
}

interface BreakStatement {
  type: 'BreakStatement';
  label: Identifier | null;
}

interface ClassDeclaration {
  type: 'ClassDeclaration';
  id: Identifier | null;
  superClass: Identifier | null;
  body: ClassBody;
}

interface ContinueStatement {
  type: 'ContinueStatement';
  label: Identifier | null;
}

interface DebuggerStatement {
  type: 'DebuggerStatement';
}

interface DoWhileStatement {
  type: 'DoWhileStatement';
  body: Statement;
  test: Expression;
}

interface EmptyStatement {
  type: 'EmptyStatement';
}

interface ExpressionStatement {
  type: 'ExpressionStatement';
  expression: Expression;
  directive?: string;
}

interface ForStatement {
  type: 'ForStatement';
  init: Expression | null;
  test: Expression | null;
  update: Expression | null;
  body: Statement;
}

interface ForInStatement {
  type: 'ForInStatement';
  left: Expression;
  right: Expression;
  body: Statement;
  each: false;
}

interface ForOfStatement {
  type: 'ForOfStatement';
  left: Expression;
  right: Expression;
  body: Statement;
}

interface FunctionDeclaration {
  type: 'FunctionDeclaration';
  id: Identifier | null;
  params: FunctionParameter[];
  body: BlockStatement;
  generator: boolean;
  async: boolean;
  expression: false;
}

type FunctionParameter = AssignmentPattern | Identifier | BindingPattern;

interface IfStatement {
  type: 'IfStatement';
  test: Expression;
  consequent: Statement;
  alternate?: Statement;
}

interface LabeledStatement {
  type: 'LabeledStatement';
  label: Identifier;
  body: Statement;
}

interface ReturnStatement {
  type: 'ReturnStatement';
  argument: Expression | null;
}

interface SwitchStatement {
  type: 'SwitchStatement';
  discriminant: Expression;
  cases: SwitchCase[];
}

interface SwitchCase {
  type: 'SwitchCase';
  test: Expression;
  consequent: Statement[];
}

interface ThrowStatement {
  type: 'ThrowStatement';
  argument: Expression;
}

interface TryStatement {
  type: 'TryStatement';
  block: BlockStatement;
  handler: CatchClause | null;
  finalizer: BlockStatement | null;
}

interface CatchClause {
  type: 'CatchClause';
  param: Identifier | BindingPattern;
  body: BlockStatement;
}

interface VariableDeclaration {
  type: 'VariableDeclaration';
  declarations: VariableDeclarator[];
  kind: 'var' | 'const' | 'let';
}

interface VariableDeclarator {
  type: 'VariableDeclarator';
  id: Identifier | BindingPattern;
  init: Expression | null;
}

interface WhileStatement {
  type: 'WhileStatement';
  test: Expression;
  body: Statement;
}

interface WithStatement {
  type: 'WithStatement';
  object: Expression;
  body: Statement;
}

interface Program {
  type: 'Program';
  sourceType: 'script';
  body: StatementListItem[];
}

interface Program {
  type: 'Program';
  sourceType: 'module';
  body: ModuleItem[];
}

type StatementListItem = Declaration | Statement;
type ModuleItem = ImportDeclaration | ExportDeclaration | StatementListItem;

type ImportDeclaration= {
  type: 'ImportDeclaration';
  specifiers: ImportSpecifier[];
  source: Literal;
}

interface ImportSpecifier {
  type: 'ImportSpecifier' | 'ImportDefaultSpecifier' | 'ImportNamespaceSpecifier';
  local: Identifier;
  imported?: Identifier;
}

type ExportDeclaration = ExportAllDeclaration | ExportDefaultDeclaration | ExportNamedDeclaration;

interface ExportAllDeclaration {
  type: 'ExportAllDeclaration';
  source: Literal;
}

interface ExportDefaultDeclaration {
  type: 'ExportDefaultDeclaration';
  declaration: Identifier | BindingPattern | ClassDeclaration | Expression | FunctionDeclaration;
}

interface ExportNamedDeclaration {
  type: 'ExportNamedDeclaration';
  declaration: ClassDeclaration | FunctionDeclaration | VariableDeclaration;
  specifiers: ExportSpecifier[];
  source: Literal;
}

interface ExportSpecifier {
  type: 'ExportSpecifier';
  exported: Identifier;
  local: Identifier;
}


declare module esprima {

  declare function parse(input: string, config?: Object, delegate?: Function): Program;

  declare function tokenize(input: string, config?: Object): Array<{
    type:string;
    value:string;
    range?:[number,number];
    loc?: SourceLocation
  }>;

  declare var exports: {
    parse:parse;
    tokenize:tokenize;
  }
}
