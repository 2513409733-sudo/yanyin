import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking, TextInput, Modal,
} from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useStore } from '../../store/useStore'

// Pixel heart decoration
function PixelHeart({ size = 16, color = '#FD85AB' }) {
  const u = size / 16
  const b = (x, y, w, h) => (
    <View key={`${x}${y}`} style={{ position: 'absolute', left: x*u, top: y*u, width: w*u, height: h*u, backgroundColor: color }} />
  )
  return (
    <View style={{ width: size, height: size }}>
      {b(1,4,4,2)}{b(7,4,4,2)}
      {b(0,6,6,4)}{b(6,6,4,4)}{b(10,6,6,4)}
      {b(1,10,14,2)}{b(2,12,12,2)}
      {b(4,14,8,1)}
    </View>
  )
}

// Quick action button
function QuickBtn({ emoji, label, onPress }) {
  return (
    <TouchableOpacity style={hs.quickBtn} onPress={onPress}>
      <View style={hs.quickBtnBox}>
        <Text style={{ fontSize: 22 }}>{emoji}</Text>
      </View>
      <Text style={[hs.quickBtnLabel, { fontFamily: 'Cubic11' }]}>{label}</Text>
    </TouchableOpacity>
  )
}

// Import song sheet (modal)
function ImportSongSheet({ visible, onClose, onSave, title: sheetTitle }) {
  const [url, setUrl] = useState('')
  const [songTitle, setSongTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [songId, setSongId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const theme = useStore(s => s.theme)

  const parseSongId = (u) => {
    const m = u.match(/[?&]id=(\d+)/) || u.match(/song\/(\d+)/)
    return m?.[1] || null
  }

  const handleUrlChange = async (val) => {
    setUrl(val)
    setError('')
    const id = parseSongId(val)
    if (!id) { setSongId(''); return }
    setSongId(id)
    setLoading(true)
    setSongTitle(''); setArtist('')
    try {
      const apiUrl = `https://music.163.com/api/song/detail/?ids=[${id}]`
      const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`)
      const data = await res.json()
      const s = data.songs?.[0]
      if (s) {
        setSongTitle(s.name || '')
        setArtist((s.artists || []).map(a => a.name).join(' / '))
      } else {
        setError('自动获取失败，请手动填写')
      }
    } catch {
      setError('自动获取失败，请手动填写')
    }
    setLoading(false)
  }

  const handleSave = () => {
    if (!songTitle.trim()) { setError('请填写歌曲名称'); return }
    const link = url.trim() || `https://music.163.com/song?id=${songId}`
    onSave({ title: songTitle.trim(), artist: artist.trim(), songId, link })
    setSongTitle(''); setArtist(''); setUrl(''); setSongId(''); setError('')
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={hs.overlay} activeOpacity={1} onPress={onClose} />
      <View style={[hs.sheet, { backgroundColor: theme.bg }]}>
        <View style={hs.sheetHeader}>
          <Text style={[hs.sheetTitle, { fontFamily: 'Cubic11' }]}>{sheetTitle}</Text>
          <TouchableOpacity onPress={onClose} style={hs.closeBtn}><Text style={{ fontSize: 16 }}>✕</Text></TouchableOpacity>
        </View>
        <Text style={[hs.fieldLabel, { fontFamily: 'Cubic11' }]}>粘贴网易云歌曲链接</Text>
        <TextInput
          style={[hs.input, { fontFamily: 'Cubic11' }]}
          placeholder="https://music.163.com/song?id=..."
          value={url} onChangeText={handleUrlChange}
          placeholderTextColor="#bbb"
        />
        {loading && <Text style={[hs.statusText, { color: theme.accent, fontFamily: 'Cubic11' }]}>⏳ 获取中...</Text>}
        {!!error && <Text style={[hs.statusText, { color: '#ff7675', fontFamily: 'Cubic11' }]}>{error}</Text>}
        <TextInput style={[hs.input, { fontFamily: 'Cubic11', marginTop: 8 }]} placeholder="歌曲名称" value={songTitle} onChangeText={setSongTitle} placeholderTextColor="#bbb" />
        <TextInput style={[hs.input, { fontFamily: 'Cubic11', marginTop: 8 }]} placeholder="歌手" value={artist} onChangeText={setArtist} placeholderTextColor="#bbb" />
        <View style={hs.sheetBtns}>
          <TouchableOpacity onPress={onClose} style={[hs.btnOutline, { flex: 1 }]}>
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 14, color: '#3d3d3d' }]}>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={[hs.btnPrimary, { flex: 1, backgroundColor: theme.primary }]}>
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 14, color: '#fff', fontWeight: '700' }]}>保存</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

