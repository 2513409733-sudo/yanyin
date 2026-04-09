/**
 * Firebase Firestore service for cross-device user registration,
 * UID search, and partner binding.
 *
 * Firestore schema:
 *   users/{uid}     { uid, name, createdAt, mood?, moodSong? }
 *   couples/{id}    { users: [uid1, uid2], boundAt }
 *     id = sorted UIDs joined by '_'  e.g. "AAA_BBB"
 */
import {
  doc, getDoc, setDoc, query, collection,
  where, getDocs, serverTimestamp, onSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'

// ── Helpers ──────────────────────────────────────────────

const coupleId = (a, b) => [a, b].sort().join('_')

// ── User registration ─────────────────────────────────────

/**
 * Register a new user. Returns { ok: true } or { ok: false, error }.
 */
export async function registerUserRemote(uid, name) {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return { ok: false, error: 'uid_taken' }
  await setDoc(ref, { uid, name, createdAt: serverTimestamp() })
  return { ok: true }
}

// ── Login ─────────────────────────────────────────────────

/**
 * Fetch a user by UID. Returns user data or null.
 */
export async function fetchUserByUid(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

// ── Partner search ────────────────────────────────────────

/**
 * Search for a user by UID (excluding self). Returns user data or null.
 */
export async function searchPartnerByUid(uid, myUid) {
  if (uid === myUid) return null
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

// ── Partner binding ───────────────────────────────────────

/**
 * Create a couple record linking two UIDs.
 */
export async function bindPartnerRemote(myUid, partnerUid) {
  const id = coupleId(myUid, partnerUid)
  await setDoc(doc(db, 'couples', id), {
    users: [myUid, partnerUid],
    boundAt: serverTimestamp(),
  }, { merge: true })
}

/**
 * Find the couple record for a user. Returns { partnerUid } or null.
 */
export async function fetchCoupleForUser(myUid) {
  const q = query(collection(db, 'couples'), where('users', 'array-contains', myUid))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const data = snap.docs[0].data()
  const partnerUid = data.users.find(u => u !== myUid)
  return { partnerUid, boundAt: data.boundAt }
}

// ── Real-time partner status ──────────────────────────────

/**
 * Subscribe to a partner's live status (mood, moodSong, name).
 * Returns an unsubscribe function.
 */
export function subscribePartnerStatus(partnerUid, callback) {
  return onSnapshot(doc(db, 'users', partnerUid), snap => {
    if (snap.exists()) callback(snap.data())
  })
}

// ── Publish own mood ─────────────────────────────────────

/**
 * Write the user's current mood to Firestore so the partner can see it.
 */
export async function publishMood(uid, mood, moodSong) {
  await setDoc(doc(db, 'users', uid), { mood, moodSong }, { merge: true })
}
