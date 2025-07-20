// import admin from 'firebase-admin';
import { initFirestore/*, initAdminFirestore*/ } from './helpers/utils';
import { Firestore } from '@google-cloud/firestore';
import { FireQuery } from '../src/firequery';

let firestore: Firestore;
// let adminFirestore: admin.firestore.Firestore;

beforeAll(() => {
  firestore = initFirestore();
  // adminFirestore = initAdminFirestore();
});

describe('FireQuery basic API', () => {
  it('is instantiable with Firestore', () => {
    expect(new FireQuery(firestore)).toBeInstanceOf(FireQuery);
  });

  it('is instantiable with DocumentReference', () => {
    expect(new FireQuery(firestore.doc('testing/doc'))).toBeInstanceOf(FireQuery);
  });

  // it('is instantiable with firebase-admin Firestore', () => {
  //   expect(new FireQuery(adminFirestore)).toBeInstanceOf(FireQuery);
  // });

  // it('is instantiable with firebase-admin DocumentReference', () => {
  //   expect(new FireQuery(adminFirestore.doc('testing/doc'))).toBeInstanceOf(
  //     FireQuery
  //   );
  // });

  it('is instantiable with Firestore and options', () => {
    const options = { includeId: true };
    const fireQuery = new FireQuery(firestore, options);

    expect(fireQuery).toBeInstanceOf(FireQuery);
    expect(fireQuery.options).toEqual(options);
    expect(() => fireQuery.ref).not.toThrow();
    expect(fireQuery.ref.path).toBe('');
  });

  it('is instantiable with DocumentReference and options', () => {
    const options = { includeId: true };
    const docRef = firestore.doc('a/b');
    const fireQuery = new FireQuery(docRef, options);

    expect(fireQuery).toBeInstanceOf(FireQuery);
    expect(fireQuery.options).toEqual(options);
    expect(() => fireQuery.ref).not.toThrow();
    expect(fireQuery.ref.path).toBe('a/b');
  });

  // it('is instantiable with firebase-admin Firestore and options', () => {
  //   const options = { includeId: true };
  //   const fireQuery = new FireQuery(adminFirestore, options);

  //   expect(fireQuery).toBeInstanceOf(FireQuery);
  //   expect(fireQuery.options).toEqual(options);
  //   expect(() => fireQuery.ref).not.toThrow();
  //   expect(fireQuery.ref.path).toBe('');
  // });

  // it('is instantiable with firebase-admin DocumentReference and options', () => {
  //   const options = { includeId: true };
  //   const docRef = adminFirestore.doc('a/b');
  //   const fireQuery = new FireQuery(docRef, options);

  //   expect(fireQuery).toBeInstanceOf(FireQuery);
  //   expect(fireQuery.options).toEqual(options);
  //   expect(() => fireQuery.ref).not.toThrow();
  //   expect(fireQuery.ref.path).toBe('a/b');
  // });

  it('has query() method', () => {
    expect(typeof new FireQuery(firestore).query).toBe('function');
  });

  it("doesn't have rxQuery() method", () => {
    // We haven't imported "firequery/rx" so rxQuery shouldn't exist
    expect((new FireQuery(firestore) as any).rxQuery).toBeUndefined();
  });
});
