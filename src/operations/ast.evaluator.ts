import { DocumentData, Firestore } from "@google-cloud/firestore";
import { Start } from "../sql-parser";
import { SelectEvaluator } from "./evaluators/select/select.evaluator";
import { InsertEvaluator } from "./evaluators/insert/insert.evaluator";
import { UpdateEvaluator } from "./evaluators/update/update.evaluator";
import { DeleteEvaluator } from "./evaluators/delete/delete.evaluator";

export class ASTEvaluator {
  static async evaluate(
    start: Start,
    db: Firestore,
  ): Promise<DocumentData[]> {
    const rawAst = (start as any).ast;

    // Normaliza para array
    const ast = Array.isArray(rawAst) ? rawAst : [rawAst];

    console.log(`Running AST evaluator for ${JSON.stringify(start)}`);

    const results: DocumentData[] = [];

    for (const stmt of ast) {
      if (typeof stmt !== "object" || stmt === null || stmt.type === "proc") continue;

      switch (stmt.type) {
        case "select":
          results.push(...await SelectEvaluator.execute(stmt, db));
          break;
        case "insert":
          results.push(...await InsertEvaluator.execute(stmt, db));
          break;
        case "update":
          results.push(...await UpdateEvaluator.execute(stmt, db));
          break;
        case "delete":
          results.push(...await DeleteEvaluator.execute(stmt, db));
          break;
        default:
          throw new Error(`Unsupported SQL type: ${stmt.type}`);
      }
    }

    return results;
  }
}
