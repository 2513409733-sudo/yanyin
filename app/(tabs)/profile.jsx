import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet, Alert } from 'react-native'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import * as Clipboard from 'expo-clipboard'
import { useRouter } from 'expo-router'
import { useStore, THEME_PRESETS, DEFAULT_THEME } from '../../store/useStore'

// Color swatches for custom color picker (replaces <input type="color">)
const COLOR_SWATCHES = [
  '#ff6b9d','#ff7675','#fd79a8','#e84393','#a29bfe',
  '#6c5ce7','#74b9ff','#0984e3','#00cec9','#00b894',
  '#55efc4','#81ecec','#fdcb6e','#e17055','#d63031',
  '#f9ca24','#6ab04c','#badc58','#ffffff','#fffef5',
  '#fdf6e3','#f0e6d3','#e8dfa8','#d4c5a9','#b2bec3',
  '#636e72','#3d3d3d','#2d3436','#1e1e2e','#000000',
]

// ── Theme Panel ───────────────────────────────────────────
function ThemePanel({ onClose }) {
  const { theme, setTheme, resetTheme } = useStore()
  const [local, setLocal] = useState({ ...theme })
  const [colorTarget, setColorTarget] = useState(null)

  const FIELDS = [
    { key: 'primary',   label: '主色',     desc: '按钮 / 标签' },
    { key: 'secondary', label: '辅色',     desc: 'TA 的边框 / 气泡' },
    { key: 'accent',    label: '强调色',   desc: '能量 / 在线状态' },
    { key: 'bg',        label: '背景色',   desc: '页面主背景' },
    { key: 'bgHeader',  label: '卡片底色', desc: '标题栏 / 卡片' },
  ]

  return (
    <Modal animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={ps.overlay}>
        <ScrollView style={[ps.sheet, { backgroundColor: local.bg || '#fdf6e3' }]}>
          <View style={ps.sheetHeader}>
            <Text style={[ps.sheetTitle, { fontFamily: 'Cubic11' }]}>主题风格</Text>
            <TouchableOpacity
              onPress={() => { setLocal({ ...DEFAULT_THEME }); resetTheme(); onClose() }}
              style={ps.resetBtn}
            >
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 11, color: '#3d3d3d' }]}>↺ 恢复默认</Text>
            </TouchableOpacity>
          </View>

          {/* Preset grid */}
          <Text style={[ps.sectionLabel, { fontFamily: 'Cubic11' }]}>预设风格</Text>
          <View style={ps.presetGrid}>
            {THEME_PRESETS.map(p => {
              const isActive = local.primary === p.primary && local.bg === p.bg
              return (
                <TouchableOpacity
                  key={p.label}
                  onPress={() => setLocal({ ...p })}
                  style={[ps.presetCard, {
                    backgroundColor: p.bg,
                    borderColor: isActive ? p.primary : '#3d3d3d',
                    borderWidth: isActive ? 3 : 2,
                    shadowColor: isActive ? p.primary : '#3d3d3d',
                  }]}
                >
                  <View style={{ flexDirection: 'row', gap: 3, marginBottom: 4 }}>
                    {[p.primary, p.secondary, p.accent].map(c => (
                      <View key={c} style={{ width: 10, height: 10, backgroundColor: c, borderWidth: 1, borderColor: '#3d3d3d' }} />
                    ))}
                  </View>
                  <View style={{ width: '100%', height: 5, backgroundColor: p.bgHeader, borderWidth: 1, borderColor: '#3d3d3d', marginBottom: 4 }} />
                  <Text style={{ fontSize: 9, fontFamily: 'Cubic11', color: '#555' }}>{p.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Preview bar */}
          <View style={[ps.previewBar, {
            backgroundColor: local.primary,
            borderColor: '#3d3d3d',
          }]}>
            <View style={[{ flex: 1, backgroundColor: local.secondary, height: '100%' }]} />
            <View style={[{ flex: 1, backgroundColor: local.accent, height: '100%' }]} />
          </View>

          {/* Custom fields */}
          <Text style={[ps.sectionLabel, { fontFamily: 'Cubic11', marginTop: 16 }]}>自定义色盘</Text>
          {FIELDS.map(({ key, label, desc }) => (
            <View key={key} style={ps.colorRow}>
              <View style={{ flex: 1 }}>
                <Text style={[ps.colorLabel, { fontFamily: 'Cubic11' }]}>{label}</Text>
                <Text style={[ps.colorDesc, { fontFamily: 'Cubic11' }]}>{desc}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setColorTarget(colorTarget === key ? null : key)}
                style={[ps.colorSwatch, { backgroundColor: local[key], borderColor: '#3d3d3d' }]}
              />
            </View>
          ))}

          {/* Color swatch picker (shown when a field is selected) */}
          {colorTarget && (
            <View style={ps.swatchGrid}>
              {COLOR_SWATCHES.map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => { setLocal(v => ({ ...v, [colorTarget]: c })); setColorTarget(null) }}
                  style={[ps.swatchDot, { backgroundColor: c, borderColor: local[colorTarget] === c ? '#3d3d3d' : '#ddd' }]}
                />
              ))}
            </View>
          )}

          {/* Buttons */}
          <View style={ps.rowBtns}>
            <TouchableOpacity onPress={onClose} style={[ps.outlineBtn, { flex: 1 }]}>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 13 }]}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setTheme(local); onClose() }} style={[ps.primaryBtn, { flex: 1 }]}>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 13, color: '#fff', fontWeight: '700' }]}>应用</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}

