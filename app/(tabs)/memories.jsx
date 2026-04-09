import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Modal, FlatList,
} from 'react-native'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useStore, MOODS, calcAnniversary } from '../../store/useStore'

const TABS = [
  { key: 'mood',        label: '心情',  emoji: '😊' },
  { key: 'album',       label: '相册',  emoji: '🖼️' },
  { key: 'anniversary', label: '纪念日', emoji: '📅' },
  { key: 'gifts',       label: '礼物',  emoji: '🎁' },
]

// ── 心情 Tab ─────────────────────────────────────────────
function MoodTab({ theme }) {
  const { user, partner, myMood, moodHistory, setMood } = useStore()
  const [picking, setPicking] = useState(false)

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={[ms.card]}>
        <Text style={[ms.sectionLabel, { fontFamily: 'Cubic11' }]}>TODAY</Text>
        <View style={ms.moodRow}>
          <View style={ms.moodPerson}>
            <Text style={{ fontSize: 40 }}>{user.mood.emoji}</Text>
            <Text style={[ms.personName, { fontFamily: 'Cubic11' }]}>{user.name}</Text>
            <Text style={[ms.moodLabel, { fontFamily: 'Cubic11', color: theme.primary }]}>{user.mood.label}</Text>
          </View>
          <Text style={{ fontSize: 20 }}>❤️</Text>
          <View style={ms.moodPerson}>
            <Text style={{ fontSize: 40 }}>{partner.mood.emoji}</Text>
            <Text style={[ms.personName, { fontFamily: 'Cubic11' }]}>{partner.name}</Text>
            <Text style={[ms.moodLabel, { fontFamily: 'Cubic11', color: theme.secondary }]}>{partner.mood.label}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setPicking(true)} style={[ms.primaryBtn, { backgroundColor: theme.primary }]}>
          <Text style={[ms.primaryBtnText, { fontFamily: 'Cubic11' }]}>更新我的心情</Text>
        </TouchableOpacity>
      </View>

      <Text style={[ms.sectionLabel, { fontFamily: 'Cubic11' }]}>心情记录</Text>
      {moodHistory.map((item, i) => (
        <View key={i} style={ms.moodHistoryItem}>
          <Text style={{ fontSize: 24 }}>{item.mood.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 13, fontWeight: '700', color: '#374151' }]}>{item.mood.label}</Text>
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 11, color: '#aaa' }]}>{item.date}</Text>
          </View>
        </View>
      ))}

      <Modal visible={picking} transparent animationType="slide" onRequestClose={() => setPicking(false)}>
        <TouchableOpacity style={ms.overlay} activeOpacity={1} onPress={() => setPicking(false)} />
        <View style={[ms.sheet, { backgroundColor: theme.bg }]}>
          <View style={ms.sheetHeader}>
            <Text style={[ms.sheetTitle, { fontFamily: 'Cubic11' }]}>今天感觉怎么样？</Text>
            <TouchableOpacity onPress={() => setPicking(false)} style={ms.closeBtn}>
              <Text style={{ fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={ms.moodGrid}>
            {MOODS.map(m => (
              <TouchableOpacity
                key={m.label}
                onPress={() => { setMood(m); setPicking(false) }}
                style={[ms.moodOption, myMood?.label === m.label && { borderColor: theme.primary, backgroundColor: theme.primary + '22' }]}
              >
                <Text style={{ fontSize: 28 }}>{m.emoji}</Text>
                <Text style={[{ fontFamily: 'Cubic11', fontSize: 11, color: '#555' }]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

// ── 相册 Tab ─────────────────────────────────────────────
function AlbumTab({ theme }) {
  const { memories, user, partner, addMemory, addMemoryComment, addMemoryPhoto } = useStore()
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newText, setNewText] = useState('')
  const [newPhotos, setNewPhotos] = useState([])
  const [selectedMemory, setSelectedMemory] = useState(null)
  const [detailComment, setDetailComment] = useState('')

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsMultipleSelection: false })
    if (!result.canceled) setNewPhotos(p => [...p, result.assets[0].uri])
  }

  const submitMemory = () => {
    if (!newTitle.trim()) return
    addMemory(newTitle, newText, newPhotos.map(u => ({ id: Date.now() + Math.random(), url: u })))
    setAdding(false); setNewTitle(''); setNewText(''); setNewPhotos([])
  }

  const sendComment = () => {
    if (!detailComment.trim() || !selectedMemory) return
    addMemoryComment(selectedMemory.id, detailComment)
    setDetailComment('')
    // Refresh
    const updated = useStore.getState().memories.find(m => m.id === selectedMemory.id)
    if (updated) setSelectedMemory(updated)
  }

  return (
    <View style={{ flex: 1 }}>
      {!adding ? (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <TouchableOpacity onPress={() => setAdding(true)} style={[ms.addMemoryBtn, { borderColor: theme.primary }]}>
            <Text style={{ fontSize: 20 }}>+</Text>
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 13, color: theme.primary }]}>添加新回忆</Text>
          </TouchableOpacity>
          {memories.map(mem => {
            const photos = (mem.photos || []).map(p => typeof p === 'string' ? p : p.url)
            return (
              <TouchableOpacity key={mem.id} onPress={() => setSelectedMemory(mem)} style={ms.memCard}>
                <View style={ms.memHeader}>
                  <Text style={{ fontSize: 20 }}>{mem.emoji || '📸'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[ms.memTitle, { fontFamily: 'Cubic11' }]}>{mem.title}</Text>
                    <Text style={[ms.memDate, { fontFamily: 'Cubic11' }]}>{mem.date}</Text>
                  </View>
                </View>
                {mem.text ? <Text style={[ms.memText, { fontFamily: 'Cubic11' }]}>{mem.text}</Text> : null}
                {photos.length > 0 && (
                  <View style={ms.photoGrid2}>
                    {photos.slice(0, 4).map((url, i) => (
                      <Image key={i} source={{ uri: url }} style={ms.photoGridItem} contentFit="cover" />
                    ))}
                  </View>
                )}
                {(mem.comments || []).length > 0 && (
                  <Text style={[ms.memCommentHint, { fontFamily: 'Cubic11' }]}>💬 {mem.comments.length} 条评论</Text>
                )}
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          <Text style={[ms.sectionLabel, { fontFamily: 'Cubic11' }]}>新建回忆</Text>
          <TextInput style={[ms.input, { fontFamily: 'Cubic11' }]} placeholder="回忆标题" placeholderTextColor="#bbb" value={newTitle} onChangeText={setNewTitle} />
          <TextInput style={[ms.input, { fontFamily: 'Cubic11', minHeight: 80 }]} placeholder="记录这个瞬间..." placeholderTextColor="#bbb" value={newText} onChangeText={setNewText} multiline />
          <View style={ms.photoThumbRow}>
            {newPhotos.map((uri, i) => (
              <View key={i} style={{ position: 'relative' }}>
                <Image source={{ uri }} style={ms.photoThumb} contentFit="cover" />
                <TouchableOpacity onPress={() => setNewPhotos(p => p.filter((_, j) => j !== i))} style={ms.removeThumb}>
                  <Text style={{ color: '#fff', fontSize: 10 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={pickPhoto} style={ms.addThumb}>
              <Text style={{ fontSize: 20 }}>+</Text>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: '#aaa' }]}>照片</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={() => setAdding(false)} style={[ms.btnOutline, { flex: 1 }]}>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 14 }]}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={submitMemory} style={[ms.primaryBtn, { flex: 1, backgroundColor: theme.primary }]}>
              <Text style={[ms.primaryBtnText, { fontFamily: 'Cubic11' }]}>保存</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Detail modal */}
      <Modal visible={!!selectedMemory} transparent animationType="slide" onRequestClose={() => setSelectedMemory(null)}>
        <TouchableOpacity style={ms.overlay} activeOpacity={1} onPress={() => setSelectedMemory(null)} />
        {selectedMemory && (
          <View style={[ms.detailSheet, { backgroundColor: theme.bg }]}>
            <View style={ms.sheetHeader}>
              <Text style={[ms.sheetTitle, { fontFamily: 'Cubic11' }]} numberOfLines={1}>{selectedMemory.title}</Text>
              <TouchableOpacity onPress={() => setSelectedMemory(null)} style={ms.closeBtn}><Text style={{ fontSize: 16 }}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }}>
              {selectedMemory.text ? <Text style={[{ fontFamily: 'Cubic11', fontSize: 13, color: '#555', lineHeight: 20 }]}>{selectedMemory.text}</Text> : null}
              {(selectedMemory.photos || []).map((p, i) => {
                const uri = typeof p === 'string' ? p : p.url
                return <Image key={i} source={{ uri }} style={{ width: '100%', aspectRatio: 1, borderWidth: 2, borderColor: '#3d3d3d' }} contentFit="cover" />
              })}
              {(selectedMemory.comments || []).map(c => (
                <View key={c.id} style={ms.commentItem}>
                  <View style={[ms.commentAvatar, { backgroundColor: c.from === 'A' ? theme.primary : theme.secondary }]}>
                    <Text style={{ color: '#fff', fontSize: 10 }}>{c.from === 'A' ? '我' : 'TA'}</Text>
                  </View>
                  <View style={ms.commentBubble}>
                    <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, color: '#3d3d3d' }]}>{c.text}</Text>
                    <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: '#aaa', marginTop: 2 }]}>{c.time}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={ms.detailInputRow}>
              <TextInput
                style={[ms.detailInput, { fontFamily: 'Cubic11', flex: 1 }]}
                placeholder="留下评论..." placeholderTextColor="#bbb"
                value={detailComment} onChangeText={setDetailComment}
                multiline
              />
              <TouchableOpacity onPress={sendComment} style={[ms.sendBtn, { backgroundColor: theme.primary }]}>
                <Text style={{ color: '#fff', fontSize: 14 }}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </View>
  )
}

