export type SelectStmtLite = {
  type: "select";
  with: string;
  options: string;
  distinct: { type: string };
  columns: SelectColumnExpr[];
  from: SelectFromItem[];
  where?: BinaryExpr;
  groupby?: string;
  having?: string;
  orderby?: OrderByExpr[];
  limit?: {
    seperator: string;
    value: { type: "number"; value: number }[];
  };
  window?: string;
};

export type SelectColumnExpr = {
  type: "expr";
  expr: BinaryExpr;
  as: string;
};

export type SelectFromItem = {
  db: string;
  table: string | undefined;
  as: string | null | undefined;
  join?: string; // "INNER JOIN", etc.
  on?: BinaryExpr;
};

export type OrderByExpr = {
  expr: BinaryExpr;
  type?: "ASC" | "DESC";
};

export type BinaryExpr =
  | {
      type: "binary_expr";
      operator?: string;
      left: ColumnRef | Literal | BinaryExpr;
      right?: ColumnRef | Literal | BinaryExpr;
    }
  | ColumnRef
  | Literal;

export type ColumnRef = {
  type: "column_ref";
  table?: string;
  column: string;
};

export type Literal =
  | { type: "number"; value: number }
  | { type: "bool"; value: boolean }
  | { type: "single_quote_string"; value: string };
