import { Firestore } from '@google-cloud/firestore';
import { parse } from './sql-parser';
import { DocumentData, assert } from './utils';
import { ASTEvaluator } from './operations/ast.evaluator';

export class FireQuery {
  constructor(private readonly db: Firestore) {
    if (typeof db.collection !== 'function') {
      throw new Error('Expected a Firestore instance.');
    }
  }

  async query(sql: string): Promise<DocumentData[]> {
    assert(typeof sql === 'string' && sql.length > 0, 'query() expects a non-empty string.');
    const ast = parse(sql);
    return ASTEvaluator.evaluate(ast, this.db);
  }

  toJSON(): object {
    return {
      db: this.db,
    };
  }
}
