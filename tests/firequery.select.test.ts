import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import { Firestore } from '@google-cloud/firestore';
import { FireQuery } from '../src/firequery';
import 'dotenv/config';

export const db = new Firestore({
  projectId: process.env.TESTS_FIRESTORE_PROJECT_ID,
  databaseId: process.env.TESTS_FIRESTORE_DATABASE_ID,
});
const fq = new FireQuery(db);
const usersCol = db.collection('users');

describe('FireQuery SELECT', () => {
  beforeAll(async () => {
    await usersCol.doc('eperson').set({ name: 'Eperson', surname: 'Mayrink', birthYear: 2000 });
  });

  afterAll(async () => {
    await usersCol.doc('eperson').delete();
  });

  it('should return name from users', async () => {
    const result = await fq.query('SELECT name FROM users');
    expect(result).toEqual([{ name: 'Eperson' }]);
  });

  it('should return all fields with SELECT *', async () => {
    const result = await fq.query('SELECT * FROM users');
    expect(result[0]).toMatchObject({ name: 'Eperson', surname: 'Mayrink', birthYear: 2000 });
  });
});
