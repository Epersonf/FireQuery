import { Query } from '@google-cloud/firestore';
import { Observable } from 'rxjs';

export type DocumentData = { [field: string]: any };

export type ValueOf<T> = T[keyof T];

export const DOCUMENT_KEY_NAME = '__name__';

export function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

export function contains(obj: object, prop: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

export function safeGet(obj: any, prop: string): any {
  if (contains(obj, prop)) return obj[prop];
}

export function deepGet(obj: any, path: string): any {
  let value = obj;
  const props = path.split('.');

  props.some(prop => {
    value = safeGet(value, prop);

    // By using "some" instead of "forEach", we can return
    // true whenever we want to break out of the loop.
    return typeof value === void 0;
  });

  return value;
}

/**
 * Adapted from: https://github.com/firebase/firebase-ios-sdk/blob/14dd9dc2704038c3bf702426439683cee4dc941a/Firestore/core/src/firebase/firestore/util/string_util.cc#L23-L40
 */
export function prefixSuccessor(prefix: string): string {
  // We can increment the last character in the string and be done
  // unless that character is 255 (0xff), in which case we have to erase the
  // last character and increment the previous character, unless that
  // is 255, etc. If the string is empty or consists entirely of
  // 255's, we just return the empty string.
  let limit = prefix;
  while (limit.length > 0) {
    const index = limit.length - 1;
    if (limit[index] === '\xff') {
      limit = limit.slice(0, -1);
    } else {
      limit =
        limit.substr(0, index) +
        String.fromCharCode(limit.charCodeAt(index) + 1);
      break;
    }
  }
  return limit;
}

export function collectionData<T = DocumentData>(
  query: Query<T>,
  idField?: string
): Observable<T[]> {
  return new Observable<T[]>(subscriber => {
    const unsubscribe = query.onSnapshot(snapshot => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return idField ? { ...d, [idField]: doc.id } : d;
      }) as T[];

      subscriber.next(data);
    }, error => subscriber.error(error));

    return unsubscribe;
  });
}