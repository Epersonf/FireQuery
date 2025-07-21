# FireQuery - Query Firestore using SQL

## Overview

**FireQuery** is a library that enables you to run SQL commands (PostgreSQL-style) on Cloud Firestore using familiar syntax such as `SELECT`, `INSERT`, `UPDATE`, and `DELETE`. It offers partial support for `JOIN`, `WHERE`, `ORDER BY`, `LIMIT`, `OFFSET`, and more.

Queries are parsed via PEG.js with auto-generated type definitions, and execution is handled using the official Firebase SDK.

---

## Installation

```sh
npm install firequery firebase
```

---

## Basic Usage

```ts
import { FireQuery } from 'firequery';
import firebase from 'firebase/app';
import '@google-cloud/firestore';

firebase.initializeApp({ /* config */ });
const dbRef = firebase.firestore();

const fireQuery = new FireQuery(dbRef);

const users = await fireQuery.query(`
  SELECT name, age FROM users WHERE active = true ORDER BY age DESC LIMIT 5;
`);

console.log(users);
```

For realtime updates:

```ts
import 'firequery/rx';

fireQuery.rxQuery('SELECT * FROM posts WHERE published = true').subscribe(results => {
  console.log('Realtime update:', results);
});
```

---

## Supported Commands

### `SELECT`

```sql
SELECT id, name FROM users WHERE age >= 18 ORDER BY created_at DESC LIMIT 10 OFFSET 5;
```

### `INSERT`

```sql
INSERT INTO users (id, name, active)
VALUES ('u1', 'Alice', true), ('u2', 'Bob', false);
```

### `UPDATE`

```sql
UPDATE users
SET active = false, last_login = CURRENT_TIMESTAMP
WHERE last_login < '2024-01-01';
```

### `DELETE`

```sql
DELETE FROM users
WHERE active = false AND created_at < '2023-01-01';
```

---

## Features and Extensions

### WHERE

* Supports `=`, `!=`, `>`, `<`, `<=`, `>=`
* `IS NULL`, `IS NOT NULL`
* `IN (...)`
* `LIKE 'prefix%'`
* `AND`, `OR`, nested expressions

### Functions

* `NOW()` or `CURRENT_TIMESTAMP` return `new Date()`

### Sorting, Limit and Offset

```sql
ORDER BY score DESC, created_at ASC
LIMIT 10 OFFSET 20
```

### Document ID

* Use `__name__` to access the document ID:

```sql
SELECT __name__ AS id, name FROM users;
```

---

## Current Support

| Feature               | Status      |
| --------------------- | ----------- |
| SELECT                | ✅           |
| INSERT                | ✅           |
| UPDATE                | ✅           |
| DELETE                | ✅           |
| Complex WHERE         | ✅           |
| ORDER BY              | ✅           |
| LIMIT/OFFSET          | ✅           |
| Functions: NOW(), etc | ✅           |
| IN, LIKE              | ✅           |
| GROUP BY              | ❌           |
| JOIN                  | ❌           |
| Subqueries            | ✅ (limited) |
| RETURNING             | ❌           |

---

## Examples

```sql
-- Query documents with boolean field
SELECT * FROM users WHERE active;

-- Insert documents
INSERT INTO products (id, title, price)
VALUES ('p1', 'Item 1', 99.9);

-- Update records
UPDATE users SET last_seen = NOW() WHERE active = true;

-- Conditional deletion
DELETE FROM logs WHERE created_at < '2022-01-01';
```

---

## Performance Notice

FireQuery is smart, but not magical: queries using `OR`, `IN`, or `!=` may trigger multiple parallel queries to Firestore. Use with awareness of your data model.

```sql
SELECT * FROM cities
WHERE country != 'Japan' AND region IN ('north', 'south')
```

This may generate several query combinations under the hood.

---

## Author

Based on the original [FireSQL](https://firesql.firebaseapp.com/) project, adapted for PostgreSQL syntax and extended DML support.

---

## License

MIT
