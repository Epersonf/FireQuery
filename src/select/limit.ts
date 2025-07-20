import { assert, astValueToNative } from '../utils';
import { SQL_Value } from '../sql-parser';
import { DocumentData, Query } from '@google-cloud/firestore';

export function applyLimit(
  queries: Query[],
  astLimit: SQL_Value
): Query[] {
  assert(
    astLimit.type === 'number',
    "LIMIT has to be a number."
  );
  const limit = astValueToNative(astLimit) as number;
  return queries.map(query => query.limit(limit));
}

export function applyLimitLocally(
  docs: DocumentData[],
  astLimit: SQL_Value
): DocumentData[] {
  const limit = astValueToNative(astLimit) as number;
  docs.splice(limit);
  return docs;
}
