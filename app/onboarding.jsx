import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useStore } from '../store/useStore'

const SKIN_OPTIONS  = ['s1','s2','s3','s4']
const HAIR_OPTIONS  = ['h1','h2','h3','h4']
const HAIR_COLORS   = ['hc1','hc2','hc3','hc4','hc5','hc6']
const EYE_OPTIONS   = ['e1','e2','e3']
const OUTFIT_OPTIONS = ['o1','o2','o3']
const OUTFIT_COLORS  = ['oc1','oc2','oc3','oc4','oc5','oc6']
const ACC_OPTIONS   = ['a0','a1','a2','a3']

const SKIN_MAP  = { s1:'#FDDCB5', s2:'#F5C5A3', s3:'#D4956A', s4:'#8B5E3C' }
const HAIR_MAP  = { hc1:'#3d3d3d', hc2:'#8B4513', hc3:'#FFD700', hc4:'#FF69B4', hc5:'#9B7EC8', hc6:'#4A90D9' }
const OUTFIT_MAP = { oc1:'#FD85AB', oc2:'#92C6D9', oc3:'#7DA87B', oc4:'#D4956A', oc5:'#9B7EC8', oc6:'#E8704A' }

// Simple pixel avatar preview
function AvatarPreview({ avatar, size = 120 }) {
  const skinColor = SKIN_MAP[avatar.skin] || '#F5C5A3'
  const hairColor = HAIR_MAP[avatar.hairColor] || '#8B4513'
  const outfitColor = OUTFIT_MAP[avatar.outfitColor] || '#FD85AB'
  const u = size / 10
  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {/* Body */}
      <View style={{ position:'absolute', left:2*u, top:5*u, width:6*u, height:4*u, backgroundColor: outfitColor, borderWidth:1, borderColor:'#3d3d3d' }} />
      {/* Head */}
      <View style={{ position:'absolute', left:2.5*u, top:1.5*u, width:5*u, height:4*u, backgroundColor: skinColor, borderWidth:1, borderColor:'#3d3d3d' }} />
      {/* Hair */}
      <View style={{ position:'absolute', left:2*u, top:u, width:6*u, height:2*u, backgroundColor: hairColor, borderWidth:1, borderColor:'#3d3d3d' }} />
      {/* Eyes */}
      <View style={{ position:'absolute', left:3.5*u, top:3*u, width:u, height:u, backgroundColor:'#3d3d3d' }} />
      <View style={{ position:'absolute', left:5.5*u, top:3*u, width:u, height:u, backgroundColor:'#3d3d3d' }} />
    </View>
  )
}

function Row({ label, options, value, onChange, renderItem }) {
  return (
    <View style={ob.section}>
      <Text style={ob.sectionLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={ob.optRow}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt}
              onPress={() => onChange(opt)}
              style={[ob.optBtn, value === opt && ob.optBtnActive]}
            >
              {renderItem ? renderItem(opt) : <Text style={ob.optText}>{opt}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

export default function Onboarding() {
  const router = useRouter()
  const setAvatar = useStore(s => s.setAvatar)
  const setHasSetAvatar = useStore(s => s.setHasSetAvatar)
  const theme = useStore(s => s.theme)

  const [avatar, setAvatarLocal] = useState({
    skin: 's2', hair: 'h1', hairColor: 'hc2',
    eyes: 'e1', outfit: 'o1', outfitColor: 'oc6', accessory: 'a0',
  })

  const update = (key) => (val) => setAvatarLocal(a => ({ ...a, [key]: val }))

  const done = () => {
    setAvatar(avatar)
    setHasSetAvatar()
    router.replace('/(tabs)')
  }

  const skinColor = SKIN_MAP[avatar.skin] || '#F5C5A3'
  const hairColor = HAIR_MAP[avatar.hairColor] || '#8B4513'
  const outfitColor = OUTFIT_MAP[avatar.outfitColor] || '#FD85AB'

  return (
    <View style={[ob.page, { backgroundColor: theme.bg }]}>
      <View style={[ob.header, { backgroundColor: theme.bgHeader }]}>
        <Text style={[ob.title, { fontFamily: 'Cubic11' }]}>创建你的像素形象</Text>
        <Text style={[ob.sub, { fontFamily: 'Cubic11' }]}>欢迎来到盐音 ✨</Text>
      </View>

      {/* Avatar preview */}
      <View style={ob.previewArea}>
        <AvatarPreview avatar={avatar} size={120} />
      </View>

      <ScrollView style={ob.scroll} contentContainerStyle={ob.scrollContent}>
        <Row label="肤色" options={SKIN_OPTIONS} value={avatar.skin} onChange={update('skin')}
          renderItem={(opt) => <View style={[ob.colorSwatch, { backgroundColor: SKIN_MAP[opt] }]} />}
        />
        <Row label="发色" options={HAIR_COLORS} value={avatar.hairColor} onChange={update('hairColor')}
          renderItem={(opt) => <View style={[ob.colorSwatch, { backgroundColor: HAIR_MAP[opt] }]} />}
        />
        <Row label="服装色" options={OUTFIT_COLORS} value={avatar.outfitColor} onChange={update('outfitColor')}
          renderItem={(opt) => <View style={[ob.colorSwatch, { backgroundColor: OUTFIT_MAP[opt] }]} />}
        />
      </ScrollView>

      <TouchableOpacity onPress={done} style={[ob.doneBtn, { backgroundColor: theme.primary }]}>
        <Text style={[ob.doneBtnText, { fontFamily: 'Cubic11' }]}>完成 ▶</Text>
      </TouchableOpacity>
    </View>
  )
}

const ob = StyleSheet.create({
  page: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, borderBottomWidth: 3, borderBottomColor: '#3d3d3d' },
  title: { fontSize: 18, color: '#3d3d3d', fontWeight: '700' },
  sub: { fontSize: 13, color: '#888', marginTop: 4 },
  previewArea: { alignItems: 'center', paddingVertical: 24, borderBottomWidth: 2, borderBottomColor: '#e8dfa8' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 20 },
  section: { gap: 8 },
  sectionLabel: { fontFamily: 'Cubic11', fontSize: 12, color: '#888' },
  optRow: { flexDirection: 'row', gap: 10 },
  optBtn: {
    width: 48, height: 48,
    borderWidth: 3, borderColor: '#3d3d3d',
    backgroundColor: '#fffef5',
    alignItems: 'center', justifyContent: 'center',
  },
  optBtnActive: {
    shadowColor: '#3d3d3d', shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  optText: { fontFamily: 'Cubic11', fontSize: 11, color: '#3d3d3d' },
  colorSwatch: { width: 28, height: 28, borderWidth: 2, borderColor: '#3d3d3d' },
  doneBtn: {
    margin: 20, paddingVertical: 16, alignItems: 'center',
    borderWidth: 3, borderColor: '#3d3d3d',
    shadowColor: '#3d3d3d', shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 5,
  },
  doneBtnText: { fontSize: 16, color: '#fff', fontWeight: '700' },
})
