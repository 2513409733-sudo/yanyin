import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useStore } from '../store/useStore'

export default function BindPartner() {
  const router = useRouter()
  const { user, searchUserByUid, bindPartner, skipBind, theme } = useStore()
  const [query, setQuery] = useState('')
  const [found, setFound] = useState(null)   // { uid, name } | null
  const [searched, setSearched] = useState(false)
  const [searching, setSearching] = useState(false)
  const [binding, setBinding] = useState(false)

  const handleSearch = async () => {
    const q = query.trim().toUpperCase()
    if (!q) return Alert.alert('提示', '请输入对方的 UID')
    if (q === user.uid) return Alert.alert('提示', '不能绑定自己哦')
    setSearching(true)
    const result = await searchUserByUid(q)
    setSearching(false)
    setFound(result)
    setSearched(true)
  }

  const handleBind = async () => {
    if (!found) return
    setBinding(true)
    await bindPartner(found.uid, found.name)
    setBinding(false)
    router.replace('/(tabs)')
  }

  const handleSkip = () => {
    skipBind()
    router.replace('/(tabs)')
  }

  return (
    <View style={[bp.page, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[bp.header, { backgroundColor: theme.bgHeader }]}>
        <Text style={[bp.title, { fontFamily: 'Cubic11' }]}>寻找你的 TA</Text>
        <Text style={[bp.sub, { fontFamily: 'Cubic11' }]}>输入对方的 UID 匹配为伴侣</Text>
      </View>

      <View style={bp.body}>
        {/* My UID card */}
        <View style={[bp.myUidCard, { borderColor: theme.primary + '88', backgroundColor: theme.primary + '11' }]}>
          <Text style={[bp.myUidLabel, { fontFamily: 'Cubic11', color: theme.primary }]}>你的 UID（分享给对方）</Text>
          <Text style={[bp.myUid, { fontFamily: 'Cubic11', color: theme.primary }]}>{user.uid}</Text>
          <Text style={[bp.myUidName, { fontFamily: 'Cubic11', color: '#888' }]}>{user.name}</Text>
        </View>

        {/* Search */}
        <View style={bp.section}>
          <Text style={[bp.sectionLabel, { fontFamily: 'Cubic11' }]}>搜索对方 UID</Text>
          <View style={bp.searchRow}>
            <TextInput
              style={[bp.input, { fontFamily: 'Cubic11', flex: 1 }]}
              placeholder="输入对方的 UID"
              value={query}
              onChangeText={t => { setQuery(t.toUpperCase().replace(/[^A-Z0-9]/g, '')); setSearched(false); setFound(null) }}
              autoCapitalize="characters"
              maxLength={16}
              placeholderTextColor="#bbb"
            />
            <TouchableOpacity
              onPress={handleSearch}
              disabled={searching}
              style={[bp.searchBtn, { backgroundColor: theme.primary, borderColor: '#3d3d3d', opacity: searching ? 0.6 : 1 }]}
            >
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, color: '#fff', fontWeight: '700' }]}>{searching ? '...' : '搜索'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Result */}
        {searched && (
          found ? (
            <View style={[bp.resultCard, { borderColor: '#3d3d3d' }]}>
              <View style={[bp.resultDot, { backgroundColor: theme.secondary }]} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[bp.resultName, { fontFamily: 'Cubic11' }]}>{found.name}</Text>
                <Text style={[bp.resultUid, { fontFamily: 'Cubic11' }]}>UID: {found.uid}</Text>
              </View>
              <TouchableOpacity
                onPress={handleBind}
                disabled={binding}
                style={[bp.bindBtn, { backgroundColor: theme.secondary, borderColor: '#3d3d3d', opacity: binding ? 0.6 : 1 }]}
              >
                <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, color: '#fff', fontWeight: '700' }]}>{binding ? '...' : '绑定 ❤️'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={bp.notFound}>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, color: '#aaa' }]}>
                未找到该 UID，请确认对方已在本设备注册
              </Text>
            </View>
          )
        )}

        {/* Skip */}
        <TouchableOpacity onPress={handleSkip} style={bp.skipBtn}>
          <Text style={[bp.skipText, { fontFamily: 'Cubic11', color: '#aaa' }]}>稍后再绑定 ›</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const bp = StyleSheet.create({
  page: { flex: 1 },
  header: {
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24,
    borderBottomWidth: 3, borderBottomColor: '#3d3d3d',
  },
  title: { fontSize: 18, color: '#3d3d3d', fontWeight: '700' },
  sub: { fontSize: 12, color: '#888', marginTop: 4 },

  body: { padding: 20, gap: 20 },

  myUidCard: {
    borderWidth: 2, padding: 16, gap: 4, alignItems: 'center',
  },
  myUidLabel: { fontSize: 10 },
  myUid: { fontSize: 22, fontWeight: '700', letterSpacing: 3, marginTop: 4 },
  myUidName: { fontSize: 11, marginTop: 2 },

  section: { gap: 8 },
  sectionLabel: { fontSize: 11, color: '#888' },
  searchRow: { flexDirection: 'row', gap: 8 },
  input: {
    borderWidth: 3, borderColor: '#3d3d3d',
    backgroundColor: '#fffef5',
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: '#3d3d3d',
  },
  searchBtn: {
    borderWidth: 3, paddingHorizontal: 16, paddingVertical: 10,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#3d3d3d', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
  },

  resultCard: {
    borderWidth: 3, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fffef5',
    shadowColor: '#3d3d3d', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
  },
  resultDot: { width: 10, height: 10, borderWidth: 1, borderColor: '#3d3d3d' },
  resultName: { fontSize: 14, color: '#3d3d3d', fontWeight: '700' },
  resultUid: { fontSize: 10, color: '#aaa' },
  bindBtn: {
    borderWidth: 3, paddingHorizontal: 12, paddingVertical: 8,
    shadowColor: '#3d3d3d', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0,
  },

  notFound: {
    borderWidth: 2, borderColor: '#e8dfa8', borderStyle: 'dashed',
    padding: 16, alignItems: 'center',
  },

  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: { fontSize: 12 },
})
