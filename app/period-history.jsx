import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet, Alert } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useStore } from '../store/useStore'
import { logsFor, calcAvgCycle, logDuration } from '../store/periodUtils'

export default function PeriodHistory() {
  const router = useRouter()
  const { from } = useLocalSearchParams()
  const { user, partner, periodLogs, deletePeriodLog, updatePeriodLog } = useStore()
  const theme = useStore(s => s.theme)

  const isA = from === 'A'
  const personName = isA ? user.name : partner.name
  const color = isA ? theme.primary : theme.secondary
  const logs = logsFor(periodLogs, from)
  const sorted = [...logs].reverse()

  const avgCycle = calcAvgCycle(logs)
  const totalCount = logs.length
  const avgDuration = (() => {
    const completed = logs.filter(l => l.endDate)
    if (!completed.length) return null
    const total = completed.reduce((sum, l) => {
      const days = Math.floor(
        (new Date(l.endDate + 'T00:00:00') - new Date(l.startDate + 'T00:00:00')) / 86400000
      ) + 1
      return sum + days
    }, 0)
    return Math.round(total / completed.length)
  })()

  const [editingLog, setEditingLog] = useState(null)
  const [editStart, setEditStart] = useState('')
  const [editEnd, setEditEnd] = useState('')

  const handleEdit = (log) => {
    setEditingLog(log)
    setEditStart(log.startDate)
    setEditEnd(log.endDate || '')
  }

  const handleSave = () => {
    if (!editStart) return
    updatePeriodLog(editingLog.id, {
      startDate: editStart,
      endDate: editEnd.trim() || null,
    })
    setEditingLog(null)
  }

  const handleDelete = (id) => {
    Alert.alert('删除记录', '确定删除这条经期记录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: () => deletePeriodLog(id) },
    ])
  }

  return (
    <View style={[ph.page, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[ph.header, { backgroundColor: theme.bgHeader }]}>
        <TouchableOpacity onPress={() => router.back()} style={ph.backBtn}>
          <Text style={{ fontFamily: 'Cubic11', fontSize: 14 }}>‹ 返回</Text>
        </TouchableOpacity>
        <Text style={[ph.headerTitle, { fontFamily: 'Cubic11', flex: 1 }]}>{personName} · 历史经期</Text>
      </View>

      {/* Stats row */}
      <View style={[ph.statsBar, { backgroundColor: theme.bgHeader, borderBottomColor: '#3d3d3d' }]}>
        <View style={ph.statItem}>
          <Text style={[ph.statNum, { fontFamily: 'Cubic11', color }]}>{totalCount}</Text>
          <Text style={[ph.statLabel, { fontFamily: 'Cubic11' }]}>记录次数</Text>
        </View>
        <View style={ph.statDivider} />
        <View style={ph.statItem}>
          <Text style={[ph.statNum, { fontFamily: 'Cubic11', color }]}>{avgCycle != null ? `${avgCycle} 天` : '--'}</Text>
          <Text style={[ph.statLabel, { fontFamily: 'Cubic11' }]}>平均周期</Text>
        </View>
        <View style={ph.statDivider} />
        <View style={ph.statItem}>
          <Text style={[ph.statNum, { fontFamily: 'Cubic11', color }]}>{avgDuration != null ? `${avgDuration} 天` : '--'}</Text>
          <Text style={[ph.statLabel, { fontFamily: 'Cubic11' }]}>平均经期</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={ph.body}>
        {sorted.length === 0 ? (
          <View style={ph.empty}>
            <Text style={{ fontSize: 36, opacity: 0.15 }}>🌸</Text>
            <Text style={{ fontFamily: 'Cubic11', fontSize: 12, color: '#bbb', marginTop: 12 }}>暂无记录</Text>
          </View>
        ) : (
          <View style={ph.list}>
            {sorted.map((log, i) => (
              <View
                key={log.id}
                style={[
                  ph.row,
                  i < sorted.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#e8dfa8' },
                ]}
              >
                {/* Index label */}
                <View style={[ph.indexBox, { borderColor: color + '66' }]}>
                  <Text style={{ fontFamily: 'Cubic11', fontSize: 9, color: color }}>
                    #{sorted.length - i}
                  </Text>
                </View>

                {/* Info */}
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={{ fontFamily: 'Cubic11', fontSize: 12, color: '#3d3d3d' }}>
                    {log.startDate}
                    {log.endDate ? ` — ${log.endDate}` : ' — 进行中'}
                  </Text>
                  <Text style={{ fontFamily: 'Cubic11', fontSize: 10, color: '#aaa' }}>
                    {logDuration(log)}
                  </Text>
                </View>

                {/* Actions */}
                <TouchableOpacity onPress={() => handleEdit(log)} style={ph.actionBtn}>
                  <Text style={{ fontSize: 14, color }}>✎</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(log.id)} style={ph.actionBtn}>
                  <Text style={{ fontSize: 14, color: '#e57373', opacity: 0.6 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Edit modal */}
      {editingLog && (
        <Modal animationType="slide" transparent presentationStyle="overFullScreen">
          <View style={ph.overlay}>
            <View style={[ph.modalSheet, { backgroundColor: theme.bg }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontFamily: 'Cubic11', fontSize: 13, fontWeight: '700', color: '#3d3d3d', flex: 1 }}>
                  修改记录
                </Text>
                <TouchableOpacity onPress={() => setEditingLog(null)} style={ph.closeBtn}>
                  <Text style={{ fontSize: 16 }}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontFamily: 'Cubic11', fontSize: 10, color: '#aaa', marginBottom: 6 }}>开始日期</Text>
              <TextInput
                value={editStart}
                onChangeText={setEditStart}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#ccc"
                style={[ph.dateInput, { fontFamily: 'Cubic11' }]}
              />

              <Text style={{ fontFamily: 'Cubic11', fontSize: 10, color: '#aaa', marginBottom: 6, marginTop: 14 }}>
                结束日期（留空表示进行中）
              </Text>
              <TextInput
                value={editEnd}
                onChangeText={setEditEnd}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#ccc"
                style={[ph.dateInput, { fontFamily: 'Cubic11' }]}
              />

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                <TouchableOpacity onPress={() => setEditingLog(null)} style={[ph.outlineBtn, { flex: 1 }]}>
                  <Text style={{ fontFamily: 'Cubic11', fontSize: 13 }}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  style={[ph.primaryBtn, { flex: 1, backgroundColor: color, borderColor: '#3d3d3d' }]}
                >
                  <Text style={{ fontFamily: 'Cubic11', fontSize: 13, color: '#fff', fontWeight: '700' }}>保存</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  )
}

const ph = StyleSheet.create({
  page: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16,
    borderBottomWidth: 3, borderBottomColor: '#3d3d3d',
  },
  backBtn: { borderWidth: 2, borderColor: '#3d3d3d', paddingHorizontal: 8, paddingVertical: 4 },
  headerTitle: { fontSize: 13, fontWeight: '700', color: '#3d3d3d' },

  statsBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 3,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 9, color: '#aaa' },
  statDivider: { width: 1, height: 32, backgroundColor: '#e8dfa8' },

  body: { padding: 16, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingVertical: 80 },

  list: { borderWidth: 3, borderColor: '#3d3d3d', backgroundColor: '#fffef5' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 12, paddingVertical: 12,
  },
  indexBox: {
    borderWidth: 1, paddingHorizontal: 5, paddingVertical: 2,
    alignItems: 'center', minWidth: 28,
  },
  actionBtn: { padding: 6 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopWidth: 4, borderTopColor: '#3d3d3d', padding: 20 },
  closeBtn: { borderWidth: 2, borderColor: '#3d3d3d', padding: 6 },
  dateInput: {
    borderWidth: 2, borderColor: '#3d3d3d', paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 13, color: '#3d3d3d', backgroundColor: '#fffef5',
  },
  outlineBtn: {
    borderWidth: 3, borderColor: '#3d3d3d', paddingVertical: 12, alignItems: 'center',
    shadowColor: '#3d3d3d', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0,
  },
  primaryBtn: {
    borderWidth: 3, paddingVertical: 12, alignItems: 'center',
    shadowColor: '#3d3d3d', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0,
  },
})
