import { DocumentData, Firestore } from "@google-cloud/firestore";
import { DeleteStmtLite, BinaryExprNode, Expr, Literal } from "./delete-stmt.int";
import { ProcStmt } from "../../../sql-parser";

export class DeleteEvaluator {
  static async execute(
    stmt: ProcStmt,
    ref: Firestore,
  ): Promise<DocumentData[]> {
    const t = stmt as unknown as DeleteStmtLite;
    const collectionName = t.from?.[0]?.db;
    if (!collectionName) throw new Error("Missing collection name in DELETE.");

    let query: FirebaseFirestore.Query = ref.collection(collectionName);

    if (t.where) {
      query = DeleteEvaluator.applyWhere(query, t.where);
    }

    const snapshot = await query.get();
    const deleted: DocumentData[] = [];

    for (const doc of snapshot.docs) {
      await doc.ref.delete();
      deleted.push({ id: doc.id, ...doc.data() });
    }

    return deleted;
  }

  private static applyWhere(
    query: FirebaseFirestore.Query,
    expr: BinaryExprNode
  ): FirebaseFirestore.Query {
    const left = expr.left;
    const right = expr.right;

    // Só suportamos column_ref = literal por enquanto
    if (left.type === "column_ref" && DeleteEvaluator.isLiteral(right)) {
      const column = left.column;
      const value = DeleteEvaluator.resolveLiteral(right);
      const op = expr.operator;

      switch (op) {
        case "=":
          return query.where(column, "==", value);
        case "!=":
        case "<>":
          return query.where(column, "!=", value);
        case "<":
        case ">":
        case "<=":
        case ">=":
          return query.where(column, op as any, value);
        case "IS NOT":
          if (right.type === "null") return query.where(column, "!=", null);
          break;
        default:
          throw new Error(`Unsupported operator in WHERE: ${op}`);
      }
    }

    // TODO: suporte a operadores compostos (AND, OR) e subqueries
    throw new Error("Only simple DELETE WHERE column = literal is supported.");
  }

  private static isLiteral(expr: Expr): expr is Literal {
    return (
      expr.type === "number" ||
      expr.type === "bool" ||
      expr.type === "null" ||
      expr.type === "single_quote_string"
    );
  }

  private static resolveLiteral(expr: Literal): any {
    return expr.value;
  }
}
