import { DocumentData, DocumentReference, Firestore } from "@google-cloud/firestore";
import { FunctionExprLite, InsertStmtLite, LiteralExprLite } from "./insert-stmt.int";
import { ProcStmt } from "../../../sql-parser";

export class InsertEvaluator {
  static async execute(
    stmt: ProcStmt,
    ref: Firestore,
  ): Promise<DocumentData[]> {
    const t = stmt as any as InsertStmtLite;
    const collectionName = t.table?.[0]?.db;
    if (!collectionName) throw new Error("Missing collection name in INSERT.");

    const collection = ref.collection(collectionName);
    const rows: DocumentData[] = [];

    for (const exprList of t.values) {
      const data: DocumentData = {};

      t.columns.forEach((col, i) => {
        const expr = exprList.value[i];
        const value = InsertEvaluator.resolveValue(expr.left);
        data[col.name] = value;
      });

      const docRef = data.id
        ? collection.doc(data.id)
        : collection.doc();

      await docRef.set(data, { merge: true });
      rows.push({ id: docRef.id, ...data });
    }

    return rows;
  }

  private static resolveValue(expr: LiteralExprLite | FunctionExprLite): any {
    switch (expr.type) {
      case "single_quote_string":
      case "number":
        return expr.value;
      case "function":
        return InsertEvaluator.evaluateFunction(expr.name);
      default:
        throw new Error(`Unsupported expression type: ${(expr as any).type}`);
    }
  }

  private static evaluateFunction(name: string): any {
    const normalized = name.toLowerCase().split(".")[0];
    switch (normalized) {
      case "now":
      case "current_timestamp":
        return new Date();
      default:
        throw new Error(`Unsupported function: ${name}`);
    }
  }
}