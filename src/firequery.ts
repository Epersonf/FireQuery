import '@google-cloud/firestore';
import { parse } from './sql-parser';
import { DocumentData, assert } from './utils';
import { DocumentReference, Firestore } from '@google-cloud/firestore';
import { ASTEvaluator } from './operations/ast.evaluator';

export class FireQuery {
  private _ref: DocumentReference;

  constructor(ref: FirestoreOrDocument) {
    if (typeof (ref as any).doc === 'function') {
      try {
        this._ref = (ref as Firestore).doc('/');
      } catch (err) {
        this._ref = ref as DocumentReference;
      }
    } else if (typeof (ref as any).collection === 'function') {
      this._ref = ref as DocumentReference;
    } else {
      throw new Error(
        'The first parameter needs to be a Firestore object ' +
          ' or a Firestore document reference .'
      );
    }
  }

  get ref(): DocumentReference {
    return this._ref;
  }

  get firestore(): Firestore {
    return this._ref.firestore;
  }

  query(sql: string): Promise<DocumentData[]>;
  query<T>(sql: string): Promise<T[]>;
  async query<T>(
    sql: string
  ): Promise<T[] | DocumentData[]> {
    assert(typeof sql === 'string' && sql.length > 0, 'query() expects a non-empty string.');
    const ast = parse(sql);

    return ASTEvaluator.evaluate(ast, this._ref);
  }

  toJSON(): object {
    return {
      ref: this._ref,
    };
  }
}

export type FirestoreOrDocument =
  | Firestore
  | DocumentReference
  | AdminFirestore
  | AdminDocumentReference;

interface AdminFirestore {
  collection(collectionPath: string): any;
  doc(documentPath: string): any;
}

interface AdminDocumentReference {
  collection(collectionPath: string): any;
  get(options?: any): Promise<any>;
}
