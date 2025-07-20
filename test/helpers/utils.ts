import { Firestore } from '@google-cloud/firestore';
import '@google-cloud/firestore';

let firestore: Firestore;

export function initFirestore(): Firestore {
  if (firestore) {
    return firestore;
  }

  const emulatorProjectId = process.env['FIREQUERY_TEST_PROJECT_ID'];
  const emulatorHost = process.env['FIREQUERY_TEST_EMULATOR_HOST'];

  if (emulatorProjectId && emulatorHost) {
    // Usando o emulador local
    firestore = new Firestore({
      projectId: emulatorProjectId,
      servicePath: emulatorHost.split(':')[0],
      port: parseInt(emulatorHost.split(':')[1], 10),
      sslCreds: require('@grpc/grpc-js').credentials.createInsecure(),
    });
  } else {
    // SDK padrão (GOOGLE_APPLICATION_CREDENTIALS ou ambiente GCP)
    firestore = new Firestore();
  }

  return firestore;
}



/*
import admin from 'firebase-admin';
import firebase from 'firebase/app';
import '@google-cloud/firestore';

let firestore: Firestore;
// let adminFirestore: admin.firestore.Firestore;

export function initFirestore(): Firestore {
  if (firestore) {
    return firestore;
  }

  firestore = _initFirestore(firebase);

  return firestore;
}

// export function initAdminFirestore(): admin.firestore.Firestore {
//   if (adminFirestore) {
//     return adminFirestore;
//   }

//   adminFirestore = _initFirestore(admin);

//   return adminFirestore;
// }

function _initFirestore<
  T extends Firestore | admin.firestore.Firestore
>(namespace: typeof firebase | typeof admin): T {
  const emulatorProjectId = process.env['FIREQUERY_TEST_PROJECT_ID'];
  let firestoreObject: Firestore;

  if (typeof emulatorProjectId === 'string') {
    // Using the local emulator
    const emulatorHost = process.env['FIREQUERY_TEST_EMULATOR_HOST'];
    const app = (namespace as typeof firebase).initializeApp({
      projectId: emulatorProjectId
    });

    firestoreObject = app.firestore();
    firestoreObject.settings({
      host: emulatorHost,
      ssl: false
    });
  } else {
    try {
      firestoreObject = (namespace as typeof firebase).firestore();
    } catch (err) {
      const { project } = require('../../config/test.config.json');
      const app = (namespace as typeof firebase).initializeApp(project);
      firestoreObject = app.firestore();
    }
  }

  return firestoreObject as T;
}
*/