// ── Relation Panel ────────────────────────────────────────
function RelationPanel({ onClose }) {
  const { partner, setDaysCount, setRelationLabel } = useStore()
  const theme = useStore(s => s.theme)
  const [days, setDays] = useState(String(partner.daysCount))
  const [label, setLabel] = useState(partner.relationLabel || '在一起')

  const handleSave = () => {
    const n = parseInt(days)
    if (!isNaN(n) && n >= 0) setDaysCount(n)
    if (label.trim()) setRelationLabel(label.trim())
    onClose()
  }

  return (
    <Modal animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={ps.overlay}>
        <View style={[ps.sheet, { backgroundColor: theme.bg }]}>
          <View style={ps.sheetHeader}>
            <Text style={[ps.sheetTitle, { fontFamily: 'Cubic11' }]}>关系设置</Text>
            <TouchableOpacity onPress={onClose} style={ps.closeBtn}>
              <Text style={{ fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={[ps.fieldLabel, { fontFamily: 'Cubic11' }]}>关系称谓（替换"在一起"）</Text>
          <TextInput
            style={[ps.input, { fontFamily: 'Cubic11' }]}
            placeholder="在一起 / 好朋友 / 搭档..."
            placeholderTextColor="#bbb"
            value={label}
            onChangeText={setLabel}
          />
          <Text style={[ps.fieldLabel, { fontFamily: 'Cubic11', marginTop: 12 }]}>在一起天数</Text>
          <TextInput
            style={[ps.input, { fontFamily: 'Cubic11' }]}
            placeholder="128"
            placeholderTextColor="#bbb"
            keyboardType="number-pad"
            value={days}
            onChangeText={setDays}
          />
          <View style={[ps.rowBtns, { marginTop: 20 }]}>
            <TouchableOpacity onPress={onClose} style={[ps.outlineBtn, { flex: 1 }]}>
              <Text style={{ fontFamily: 'Cubic11', fontSize: 13 }}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[ps.primaryBtn, { flex: 1, backgroundColor: theme.primary }]}>
              <Text style={{ fontFamily: 'Cubic11', fontSize: 13, color: '#fff', fontWeight: '700' }}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ── Bind Panel ────────────────────────────────────────────
function BindPanel({ onClose }) {
  const { user, partner, isBound, bindPartner, unbindPartner } = useStore()
  const theme = useStore(s => s.theme)
  const [searchUid, setSearchUid] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searching, setSearching] = useState(false)
  const [confirmUnbind, setConfirmUnbind] = useState(false)

  const doSearch = () => {
    const uid = searchUid.trim().toUpperCase()
    if (!uid) return
    setSearching(true)
    setSearchResult(null)
    setTimeout(() => {
      if (uid.length === 10 && uid.startsWith('IS') && uid !== user.uid) {
        setSearchResult({ uid, name: '用户' + uid.slice(-4), found: true })
      } else {
        setSearchResult({ found: false })
      }
      setSearching(false)
    }, 800)
  }

  const doBind = () => {
    if (!searchResult?.found) return
    bindPartner(searchResult.uid, searchResult.name)
    onClose()
  }

  const doUnbind = () => {
    unbindPartner()
    onClose()
  }

  return (
    <Modal animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={ps.overlay}>
        <View style={[ps.sheet, { backgroundColor: theme.bg }]}>
          <View style={ps.sheetHeader}>
            <Text style={[ps.sheetTitle, { fontFamily: 'Cubic11' }]}>伴侣绑定</Text>
            <TouchableOpacity onPress={onClose} style={ps.closeBtn}>
              <Text style={{ fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>

          {isBound ? (
            <>
              <View style={[ps.partnerCard, { borderColor: '#3d3d3d' }]}>
                <View style={[ps.partnerIcon, { backgroundColor: theme.secondary + '22', borderColor: '#3d3d3d' }]}>
                  <Text style={{ fontSize: 18 }}>👤</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[{ fontFamily: 'Cubic11', fontSize: 13, fontWeight: '700', color: '#374151' }]}>{partner.name}</Text>
                  <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: '#aaa' }]}>{partner.uid}</Text>
                </View>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.accent, borderWidth: 1, borderColor: '#3d3d3d' }} />
              </View>
              {!confirmUnbind ? (
                <TouchableOpacity onPress={() => setConfirmUnbind(true)} style={[ps.outlineBtn, { borderColor: '#ff7675' }]}>
                  <Text style={{ fontFamily: 'Cubic11', fontSize: 13, color: '#ff7675' }}>解绑当前伴侣</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <Text style={{ fontFamily: 'Cubic11', fontSize: 11, color: '#ff7675', textAlign: 'center', marginBottom: 12 }}>
                    确认解绑？解绑后将失去共同数据访问
                  </Text>
                  <View style={ps.rowBtns}>
                    <TouchableOpacity onPress={() => setConfirmUnbind(false)} style={[ps.outlineBtn, { flex: 1 }]}>
                      <Text style={{ fontFamily: 'Cubic11', fontSize: 13 }}>取消</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={doUnbind} style={[ps.primaryBtn, { flex: 1, backgroundColor: '#ff7675' }]}>
                      <Text style={{ fontFamily: 'Cubic11', fontSize: 13, color: '#fff', fontWeight: '700' }}>确认解绑</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </>
          ) : (
            <>
              <Text style={{ fontFamily: 'Cubic11', fontSize: 10, color: '#888', marginBottom: 8 }}>通过 UID 搜索并绑定伴侣</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                <TextInput
                  style={[ps.input, { fontFamily: 'Cubic11', flex: 1 }]}
                  placeholder="输入对方 UID（如 IS12345678）"
                  placeholderTextColor="#bbb"
                  value={searchUid}
                  onChangeText={setSearchUid}
                  autoCapitalize="characters"
                  returnKeyType="search"
                  onSubmitEditing={doSearch}
                />
                <TouchableOpacity onPress={doSearch} style={[ps.primaryBtn, { paddingHorizontal: 14, backgroundColor: theme.primary }]}>
                  <Text style={{ fontFamily: 'Cubic11', fontSize: 13, color: '#fff' }}>{searching ? '...' : '搜索'}</Text>
                </TouchableOpacity>
              </View>
              {searchResult && (
                searchResult.found ? (
                  <View style={[ps.partnerCard, { marginBottom: 12 }]}>
                    <View style={[ps.partnerIcon, { backgroundColor: theme.primary + '22', borderColor: '#3d3d3d' }]}>
                      <Text style={{ fontSize: 18 }}>👤</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Cubic11', fontSize: 13, fontWeight: '700', color: '#374151' }}>{searchResult.name}</Text>
                      <Text style={{ fontFamily: 'Cubic11', fontSize: 10, color: '#aaa' }}>{searchResult.uid}</Text>
                    </View>
                    <TouchableOpacity onPress={doBind} style={[ps.primaryBtn, { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: theme.primary }]}>
                      <Text style={{ fontFamily: 'Cubic11', fontSize: 12, color: '#fff' }}>绑定</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={{ fontFamily: 'Cubic11', fontSize: 10, color: '#ff7675', marginBottom: 8 }}>未找到该用户，请检查 UID</Text>
                )
              )}
              <Text style={{ fontFamily: 'Cubic11', fontSize: 9, color: '#ccc' }}>UID 格式：IS + 8位数字，可在对方的「我的」页面复制</Text>
            </>
          )}
        </View>
      </View>
    </Modal>
  )
}

