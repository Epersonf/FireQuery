import { DocumentData, DocumentReference } from "@google-cloud/firestore";
import { Start } from "../sql-parser";
import { SelectEvaluator } from "./evaluators/select/select.evaluator";
import { InsertEvaluator } from "./evaluators/insert/insert.evaluator";
import { UpdateEvaluator } from "./evaluators/update/update.evaluator";
import { DeleteEvaluator } from "./evaluators/delete/delete.evaluator";

export class ASTEvaluator {
  static async evaluate<T>(
    ast: Start,
    ref: DocumentReference,
  ): Promise<T[] | DocumentData[]> {
    if (!Array.isArray(ast)) throw new Error("Expected AST to be an array");

    const results: T[] | DocumentData[] = [];

    for (const stmt of ast) {
      if (typeof stmt !== "object" || stmt === null || stmt.type === "proc") continue;

      switch (stmt.type) {
        case "select":
          return await SelectEvaluator.execute(stmt, ref);
        case "insert":
          return await InsertEvaluator.execute(stmt, ref);
        case "update":
          return await UpdateEvaluator.execute(stmt, ref);
        case "delete":
          return await DeleteEvaluator.execute(stmt, ref);
        default:
          throw new Error(`Unsupported SQL type: ${stmt.type}`);
      }
    }

    return results;
  }
}
