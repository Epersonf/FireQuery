import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { Firestore } from '@google-cloud/firestore';
import { FireQuery } from '../src/firequery';
import 'dotenv/config';

const db = new Firestore({
  projectId: process.env.TESTS_FIRESTORE_PROJECT_ID,
  databaseId: process.env.TESTS_FIRESTORE_DATABASE_ID,
});

const fq = new FireQuery(db);
const users = db.collection('users');

describe('FireQuery DELETE', () => {
  beforeEach(async () => {
    const snapshot = await users.get();
    await Promise.all(snapshot.docs.map(doc => doc.ref.delete()));
  });

  afterEach(async () => {
    const snapshot = await users.get();
    await Promise.all(snapshot.docs.map(doc => doc.ref.delete()));
  });

  it('should delete documents matching the WHERE clause', async () => {
    await Promise.all([
      users.doc('d1').set({ name: 'DeleteMe', age: 40 }),
      users.doc('d2').set({ name: 'KeepMe', age: 30 }),
      users.doc('d3').set({ name: 'DeleteMe', age: 35 }),
    ]);

    const result = await fq.query(`DELETE FROM users WHERE name = 'DeleteMe'`);
    expect(result.length).toBe(2);

    const remaining = await users.get();
    const names = remaining.docs.map(d => d.data().name);
    expect(names).toEqual(['KeepMe']);
  });

  it('should delete all documents if no WHERE clause is given', async () => {
    await Promise.all([
      users.doc('a1').set({ name: 'One' }),
      users.doc('a2').set({ name: 'Two' }),
    ]);

    const result = await fq.query(`DELETE FROM users`);
    expect(result.length).toBe(2);

    const remaining = await users.get();
    expect(remaining.empty).toBe(true);
  });
});
