export type UpdateStmtLite = {
  type: "update";
  table: {
    db: string;
    table: string | undefined;
    as: string;
  }[];
  set: UpdateAssignment[];
  where?: BinaryExprNode;
  returning?: string;
};

export type UpdateAssignment = {
  column: string;
  value: Expr;
  table: string;
};

// reutilizando tipos existentes:
export interface BinaryExprNode {
  type: "binary_expr";
  operator: string;
  left: Expr;
  right: Expr;
}

export type Expr =
  | ColumnRef
  | Literal
  | BinaryExprNode
  | FunctionExpr;

export type ColumnRef = {
  type: "column_ref";
  table: string | null;
  column: string;
};

export type Literal =
  | { type: "single_quote_string"; value: string }
  | { type: "number"; value: number }
  | { type: "bool"; value: boolean }
  | { type: "null"; value: null };

export type FunctionExpr = {
  type: "function";
  name: string;
  over?: string;
};