// ── 纪念日 Tab ───────────────────────────────────────────
function AnniversaryTab({ theme }) {
  const { anniversaries, partner, addAnniversary, updateAnniversary, deleteAnniversary } = useStore()
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [type, setType] = useState('anniversary')
  const [repeat, setRepeat] = useState('yearly')

  const startToday = new Date().toISOString().slice(0, 10)
  const togetherDays = (() => {
    const anniv = anniversaries.find(a => a.type === 'anniversary')
    if (!anniv) return partner.daysCount
    const start = new Date(anniv.date + 'T00:00:00')
    return Math.floor((new Date() - start) / 86400000)
  })()

  const handleSubmit = () => {
    if (!title.trim() || !date.trim()) return
    const data = { title: title.trim(), date, type, repeat, calType: 'solar' }
    if (editId) updateAnniversary(editId, data)
    else addAnniversary(data)
    setAdding(false); setEditId(null); setTitle(''); setDate(''); setType('anniversary'); setRepeat('yearly')
  }

  const startEdit = (a) => {
    setEditId(a.id); setTitle(a.title); setDate(a.date); setType(a.type); setRepeat(a.repeat || 'yearly')
    setAdding(true)
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      {/* Together days */}
      <View style={[ms.card, { alignItems: 'center', paddingVertical: 24 }]}>
        <Text style={{ fontSize: 36 }}>❤️</Text>
        <Text style={[{ fontFamily: 'Cubic11', fontSize: 32, fontWeight: '700', color: theme.primary, marginTop: 8 }]}>{togetherDays}</Text>
        <Text style={[{ fontFamily: 'Cubic11', fontSize: 13, color: '#888', marginTop: 4 }]}>在一起的第 {togetherDays} 天</Text>
      </View>

      {adding ? (
        <View style={ms.card}>
          <Text style={[ms.sectionLabel, { fontFamily: 'Cubic11', marginBottom: 12 }]}>{editId ? '编辑' : '新建'}纪念日</Text>
          <TextInput style={[ms.input, { fontFamily: 'Cubic11', marginBottom: 10 }]} placeholder="标题" placeholderTextColor="#bbb" value={title} onChangeText={setTitle} />
          <TextInput style={[ms.input, { fontFamily: 'Cubic11', marginBottom: 10 }]} placeholder="日期 YYYY-MM-DD" placeholderTextColor="#bbb" value={date} onChangeText={setDate} />
          <View style={ms.toggleRow}>
            {[['anniversary','纪念日'], ['countdown','倒数日']].map(([v, l]) => (
              <TouchableOpacity key={v} onPress={() => setType(v)} style={[ms.toggleBtn, type === v && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
                <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, color: type === v ? '#fff' : '#3d3d3d' }]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={[ms.toggleRow, { marginTop: 8 }]}>
            {[['none','不重复'], ['monthly','每月'], ['yearly','每年']].map(([v, l]) => (
              <TouchableOpacity key={v} onPress={() => setRepeat(v)} style={[ms.toggleBtn, repeat === v && { backgroundColor: theme.secondary, borderColor: theme.secondary }]}>
                <Text style={[{ fontFamily: 'Cubic11', fontSize: 11, color: repeat === v ? '#fff' : '#3d3d3d' }]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <TouchableOpacity onPress={() => { setAdding(false); setEditId(null) }} style={[ms.btnOutline, { flex: 1 }]}>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 14 }]}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={[ms.primaryBtn, { flex: 1, backgroundColor: theme.primary }]}>
              <Text style={[ms.primaryBtnText, { fontFamily: 'Cubic11' }]}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setAdding(true)} style={[ms.addMemoryBtn, { borderColor: theme.primary }]}>
          <Text style={{ fontSize: 20 }}>+</Text>
          <Text style={[{ fontFamily: 'Cubic11', fontSize: 13, color: theme.primary }]}>添加纪念日</Text>
        </TouchableOpacity>
      )}

      {anniversaries.map(a => {
        const calc = calcAnniversary(a)
        return (
          <View key={a.id} style={ms.annivCard}>
            <View style={{ flex: 1 }}>
              <Text style={[ms.annivTitle, { fontFamily: 'Cubic11' }]}>{a.title}</Text>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 11, color: '#aaa' }]}>{a.date} · {a.repeat === 'yearly' ? '每年' : a.repeat === 'monthly' ? '每月' : '不重复'}</Text>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 14, fontWeight: '700', color: theme.primary, marginTop: 4 }]}>{calc.label}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={() => startEdit(a)} style={ms.iconBtn}>
                <Text style={{ fontSize: 14 }}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteAnniversary(a.id)} style={ms.iconBtn}>
                <Text style={{ fontSize: 14 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      })}
    </ScrollView>
  )
}

