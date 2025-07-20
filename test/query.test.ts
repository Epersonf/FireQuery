import { Firestore } from '@google-cloud/firestore';
import { FireQuery } from '../src/firequery';
import { initFirestore } from './helpers/utils';

let firestore: Firestore;
let fireQuery: FireQuery;

beforeAll(() => {
  firestore = initFirestore();
  fireQuery = new FireQuery(firestore);
});

describe('Method query()', () => {
  it('returns a Promise', () => {
    const returnValue = fireQuery.query('SELECT * FROM nonExistantCollection');
    // tslint:disable-next-line: no-floating-promises
    expect(returnValue).toBeInstanceOf(Promise);
  });

  it('expects one non-empty string argument', async () => {
    expect.assertions(3);

    try {
      await (fireQuery as any).query();
    } catch (err) {
      expect(err).not.toBeUndefined();
    }

    try {
      await (fireQuery as any).query('');
    } catch (err) {
      expect(err).not.toBeUndefined();
    }

    try {
      await (fireQuery as any).query(42);
    } catch (err) {
      expect(err).not.toBeUndefined();
    }
  });

  it('accepts options as second argument', async () => {
    expect.assertions(1);

    const returnValue = fireQuery.query('SELECT * FROM nonExistantCollection', {
      includeId: true
    });

    // tslint:disable-next-line: no-floating-promises
    expect(returnValue).toBeInstanceOf(Promise);

    try {
      await returnValue;
    } catch (err) {
      // We're testing that query() doesn't throw, so
      // this assertion shouldn't be reached.
      expect(true).toBe(false);
    }
  });

  it('throws when SQL has syntax errors', async () => {
    expect.assertions(2);

    try {
      await fireQuery.query('not a valid query');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err).toHaveProperty('name', 'SyntaxError');
    }
  });
});