// Song side card
function SongSide({ song, label, accentColor, canChange, onChangeClick }) {
  const openSong = () => {
    if (!song) return
    const url = song.link || (song.songId ? `https://music.163.com/song?id=${song.songId}` : null)
    if (url) Linking.openURL(url)
  }
  return (
    <View style={[hs.songSide, { flex: 1 }]}>
      <Text style={[hs.songLabel, { fontFamily: 'Cubic11', color: '#aaa' }]}>{label}</Text>
      <View style={[hs.songCover, { borderColor: accentColor }]}>
        <Text style={{ fontSize: 24 }}>🎵</Text>
      </View>
      <Text style={[hs.songTitle, { fontFamily: 'Cubic11' }]} numberOfLines={1}>{song?.title || '—'}</Text>
      <Text style={[hs.songArtist, { fontFamily: 'Cubic11' }]} numberOfLines={1}>{song?.artist || ''}</Text>
      <View style={hs.songBtns}>
        <TouchableOpacity onPress={openSong} style={[hs.songPlayBtn, { flex: 1 }]} disabled={!song?.link && !song?.songId}>
          <Text style={[{ fontFamily: 'Cubic11', fontSize: 11, color: '#3d3d3d' }]}>▶ 播放</Text>
        </TouchableOpacity>
        {canChange && (
          <TouchableOpacity onPress={onChangeClick} style={hs.songChangeBtn}>
            <Text style={{ fontSize: 14 }}>🔄</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default function Home() {
  const { user, partner, anniversaries, playlist, setMoodSong, addToPlaylist, removeFromPlaylist } = useStore()
  const theme = useStore(s => s.theme)
  const router = useRouter()
  const [showImport, setShowImport] = useState(false)
  const [showAddToList, setShowAddToList] = useState(false)

  const nextAnniv = anniversaries[0]
  const today = new Date()
  const parts = nextAnniv?.date?.split('-') || ['2025','11','05']
  const nextDate = new Date(today.getFullYear(), parseInt(parts[1])-1, parseInt(parts[2]))
  if (nextDate < today) nextDate.setFullYear(today.getFullYear() + 1)
  const daysLeft = Math.ceil((nextDate - today) / 86400000)

  return (
    <View style={[hs.page, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[hs.header, { backgroundColor: theme.bgHeader }]}>
          {/* Days together */}
          <View style={hs.daysBadge}>
            <View style={[hs.daysBadgeInner, { backgroundColor: theme.primary }]}>
              <PixelHeart size={12} color="#fff" />
              <Text style={[hs.daysText, { fontFamily: 'Cubic11' }]}>
                {partner.relationLabel} DAY {partner.daysCount}
              </Text>
              <PixelHeart size={12} color="#fff" />
            </View>
          </View>

          {/* Dual avatar */}
          <View style={hs.avatarRow}>
            {/* Me */}
            <TouchableOpacity style={hs.personCol} onPress={() => router.push('/profile')}>
              <View style={[hs.avatarBox, { borderColor: theme.primary }]}>
                {user.avatarUrl
                  ? <Image source={{ uri: user.avatarUrl }} style={hs.avatarImg} />
                  : <Text style={{ fontSize: 32 }}>😊</Text>
                }
              </View>
              <Text style={[hs.personName, { fontFamily: 'Cubic11' }]}>{user.name}</Text>
              <Text style={{ fontSize: 18 }}>{user.mood?.emoji}</Text>
            </TouchableOpacity>

            {/* Center heart */}
            <View style={hs.centerHeart}>
              <PixelHeart size={32} color={theme.primary} />
            </View>

            {/* Partner */}
            <View style={hs.personCol}>
              <View style={[hs.avatarBox, { borderColor: theme.secondary }]}>
                {partner.avatarUrl
                  ? <Image source={{ uri: partner.avatarUrl }} style={hs.avatarImg} />
                  : <Text style={{ fontSize: 32 }}>😊</Text>
                }
              </View>
              <Text style={[hs.personName, { fontFamily: 'Cubic11' }]}>{partner.name}</Text>
              <Text style={{ fontSize: 18 }}>{partner.mood?.emoji}</Text>
            </View>
          </View>

          {/* Anniversary bar */}
          {nextAnniv && (
            <View style={[hs.annivBar, { backgroundColor: theme.bg, borderColor: theme.primary }]}>
              <Text style={[hs.annivText, { fontFamily: 'Cubic11' }]}>📅 {nextAnniv.title}</Text>
              <Text style={[hs.annivDays, { fontFamily: 'Cubic11', color: theme.primary }]}>{daysLeft}天后</Text>
            </View>
          )}
        </View>

        {/* Mood songs */}
        <View style={hs.section}>
          <View style={hs.card}>
            <View style={[hs.cardHeader, { backgroundColor: theme.bgHeader }]}>
              <Text style={{ fontSize: 14 }}>🎵</Text>
              <Text style={[hs.cardHeaderText, { fontFamily: 'Cubic11', color: '#3d3d3d' }]}>心情曲</Text>
            </View>
            <View style={hs.songRow}>
              <SongSide song={user.moodSong} label={`${user.name} 的`} accentColor={theme.primary} canChange onChangeClick={() => setShowImport(true)} />
              <View style={hs.divider} />
              <SongSide song={partner.moodSong} label={`${partner.name} 的`} accentColor={theme.secondary} canChange={false} />
            </View>
          </View>
        </View>

        {/* Quick access */}
        <View style={hs.section}>
          <View style={hs.card}>
            <Text style={[hs.sectionTitle, { fontFamily: 'Cubic11' }]}>QUICK ACCESS</Text>
            <View style={hs.quickRow}>
              <QuickBtn emoji="🍱" label="三餐打卡" onPress={() => router.push('/checkin')} />
              <QuickBtn emoji="😊" label="今日心情" onPress={() => router.push('/memories')} />
              <QuickBtn emoji="🖼️" label="共享相册" onPress={() => router.push('/memories')} />
              <QuickBtn emoji="🎁" label="礼物"     onPress={() => router.push('/memories')} />
              <QuickBtn emoji="📅" label="纪念日"   onPress={() => router.push('/memories')} />
            </View>
          </View>
        </View>

        {/* Shared playlist */}
        <View style={hs.section}>
          <View style={hs.card}>
            <View style={[hs.cardHeader, { backgroundColor: theme.bgHeader }]}>
              <Text style={{ fontSize: 14 }}>🎶</Text>
              <Text style={[hs.cardHeaderText, { fontFamily: 'Cubic11', color: '#3d3d3d' }]}>共享歌单</Text>
              <Text style={[hs.cardHeaderSub, { fontFamily: 'Cubic11' }]}>{playlist.length} 首</Text>
              <TouchableOpacity onPress={() => setShowAddToList(true)} style={[hs.addBtn, { marginLeft: 'auto' }]}>
                <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, color: '#3d3d3d' }]}>+ 添加</Text>
              </TouchableOpacity>
            </View>
            {playlist.length === 0 ? (
              <View style={hs.emptyPlaylist}>
                <Text style={{ fontSize: 24, opacity: 0.3 }}>🎵</Text>
                <Text style={[{ fontFamily: 'Cubic11', fontSize: 11, color: '#ccc' }]}>还没有共享歌曲</Text>
              </View>
            ) : (
              playlist.slice(0, 5).map((song, i) => {
                const isMe = song.from === 'A'
                const url = song.link || (song.songId ? `https://music.163.com/song?id=${song.songId}` : null)
                return (
                  <View key={song.id} style={[hs.playlistItem, i < playlist.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#e8dfa8' }]}>
                    <View style={[hs.playlistIcon, { borderColor: isMe ? theme.primary : theme.secondary, backgroundColor: (isMe ? theme.primary : theme.secondary) + '22' }]}>
                      <Text style={{ fontSize: 16 }}>🎵</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[hs.playlistTitle, { fontFamily: 'Cubic11' }]} numberOfLines={1}>{song.title}</Text>
                      <Text style={[hs.playlistSub, { fontFamily: 'Cubic11' }]} numberOfLines={1}>
                        {song.artist}{song.artist ? ' · ' : ''}{isMe ? user.name : partner.name}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => url && Linking.openURL(url)} disabled={!url} style={hs.playBtn}>
                      <Text style={{ fontSize: 12 }}>▶</Text>
                    </TouchableOpacity>
                    {isMe && (
                      <TouchableOpacity onPress={() => removeFromPlaylist(song.id)} style={hs.playBtn}>
                        <Text style={{ fontSize: 14, color: '#ff7675' }}>×</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )
              })
            )}
          </View>
        </View>

        {/* Activity feed */}
        <View style={[hs.section, { marginBottom: 24 }]}>
          <View style={hs.card}>
            <Text style={[hs.sectionTitle, { fontFamily: 'Cubic11' }]}>今日动态</Text>
            {[
              { emoji: '☀️', text: '早餐已打卡', sub: `你和${partner.name}都完成了早餐打卡` },
              { emoji: '🌤️', text: '午餐待打卡', sub: `${partner.name}还没有打卡午餐` },
            ].map((item, i) => (
              <View key={i}>
                {i > 0 && <View style={hs.hrLine} />}
                <View style={hs.activityItem}>
                  <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                  <View>
                    <Text style={[hs.activityTitle, { fontFamily: 'Cubic11' }]}>{item.text}</Text>
                    <Text style={[hs.activitySub, { fontFamily: 'Cubic11' }]}>{item.sub}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <ImportSongSheet visible={showImport} onClose={() => setShowImport(false)} onSave={setMoodSong} title="更换心情曲" />
      <ImportSongSheet visible={showAddToList} onClose={() => setShowAddToList(false)} onSave={addToPlaylist} title="添加到共享歌单" />
    </View>
  )
}

const hs = StyleSheet.create({
  page: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 16, borderBottomWidth: 3, borderBottomColor: '#3d3d3d' },
  daysBadge: { alignItems: 'center', marginBottom: 16 },
  daysBadgeInner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 6, borderWidth: 2, borderColor: '#3d3d3d', shadowColor: '#3d3d3d', shadowOffset: {width:3,height:3}, shadowOpacity:1, shadowRadius:0 },
  daysText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  avatarRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 24 },
  personCol: { alignItems: 'center', gap: 4 },
  avatarBox: { width: 72, height: 72, borderWidth: 3, shadowColor: '#3d3d3d', shadowOffset:{width:3,height:3}, shadowOpacity:1, shadowRadius:0, backgroundColor: '#fffef5', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: 72, height: 72 },
  personName: { fontSize: 12, fontWeight: '700', color: '#3d3d3d' },
  centerHeart: { paddingBottom: 16 },
  annivBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 2 },
  annivText: { fontSize: 11, color: '#666' },
  annivDays: { fontSize: 11, fontWeight: '700' },
  section: { marginHorizontal: 16, marginTop: 12 },
  card: { borderWidth: 3, borderColor: '#3d3d3d', backgroundColor: '#fffef5', shadowColor:'#3d3d3d', shadowOffset:{width:4,height:4}, shadowOpacity:1, shadowRadius:0, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: '#e8dfa8' },
  cardHeaderText: { fontSize: 12, color: '#3d3d3d', fontWeight: '700' },
  cardHeaderSub: { fontSize: 11, color: '#aaa' },
  addBtn: { borderWidth: 2, borderColor: '#3d3d3d', paddingHorizontal: 10, paddingVertical: 4 },
  songRow: { flexDirection: 'row' },
  songSide: { padding: 12, gap: 6, alignItems: 'center' },
  songLabel: { fontSize: 10 },
  songCover: { width: '100%', aspectRatio: 1, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f0' },
  songTitle: { fontSize: 12, fontWeight: '700', color: '#374151', alignSelf: 'flex-start' },
  songArtist: { fontSize: 10, color: '#aaa', alignSelf: 'flex-start' },
  songBtns: { flexDirection: 'row', gap: 6, width: '100%' },
  songPlayBtn: { borderWidth: 2, borderColor: '#3d3d3d', paddingVertical: 6, alignItems: 'center' },
  songChangeBtn: { borderWidth: 2, borderColor: '#3d3d3d', paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  divider: { width: 2, backgroundColor: '#e8dfa8' },
  sectionTitle: { fontSize: 10, color: '#aaa', padding: 12, paddingBottom: 8 },
  quickRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 12 },
  quickBtn: { alignItems: 'center', gap: 4 },
  quickBtnBox: { width: 48, height: 48, borderWidth: 3, borderColor: '#3d3d3d', backgroundColor: '#fffef5', alignItems: 'center', justifyContent: 'center', shadowColor:'#3d3d3d', shadowOffset:{width:3,height:3}, shadowOpacity:1, shadowRadius:0 },
  quickBtnLabel: { fontSize: 10, color: '#555' },
  emptyPlaylist: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  playlistItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 10 },
  playlistIcon: { width: 36, height: 36, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  playlistTitle: { fontSize: 12, fontWeight: '700', color: '#374151' },
  playlistSub: { fontSize: 10, color: '#aaa' },
  playBtn: { borderWidth: 2, borderColor: '#3d3d3d', padding: 6 },
  activityItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  activityTitle: { fontSize: 13, fontWeight: '700', color: '#374151' },
  activitySub: { fontSize: 11, color: '#aaa', marginTop: 2 },
  hrLine: { height: 2, backgroundColor: '#e8dfa8', marginHorizontal: 12 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { borderTopWidth: 4, borderTopColor: '#3d3d3d', padding: 20 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sheetTitle: { fontSize: 14, color: '#3d3d3d', fontWeight: '700' },
  closeBtn: { borderWidth: 2, borderColor: '#3d3d3d', padding: 6 },
  fieldLabel: { fontSize: 11, color: '#888', marginBottom: 6 },
  input: { borderWidth: 3, borderColor: '#3d3d3d', backgroundColor: '#fffef5', paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#3d3d3d' },
  statusText: { fontSize: 11, marginTop: 4 },
  sheetBtns: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btnOutline: { borderWidth: 3, borderColor: '#3d3d3d', paddingVertical: 14, alignItems: 'center' },
  btnPrimary: { borderWidth: 3, borderColor: '#3d3d3d', paddingVertical: 14, alignItems: 'center', shadowColor:'#3d3d3d', shadowOffset:{width:4,height:4}, shadowOpacity:1, shadowRadius:0 },
})
