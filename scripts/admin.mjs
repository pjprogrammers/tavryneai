#!/usr/bin/env node
/**
 * scripts/admin.mjs
 *
 * Manage admin custom claims on Firebase Auth users.
 *
 * Usage:
 *   node scripts/admin.mjs grant <email>     # mark a user as admin
 *   node scripts/admin.mjs revoke <email>    # remove admin from a user
 *   node scripts/admin.mjs check <email>     # show current claim + Firestore isAdmin
 *   node scripts/admin.mjs list              # list all users with the admin claim
 *
 * Requirements:
 *   - FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY in .env.local
 *     (already present in this repo).
 *   - The user must already exist in Firebase Auth (sign in once before granting).
 *
 * This is the recommended way to add/remove admins. The env-var `ADMIN_EMAILS`
 * whitelist is a legacy fallback that requires a redeploy to take effect.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function loadEnvLocal() {
  const path = resolve(ROOT, '.env.local');
  if (!existsSync(path)) {
    throw new Error(`.env.local not found at ${path}`);
  }
  const text = readFileSync(path, 'utf8');
  const env = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replace(/\\n/g, '\n');
    }
    env[key] = value;
  }
  return env;
}

const env = loadEnvLocal();
const clientEmail = env.FIREBASE_ADMIN_CLIENT_EMAIL;
const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const privateKeyRaw = env.FIREBASE_ADMIN_PRIVATE_KEY;
if (!clientEmail || !projectId || !privateKeyRaw) {
  console.error('Missing FIREBASE_ADMIN_CLIENT_EMAIL / NEXT_PUBLIC_FIREBASE_PROJECT_ID / FIREBASE_ADMIN_PRIVATE_KEY in .env.local');
  process.exit(1);
}
const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

const { initializeApp, cert } = await import('firebase-admin/app');
const { getAuth } = await import('firebase-admin/auth');
const { getFirestore, FieldValue } = await import('firebase-admin/firestore');

initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
});

const auth = getAuth();
const db = getFirestore();

async function getUserByEmail(email) {
  try {
    return await auth.getUserByEmail(email);
  } catch (err) {
    if (err?.code === 'auth/user-not-found') {
      return null;
    }
    throw err;
  }
}

async function setClaim(uid, claim) {
  await auth.setCustomUserClaims(uid, claim);
  const userRef = db.doc(`users/${uid}`);
  await userRef.set({ isAdmin: !!claim.admin, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

async function grant(email) {
  const user = await getUserByEmail(email);
  if (!user) {
    console.error(`No Firebase Auth user with email: ${email}`);
    console.error('The user must sign in to the app at least once before they can be granted admin.');
    process.exit(1);
  }
  await setClaim(user.uid, { admin: true });
  await auth.revokeRefreshTokens(user.uid).catch(() => {});
  console.log(`Granted admin to ${email} (uid=${user.uid}).`);
  console.log('The user must sign out and sign back in (or the token will auto-refresh within ~1h) for the new claim to take effect.');
}

async function revoke(email) {
  const user = await getUserByEmail(email);
  if (!user) {
    console.error(`No Firebase Auth user with email: ${email}`);
    process.exit(1);
  }
  await setClaim(user.uid, { admin: false });
  await auth.revokeRefreshTokens(user.uid).catch(() => {});
  console.log(`Revoked admin from ${email} (uid=${user.uid}).`);
}

async function check(email) {
  const user = await getUserByEmail(email);
  if (!user) {
    console.error(`No Firebase Auth user with email: ${email}`);
    process.exit(1);
  }
  const claim = user.customClaims?.admin === true;
  const snap = await db.doc(`users/${user.uid}`).get();
  const fsIsAdmin = snap.exists ? snap.data()?.isAdmin === true : null;
  console.log(`uid:        ${user.uid}`);
  console.log(`email:      ${user.email}`);
  console.log(`admin claim: ${claim}`);
  console.log(`Firestore isAdmin: ${fsIsAdmin}`);
  console.log(`env whitelist (ADMIN_EMAILS): ${(env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).includes(email.toLowerCase())}`);
}

async function list() {
  console.log('Scanning all users — this lists up to 1000 most recent sign-ins. Users with the admin claim:');
  let pageToken = undefined;
  const found = [];
  do {
    const result = await auth.listUsers(1000, pageToken);
    for (const u of result.users) {
      if (u.customClaims?.admin === true) {
        found.push({ uid: u.uid, email: u.email || '(no email)' });
      }
    }
    pageToken = result.pageToken;
  } while (pageToken);
  if (found.length === 0) {
    console.log('(none)');
  } else {
    for (const u of found) console.log(`  ${u.email}  uid=${u.uid}`);
  }
}

const [, , cmd, arg] = process.argv;
switch (cmd) {
  case 'grant':  if (!arg) { console.error('Usage: grant <email>'); process.exit(1); } await grant(arg); break;
  case 'revoke': if (!arg) { console.error('Usage: revoke <email>'); process.exit(1); } await revoke(arg); break;
  case 'check':  if (!arg) { console.error('Usage: check <email>'); process.exit(1); } await check(arg); break;
  case 'list':   await list(); break;
  default:
    console.error('Usage: node scripts/admin.mjs <grant|revoke|check|list> [email]');
    process.exit(1);
}
