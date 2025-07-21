import { DocumentData, Firestore } from "@google-cloud/firestore";
import { ProcStmt } from "../../../sql-parser";
import {
  UpdateStmtLite,
  Expr,
  FunctionExpr,
} from "./update-stmt.int";
import { DeleteEvaluator } from "../delete/delete.evaluator";

export class UpdateEvaluator {
  static async execute(
    stmt: ProcStmt,
    ref: Firestore,
  ): Promise<DocumentData[]> {
    const t = stmt as unknown as UpdateStmtLite;
    const collectionName = t.table?.[0]?.db ?? t.table?.[0]?.table;
    if (!collectionName) throw new Error("Missing collection name in UPDATE.");

    let query: FirebaseFirestore.Query = ref.collection(collectionName);

    if (t.where) {
      query = DeleteEvaluator["applyWhere"](query, t.where);
    }

    const snapshot = await query.get();
    const updated: DocumentData[] = [];

    for (const doc of snapshot.docs) {
      const data: Record<string, any> = {};

      for (const assignment of t.set) {
        const field = assignment.column;
        const value = UpdateEvaluator.resolveExpr(assignment.value);
        data[field] = value;
      }

      await doc.ref.update(data);
      updated.push({ id: doc.id, ...doc.data(), ...data });
    }

    return updated;
  }

  private static resolveExpr(expr: Expr): any {
    switch (expr.type) {
      case "single_quote_string":
      case "number":
      case "bool":
      case "null":
        return expr.value;
      case "function":
        return UpdateEvaluator.evaluateFunction(expr);
      default:
        throw new Error(`Unsupported value in SET: ${expr.type}`);
    }
  }

  private static evaluateFunction(fn: FunctionExpr): any {
    const name = fn.name.toLowerCase();
    switch (name) {
      case "now":
      case "current_timestamp":
        return new Date();
      default:
        throw new Error(`Unsupported function in SET: ${fn.name}`);
    }
  }
}