// ── Main Profile ──────────────────────────────────────────
export default function Profile() {
  const { user, partner, isBound, logout, setAvatarUrl } = useStore()
  const theme = useStore(s => s.theme)
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [showTheme, setShowTheme] = useState(false)
  const [showRelation, setShowRelation] = useState(false)
  const [showBind, setShowBind] = useState(false)

  const copyUID = async () => {
    await Clipboard.setStringAsync(user.uid)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!result.canceled) {
      setAvatarUrl(result.assets[0].uri)
    }
  }

  const MENU = [
    { emoji: '📷', label: '更换头像',   sub: '上传照片作为头像',                    onPress: pickAvatar },
    { emoji: '❤️', label: '关系设置',   sub: `与 ${partner.name}`,                  onPress: () => setShowRelation(true) },
    { emoji: '👥', label: '伴侣绑定',   sub: isBound ? `已绑定 ${partner.name}` : '搜索添加伴侣', onPress: () => setShowBind(true) },
    { emoji: '🎨', label: '主题风格',   sub: '配色 · 背景 · 氛围感',               onPress: () => setShowTheme(true) },
  ]

  const STATS = [
    { label: partner.relationLabel || '在一起', value: isBound ? partner.daysCount : '--' },
    { label: '打卡', value: 87 },
    { label: '回忆', value: 12 },
  ]

  return (
    <ScrollView style={[pf.page, { backgroundColor: theme.bg }]} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={[pf.header, { backgroundColor: theme.bgHeader }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          {/* Avatar */}
          <TouchableOpacity onPress={pickAvatar} style={[pf.avatarBtn, { borderColor: theme.primary, shadowColor: theme.primary, backgroundColor: theme.primary + '22' }]}>
            {user.avatarUrl
              ? <Image source={{ uri: user.avatarUrl }} style={{ width: 64, height: 64 }} contentFit="cover" />
              : <Text style={{ fontSize: 36 }}>😊</Text>
            }
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[pf.userName, { fontFamily: 'Cubic11' }]}>{user.name}</Text>
            <TouchableOpacity onPress={copyUID} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <Text style={[pf.uid, { fontFamily: 'Cubic11' }]}>{user.uid}</Text>
              <Text style={{ fontSize: 10, color: copied ? theme.primary : '#aaa' }}>⎘</Text>
            </TouchableOpacity>
            {copied && <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: theme.primary }]}>已复制！</Text>}
          </View>
        </View>

        {/* Stats row */}
        <View style={pf.statsRow}>
          {STATS.map(s => (
            <View key={s.label} style={[pf.statCard, { borderColor: '#3d3d3d', shadowColor: '#3d3d3d' }]}>
              <Text style={[pf.statValue, { fontFamily: 'Cubic11' }]}>{s.value}</Text>
              <Text style={[pf.statLabel, { fontFamily: 'Cubic11' }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Partner card or add partner button */}
      <View style={{ marginHorizontal: 16, marginTop: 12 }}>
        {isBound ? (
          <View style={[pf.card, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
            <View style={[pf.partnerAv, { borderColor: theme.secondary, backgroundColor: theme.secondary + '22' }]}>
              {partner.avatarUrl
                ? <Image source={{ uri: partner.avatarUrl }} style={{ width: 40, height: 40 }} contentFit="cover" />
                : <Text style={{ fontSize: 22 }}>😊</Text>
              }
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 13, fontWeight: '700', color: '#374151' }]}>{partner.name}</Text>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: '#aaa' }]}>{partner.uid}</Text>
            </View>
            <Text style={{ fontSize: 20 }}>{partner.mood?.emoji || '😊'}</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setShowBind(true)} style={[pf.card, { alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }]}>
            <Text style={{ fontSize: 14, color: theme.primary }}>＋</Text>
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, color: theme.primary }]}>搜索并添加伴侣</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Menu */}
      <View style={[pf.card, { marginHorizontal: 16, marginTop: 12, padding: 0, overflow: 'hidden' }]}>
        {MENU.map(({ emoji, label, sub, onPress }, i) => (
          <TouchableOpacity
            key={label}
            onPress={onPress}
            style={[pf.menuRow, i < MENU.length - 1 && { borderBottomWidth: 2, borderBottomColor: '#e8dfa8' }]}
          >
            <View style={[pf.menuIcon, { backgroundColor: theme.primary + '22', borderColor: '#3d3d3d' }]}>
              <Text style={{ fontSize: 15 }}>{emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 13, fontWeight: '700', color: '#374151' }]}>{label}</Text>
              {sub && <Text style={[{ fontFamily: 'Cubic11', fontSize: 11, color: '#aaa' }]}>{sub}</Text>}
            </View>
            <Text style={{ fontSize: 16, color: '#aaa' }}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity
        onPress={() => { logout(); router.replace('/login') }}
        style={[pf.card, { marginHorizontal: 16, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }]}
      >
        <Text style={{ fontSize: 15 }}>🚪</Text>
        <Text style={[{ fontFamily: 'Cubic11', fontSize: 13, fontWeight: '700', color: '#ff7675' }]}>退出登录</Text>
      </TouchableOpacity>

      {showTheme && <ThemePanel onClose={() => setShowTheme(false)} />}
      {showRelation && <RelationPanel onClose={() => setShowRelation(false)} />}
      {showBind && <BindPanel onClose={() => setShowBind(false)} />}
    </ScrollView>
  )
}

