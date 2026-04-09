import { create } from 'zustand'

// ── 默认主题颜色 ──────────────────────────────────────────
export const DEFAULT_THEME = {
  primary:   '#FD85AB',
  secondary: '#92C6D9',
  accent:    '#3FEECE',
  bg:        '#fdf6e3',
  bgHeader:  '#f5eedc',
}

// ── 主题风格预设 ──────────────────────────────────────────
export const THEME_PRESETS = [
  { label: '蜜桃粉',   primary: '#FD85AB', secondary: '#92C6D9', accent: '#3FEECE', bg: '#fdf6e3', bgHeader: '#f5eedc' },
  { label: '抹茶拿铁', primary: '#7DA87B', secondary: '#C5B99E', accent: '#D4C483', bg: '#F2F7F0', bgHeader: '#E8F0E4' },
  { label: '薰衣草',   primary: '#9B7EC8', secondary: '#B8D4E0', accent: '#F0C8D0', bg: '#F5F0FF', bgHeader: '#EDE6FA' },
  { label: '焦糖杏',   primary: '#D4956A', secondary: '#B8C5A0', accent: '#E8B86D', bg: '#FDF5EC', bgHeader: '#F7EBDC' },
  { label: '深海蓝',   primary: '#5BAFC4', secondary: '#8BA8C8', accent: '#E8C97E', bg: '#EEF4F8', bgHeader: '#E4EDF4' },
  { label: '暖橘秋',   primary: '#E8704A', secondary: '#9AB8A8', accent: '#F0C060', bg: '#FFF4EC', bgHeader: '#FFEADC' },
]

// ── 农历日期显示 ────────────────────────────────────────
export const toLunarDate = (dateStr) => {
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('zh-u-ca-chinese', { month: 'long', day: 'numeric' })
  } catch {
    return ''
  }
}

// ── 纪念日计算工具 ────────────────────────────────────────
export const calcAnniversary = (anniv) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const parts = anniv.date.split('-')
  const month = parseInt(parts[1]) - 1
  const day = parseInt(parts[2])

  if (anniv.type === 'anniversary') {
    const start = new Date(anniv.date + 'T00:00:00')
    const days = Math.floor((today - start) / 86400000)
    return { days, mode: 'since', label: days >= 0 ? `第 ${days} 天` : `还有 ${-days} 天` }
  } else {
    let next
    if (anniv.repeat === 'yearly') {
      next = new Date(today.getFullYear(), month, day)
      if (next < today) next.setFullYear(today.getFullYear() + 1)
    } else if (anniv.repeat === 'monthly') {
      next = new Date(today.getFullYear(), today.getMonth(), day)
      if (next < today) { next.setMonth(next.getMonth() + 1) }
    } else {
      next = new Date(anniv.date + 'T00:00:00')
    }
    const days = Math.ceil((next - today) / 86400000)
    return { days: Math.max(0, days), mode: 'countdown', label: days === 0 ? '就是今天！' : `还有 ${days} 天` }
  }
}

export const MOODS = [
  { label: '开心', emoji: '😊', color: '#FDCB6E' },
  { label: '平静', emoji: '😌', color: '#74B9FF' },
  { label: '期待', emoji: '🥰', color: '#FF8FA3' },
  { label: '疲惫', emoji: '😪', color: '#b2bec3' },
  { label: '难过', emoji: '😢', color: '#636e72' },
  { label: '焦虑', emoji: '😰', color: '#a29bfe' },
  { label: '生气', emoji: '😠', color: '#ff7675' },
]

// ── Mock 数据 ──────────────────────────────────────────────
const mockCheckins = [
  {
    id: 1, date: '2026-03-13', meal: 'breakfast',
    userA: { img: null, text: '今天的早餐是燕麦粥，加了蓝莓 🫐', time: '08:12' },
    userB: { img: null, text: '包子和豆浆，快乐！', time: '08:30' },
    comments: [
      { id: 1, from: 'B', text: '你的早餐好健康哦', time: '08:35' },
      { id: 2, from: 'A', text: '哈哈你的包子看起来也很好吃', time: '08:40' },
    ],
  },
  {
    id: 2, date: '2026-03-13', meal: 'lunch',
    userA: { img: null, text: '外卖沙拉，清爽', time: '12:05' },
    userB: null,
    comments: [],
  },
  {
    id: 3, date: '2026-03-13', meal: 'dinner',
    userA: null, userB: null, comments: [],
  },
]

