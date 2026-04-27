/**
 * Backend service stub — all functions return "not available" so the app
 * falls back to localStorage-only mode. Replace with a real backend later.
 */

export async function registerUserRemote(_uid, _name) {
  return { ok: false, error: 'no_backend' }
}

export async function fetchUserByUid(_uid) {
  return null
}

export async function searchPartnerByUid(_uid, _myUid) {
  return null
}

export async function bindPartnerRemote(_myUid, _partnerUid) {}

export async function fetchCoupleForUser(_myUid) {
  return null
}

export function subscribePartnerStatus(_partnerUid, _callback) {
  return () => {}
}

export async function publishMood(_uid, _mood, _moodSong) {}
