import { DocumentData, Firestore } from "@google-cloud/firestore";
import { BinaryExprLite, FunctionExprLite, InsertStmtLite, LiteralExprLite } from "./insert-stmt.int";
import { ProcStmt } from "../../../sql-parser";

export class InsertEvaluator {
  static async execute(
    stmt: ProcStmt,
    ref: Firestore,
  ): Promise<DocumentData[]> {
    const t = stmt as unknown as InsertStmtLite;
    const collectionName = t.table?.[0]?.db ?? t.table?.[0]?.table;
    if (!collectionName) throw new Error("Missing collection name in INSERT.");

    const collection = ref.collection(collectionName);
    const rows: DocumentData[] = [];

    for (const exprList of t.values) {
      const data: DocumentData = {};
      const values = exprList.value ?? [];

      for (let i = 0; i < t.columns.length; i++) {
        const col = t.columns[i];
        const expr = values[i];
        if (!expr) {
          throw new Error(`Missing value for column '${col}' at index ${i}`);
        }
        data[col] = this.resolveValue(expr);
      }

      const docRef = data.id ? collection.doc(data.id) : collection.doc();
      await docRef.set(data, { merge: true });
      rows.push({ id: docRef.id, ...data });
    }

    return rows;
  }

  private static resolveValue(expr: BinaryExprLite | LiteralExprLite | FunctionExprLite): any {
    if (!expr || typeof expr.type !== 'string') {
      throw new Error(`Invalid expression node: ${JSON.stringify(expr)}`);
    }

    switch (expr.type) {
      case "single_quote_string":
        return expr.value;
      case "number":
        return expr.value;
      case "function":
        return this.evaluateFunction(expr.name);
      case "binary_expr":
        if (!expr.left || !expr.right) {
          throw new Error(`Invalid binary expression: ${JSON.stringify(expr)}`);
        }

        const left = this.resolveValue(expr.left);
        const right = this.resolveValue(expr.right);
        const op = expr.operator;

        switch (op) {
          case "+": return left + right;
          case "-": return left - right;
          case "*": return left * right;
          case "/": return left / right;
          case "%": return left % right;
          default:
            throw new Error(`Unsupported operator in binary expression: ${op}`);
        }
      default:
        throw new Error('Unsupported value type');
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