// ── Panel styles (shared by modals) ──────────────────────
const ps = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopWidth: 4, borderTopColor: '#3d3d3d', padding: 20, maxHeight: '90%' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sheetTitle: { fontSize: 13, color: '#3d3d3d', fontWeight: '700' },
  resetBtn: { borderWidth: 2, borderColor: '#3d3d3d', paddingHorizontal: 8, paddingVertical: 4 },
  closeBtn: { borderWidth: 2, borderColor: '#3d3d3d', padding: 6 },
  sectionLabel: { fontSize: 11, color: '#aaa', marginBottom: 8 },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  presetCard: {
    width: '30%', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 6,
    shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0,
  },
  previewBar: { height: 12, flexDirection: 'row', borderWidth: 2, marginBottom: 8, overflow: 'hidden' },
  colorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  colorLabel: { fontSize: 13, fontWeight: '700', color: '#374151' },
  colorDesc: { fontSize: 10, color: '#aaa' },
  colorSwatch: { width: 36, height: 36, borderWidth: 3, shadowColor: '#3d3d3d', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0 },
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  swatchDot: { width: 30, height: 30, borderWidth: 2 },
  fieldLabel: { fontSize: 11, color: '#aaa', marginBottom: 4 },
  input: {
    borderWidth: 3, borderColor: '#3d3d3d', backgroundColor: '#fffef5',
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#3d3d3d',
  },
  rowBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  outlineBtn: {
    borderWidth: 3, borderColor: '#3d3d3d', paddingVertical: 12,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#3d3d3d', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0,
  },
  primaryBtn: {
    borderWidth: 3, borderColor: '#3d3d3d', paddingVertical: 12,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#ff6b9d',
    shadowColor: '#3d3d3d', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0,
  },
  partnerCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 3, borderColor: '#3d3d3d', padding: 12, marginBottom: 12,
    backgroundColor: '#fffef5',
  },
  partnerIcon: { width: 40, height: 40, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
})

// ── Page styles ───────────────────────────────────────────
const pf = StyleSheet.create({
  page: { flex: 1 },
  header: {
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 16,
    borderBottomWidth: 3, borderBottomColor: '#3d3d3d',
  },
  avatarBtn: {
    width: 64, height: 64, borderWidth: 3, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, flexShrink: 0,
  },
  userName: { fontSize: 17, fontWeight: '700', color: '#374151' },
  uid: { fontSize: 10, color: '#aaa' },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  statCard: {
    flex: 1, paddingVertical: 10, alignItems: 'center', gap: 2,
    borderWidth: 2, backgroundColor: '#fffef5',
    shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0,
  },
  statValue: { fontSize: 15, fontWeight: '700', color: '#374151' },
  statLabel: { fontSize: 10, color: '#888' },
  card: {
    borderWidth: 3, borderColor: '#3d3d3d', backgroundColor: '#fffef5', padding: 16,
    shadowColor: '#3d3d3d', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
  },
  partnerAv: { width: 40, height: 40, borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  menuIcon: { width: 32, height: 32, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0, shadowColor: '#3d3d3d', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0 },
})