const mockMessages = [
  { id: 1, from: 'B', text: '你在干嘛呢~', time: '10:01', type: 'text', read: true },
  { id: 2, from: 'A', text: '在工作ing，好忙😭', time: '10:03', type: 'text', read: true },
  { id: 3, from: 'B', text: '辛苦了❤️ 中午想吃什么', time: '10:05', type: 'text', read: true },
  { id: 4, from: 'A', text: '想吃你做的饭哈哈', time: '10:06', type: 'text', read: true },
  { id: 5, from: 'B', text: '那今晚给你做！', time: '10:07', type: 'text', read: false },
]

const mockMemories = [
  {
    id: 1, date: '2026-02-14', title: '情人节快乐', text: '第一次一起看烟火🎆', emoji: '🌸',
    photos: [],
    comments: [{ id: 1, from: 'B', text: '这天好开心，永远记得~', time: '22:30' }],
  },
  {
    id: 2, date: '2026-01-01', title: '新年', text: '一起跨年，许下了很多愿望', emoji: '🎉',
    photos: [], comments: [],
  },
  {
    id: 3, date: '2025-12-25', title: '圣诞节', text: '交换礼物，你的眼睛亮亮的', emoji: '🎄',
    photos: [], comments: [],
  },
]

const mockPlaylist = [
  { id: 1, title: '晴天', artist: '周杰伦', songId: '186001', link: 'https://music.163.com/song?id=186001', from: 'A', addedAt: '2026-03-13' },
  { id: 2, title: '告白气球', artist: '周杰伦', songId: '413812694', link: 'https://music.163.com/song?id=413812694', from: 'B', addedAt: '2026-03-12' },
  { id: 3, title: '小幸运', artist: '田馥甄', songId: '31654343', link: 'https://music.163.com/song?id=31654343', from: 'B', addedAt: '2026-03-10' },
  { id: 4, title: '永不失联的爱', artist: '周兴哲', songId: '441116287', link: 'https://music.163.com/song?id=441116287', from: 'A', addedAt: '2026-03-08' },
]

const mockGifts = [
  {
    id: 1, date: '2026-03-08', from: 'B',
    title: '女神节礼物', text: '一束粉色玫瑰，香香的 🌹',
    img: null,
    comments: [{ id: 1, from: 'A', text: '好漂亮！谢谢你 💕', time: '15:30' }],
  },
  {
    id: 2, date: '2026-02-14', from: 'B',
    title: '情人节巧克力', text: '手工制作的心形巧克力，甜甜的~',
    img: null, comments: [],
  },
  {
    id: 3, date: '2026-01-01', from: 'A',
    title: '新年礼物', text: '给你买了星露谷周边手办 🌱',
    img: null,
    comments: [{ id: 1, from: 'B', text: '太可爱了！！好喜欢 😭', time: '00:20' }],
  },
]

const mockPeriodLogs = [
  { id: 1, from: 'A', startDate: '2026-01-18', endDate: '2026-01-23', notes: '' },
  { id: 2, from: 'A', startDate: '2026-02-16', endDate: '2026-02-21', notes: '' },
  { id: 3, from: 'A', startDate: '2026-03-14', endDate: null,         notes: '' },
  { id: 4, from: 'B', startDate: '2026-01-22', endDate: '2026-01-27', notes: '' },
  { id: 5, from: 'B', startDate: '2026-02-20', endDate: '2026-02-25', notes: '' },
]

function _toggleItem(items, id) {
  const today = new Date().toISOString().slice(0, 10)
  return items.map(it => {
    if (it.id === id) { const done = !it.done; return { ...it, done, doneAt: done ? today : null } }
    return { ...it, items: _toggleItem(it.items || [], id) }
  })
}
function _addItem(items, parentId, newItem) {
  if (parentId === null) return [...items, newItem]
  return items.map(it => {
    if (it.id === parentId) return { ...it, items: [...(it.items || []), newItem] }
    return { ...it, items: _addItem(it.items || [], parentId, newItem) }
  })
}

