import { DocumentData, DocumentReference } from "@google-cloud/firestore";
import { SelectStmtLite, OrderByExpr } from "./select-stmt.int";
import { ProcStmt, Start } from "../../../sql-parser";

export class SelectEvaluator {
  static async execute(
    stmt: ProcStmt,
    ref: DocumentReference
  ): Promise<DocumentData[]> {
    const t = stmt as unknown as SelectStmtLite;

    const collectionName = t.from?.[0]?.db;
    if (!collectionName) {
      throw new Error("Missing collection name in FROM clause.");
    }

    let query: FirebaseFirestore.Query = ref.firestore.collection(collectionName);

    // ORDER BY
    if (t.orderby?.length) {
      for (const order of t.orderby) {
        const col = SelectEvaluator.extractColumnName(order);
        if (col) {
          query = query.orderBy(col, order.type?.toLowerCase() as FirebaseFirestore.OrderByDirection);
        }
      }
    }

    // LIMIT / OFFSET
    const limitArgs = t.limit?.value ?? [];
    const [limitNode, offsetNode] = limitArgs;
    if (limitNode?.type === "number") {
      query = query.limit(limitNode.value);
    }
    if (offsetNode?.type === "number") {
      query = query.offset(offsetNode.value);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data());
  }

  private static extractColumnName(order: OrderByExpr): string | undefined {
    const expr = order.expr;
    if (expr?.type === "binary_expr" && expr.left?.type === "column_ref") {
      return expr.left.column;
    }
    return undefined;
  }
}
