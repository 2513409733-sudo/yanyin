import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { useStore } from '../store/useStore'

// Generate a random 8-char UID: uppercase letters + digits, ambiguous chars removed
function genUid() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

function PixelHeart({ size = 32, color = '#fff' }) {
  const u = size / 16
  const b = (x, y, w, h) => (
    <View key={`${x}${y}`} style={{ position: 'absolute', left: x*u, top: y*u, width: w*u, height: h*u, backgroundColor: color }} />
  )
  return (
    <View style={{ width: size, height: size }}>
      {b(1,4,4,2)}{b(7,4,4,2)}
      {b(0,6,6,4)}{b(6,6,4,4)}{b(10,6,6,4)}
      {b(1,10,14,2)}{b(2,12,12,2)}
      {b(4,14,8,1)}{b(6,15,4,1)}
    </View>
  )
}

export default function Login() {
  const [tab, setTab] = useState('register')
  const [name, setName] = useState('')
  const [uid, setUid] = useState('')
  const [loginUid, setLoginUid] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { registerUser, loginByUid, loginAsDemo, theme } = useStore()

  const handleRegister = async () => {
    const trimUid = uid.trim().toUpperCase()
    const trimName = name.trim()
    if (!trimUid) return Alert.alert('提示', '请设置你的 UID')
    if (trimUid.length < 4) return Alert.alert('提示', 'UID 至少需要 4 位')
    if (!trimName) return Alert.alert('提示', '请填写昵称')
    setLoading(true)
    const result = await registerUser(trimUid, trimName)
    setLoading(false)
    if (!result.ok) {
      Alert.alert('UID 已被使用', '该 UID 已有人注册，请换一个试试')
      return
    }
    router.replace('/onboarding')
  }

  const handleLogin = async () => {
    const trimUid = loginUid.trim().toUpperCase()
    if (!trimUid) return Alert.alert('提示', '请输入你的 UID')
    setLoading(true)
    const ok = await loginByUid(trimUid)
    setLoading(false)
    if (!ok) {
      Alert.alert('未找到该 UID', '该 UID 尚未注册，请先注册')
      return
    }
    const { user, isBound } = useStore.getState()
    if (!user.hasSetAvatar) {
      router.replace('/onboarding')
    } else if (!isBound) {
      router.replace('/bind-partner')
    } else {
      router.replace('/(tabs)')
    }
  }

  return (
    <ScrollView
      style={[s.page, { backgroundColor: theme.bg }]}
      contentContainerStyle={s.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Logo */}
      <View style={s.logoArea}>
        <View style={[s.logoBox, { backgroundColor: theme.primary }]}>
          <PixelHeart size={40} color="#fff" />
        </View>
        <Text style={[s.appTitle, { fontFamily: 'Cubic11' }]}>盐音</Text>
        <Text style={[s.appSub, { fontFamily: 'Cubic11' }]}>让每一天都留有痕迹</Text>
      </View>

      {/* Card */}
      <View style={s.card}>
        {/* Tabs */}
        <View style={s.tabRow}>
          {[['register', '注 册'], ['login', '登 录']].map(([t, l], i) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[
                s.tabBtn,
                tab === t && { backgroundColor: theme.bg },
                i === 0 && { borderRightWidth: 3 },
              ]}
            >
              <Text style={[s.tabText, {
                fontFamily: 'Cubic11',
                color: tab === t ? theme.primary : '#888',
                fontWeight: tab === t ? '700' : '400',
              }]}>
                {l}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'register' ? (
          <View style={s.form}>
            {/* UID */}
            <View style={s.field}>
              <Text style={[s.label, { fontFamily: 'Cubic11' }]}>设置你的 UID</Text>
              <Text style={[s.hint, { fontFamily: 'Cubic11' }]}>UID 是你的唯一标识，对象通过它找到你</Text>
              <View style={s.uidRow}>
                <TextInput
                  style={[s.input, s.uidInput, { fontFamily: 'Cubic11' }]}
                  placeholder="4–16 位字母或数字"
                  value={uid}
                  onChangeText={t => setUid(t.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  autoCapitalize="characters"
                  maxLength={16}
                  placeholderTextColor="#bbb"
                />
                <TouchableOpacity
                  onPress={() => setUid(genUid())}
                  style={[s.genBtn, { borderColor: theme.primary }]}
                >
                  <Text style={[{ fontFamily: 'Cubic11', fontSize: 11, color: theme.primary }]}>随机生成</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Nickname */}
            <View style={s.field}>
              <Text style={[s.label, { fontFamily: 'Cubic11' }]}>昵称</Text>
              <TextInput
                style={[s.input, { fontFamily: 'Cubic11' }]}
                placeholder="给自己取个名字"
                value={name}
                onChangeText={setName}
                maxLength={12}
                placeholderTextColor="#bbb"
              />
            </View>

            <TouchableOpacity onPress={handleRegister} disabled={loading} style={[s.primaryBtn, { backgroundColor: theme.primary, opacity: loading ? 0.6 : 1 }]}>
              <Text style={[s.primaryBtnText, { fontFamily: 'Cubic11' }]}>{loading ? '请稍候...' : '▶ 注册并开始'}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.form}>
            <View style={s.field}>
              <Text style={[s.label, { fontFamily: 'Cubic11' }]}>你的 UID</Text>
              <Text style={[s.hint, { fontFamily: 'Cubic11' }]}>输入注册时设置的 UID 即可登录</Text>
              <TextInput
                style={[s.input, { fontFamily: 'Cubic11' }]}
                placeholder="输入你的 UID"
                value={loginUid}
                onChangeText={t => setLoginUid(t.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                autoCapitalize="characters"
                maxLength={16}
                placeholderTextColor="#bbb"
              />
            </View>

            <TouchableOpacity onPress={handleLogin} disabled={loading} style={[s.primaryBtn, { backgroundColor: theme.primary, opacity: loading ? 0.6 : 1 }]}>
              <Text style={[s.primaryBtnText, { fontFamily: 'Cubic11' }]}>{loading ? '请稍候...' : '▶ 登录'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Demo entry */}
      <TouchableOpacity
        onPress={() => { loginAsDemo(); router.replace('/(tabs)') }}
        style={s.demoBtn}
      >
        <Text style={[s.demoText, { fontFamily: 'Cubic11', color: theme.primary }]}>✨ 一键体验（自动匹配虚拟伴侣）</Text>
      </TouchableOpacity>

      <Text style={[s.terms, { fontFamily: 'Cubic11' }]}>
        UID 仅保存在本设备，不会上传至任何服务器
      </Text>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  page: { flex: 1 },
  container: { alignItems: 'center', paddingBottom: 40 },
  logoArea: { alignItems: 'center', paddingTop: 80, paddingBottom: 32 },
  logoBox: {
    width: 72, height: 72,
    borderWidth: 4, borderColor: '#3d3d3d',
    shadowColor: '#3d3d3d', shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 6,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  appTitle: { fontSize: 18, color: '#3d3d3d', letterSpacing: 3, fontWeight: '700' },
  appSub: { fontSize: 13, color: '#888', marginTop: 6 },
  card: {
    width: '90%',
    borderWidth: 3, borderColor: '#3d3d3d',
    backgroundColor: '#fffef5',
    shadowColor: '#3d3d3d', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 5,
  },
  tabRow: { flexDirection: 'row', borderBottomWidth: 3, borderBottomColor: '#3d3d3d' },
  tabBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderColor: '#3d3d3d' },
  tabText: { fontSize: 14 },
  form: { padding: 20, gap: 14 },
  field: { gap: 4 },
  label: { fontSize: 11, color: '#888' },
  hint: { fontSize: 10, color: '#bbb', marginBottom: 2 },
  input: {
    borderWidth: 3, borderColor: '#3d3d3d',
    backgroundColor: '#fffef5',
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: '#3d3d3d',
  },
  uidRow: { flexDirection: 'row', gap: 8, alignItems: 'stretch' },
  uidInput: { flex: 1 },
  genBtn: {
    borderWidth: 2, paddingHorizontal: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fffef5',
  },
  primaryBtn: {
    borderWidth: 3, borderColor: '#3d3d3d',
    paddingVertical: 14, alignItems: 'center',
    shadowColor: '#3d3d3d', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 5,
    marginTop: 4,
  },
  primaryBtnText: { fontSize: 14, color: '#fff', fontWeight: '700' },
  terms: { fontSize: 11, color: '#bbb', marginTop: 12, textAlign: 'center', paddingHorizontal: 32 },
  demoBtn: { marginTop: 24, paddingVertical: 10, paddingHorizontal: 24, alignItems: 'center' },
  demoText: { fontSize: 13, textDecorationLine: 'underline' },
})
