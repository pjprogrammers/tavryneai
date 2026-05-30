import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

type FirebaseModules = {
  auth: Auth;
  db: Firestore;
  authMod: typeof import('firebase/auth');
  firestoreMod: typeof import('firebase/firestore');
};

let _init: Promise<FirebaseModules> | null = null;
let _resolved: FirebaseModules | null = null;

/** Returns already-resolved Firebase modules synchronously (null if not yet loaded). */
export function getFirebaseSync(): FirebaseModules | null {
  return _resolved;
}

export async function getFirebase(): Promise<FirebaseModules> {
  if (!_init) {
    _init = (async () => {
      const [authMod, firestoreMod] = await Promise.all([
        import('firebase/auth'),
        import('firebase/firestore'),
      ]);

      const { auth: existingAuth, db: existingDb } = await import('@/lib/firebase/client');
      const auth = existingAuth;
      const db = existingDb;

      const result: FirebaseModules = { auth, db, authMod, firestoreMod };
      _resolved = result;
      return result;
    })();
  }
  return _init;
}
