/**
 * LeanCloud service — cross-device user registration, UID search, partner binding.
 *
 * LeanCloud classes (auto-created on first save):
 *   YanUser  { uid: string (unique), name: string, mood?: object, moodSong?: object }
 *   Couple   { userA: string, userB: string }
 */
import { AV } from './leancloud'

// ── Helpers ──────────────────────────────────────────────

async function findYanUser(uid) {
  const q = new AV.Query('YanUser')
  q.equalTo('uid', uid)
  return q.first()   // returns AV.Object or undefined
}

// ── Register ─────────────────────────────────────────────

export async function registerUserRemote(uid, name) {
  const existing = await findYanUser(uid)
  if (existing) return { ok: false, error: 'uid_taken' }
  const obj = new AV.Object('YanUser')
  obj.set('uid', uid)
  obj.set('name', name)
  await obj.save()
  return { ok: true }
}

// ── Login ─────────────────────────────────────────────────

export async function fetchUserByUid(uid) {
  const obj = await findYanUser(uid)
  if (!obj) return null
  return { uid: obj.get('uid'), name: obj.get('name') }
}

// ── Search partner ────────────────────────────────────────

export async function searchPartnerByUid(uid, myUid) {
  if (uid === myUid) return null
  return fetchUserByUid(uid)
}

// ── Bind partners ─────────────────────────────────────────

export async function bindPartnerRemote(myUid, partnerUid) {
  // Avoid duplicate couple records
  const q1 = new AV.Query('Couple')
  q1.equalTo('userA', myUid); q1.equalTo('userB', partnerUid)
  const q2 = new AV.Query('Couple')
  q2.equalTo('userA', partnerUid); q2.equalTo('userB', myUid)
  const existing = await AV.Query.or(q1, q2).first()
  if (existing) return

  const couple = new AV.Object('Couple')
  couple.set('userA', myUid)
  couple.set('userB', partnerUid)
  await couple.save()
}

export async function fetchCoupleForUser(myUid) {
  const q1 = new AV.Query('Couple'); q1.equalTo('userA', myUid)
  const q2 = new AV.Query('Couple'); q2.equalTo('userB', myUid)
  const obj = await AV.Query.or(q1, q2).first()
  if (!obj) return null
  const partnerUid = obj.get('userA') === myUid ? obj.get('userB') : obj.get('userA')
  return { partnerUid }
}

// ── Real-time partner status (polling every 30 s) ─────────

export function subscribePartnerStatus(partnerUid, callback) {
  let active = true

  const poll = async () => {
    while (active) {
      try {
        const obj = await findYanUser(partnerUid)
        if (obj) {
          callback({
            uid:      obj.get('uid'),
            name:     obj.get('name'),
            mood:     obj.get('mood'),
            moodSong: obj.get('moodSong'),
          })
        }
      } catch { /* network error — ignore */ }
      await new Promise(r => setTimeout(r, 30_000))
    }
  }

  poll()
  return () => { active = false }
}

// ── Publish own mood ──────────────────────────────────────

export async function publishMood(uid, mood, moodSong) {
  const obj = await findYanUser(uid)
  if (!obj) return
  if (mood)     obj.set('mood', mood)
  if (moodSong) obj.set('moodSong', moodSong)
  await obj.save()
}
