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

describe('FireQuery INSERT', () => {
  beforeAll(async () => {
    const snapshot = await users.get();
    const deletions = snapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletions);
  });

  afterAll(async () => {
    const snapshot = await users.get();
    const deletions = snapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletions);
  });

  it('should insert a single document with explicit columns', async () => {
    const result = await fq.query(`INSERT INTO users (name, age) VALUES ('Eperson', 23)`);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toMatchObject({ name: 'Eperson', age: 23 });

    const snapshot = await users.where('name', '==', 'Eperson').get();
    expect(snapshot.docs[0].data()).toMatchObject({ name: 'Eperson', age: 23 });
  });

  it('should insert multiple documents at once', async () => {
    const result = await fq.query(`
      INSERT INTO users (name, age) VALUES
      ('Lucas', 30),
      ('Clara', 28)
    `);

    expect(result.length).toBe(2);
    const names = result.map(r => r.name).sort();
    expect(names).toEqual(['Clara', 'Lucas']);
  });
});
