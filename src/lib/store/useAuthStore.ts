import { create } from 'zustand';
import { User, AuthProvider } from '@/lib/types/user';
import { getFirebase, getFirebaseSync } from '@/lib/firebase/lazy';
import { applyTheme, applyColorTheme } from '@/lib/utils/theme';

const sanitizeEmail = (email: string) => email.trim().toLowerCase();

const validatePassword = (password: string, email?: string): string | null => {
  if (!password) return 'Password is required.';
  if (password.length < 10) return 'Password must be at least 10 characters long.';
  if (password.length > 128) return 'Password is too long.';
  if (/\s/.test(password)) return 'Password cannot contain spaces.';
  if (!/[A-Z]/.test(password)) return 'Password must include at least 1 uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must include at least 1 lowercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must include at least 1 number.';
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) return 'Password must include at least 1 special character.';

  const weakPasswords = ['1234567890', '123456789', 'password', 'password123', 'qwerty', '1111111111', '0000000000'];
  if (weakPasswords.includes(password.toLowerCase())) return 'This password is too common. Choose a stronger one.';
  if (email && password.toLowerCase().includes(email.split('@')[0])) return 'Password should not contain your email or name.';
  if (/^(.)\1+$/.test(password)) return 'Password cannot be repetitive.';
  return null;
};

const getAuthErrorMessage = (errorCode?: string): string => {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password is too weak.';
    case 'auth/popup-closed-by-user':
      return 'Authentication popup was closed.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Check your internet connection.';
    case 'auth/operation-not-allowed':
    case 'auth/admin-restricted-operation':
      return 'This sign-in method is not enabled. Please contact support.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized. Add it to the Firebase Console.';
    case 'auth/credential-already-in-use':
      return 'An account already exists with this email. Try signing in instead.';
    case 'auth/requires-recent-login':
      return 'Please sign out and sign in again before changing your password.';
    case 'auth/web-context-required':
      return 'Browser authentication is required. Please use a web browser.';
    case 'auth/quota-exceeded':
      return 'Service temporarily unavailable. Please try again later.';
    case 'auth/api-key-not-valid':
    case 'auth/invalid-api-key':
      return 'Authentication configuration is invalid. Contact support.';
    case 'auth/configuration-not-found':
      return 'Authentication service is not configured. Contact support.';
    case undefined:
      return 'Something went wrong. Please try again.';
    default:
      console.error('[Auth] Unhandled Firebase error:', errorCode);
      return 'Something went wrong. Please try again.';
  }
};

interface AuthState {
  user: User | null;
  firebaseUser: import('firebase/auth').User | null;
  idToken: string | null;
  loading: boolean;
  initialized: boolean;
  authError: string | null;

  initialize: () => () => void;
  handleRedirectResult: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  updateProfile: (data: { displayName?: string; avatarUrl?: string }) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  reloadAndCheckVerification: () => Promise<{ emailVerified: boolean }>;
  syncEmailVerifiedToFirestore: (firebaseUser: import('firebase/auth').User) => Promise<void>;
}

function makeUser(uid: string, email: string, displayName: string, provider: AuthProvider, emailVerified: boolean = false): User {
  const now = new Date();
  return {
    uid, email, displayName, avatarUrl: '', provider, emailVerified,
    createdAt: now, lastLoginAt: now, tokensUsedToday: 0,
    tokenResetDate: now.toISOString().split('T')[0], totalTokensConsumed: 0,
    dailyUsage: {},
    planType: 'free', projectCount: 0, isActive: true,
  };
}

