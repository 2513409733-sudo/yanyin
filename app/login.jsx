import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useStore } from '../store/useStore'

function PixelHeart({ size = 32, color = '#fff' }) {
  // Pixel heart made from View blocks
  const s = size / 16
  const block = (x, y, w, h) => (
    <View key={`${x}${y}`} style={{
      position: 'absolute', left: x * s, top: y * s,
      width: w * s, height: h * s, backgroundColor: color,
    }} />
  )
  return (
    <View style={{ width: size, height: size }}>
      {block(1,4,4,2)}{block(7,4,4,2)}
      {block(0,6,6,4)}{block(6,6,4,4)}{block(10,6,6,4)}
      {block(1,10,14,2)}{block(2,12,12,2)}
      {block(4,14,8,1)}{block(6,15,4,1)}
    </View>
  )
}

export default function Login() {
  const [tab, setTab] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const login = useStore(s => s.login)
  const theme = useStore(s => s.theme)

  const handleSubmit = () => {
    login(name || '小雪')
    router.replace('/onboarding')
  }

  return (
    <ScrollView style={[s.page, { backgroundColor: theme.bg }]} contentContainerStyle={s.container}>
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
          {[['login', '登 录'], ['register', '注 册']].map(([t, l], i) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[
                s.tabBtn,
                tab === t && { backgroundColor: theme.bg },
                i === 0 && { borderRightWidth: 3 },
              ]}
            >
              <Text style={[s.tabText, { fontFamily: 'Cubic11', color: tab === t ? theme.primary : '#888', fontWeight: tab === t ? '700' : '400' }]}>
                {l}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.form}>
          {tab === 'register' && (
            <View style={s.field}>
              <Text style={[s.label, { fontFamily: 'Cubic11' }]}>昵称</Text>
              <TextInput
                style={[s.input, { fontFamily: 'Cubic11' }]}
                placeholder="给自己取个名字"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#bbb"
              />
            </View>
          )}
          <View style={s.field}>
            <Text style={[s.label, { fontFamily: 'Cubic11' }]}>邮箱</Text>
            <TextInput
              style={[s.input, { fontFamily: 'Cubic11' }]}
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#bbb"
            />
          </View>
          <View style={s.field}>
            <Text style={[s.label, { fontFamily: 'Cubic11' }]}>密码</Text>
            <TextInput
              style={[s.input, { fontFamily: 'Cubic11' }]}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#bbb"
            />
          </View>

          <TouchableOpacity onPress={handleSubmit} style={[s.primaryBtn, { backgroundColor: theme.primary }]}>
            <Text style={[s.primaryBtnText, { fontFamily: 'Cubic11' }]}>
              {tab === 'login' ? '▶ 登录' : '▶ 注册并开始'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[s.terms, { fontFamily: 'Cubic11' }]}>
        登录即表示同意《用户协议》和《隐私政策》
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
  input: {
    borderWidth: 3, borderColor: '#3d3d3d',
    backgroundColor: '#fffef5',
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: '#3d3d3d',
  },
  primaryBtn: {
    borderWidth: 3, borderColor: '#3d3d3d',
    paddingVertical: 14, alignItems: 'center',
    shadowColor: '#3d3d3d', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 5,
    marginTop: 4,
  },
  primaryBtnText: { fontSize: 14, color: '#fff', fontWeight: '700' },
  terms: { fontSize: 11, color: '#bbb', marginTop: 20, textAlign: 'center', paddingHorizontal: 32 },
})
