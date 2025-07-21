import { DocumentData, Firestore } from "@google-cloud/firestore";
import { SelectStmtLite, OrderByExpr } from "./select-stmt.int";

export class SelectEvaluator {
  static async execute(
    stmt: SelectStmtLite,
    ref: Firestore,
  ): Promise<DocumentData[]> {
    const collectionName = stmt.from?.[0]?.db ?? stmt.from?.[0]?.table;
    if (!collectionName) {
      throw new Error("Missing collection name in FROM clause.");
    }

    let query: FirebaseFirestore.Query = ref.collection(collectionName);

    // SELECT columns
    if (stmt.columns && Array.isArray(stmt.columns)) {
      const fields = stmt.columns
        .map(col => col.expr?.type === 'column_ref' ? col.expr.column : null)
        .filter((c): c is string => !!c);

      const isSelectAll = fields.includes('*');

      if (!isSelectAll && fields.length > 0) {
        query = query.select(...fields);
      }
    }

    // ORDER BY
    if (stmt.orderby?.length) {
      for (const order of stmt.orderby) {
        const col = SelectEvaluator.extractColumnName(order);
        if (col) {
          query = query.orderBy(col, order.type?.toLowerCase() as FirebaseFirestore.OrderByDirection);
        }
      }
    }

    // LIMIT / OFFSET
    const limitArgs = stmt.limit?.value ?? [];
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
    if (expr?.type === "column_ref") {
      return expr.column;
    }
    if (expr?.type === "binary_expr" && expr.left?.type === "column_ref") {
      return expr.left.column;
    }
    return undefined;
  }
}
