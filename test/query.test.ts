import { Firestore } from '@google-cloud/firestore';
import { FireSQL } from '../src/firesql';
import { initFirestore } from './helpers/utils';

let firestore: Firestore;
let fireSQL: FireSQL;

beforeAll(() => {
  firestore = initFirestore();
  fireSQL = new FireSQL(firestore);
});

describe('Method query()', () => {
  it('returns a Promise', () => {
    const returnValue = fireSQL.query('SELECT * FROM nonExistantCollection');
    // tslint:disable-next-line: no-floating-promises
    expect(returnValue).toBeInstanceOf(Promise);
  });

  it('expects one non-empty string argument', async () => {
    expect.assertions(3);

    try {
      await (fireSQL as any).query();
    } catch (err) {
      expect(err).not.toBeUndefined();
    }

    try {
      await (fireSQL as any).query('');
    } catch (err) {
      expect(err).not.toBeUndefined();
    }

    try {
      await (fireSQL as any).query(42);
    } catch (err) {
      expect(err).not.toBeUndefined();
    }
  });

  it('accepts options as second argument', async () => {
    expect.assertions(1);

    const returnValue = fireSQL.query('SELECT * FROM nonExistantCollection', {
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
      await fireSQL.query('not a valid query');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err).toHaveProperty('name', 'SyntaxError');
    }
  });
});
