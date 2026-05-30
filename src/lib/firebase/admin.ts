import admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';

let _app: admin.app.App | null = null;
let _auth: Auth | null = null;
let _firestore: Firestore | null = null;

function ensureCredentials() {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (admin.apps.length > 0) {
    _app = admin.apps[0]!;
    return;
  }

  if (!_app) {
    if (!privateKey || !clientEmail || !projectId) {
      throw new Error(
        'Firebase Admin credentials not configured. Set FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY, and NEXT_PUBLIC_FIREBASE_PROJECT_ID.'
      );
    }
    _app = admin.initializeApp({
      credential: admin.credential.cert({
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
        projectId,
      }),
    });
  }
}

const authHandler = {
  get(_target: any, prop: string | symbol) {
    ensureCredentials();
    if (!_auth) _auth = _app!.auth();
    const value = (_auth as any)[prop];
    return typeof value === 'function' ? value.bind(_auth) : value;
  },
};

const firestoreHandler = {
  get(_target: any, prop: string | symbol) {
    ensureCredentials();
    if (!_firestore) _firestore = _app!.firestore();
    const value = (_firestore as any)[prop];
    return typeof value === 'function' ? value.bind(_firestore) : value;
  },
};

export const adminAuth = new Proxy({} as Auth, authHandler);
export const adminFirestore = new Proxy({} as Firestore, firestoreHandler);
export { FieldValue };
