import '@google-cloud/firestore';
import { FireQueryOptions, QueryOptions } from './shared';
import { parse } from './sql-parser';
import { DocumentData, assert } from './utils';
import { select_ } from './select';
import { DocumentReference, Firestore } from '@google-cloud/firestore';

export class FireQuery {
  private _ref: DocumentReference;

  constructor(ref: FirestoreOrDocument, private _options: FireQueryOptions = {}) {
    /*
       We initially used `instanceof` to determine the object type, but that
       only allowed using the client SDK. Doing it this way we can support
       both the client and the admin SDKs.
       */
    if (typeof (ref as any).doc === 'function') {
      // It's an instance of Firestore
      try {
        this._ref = (ref as Firestore).doc('/');
      } catch (err) {
        // If the Firestore instance we get is from the Admin SDK, it throws
        // an error if we call `.doc("/")` on it. In that case we just treat
        // it as a DocumentReference
        this._ref = ref as DocumentReference;
      }
    } else if (typeof (ref as any).collection === 'function') {
      // It's an instance of DocumentReference
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

  get options(): FireQueryOptions {
    return this._options;
  }

  query(sql: string, options?: QueryOptions): Promise<DocumentData[]>;
  query<T>(sql: string, options?: QueryOptions): Promise<T[]>;
  async query<T>(
    sql: string,
    options: QueryOptions = {}
  ): Promise<T[] | DocumentData[]> {
    assert(
      // tslint:disable-next-line: strict-type-predicates
      typeof sql === 'string' && sql.length > 0,
      'query() expects a non-empty string.'
    );
    const ast = parse(sql);

    if (ast.type === 'select') {
      return select_(this._ref, ast, { ...this._options, ...options });
    } else {
      throw new Error(
        `"${(ast.type as string).toUpperCase()}" statements are not supported.`
      );
    }
  }

  toJSON(): object {
    return {
      ref: this._ref,
      options: this._options
    };
  }
}

export type FirestoreOrDocument =
  | Firestore
  | DocumentReference
  | AdminFirestore
  | AdminDocumentReference;

/**
 * An interface representing the basics we need from the
 * admin.firestore.Firestore class.
 * We use it like this to avoid having to require "firebase-admin".
 */
interface AdminFirestore {
  collection(collectionPath: string): any;
  doc(documentPath: string): any;
}

/**
 * An interface representing the basics we need from the
 * admin.firestore.DocumentReference class.
 * We use it like this to avoid having to require "firebase-admin".
 */
interface AdminDocumentReference {
  collection(collectionPath: string): any;
  get(options?: any): Promise<any>;
}