// ── 礼物 Tab ─────────────────────────────────────────────
function GiftsTab({ theme }) {
  const { gifts, user, partner, addGift, addGiftComment } = useStore()
  const [adding, setAdding] = useState(false)
  const [from, setFrom] = useState('B')
  const [giftTitle, setGiftTitle] = useState('')
  const [giftText, setGiftText] = useState('')
  const [giftDate, setGiftDate] = useState('')
  const [giftImg, setGiftImg] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [commentTexts, setCommentTexts] = useState({})

  const pickGiftImg = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 })
    if (!result.canceled) setGiftImg(result.assets[0].uri)
  }

  const submitGift = () => {
    if (!giftTitle.trim()) return
    addGift(from, giftTitle, giftText, giftImg, giftDate || undefined)
    setAdding(false); setGiftTitle(''); setGiftText(''); setGiftDate(''); setGiftImg(null)
  }

  const sendGiftComment = (giftId) => {
    const text = commentTexts[giftId]?.trim()
    if (!text) return
    addGiftComment(giftId, text)
    setCommentTexts(t => ({ ...t, [giftId]: '' }))
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      {adding ? (
        <View style={ms.card}>
          <Text style={[ms.sectionLabel, { fontFamily: 'Cubic11', marginBottom: 12 }]}>记录礼物</Text>
          <View style={[ms.toggleRow, { marginBottom: 12 }]}>
            <TouchableOpacity onPress={() => setFrom('B')} style={[ms.toggleBtn, from === 'B' && { backgroundColor: theme.secondary, borderColor: theme.secondary }]}>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, color: from === 'B' ? '#fff' : '#3d3d3d' }]}>TA → 我</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFrom('A')} style={[ms.toggleBtn, from === 'A' && { backgroundColor: theme.primary, borderColor: theme.primary }]}>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, color: from === 'A' ? '#fff' : '#3d3d3d' }]}>我 → TA</Text>
            </TouchableOpacity>
          </View>
          <TextInput style={[ms.input, { fontFamily: 'Cubic11', marginBottom: 10 }]} placeholder="礼物名称" placeholderTextColor="#bbb" value={giftTitle} onChangeText={setGiftTitle} />
          <TextInput style={[ms.input, { fontFamily: 'Cubic11', minHeight: 70, marginBottom: 10 }]} placeholder="描述..." placeholderTextColor="#bbb" value={giftText} onChangeText={setGiftText} multiline />
          <TextInput style={[ms.input, { fontFamily: 'Cubic11', marginBottom: 10 }]} placeholder="日期 YYYY-MM-DD（可选）" placeholderTextColor="#bbb" value={giftDate} onChangeText={setGiftDate} />
          {giftImg
            ? <Image source={{ uri: giftImg }} style={{ width: '100%', height: 160, borderWidth: 2, borderColor: '#3d3d3d', marginBottom: 10 }} contentFit="cover" />
            : <TouchableOpacity onPress={pickGiftImg} style={[ms.photoBtn, { marginBottom: 10 }]}><Text style={[{ fontFamily: 'Cubic11', fontSize: 12 }]}>📷 添加照片（可选）</Text></TouchableOpacity>
          }
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={() => setAdding(false)} style={[ms.btnOutline, { flex: 1 }]}>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 14 }]}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={submitGift} style={[ms.primaryBtn, { flex: 1, backgroundColor: theme.primary }]}>
              <Text style={[ms.primaryBtnText, { fontFamily: 'Cubic11' }]}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setAdding(true)} style={[ms.addMemoryBtn, { borderColor: theme.primary }]}>
          <Text style={{ fontSize: 20 }}>+</Text>
          <Text style={[{ fontFamily: 'Cubic11', fontSize: 13, color: theme.primary }]}>记录新礼物</Text>
        </TouchableOpacity>
      )}

      {gifts.map(g => {
        const isFromMe = g.from === 'A'
        const accentColor = isFromMe ? theme.primary : theme.secondary
        const expanded = expandedId === g.id
        return (
          <View key={g.id} style={[ms.giftCard, { borderLeftColor: accentColor }]}>
            <View style={ms.giftHeader}>
              <Text style={{ fontSize: 24 }}>🎁</Text>
              <View style={{ flex: 1 }}>
                <Text style={[ms.giftTitle, { fontFamily: 'Cubic11' }]}>{g.title}</Text>
                <Text style={[ms.giftMeta, { fontFamily: 'Cubic11' }]}>
                  {g.date} · {isFromMe ? user.name : partner.name} → {isFromMe ? partner.name : user.name}
                </Text>
              </View>
            </View>
            {g.text ? <Text style={[ms.giftText, { fontFamily: 'Cubic11' }]}>{g.text}</Text> : null}
            {g.img ? <Image source={{ uri: g.img }} style={ms.giftImg} contentFit="cover" /> : null}
            <TouchableOpacity onPress={() => setExpandedId(expanded ? null : g.id)} style={ms.commentToggle}>
              <Text style={{ fontSize: 14 }}>💬</Text>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 11, color: '#aaa' }]}>
                {g.comments.length > 0 ? `${g.comments.length} 条评论` : '留下评论'}
              </Text>
            </TouchableOpacity>
            {expanded && (
              <View style={ms.commentList}>
                {g.comments.map(c => (
                  <View key={c.id} style={ms.commentItem}>
                    <View style={[ms.commentAvatar, { backgroundColor: c.from === 'A' ? theme.primary : theme.secondary }]}>
                      <Text style={{ color: '#fff', fontSize: 10 }}>{c.from === 'A' ? '我' : 'TA'}</Text>
                    </View>
                    <View style={ms.commentBubble}>
                      <Text style={[{ fontFamily: 'Cubic11', fontSize: 12 }]}>{c.text}</Text>
                    </View>
                  </View>
                ))}
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 8 }}>
                  <TextInput
                    style={[ms.commentInput, { fontFamily: 'Cubic11', flex: 1 }]}
                    placeholder="说点什么..." placeholderTextColor="#bbb"
                    value={commentTexts[g.id] || ''}
                    onChangeText={t => setCommentTexts(prev => ({ ...prev, [g.id]: t }))}
                    multiline
                  />
                  <TouchableOpacity onPress={() => sendGiftComment(g.id)} style={[ms.sendBtn, { backgroundColor: theme.primary }]}>
                    <Text style={{ color: '#fff', fontSize: 14 }}>➤</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )
      })}
    </ScrollView>
  )
}

