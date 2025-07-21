export type DeleteStmtLite = {
  type: "delete";
  table: {
    db: string;
    table: string;
    as: string;
    addition: boolean;
  }[];
  from: {
    db: string;
    table: string | undefined;
    as: string;
  }[];
  where?: BinaryExprNode;
};

export interface BinaryExprNode {
  type: "binary_expr";
  operator: string;
  left: Expr;
  right: Expr;
}

export type Expr =
  | ColumnRef
  | Literal
  | FunctionExpr
  | IntervalExpr
  | ExprList
  | BinaryExprNode
  | SelectStmtLite;


export type ColumnRef = {
  type: "column_ref";
  table: string | null;
  column: string;
};

export type Literal =
  | { type: "number"; value: number }
  | { type: "bool"; value: boolean }
  | { type: "null"; value: null }
  | { type: "single_quote_string"; value: string };

export type FunctionExpr = {
  type: "function";
  name: string;
  over?: string;
};

export type IntervalExpr = {
  type: "interval";
  expr: Literal;
  unit: string;
};

export type ExprList = {
  type: "expr_list";
  value: Expr[];
};

export type SelectStmtLite = {
  with: string;
  type: "select";
  options: string;
  distinct: { type: string };
  columns: {
    type: "expr";
    expr: BinaryExprNode;
    as: string;
  }[];
  from: {
    db: string;
    table: string | undefined;
    as: string;
  }[];
  where?: BinaryExprNode;
  groupby: string;
  having: string;
  orderby: string;
  limit: string;
  window: string;
};