import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { Firestore } from '@google-cloud/firestore';
import { FireQuery } from '../src/firequery';
import 'dotenv/config';

const db = new Firestore({
  projectId: process.env.TESTS_FIRESTORE_PROJECT_ID,
  databaseId: process.env.TESTS_FIRESTORE_DATABASE_ID,
});

const fq = new FireQuery(db);
const users = db.collection('users');

describe('FireQuery UPDATE', () => {
  beforeAll(async () => {
    await Promise.all([
      users.doc('u1').set({ name: 'Eperson', age: 23, active: true }),
      users.doc('u2').set({ name: 'Janári', age: 22, active: false }),
    ]);
  });

  afterAll(async () => {
    const snapshot = await users.get();
    const deletions = snapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletions);
  });

  it('should update a single document', async () => {
    const result = await fq.query(`UPDATE users SET age = 24 WHERE name = 'Eperson'`);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toMatchObject({ age: 24 });

    const snapshot = await users.doc('u1').get();
    expect(snapshot.data()?.age).toBe(24);
  });

  it('should update multiple documents with a WHERE clause', async () => {
    const result = await fq.query(`UPDATE users SET active = true WHERE age < 23`);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Janári');

    const updated = await users.doc('u2').get();
    expect(updated.data()?.active).toBe(true);
  });

  it('should support expressions in update values', async () => {
    const result = await fq.query(`UPDATE users SET age = age + 1 WHERE active = true`);
    expect(result.length).toBeGreaterThan(0);

    const eperson = await users.doc('u1').get();
    const janari = await users.doc('u2').get();

    const d1 = eperson.data();
    const d2 = janari.data();

    expect(d1?.age).toBe(25);
    expect(d2?.age).toBe(23);
  });
});