// ── Main Memories ─────────────────────────────────────────
export default function Memories() {
  const theme = useStore(s => s.theme)
  const [tab, setTab] = useState('mood')

  return (
    <View style={[ms.page, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[ms.header, { backgroundColor: theme.bgHeader }]}>
        <Text style={[ms.title, { fontFamily: 'Cubic11' }]}>MEMORIES</Text>
        <Text style={[ms.sub, { fontFamily: 'Cubic11' }]}>心情 · 相册 · 纪念日 · 礼物</Text>
      </View>

      {/* Tabs */}
      <View style={ms.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[ms.tabItem, tab === t.key && { borderBottomWidth: 3, borderBottomColor: theme.primary }]}
          >
            <Text style={{ fontSize: 16 }}>{t.emoji}</Text>
            <Text style={[ms.tabLabel, { fontFamily: 'Cubic11', color: tab === t.key ? theme.primary : '#aaa' }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      <View style={{ flex: 1 }}>
        {tab === 'mood'        && <MoodTab theme={theme} />}
        {tab === 'album'       && <AlbumTab theme={theme} />}
        {tab === 'anniversary' && <AnniversaryTab theme={theme} />}
        {tab === 'gifts'       && <GiftsTab theme={theme} />}
      </View>
    </View>
  )
}

const ms = StyleSheet.create({
  page: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 3, borderBottomColor: '#3d3d3d' },
  title: { fontSize: 18, fontWeight: '700', color: '#3d3d3d' },
  sub: { fontSize: 12, color: '#aaa', marginTop: 4 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#e8dfa8' },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 2 },
  tabLabel: { fontSize: 10 },
  card: { borderWidth: 3, borderColor: '#3d3d3d', backgroundColor: '#fffef5', padding: 16, shadowColor:'#3d3d3d', shadowOffset:{width:4,height:4}, shadowOpacity:1, shadowRadius:0 },
  sectionLabel: { fontSize: 10, color: '#888', textTransform: 'uppercase' },
  moodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 12 },
  moodPerson: { alignItems: 'center', gap: 4 },
  personName: { fontSize: 12, fontWeight: '700', color: '#374151' },
  moodLabel: { fontSize: 11 },
  primaryBtn: { borderWidth: 3, borderColor: '#3d3d3d', paddingVertical: 12, alignItems: 'center', shadowColor:'#3d3d3d', shadowOffset:{width:3,height:3}, shadowOpacity:1, shadowRadius:0 },
  primaryBtnText: { fontSize: 14, color: '#fff', fontWeight: '700' },
  btnOutline: { borderWidth: 3, borderColor: '#3d3d3d', paddingVertical: 12, alignItems: 'center' },
  moodHistoryItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e8dfa8' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { borderTopWidth: 4, borderTopColor: '#3d3d3d', padding: 20 },
  detailSheet: { flex: 1, borderTopWidth: 4, borderTopColor: '#3d3d3d', maxHeight: '90%', marginTop: 'auto' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 2, borderBottomColor: '#e8dfa8' },
  sheetTitle: { fontSize: 14, fontWeight: '700', color: '#3d3d3d', flex: 1 },
  closeBtn: { borderWidth: 2, borderColor: '#3d3d3d', padding: 6 },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingTop: 8 },
  moodOption: { width: '22%', borderWidth: 3, borderColor: '#3d3d3d', padding: 10, alignItems: 'center', gap: 4, shadowColor:'#3d3d3d', shadowOffset:{width:2,height:2}, shadowOpacity:1, shadowRadius:0 },
  addMemoryBtn: { borderWidth: 2, borderStyle: 'dashed', paddingVertical: 20, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  memCard: { borderWidth: 3, borderColor: '#3d3d3d', backgroundColor: '#fffef5', overflow: 'hidden', shadowColor:'#3d3d3d', shadowOffset:{width:4,height:4}, shadowOpacity:1, shadowRadius:0 },
  memHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderBottomWidth: 1, borderBottomColor: '#e8dfa8' },
  memTitle: { fontSize: 14, fontWeight: '700', color: '#374151' },
  memDate: { fontSize: 11, color: '#aaa', marginTop: 2 },
  memText: { fontSize: 12, color: '#555', padding: 12, paddingTop: 8 },
  memCommentHint: { fontSize: 11, color: '#aaa', padding: 10, borderTopWidth: 1, borderTopColor: '#e8dfa8' },
  photoGrid2: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, paddingBottom: 8, gap: 4 },
  photoGridItem: { width: '48%', aspectRatio: 1, borderWidth: 1, borderColor: '#3d3d3d' },
  photoThumbRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoThumb: { width: 72, height: 72, borderWidth: 2, borderColor: '#3d3d3d' },
  addThumb: { width: 72, height: 72, borderWidth: 2, borderColor: '#3d3d3d', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 2 },
  removeThumb: { position: 'absolute', top: 2, right: 2, width: 18, height: 18, backgroundColor: '#3d3d3d', alignItems: 'center', justifyContent: 'center' },
  input: { borderWidth: 3, borderColor: '#3d3d3d', backgroundColor: '#fffef5', paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#3d3d3d' },
  commentItem: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  commentAvatar: { width: 26, height: 26, borderWidth: 2, borderColor: '#3d3d3d', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  commentBubble: { flex: 1, borderWidth: 2, borderColor: '#3d3d3d', backgroundColor: '#f5eedc', padding: 8 },
  commentInput: { borderWidth: 2, borderColor: '#3d3d3d', backgroundColor: '#fffef5', paddingHorizontal: 10, paddingVertical: 6, fontSize: 12, color: '#3d3d3d', minHeight: 40, maxHeight: 100 },
  commentList: { paddingHorizontal: 12, paddingBottom: 12 },
  commentToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderTopWidth: 1, borderTopColor: '#e8dfa8' },
  detailInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, borderTopWidth: 2, borderTopColor: '#e8dfa8' },
  detailInput: { borderWidth: 2, borderColor: '#3d3d3d', backgroundColor: '#fffef5', paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, color: '#3d3d3d', minHeight: 44, maxHeight: 120 },
  sendBtn: { width: 44, height: 44, borderWidth: 2, borderColor: '#3d3d3d', alignItems: 'center', justifyContent: 'center' },
  annivCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderWidth: 3, borderColor: '#3d3d3d', backgroundColor: '#fffef5', shadowColor:'#3d3d3d', shadowOffset:{width:3,height:3}, shadowOpacity:1, shadowRadius:0 },
  annivTitle: { fontSize: 14, fontWeight: '700', color: '#374151' },
  toggleRow: { flexDirection: 'row', gap: 8 },
  toggleBtn: { flex: 1, borderWidth: 2, borderColor: '#3d3d3d', paddingVertical: 8, alignItems: 'center' },
  iconBtn: { borderWidth: 2, borderColor: '#3d3d3d', padding: 6 },
  giftCard: { borderWidth: 3, borderColor: '#3d3d3d', borderLeftWidth: 6, backgroundColor: '#fffef5', shadowColor:'#3d3d3d', shadowOffset:{width:4,height:4}, shadowOpacity:1, shadowRadius:0, overflow: 'hidden' },
  giftHeader: { flexDirection: 'row', gap: 12, padding: 12 },
  giftTitle: { fontSize: 14, fontWeight: '700', color: '#374151' },
  giftMeta: { fontSize: 11, color: '#aaa', marginTop: 2 },
  giftText: { fontSize: 12, color: '#555', paddingHorizontal: 12, paddingBottom: 8 },
  giftImg: { width: '100%', height: 160, borderTopWidth: 1, borderTopColor: '#e8dfa8' },
  photoBtn: { borderWidth: 2, borderColor: '#3d3d3d', paddingVertical: 10, alignItems: 'center' },
})