const mockPlans = [
  {
    id: 1, title: '一起去看演唱会', time: '2026-05-01', from: 'B',
    createdAt: '2026-03-01', done: false, doneAt: null,
    items: [
      { id: 11, title: '购买演唱会门票', done: true, doneAt: '2026-03-10', items: [] },
      { id: 12, title: '预订附近酒店', done: false, doneAt: null, items: [
        { id: 121, title: '查好评价', done: false, doneAt: null, items: [] },
        { id: 122, title: '确认交通路线', done: false, doneAt: null, items: [] },
      ]},
      { id: 13, title: '准备应援物品', done: false, doneAt: null, items: [] },
    ],
  },
  {
    id: 2, title: '一起学一道新菜', time: null, from: 'A',
    createdAt: '2026-03-10', done: false, doneAt: null,
    items: [
      { id: 21, title: '选定食谱', done: true, doneAt: '2026-03-11', items: [] },
      { id: 22, title: '采购食材', done: false, doneAt: null, items: [] },
      { id: 23, title: '约好一起做饭的时间', done: false, doneAt: null, items: [] },
    ],
  },
]

const mockGoals = [
  { id: 1, from: 'A', title: '每天早起', detail: '工作日 6:30 前起床', steps: 30, progress: 12, completed: false, completedAt: null, createdAt: '2026-02-01' },
  { id: 2, from: 'A', title: '读完一本书', detail: '《人类简史》，每天读 10 页', steps: 10, progress: 3, completed: false, completedAt: null, createdAt: '2026-03-01' },
  { id: 3, from: 'B', title: '学做甜点', detail: '掌握 5 种基础甜点做法', steps: 5, progress: 2, completed: false, completedAt: null, createdAt: '2026-02-15' },
  { id: 4, from: 'B', title: '连续跑步打卡', detail: '每天跑步 30 分钟', steps: 30, progress: 30, completed: true, completedAt: '2026-03-01', createdAt: '2026-02-01' },
]

const mockLedgerCategories = [
  { id: 'food',      label: '餐饮',  emoji: '🍜', type: 'expense', isCustom: false },
  { id: 'transport', label: '交通',  emoji: '🚌', type: 'expense', isCustom: false },
  { id: 'shopping',  label: '购物',  emoji: '🛍️', type: 'expense', isCustom: false },
  { id: 'entertain', label: '娱乐',  emoji: '🎮', type: 'expense', isCustom: false },
  { id: 'health',    label: '医疗',  emoji: '💊', type: 'expense', isCustom: false },
  { id: 'housing',   label: '居住',  emoji: '🏠', type: 'expense', isCustom: false },
  { id: 'other_exp', label: '其他',  emoji: '📦', type: 'expense', isCustom: false },
  { id: 'salary',    label: '工资',  emoji: '💰', type: 'income',  isCustom: false },
  { id: 'bonus',     label: '奖金',  emoji: '🎁', type: 'income',  isCustom: false },
  { id: 'invest',    label: '理财',  emoji: '📈', type: 'income',  isCustom: false },
  { id: 'other_inc', label: '其他',  emoji: '✨', type: 'income',  isCustom: false },
]

const mockLedgerEntries = [
  { id: 1,  date: '2026-03-13', type: 'expense', amount: 68,    rawAmount: 68,    currency: 'CNY', categoryId: 'food',      note: '火锅🍲',      from: 'A' },
  { id: 2,  date: '2026-03-13', type: 'expense', amount: 24,    rawAmount: 24,    currency: 'CNY', categoryId: 'transport', note: '地铁',        from: 'B' },
  { id: 3,  date: '2026-03-12', type: 'expense', amount: 238,   rawAmount: 238,   currency: 'CNY', categoryId: 'shopping',  note: '买了一件外套', from: 'A' },
  { id: 4,  date: '2026-03-10', type: 'income',  amount: 12000, rawAmount: 12000, currency: 'CNY', categoryId: 'salary',    note: '三月工资',    from: 'A' },
  { id: 5,  date: '2026-03-10', type: 'income',  amount: 9500,  rawAmount: 9500,  currency: 'CNY', categoryId: 'salary',    note: '三月工资',    from: 'B' },
  { id: 6,  date: '2026-03-08', type: 'expense', amount: 188,   rawAmount: 188,   currency: 'CNY', categoryId: 'entertain', note: '电影+爆米花', from: 'B' },
  { id: 7,  date: '2026-03-05', type: 'expense', amount: 320,   rawAmount: 44.3,  currency: 'USD', categoryId: 'shopping',  note: '亚马逊购物',  from: 'A' },
  { id: 8,  date: '2026-02-14', type: 'expense', amount: 560,   rawAmount: 560,   currency: 'CNY', categoryId: 'entertain', note: '情人节晚餐',  from: 'A' },
  { id: 9,  date: '2026-02-10', type: 'expense', amount: 45,    rawAmount: 45,    currency: 'CNY', categoryId: 'transport', note: '打车',        from: 'B' },
  { id: 10, date: '2026-02-01', type: 'income',  amount: 12000, rawAmount: 12000, currency: 'CNY', categoryId: 'salary',    note: '二月工资',    from: 'A' },
  { id: 11, date: '2026-02-01', type: 'income',  amount: 9500,  rawAmount: 9500,  currency: 'CNY', categoryId: 'salary',    note: '二月工资',    from: 'B' },
]

