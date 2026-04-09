import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useStore } from '../../store/useStore'

const ENTRIES = [
  { title: '三餐打卡',   sub: '记录每一餐，感受彼此的日常',     to: '/checkin', emoji: '🍱', key: 'primary'   },
  { title: '我们的计划', sub: '记录共同计划与待办，一起完成',   to: '/plans',   emoji: '📋', key: 'secondary' },
  { title: '我们的目标', sub: '设定目标，追踪彼此的成长进度',   to: '/goals',   emoji: '🎯', key: 'accent'    },
  { title: '经期记录',   sub: '追踪周期，预测下次经期',         to: '/period',  emoji: '🌸', color: '#FD85AB'  },
  { title: '共同记账',   sub: '记录收支，查看统计与汇率换算',   to: '/ledger',  emoji: '📒', color: '#74B9FF'  },
]

export default function Record() {
  const router = useRouter()
  const theme = useStore(s => s.theme)

  return (
    <View style={[rs.page, { backgroundColor: theme.bg }]}>
      <View style={[rs.header, { backgroundColor: theme.bgHeader }]}>
        <Text style={[rs.title, { fontFamily: 'Cubic11' }]}>记录</Text>
        <Text style={[rs.sub, { fontFamily: 'Cubic11' }]}>打卡 · 计划 · 目标 · 记账</Text>
      </View>
      <ScrollView contentContainerStyle={rs.list}>
        {ENTRIES.map(({ title, sub, to, emoji, key, color }) => {
          const c = color || theme[key] || theme.primary
          return (
            <TouchableOpacity key={to} onPress={() => router.push(to)} style={rs.card}>
              <View style={[rs.iconBox, { backgroundColor: c + '22', borderColor: c, shadowColor: c }]}>
                <Text style={{ fontSize: 26 }}>{emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[rs.cardTitle, { fontFamily: 'Cubic11' }]}>{title}</Text>
                <Text style={[rs.cardSub, { fontFamily: 'Cubic11' }]}>{sub}</Text>
              </View>
              <Text style={{ fontSize: 16, color: '#aaa' }}>›</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

const rs = StyleSheet.create({
  page: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 16, borderBottomWidth: 3, borderBottomColor: '#3d3d3d' },
  title: { fontSize: 18, color: '#3d3d3d', fontWeight: '700' },
  sub: { fontSize: 12, color: '#aaa', marginTop: 4 },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20,
    borderWidth: 3, borderColor: '#3d3d3d', backgroundColor: '#fffef5',
    shadowColor: '#3d3d3d', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5,
  },
  iconBox: {
    width: 56, height: 56, borderWidth: 3, alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, flexShrink: 0,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#374151' },
  cardSub: { fontSize: 11, color: '#aaa', marginTop: 3 },
})
