export type InsertStmtLite = {
  type: "insert";
  table: {
    db: string;
    table: string | undefined;
    as: string | null;
  }[];
  columns: string[];
  values: ExprListLite[];
  partition?: string;
  returning?: string;
};

export type ExprListLite = {
  type: "expr_list";
  value: BinaryExprLite[];
};

export type BinaryExprLite = {
  type: "binary_expr";
  operator?: string;
  left: LiteralExprLite | FunctionExprLite;
  right?: undefined;
};

export type LiteralExprLite =
  | {
      type: "single_quote_string";
      value: string;
    }
  | {
      type: "number";
      value: number;
    };

export type FunctionExprLite =
  | {
      type: "function";
      name: string; // ex: "NOW.undefined" ou "CURRENT_TIMESTAMP"
      args?: {
        type: "expr_list";
        value: unknown[];
      };
      over?: string;
    };