const mapProviderId = (pid: string): AuthProvider => {
  if (pid === 'google.com') return 'google.com';
  if (pid === 'github.com') return 'github.com';
  return 'email';
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  idToken: null,
  loading: true,
  initialized: false,
  authError: null,

  clearError: () => set({ authError: null }),
  setLoading: (loading: boolean) => set({ loading }),

  initialize: () => {
    let unsubAuth: (() => void) | null = null;
    let unsubToken: (() => void) | null = null;
    let disposed = false;

    getFirebase().then(async ({ auth, authMod, db, firestoreMod }) => {
      if (disposed || unsubAuth) return;
      const { onAuthStateChanged, onIdTokenChanged } = authMod;
           const { doc, setDoc, serverTimestamp } = firestoreMod;

      unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
        if (disposed) return;
        if (firebaseUser) {
          try {
            await firebaseUser.reload();
            const token = await firebaseUser.getIdToken(false);
            const provider = mapProviderId(firebaseUser.providerData[0]?.providerId || 'email');

            const userRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await firestoreMod.getDoc(userRef);

            let user: User;
            if (!userDoc.exists()) {
              user = makeUser(firebaseUser.uid, firebaseUser.email || '', firebaseUser.displayName || 'User', provider, firebaseUser.emailVerified);
              await setDoc(userRef, { ...user, createdAt: serverTimestamp(), lastLoginAt: serverTimestamp() });
            } else {
              const existing = userDoc.data() as User;
              const updates: Record<string, any> = {
                displayName: firebaseUser.displayName || existing.displayName,
                email: firebaseUser.email || existing.email,
                lastLoginAt: serverTimestamp(),
              };
              if (firebaseUser.emailVerified && !existing.emailVerified) {
                updates.emailVerified = true;
                updates.emailVerifiedAt = serverTimestamp();
              }
              await setDoc(userRef, updates, { merge: true });
              user = {
                ...existing, displayName: firebaseUser.displayName || existing.displayName,
                lastLoginAt: new Date(), emailVerified: firebaseUser.emailVerified || existing.emailVerified,
                emailVerifiedAt: firebaseUser.emailVerified && !existing.emailVerified ? new Date() : existing.emailVerifiedAt,
              };
              // Apply saved preferences from Firestore
              const prefs = existing.preferences;
              if (prefs?.theme) {
                localStorage.setItem('tavryne-theme', prefs.theme);
                applyTheme(prefs.theme);
              }
              if (prefs?.colorTheme) {
                localStorage.setItem('tavryne-color-theme', prefs.colorTheme);
                applyColorTheme(prefs.colorTheme as any);
              }
            }

            set({ firebaseUser, idToken: token, user, loading: false, initialized: true, authError: null });

            // Fire-and-forget: exchange ID token for server session cookie
            fetch('/api/auth/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken: token }),
              credentials: 'include',
            }).catch(() => {});
          } catch (err: any) {
            // Token refresh failed (e.g. INVALID_REFRESH_TOKEN from securetoken.googleapis.com)
            // Sign out to clear the stale IndexedDB auth state so subsequent sign-in works
            set({ firebaseUser: null, idToken: null, user: null, loading: false, initialized: true, authError: null });
            authMod.signOut(auth).catch(() => {});
            fetch('/api/auth/session', { method: 'DELETE', credentials: 'include' }).catch(() => {});
          }
        } else {
          set({ firebaseUser: null, idToken: null, user: null, loading: false, initialized: true, authError: null });

          // Clear session cookie on logout
          fetch('/api/auth/session', { method: 'DELETE', credentials: 'include' }).catch(() => {});
        }
      });

      unsubToken = onIdTokenChanged(auth, async (firebaseUser) => {
        if (disposed || !firebaseUser) return;
        const currentUser = get().user;
        try {
          const token = await firebaseUser.getIdToken(false);
          set({ idToken: token });
        } catch {}
        if (!currentUser) return;
        if (firebaseUser.emailVerified && !currentUser.emailVerified) {
          try {
            await setDoc(doc(db, 'users', firebaseUser.uid), { emailVerified: true, emailVerifiedAt: serverTimestamp() }, { merge: true });
            set({ firebaseUser, user: { ...currentUser, emailVerified: true, emailVerifiedAt: new Date() } });
          } catch (err) {
            console.error('[Auth] Failed to sync emailVerified to Firestore:', err);
          }
        }
      });
    });

    return () => {
      disposed = true;
      unsubAuth?.();
      unsubToken?.();
    };
  },

  handleRedirectResult: async () => {
    const { auth, authMod } = await getFirebase();
    try {
      const cred = await authMod.getRedirectResult(auth);
      if (!cred) return;
      const { db, firestoreMod } = await getFirebase();
      const token = await cred.user.getIdToken();
      const userRef = firestoreMod.doc(db, 'users', cred.user.uid);
      const userDoc = await firestoreMod.getDoc(userRef);
      if (!userDoc.exists()) {
        const user = makeUser(cred.user.uid, cred.user.email || '', cred.user.displayName || 'User', mapProviderId(cred.providerId || 'email'), true);
        await firestoreMod.setDoc(userRef, { ...user, createdAt: firestoreMod.serverTimestamp(), lastLoginAt: firestoreMod.serverTimestamp() });
        set({ firebaseUser: cred.user, idToken: token, user, authError: null });
      } else {
        const existing = userDoc.data() as User;
        const user = { ...existing, lastLoginAt: new Date() };
        await firestoreMod.setDoc(userRef, { lastLoginAt: firestoreMod.serverTimestamp() }, { merge: true });
        set({ firebaseUser: cred.user, idToken: token, user, authError: null });

        // Apply saved preferences from Firestore
        const prefs = existing.preferences;
        if (prefs?.theme) {
          localStorage.setItem('tavryne-theme', prefs.theme);
          applyTheme(prefs.theme);
        }
        if (prefs?.colorTheme) {
          localStorage.setItem('tavryne-color-theme', prefs.colorTheme);
          applyColorTheme(prefs.colorTheme as any);
        }
      }
      fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
        credentials: 'include',
      }).catch(() => {});
    } catch (err: any) {
      set({ authError: err.message });
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    set({ authError: null });
    const { auth, authMod } = await getFirebase();
    try {
      const cleanEmail = sanitizeEmail(email);
      const cred = await authMod.signInWithEmailAndPassword(auth, cleanEmail, password);
      if (!cred.user.emailVerified) {
        await authMod.signOut(auth);
        set({ firebaseUser: null, idToken: null, user: null, authError: 'Please verify your email before signing in.' });
        fetch('/api/auth/session', { method: 'DELETE', credentials: 'include' }).catch(() => {});
        throw new Error('Please verify your email before signing in.');
      }
      const { db, firestoreMod } = await getFirebase();
      const token = await cred.user.getIdToken();
      const userRef = firestoreMod.doc(db, 'users', cred.user.uid);
      const userDoc = await firestoreMod.getDoc(userRef);
      let user: User;
      if (userDoc.exists()) {
        const existing = userDoc.data() as User;
        user = { ...existing, lastLoginAt: new Date() };
        set({ firebaseUser: cred.user, idToken: token, user });
        firestoreMod.setDoc(userRef, { lastLoginAt: firestoreMod.serverTimestamp() }, { merge: true }).catch(() => {});
      } else {
        user = makeUser(cred.user.uid, cred.user.email || '', cred.user.displayName || 'User', 'email', cred.user.emailVerified);
        set({ firebaseUser: cred.user, idToken: token, user });
        firestoreMod.setDoc(userRef, { ...user, createdAt: firestoreMod.serverTimestamp(), lastLoginAt: firestoreMod.serverTimestamp() }).catch(() => {});
      }
    } catch (err: any) {
      console.error('[Auth] signInWithEmail error:', err);
      const msg = err.code ? getAuthErrorMessage(err.code) : (err.message || 'Something went wrong. Please try again.');
      set({ authError: msg });
      throw new Error(msg);
    }
  },

  signUpWithEmail: async (email: string, password: string, displayName: string) => {
    set({ authError: null });
    const { auth, authMod, db, firestoreMod } = await getFirebase();
    try {
      const cleanEmail = sanitizeEmail(email);
      const passwordError = validatePassword(password, cleanEmail);
      if (passwordError) {
        set({ authError: passwordError });
        throw new Error(passwordError);
      }
      const cred = await authMod.createUserWithEmailAndPassword(auth, cleanEmail, password);
      const token = await cred.user.getIdToken();
      await authMod.updateProfile(cred.user, { displayName });
      await authMod.sendEmailVerification(cred.user);
      const user = makeUser(cred.user.uid, cred.user.email || '', displayName, 'email', false);
      set({ firebaseUser: cred.user, idToken: token, user });
      firestoreMod.setDoc(firestoreMod.doc(db, 'users', cred.user.uid), {
        ...user, createdAt: firestoreMod.serverTimestamp(), lastLoginAt: firestoreMod.serverTimestamp(), verificationEmailSentAt: firestoreMod.serverTimestamp(),
      }).catch(() => {});
    } catch (err: any) {
      console.error('[Auth] signUpWithEmail error:', err);
      const msg = err.code ? getAuthErrorMessage(err.code) : (err.message || 'Something went wrong. Please try again.');
      set({ authError: msg });
      throw new Error(msg);
    }
  },

  signInWithGoogle: async () => {
    set({ authError: null });
    const f = getFirebaseSync() ?? await getFirebase();
    try {
      const provider = new f.authMod.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await f.authMod.signInWithPopup(f.auth, provider);
    } catch (err: any) {
      console.error('[Auth] signInWithGoogle error:', err);
      const msg = err.code ? getAuthErrorMessage(err.code) : (err.message || 'Failed to sign in with Google');
      if (msg) set({ authError: msg });
      throw new Error(msg);
    }
  },

  signInWithGithub: async () => {
    set({ authError: null });
    const f = getFirebaseSync() ?? await getFirebase();
    try {
      const provider = new f.authMod.GithubAuthProvider();
      await f.authMod.signInWithPopup(f.auth, provider);
    } catch (err: any) {
      console.error('[Auth] signInWithGithub error:', err);
      const msg = err.code ? getAuthErrorMessage(err.code) : (err.message || 'Failed to sign in with GitHub');
      if (msg) set({ authError: msg });
      throw new Error(msg);
    }
  },

  logout: async () => {
    const { auth, authMod } = await getFirebase();
    await authMod.signOut(auth);
    set({ firebaseUser: null, idToken: null, user: null, authError: null });
  },

  refreshToken: async () => {
    const { firebaseUser } = get();
    if (firebaseUser) {
      const token = await firebaseUser.getIdToken(true);
      set({ idToken: token });
    }
  },

  updateProfile: async (data: { displayName?: string; avatarUrl?: string }) => {
    const { firebaseUser, user } = get();
    if (!firebaseUser || !user) throw new Error('Not authenticated');
    set({ authError: null });
    try {
      const { authMod } = await getFirebase();
      if (data.displayName) {
        await authMod.updateProfile(firebaseUser, { displayName: data.displayName });
      }
      const updates: Record<string, any> = {};
      if (data.displayName) updates.displayName = data.displayName;
      if (data.avatarUrl !== undefined) updates.avatarUrl = data.avatarUrl;
      if (Object.keys(updates).length > 0) {
        const { db, firestoreMod } = await getFirebase();
        await firestoreMod.setDoc(firestoreMod.doc(db, 'users', firebaseUser.uid), { ...updates, updatedAt: firestoreMod.serverTimestamp() }, { merge: true });
      }
      set({ user: { ...user, ...updates } });
    } catch (err: any) {
      set({ authError: err.message });
      throw err;
    }
  },

  updatePassword: async (newPassword: string) => {
    const { firebaseUser } = get();
    if (!firebaseUser) throw new Error('Not authenticated');
    set({ authError: null });
    try {
      const { authMod } = await getFirebase();
      await authMod.updatePassword(firebaseUser, newPassword);
    } catch (err: any) {
      const msg = err.code === 'auth/requires-recent-login'
        ? 'Please sign out and sign in again before changing your password'
        : err.message || 'Failed to update password';
      set({ authError: msg });
      throw new Error(msg);
    }
  },

  sendPasswordReset: async (email: string) => {
    set({ authError: null });
    const { auth, authMod } = await getFirebase();
    try {
      await authMod.sendPasswordResetEmail(auth, sanitizeEmail(email));
    } catch (err: any) {
      console.error('[Auth] sendPasswordReset error:', err);
      const msg = err.code ? getAuthErrorMessage(err.code) : (err.message || 'Something went wrong. Please try again.');
      set({ authError: msg });
      throw new Error(msg);
    }
  },

  sendEmailVerification: async () => {
    const { firebaseUser, user } = get();
    if (!firebaseUser) throw new Error('Not authenticated');
    set({ authError: null });
    try {
      const { authMod, db, firestoreMod } = await getFirebase();
      await authMod.sendEmailVerification(firebaseUser);
      if (user) {
        await firestoreMod.setDoc(firestoreMod.doc(db, 'users', firebaseUser.uid), { verificationEmailSentAt: firestoreMod.serverTimestamp() }, { merge: true });
      }
    } catch (err: any) {
      set({ authError: err.message });
      throw err;
    }
  },

  syncEmailVerifiedToFirestore: async (firebaseUser: import('firebase/auth').User) => {
    const currentUser = get().user;
    if (!currentUser) return;
    if (firebaseUser.emailVerified && !currentUser.emailVerified) {
      const { db, firestoreMod } = await getFirebase();
      await firestoreMod.setDoc(firestoreMod.doc(db, 'users', firebaseUser.uid), { emailVerified: true, emailVerifiedAt: firestoreMod.serverTimestamp() }, { merge: true });
      set({ firebaseUser, user: { ...currentUser, emailVerified: true, emailVerifiedAt: new Date() } });
    }
  },

  reloadAndCheckVerification: async () => {
    const { firebaseUser } = get();
    if (!firebaseUser) throw new Error('Not authenticated');
    await firebaseUser.reload();
    const { auth } = await getFirebase();
    const updatedUser = auth.currentUser;
    if (!updatedUser) throw new Error('User not found');
    if (updatedUser.emailVerified) {
      await updatedUser.getIdToken(true);
      await get().syncEmailVerifiedToFirestore(updatedUser);
    }
    return { emailVerified: updatedUser.emailVerified };
  },
}));