// ── Store ──────────────────────────────────────────────────
export const useStore = create((set, get) => ({
  theme: { ...DEFAULT_THEME },
  setTheme: (partial) => set(s => ({ theme: { ...s.theme, ...partial } })),
  resetTheme: () => set({ theme: { ...DEFAULT_THEME } }),

  isLoggedIn: false,
  user: {
    uid: 'IS87654321',
    name: '小雪',
    gender: 'female',
    hasSetAvatar: false,
    avatar: { skin: 's2', hair: 'h1', hairColor: 'hc2', eyes: 'e1', outfit: 'o1', outfitColor: 'oc6', accessory: 'a0' },
    mood: { label: '期待', emoji: '🥰', color: '#FF8FA3' },
    moodSong: { title: '晴天', artist: '周杰伦', songId: '186001', link: 'https://music.163.com/song?id=186001' },
    avatarUrl: null,
  },
  partner: {
    uid: 'IS12345678',
    name: '小明',
    gender: 'female',
    avatar: { skin: 's2', hair: 'h1', hairColor: 'hc2', eyes: 'e1', outfit: 'o1', outfitColor: 'oc6', accessory: 'a0' },
    nickname: 'TA',
    relation: '亲密关系',
    relationLabel: '在一起',
    mood: { label: '开心', emoji: '😊', color: '#FDCB6E' },
    moodSong: { title: '告白气球', artist: '周杰伦', songId: '413812694', link: 'https://music.163.com/song?id=413812694' },
    daysCount: 128,
  },

  checkins: mockCheckins,
  messages: mockMessages,
  memories: mockMemories,
  gifts: mockGifts,
  playlist: mockPlaylist,
  plans: mockPlans,
  goals: mockGoals,
  ledgerEntries: mockLedgerEntries,
  ledgerCategories: mockLedgerCategories,
  exchangeRates: { USD: 7.24, EUR: 7.85, JPY: 0.048, GBP: 9.18, HKD: 0.93, KRW: 0.0052, TWD: 0.22, SGD: 5.38 },
  ratesUpdatedAt: null,
  isBound: true,
  periodLogs: mockPeriodLogs,
  stickers: [],
  myMood: null,
  moodHistory: [
    { date: '2026-03-12', mood: MOODS[0] },
    { date: '2026-03-11', mood: MOODS[2] },
    { date: '2026-03-10', mood: MOODS[1] },
  ],
  anniversaries: [
    { id: 1, title: '在一起纪念日', date: '2025-11-05', type: 'anniversary', repeat: 'yearly',  calType: 'solar' },
    { id: 2, title: 'TA 的生日',    date: '1999-06-15', type: 'countdown',   repeat: 'yearly',  calType: 'solar' },
    { id: 3, title: '我的生日',     date: '2000-09-20', type: 'countdown',   repeat: 'yearly',  calType: 'solar' },
  ],

  // Actions
  login: (name) => set({ isLoggedIn: true, user: { ...get().user, name } }),
  logout: () => set({ isLoggedIn: false }),
  setAvatar: (avatar) => set(s => ({ user: { ...s.user, avatar } })),
  setHasSetAvatar: () => set(s => ({ user: { ...s.user, hasSetAvatar: true } })),
  setDaysCount: (n) => set(s => ({ partner: { ...s.partner, daysCount: n } })),
  setRelationLabel: (label) => set(s => ({ partner: { ...s.partner, relationLabel: label } })),
  setMoodSong: (song) => {
    const today = new Date().toISOString().slice(0, 10)
    set(s => ({
      user: { ...s.user, moodSong: song },
      playlist: [{ id: Date.now(), ...song, from: 'A', addedAt: today }, ...s.playlist],
    }))
  },
  addToPlaylist: (song) => {
    const today = new Date().toISOString().slice(0, 10)
    set(s => ({ playlist: [{ id: Date.now(), ...song, from: 'A', addedAt: today }, ...s.playlist] }))
  },
  removeFromPlaylist: (id) => set(s => ({ playlist: s.playlist.filter(p => p.id !== id) })),

  sendMessage: (text) => {
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    set(s => ({ messages: [...s.messages, { id: Date.now(), from: 'A', text, time: now, type: 'text' }] }))
    setTimeout(() => {
      const replies = ['嗯嗯~', '哈哈好的', '❤️', '想你了', '你在做什么呢', '好呀！']
      const now2 = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      set(s => ({ messages: [...s.messages, { id: Date.now() + 1, from: 'B', text: replies[Math.floor(Math.random() * replies.length)], time: now2, type: 'text' }] }))
    }, 1200)
  },

  publishCheckin: (meal, text, imgUrl = null) => {
    const today = new Date().toISOString().slice(0, 10)
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    set(s => {
      const existing = s.checkins.find(c => c.date === today && c.meal === meal)
      const userA = { img: imgUrl, text, time: now }
      if (existing) {
        return { checkins: s.checkins.map(c => c.id === existing.id ? { ...c, userA } : c) }
      }
      return { checkins: [...s.checkins, { id: Date.now(), date: today, meal, userA, userB: null, comments: [] }] }
    })
  },

  addCheckinComment: (checkinId, text) => {
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    set(s => ({
      checkins: s.checkins.map(c =>
        c.id === checkinId
          ? { ...c, comments: [...c.comments, { id: Date.now(), from: 'A', text, time: now }] }
          : c
      ),
    }))
  },

  setMood: (mood) => {
    const today = new Date().toISOString().slice(0, 10)
    set(s => ({
      user: { ...s.user, mood },
      myMood: mood,
      moodHistory: [{ date: today, mood }, ...s.moodHistory.slice(0, 6)],
    }))
  },

  addMemory: (title, text, photos = []) => {
    const today = new Date().toISOString().slice(0, 10)
    set(s => ({
      memories: [{ id: Date.now(), date: today, title, text, emoji: '📸', photos, comments: [] }, ...s.memories],
    }))
  },

  addMemoryPhoto: (memoryId, photoUrl) => {
    set(s => ({
      memories: s.memories.map(m =>
        m.id === memoryId
          ? { ...m, photos: [...(m.photos || []), { id: Date.now(), url: photoUrl }] }
          : m
      ),
    }))
  },

  addMemoryComment: (memoryId, text) => {
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    set(s => ({
      memories: s.memories.map(m =>
        m.id === memoryId
          ? { ...m, comments: [...(m.comments || []), { id: Date.now(), from: 'A', text, time: now }] }
          : m
      ),
    }))
  },

  addGift: (from, title, text, imgUrl, date) => {
    const giftDate = date || new Date().toISOString().slice(0, 10)
    set(s => ({
      gifts: [{ id: Date.now(), date: giftDate, from, title, text, img: imgUrl || null, comments: [] }, ...s.gifts],
    }))
  },

  addGiftComment: (giftId, text) => {
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    set(s => ({
      gifts: s.gifts.map(g =>
        g.id === giftId
          ? { ...g, comments: [...g.comments, { id: Date.now(), from: 'A', text, time: now }] }
          : g
      ),
    }))
  },

  addAnniversary: (data) => set(s => ({ anniversaries: [...s.anniversaries, { id: Date.now(), ...data }] })),
  updateAnniversary: (id, data) => set(s => ({ anniversaries: s.anniversaries.map(a => a.id === id ? { ...a, ...data } : a) })),
  deleteAnniversary: (id) => set(s => ({ anniversaries: s.anniversaries.filter(a => a.id !== id) })),

  addPlan: (data) => {
    const today = new Date().toISOString().slice(0, 10)
    set(s => ({ plans: [...s.plans, { id: Date.now(), ...data, createdAt: today, done: false, doneAt: null, items: [] }] }))
  },
  togglePlan: (id) => {
    const today = new Date().toISOString().slice(0, 10)
    set(s => ({ plans: s.plans.map(p => p.id === id ? { ...p, done: !p.done, doneAt: !p.done ? today : null } : p) }))
  },
  deletePlan: (id) => set(s => ({ plans: s.plans.filter(p => p.id !== id) })),
  togglePlanItem: (planId, itemId) => {
    set(s => ({ plans: s.plans.map(p => p.id === planId ? { ...p, items: _toggleItem(p.items || [], itemId) } : p) }))
  },
  addPlanItem: (planId, parentId, title) => {
    const newItem = { id: Date.now(), title, done: false, doneAt: null, items: [] }
    set(s => ({ plans: s.plans.map(p => p.id === planId ? { ...p, items: _addItem(p.items || [], parentId, newItem) } : p) }))
  },

  addGoal: (data) => {
    const today = new Date().toISOString().slice(0, 10)
    set(s => ({ goals: [...s.goals, { id: Date.now(), ...data, from: 'A', progress: 0, completed: false, completedAt: null, createdAt: today }] }))
  },
  setGoalProgress: (id, progress) => set(s => ({ goals: s.goals.map(g => g.id === id ? { ...g, progress } : g) })),
  completeGoal: (id) => {
    const today = new Date().toISOString().slice(0, 10)
    set(s => ({ goals: s.goals.map(g => g.id === id ? { ...g, completed: true, completedAt: today } : g) }))
  },
  deleteGoal: (id) => set(s => ({ goals: s.goals.filter(g => g.id !== id) })),

  addLedgerEntry: (entry) => set(s => ({ ledgerEntries: [{ id: Date.now(), ...entry }, ...s.ledgerEntries] })),
  deleteLedgerEntry: (id) => set(s => ({ ledgerEntries: s.ledgerEntries.filter(e => e.id !== id) })),
  addLedgerCategory: (cat) => set(s => ({ ledgerCategories: [...s.ledgerCategories, { id: `custom_${Date.now()}`, ...cat, isCustom: true }] })),
  deleteLedgerCategory: (id) => set(s => ({ ledgerCategories: s.ledgerCategories.filter(c => !(c.id === id && c.isCustom)) })),
  setExchangeRates: (rates) => {
    const now = new Date().toLocaleString('zh-CN', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
    set({ exchangeRates: rates, ratesUpdatedAt: now })
  },

  setGender: (target, gender) => set(s => ({ [target]: { ...s[target], gender } })),

  startPeriod: (from) => {
    const today = new Date().toISOString().slice(0, 10)
    set(s => ({
      periodLogs: [...s.periodLogs, { id: Date.now(), from, startDate: today, endDate: null, notes: '' }],
    }))
  },
  endPeriod: (from) => {
    const today = new Date().toISOString().slice(0, 10)
    set(s => ({
      periodLogs: s.periodLogs.map(l =>
        l.from === from && l.endDate === null ? { ...l, endDate: today } : l
      ),
    }))
  },
  deletePeriodLog: (id) => set(s => ({ periodLogs: s.periodLogs.filter(l => l.id !== id) })),

  setAvatarUrl: (url) => set(s => ({ user: { ...s.user, avatarUrl: url, hasSetAvatar: true } })),
  bindPartner: (uid, name) => set(s => ({ isBound: true, partner: { ...s.partner, uid, name } })),
  unbindPartner: () => set({ isBound: false }),
  addSticker: (url) => set(s => ({ stickers: [...s.stickers, { id: Date.now(), url }] })),
  markAllRead: () => set(s => ({ messages: s.messages.map(m => ({ ...m, read: true })) })),

  sendChatMessage: (payload) => {
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    const newMsg = { id: Date.now(), from: 'A', time: now, read: false, mediaUrl: null, duration: null, ...payload }
    set(s => ({ messages: [...s.messages, newMsg] }))
    if (['text', 'image', 'voice'].includes(payload.type)) {
      setTimeout(() => {
        const replies = ['嗯嗯~', '哈哈好的', '❤️', '想你了', '你在做什么呢', '好呀！']
        const now2 = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        set(s => ({
          messages: [
            ...s.messages.map(m => m.from === 'A' ? { ...m, read: true } : m),
            { id: Date.now() + 1, from: 'B', text: replies[Math.floor(Math.random() * replies.length)], time: now2, type: 'text', read: false, mediaUrl: null, duration: null },
          ],
        }))
      }, 1200)
    }
  },
}))
