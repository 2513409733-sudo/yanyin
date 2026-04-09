import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useStore } from '../store/useStore'

// ── Pixel progress bar with +/- buttons ─────────────────
function GoalCard({ goal, isMe, onProgressChange, onComplete, onDelete, color }) {
  const [expanded, setExpanded] = useState(false)
  const pct = goal.steps > 0 ? Math.round((goal.progress / goal.steps) * 100) : 0
  const isDone = goal.completed

  const step = (delta) => {
    const next = Math.max(0, Math.min(goal.steps, goal.progress + delta))
    onProgressChange(next)
  }

  return (
    <View style={[gc.card, isDone && { opacity: 0.6 }]}>
      {/* Title row */}
      <View style={gc.titleRow}>
        <View style={[gc.dot, { backgroundColor: color }]} />
        <Text style={[gc.title, { fontFamily: 'Cubic11' }]} numberOfLines={1}>{goal.title}</Text>
        {goal.detail && (
          <TouchableOpacity onPress={() => setExpanded(v => !v)} style={{ opacity: 0.5 }}>
            <Text style={{ fontSize: 12 }}>{expanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        )}
        {isMe && !isDone && (
          <TouchableOpacity onPress={onDelete} style={{ opacity: 0.3 }}>
            <Text style={{ fontSize: 14, color: '#e57373' }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {expanded && goal.detail && (
        <Text style={[gc.detail, { fontFamily: 'Cubic11' }]}>{goal.detail}</Text>
      )}

      {/* Progress */}
      <View style={gc.progressArea}>
        {!isDone ? (
          <>
            {/* Bar */}
            <View style={gc.barBg}>
              <View style={[gc.barFill, { width: `${pct}%`, backgroundColor: color }]} />
            </View>
            <View style={gc.progressRow}>
              <Text style={[gc.progressText, { fontFamily: 'Cubic11' }]}>
                {goal.progress}/{goal.steps} 步
              </Text>
              <Text style={[gc.progressText, { fontFamily: 'Cubic11', color: pct === 100 ? '#00b894' : '#aaa' }]}>
                {pct}%
              </Text>
            </View>
            {/* Step buttons (only for my goals) */}
            {isMe && (
              <View style={gc.stepBtns}>
                <TouchableOpacity onPress={() => step(-1)} style={gc.stepBtn} disabled={goal.progress <= 0}>
                  <Text style={[{ fontFamily: 'Cubic11', fontSize: 13, color: goal.progress <= 0 ? '#ccc' : '#3d3d3d' }]}>−</Text>
                </TouchableOpacity>
                <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: '#aaa', flex: 1, textAlign: 'center' }]}>
                  调整进度
                </Text>
                <TouchableOpacity onPress={() => step(1)} style={gc.stepBtn} disabled={goal.progress >= goal.steps}>
                  <Text style={[{ fontFamily: 'Cubic11', fontSize: 13, color: goal.progress >= goal.steps ? '#ccc' : '#3d3d3d' }]}>＋</Text>
                </TouchableOpacity>
              </View>
            )}
            {isMe && pct === 100 && (
              <TouchableOpacity onPress={onComplete} style={[gc.completeBtn, { backgroundColor: color }]}>
                <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, color: '#fff', fontWeight: '700' }]}>✓ 确认完成！</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <View style={[{ flex: 1, height: 8, backgroundColor: color, borderWidth: 2, borderColor: '#3d3d3d' }]} />
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color }]}>已完成 ✓</Text>
          </View>
        )}
        {isDone && goal.completedAt && (
          <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: '#ccc', marginTop: 2 }]}>完成于 {goal.completedAt}</Text>
        )}
      </View>
    </View>
  )
}

// ── Add goal sheet ────────────────────────────────────────
function AddGoalSheet({ onClose, onSave, theme }) {
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [steps, setSteps] = useState(5)

  const handleSave = () => {
    if (!title.trim()) return
    const n = Math.max(1, Math.min(100, steps))
    onSave({ title: title.trim(), detail: detail.trim(), steps: n })
    onClose()
  }

  return (
    <Modal animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={gs.overlay}>
        <View style={[gs.sheet, { backgroundColor: theme.bg }]}>
          <View style={gs.sheetHeader}>
            <Text style={[gs.sheetTitle, { fontFamily: 'Cubic11' }]}>新建目标</Text>
            <TouchableOpacity onPress={onClose} style={gs.closeBtn}>
              <Text style={{ fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={[gs.input, { fontFamily: 'Cubic11' }]}
            placeholder="目标名称"
            placeholderTextColor="#bbb"
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
          <TextInput
            style={[gs.input, { fontFamily: 'Cubic11', marginTop: 8, minHeight: 60 }]}
            placeholder="目标细节（可选）"
            placeholderTextColor="#bbb"
            value={detail}
            onChangeText={setDetail}
            multiline
          />
          <View style={{ marginTop: 12, marginBottom: 4 }}>
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 11, color: '#aaa', marginBottom: 8 }]}>
              完成步骤数（1-50），当前：{steps}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity onPress={() => setSteps(v => Math.max(1, v - 1))} style={gs.stepAdjBtn}>
                <Text style={{ fontFamily: 'Cubic11', fontSize: 16 }}>−</Text>
              </TouchableOpacity>
              <View style={[{ flex: 1, height: 8, backgroundColor: '#e8dfa8', borderWidth: 2, borderColor: '#3d3d3d' }]}>
                <View style={[{ height: '100%', backgroundColor: theme.primary, width: `${(steps / 50) * 100}%` }]} />
              </View>
              <TouchableOpacity onPress={() => setSteps(v => Math.min(50, v + 1))} style={gs.stepAdjBtn}>
                <Text style={{ fontFamily: 'Cubic11', fontSize: 16 }}>＋</Text>
              </TouchableOpacity>
              <View style={[gs.stepBadge, { backgroundColor: theme.primary + '22', borderColor: theme.primary }]}>
                <Text style={[{ fontFamily: 'Cubic11', fontSize: 13, fontWeight: '700', color: theme.primary }]}>{steps}</Text>
              </View>
            </View>
          </View>
          <View style={gs.rowBtns}>
            <TouchableOpacity onPress={onClose} style={[gs.outlineBtn, { flex: 1 }]}>
              <Text style={{ fontFamily: 'Cubic11', fontSize: 13 }}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[gs.primaryBtn, { flex: 1, backgroundColor: theme.primary }]}>
              <Text style={{ fontFamily: 'Cubic11', fontSize: 13, color: '#fff', fontWeight: '700' }}>创建</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ── Main Goals page ───────────────────────────────────────
export default function Goals() {
  const router = useRouter()
  const { user, partner, goals, addGoal, setGoalProgress, completeGoal, deleteGoal } = useStore()
  const theme = useStore(s => s.theme)
  const [showAdd, setShowAdd] = useState(false)

  const myGoals = goals.filter(g => g.from === 'A' && !g.completed)
  const partnerGoals = goals.filter(g => g.from === 'B' && !g.completed)
  const myDone = goals.filter(g => g.from === 'A' && g.completed)
  const partnerDone = goals.filter(g => g.from === 'B' && g.completed)

  const EmptyGoal = () => (
    <View style={gc.emptyBox}>
      <Text style={{ fontSize: 22, opacity: 0.2 }}>🎯</Text>
      <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: '#ccc' }]}>暂无目标</Text>
    </View>
  )

  return (
    <View style={[gc.page, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[gc.header, { backgroundColor: theme.bgHeader }]}>
        <TouchableOpacity onPress={() => router.back()} style={gc.backBtn}>
          <Text style={{ fontFamily: 'Cubic11', fontSize: 14 }}>‹ 返回</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[gc.headerTitle, { fontFamily: 'Cubic11' }]}>我们的目标</Text>
          <Text style={[gc.headerSub, { fontFamily: 'Cubic11' }]}>{myGoals.length + partnerGoals.length} 个进行中</Text>
        </View>
        <TouchableOpacity onPress={() => setShowAdd(true)} style={[gc.addBtn, { backgroundColor: theme.primary }]}>
          <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, color: '#fff', fontWeight: '700' }]}>＋ 新目标</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Column headers */}
        <View style={gc.colHeaders}>
          <View style={gc.colHeaderItem}>
            <View style={[gc.colDot, { backgroundColor: theme.primary }]} />
            <Text style={[gc.colLabel, { fontFamily: 'Cubic11', color: theme.primary }]}>{user.name} 的目标</Text>
          </View>
          <View style={[gc.divider]} />
          <View style={gc.colHeaderItem}>
            <View style={[gc.colDot, { backgroundColor: theme.secondary }]} />
            <Text style={[gc.colLabel, { fontFamily: 'Cubic11', color: theme.secondary }]}>{partner.name} 的目标</Text>
          </View>
        </View>

        {/* Active goals dual column */}
        <View style={gc.dualCols}>
          <View style={{ flex: 1 }}>
            {myGoals.length === 0 ? <EmptyGoal /> : myGoals.map(g => (
              <GoalCard key={g.id} goal={g} isMe color={theme.primary}
                onProgressChange={v => setGoalProgress(g.id, v)}
                onComplete={() => completeGoal(g.id)}
                onDelete={() => deleteGoal(g.id)}
              />
            ))}
          </View>
          <View style={[gc.divider, { alignSelf: 'stretch' }]} />
          <View style={{ flex: 1 }}>
            {partnerGoals.length === 0 ? <EmptyGoal /> : partnerGoals.map(g => (
              <GoalCard key={g.id} goal={g} isMe={false} color={theme.secondary}
                onProgressChange={() => {}} onComplete={() => {}} onDelete={() => {}}
              />
            ))}
          </View>
        </View>

        {/* Completed goals */}
        {(myDone.length > 0 || partnerDone.length > 0) && (
          <View style={{ marginHorizontal: 16, marginTop: 8 }}>
            <View style={gc.doneDivider}>
              <View style={{ flex: 1, height: 2, backgroundColor: '#e8dfa8' }} />
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: '#bbb', marginHorizontal: 8 }]}>已完成目标</Text>
              <View style={{ flex: 1, height: 2, backgroundColor: '#e8dfa8' }} />
            </View>
            <View style={gc.dualCols}>
              <View style={{ flex: 1 }}>
                {myDone.map(g => (
                  <GoalCard key={g.id} goal={g} isMe color={theme.primary}
                    onProgressChange={() => {}} onComplete={() => {}} onDelete={() => deleteGoal(g.id)}
                  />
                ))}
              </View>
              <View style={[gc.divider, { alignSelf: 'stretch' }]} />
              <View style={{ flex: 1 }}>
                {partnerDone.map(g => (
                  <GoalCard key={g.id} goal={g} isMe={false} color={theme.secondary}
                    onProgressChange={() => {}} onComplete={() => {}} onDelete={() => {}}
                  />
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {showAdd && <AddGoalSheet onClose={() => setShowAdd(false)} onSave={addGoal} theme={theme} />}
    </View>
  )
}

// ── Goal card styles ──────────────────────────────────────
const gc = StyleSheet.create({
  page: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16,
    borderBottomWidth: 3, borderBottomColor: '#3d3d3d',
  },
  backBtn: { borderWidth: 2, borderColor: '#3d3d3d', paddingHorizontal: 8, paddingVertical: 4 },
  headerTitle: { fontSize: 13, fontWeight: '700', color: '#3d3d3d' },
  headerSub: { fontSize: 10, color: '#aaa', marginTop: 1 },
  addBtn: { borderWidth: 2, borderColor: '#3d3d3d', paddingHorizontal: 10, paddingVertical: 6, shadowColor: '#3d3d3d', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0 },
  colHeaders: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  colHeaderItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  colDot: { width: 8, height: 8, borderWidth: 1, borderColor: '#3d3d3d' },
  colLabel: { fontSize: 9 },
  dualCols: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, paddingBottom: 8 },
  divider: { width: 2, backgroundColor: '#e8dfa8' },
  doneDivider: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },

  card: {
    backgroundColor: '#fffef5', borderWidth: 2, borderColor: '#3d3d3d',
    shadowColor: '#3d3d3d', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0,
    marginBottom: 8, padding: 8,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  dot: { width: 6, height: 6, flexShrink: 0 },
  title: { flex: 1, fontSize: 11, fontWeight: '700', color: '#374151' },
  detail: { fontSize: 10, color: '#aaa', marginBottom: 4 },
  progressArea: { gap: 4 },
  barBg: { height: 8, backgroundColor: '#e8dfa8', borderWidth: 2, borderColor: '#3d3d3d' },
  barFill: { height: '100%' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { fontSize: 9 },
  stepBtns: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  stepBtn: { borderWidth: 2, borderColor: '#3d3d3d', width: 26, height: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fffef5' },
  completeBtn: { borderWidth: 2, borderColor: '#3d3d3d', paddingVertical: 6, alignItems: 'center', marginTop: 4, shadowColor: '#3d3d3d', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0 },
  emptyBox: { borderWidth: 2, borderColor: '#ddd', borderStyle: 'dashed', backgroundColor: '#f9f7f0', alignItems: 'center', paddingVertical: 24, gap: 4, marginBottom: 8 },
})

// ── Sheet styles ──────────────────────────────────────────
const gs = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopWidth: 4, borderTopColor: '#3d3d3d', padding: 20 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sheetTitle: { fontSize: 12, color: '#3d3d3d', fontWeight: '700' },
  closeBtn: { borderWidth: 2, borderColor: '#3d3d3d', padding: 6 },
  input: {
    borderWidth: 3, borderColor: '#3d3d3d', backgroundColor: '#fffef5',
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#3d3d3d',
  },
  stepAdjBtn: { borderWidth: 2, borderColor: '#3d3d3d', width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fffef5' },
  stepBadge: { borderWidth: 2, paddingHorizontal: 10, paddingVertical: 4, alignItems: 'center' },
  rowBtns: { flexDirection: 'row', gap: 12, marginTop: 16 },
  outlineBtn: { borderWidth: 3, borderColor: '#3d3d3d', paddingVertical: 12, alignItems: 'center', shadowColor: '#3d3d3d', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0 },
  primaryBtn: { borderWidth: 3, borderColor: '#3d3d3d', paddingVertical: 12, alignItems: 'center', shadowColor: '#3d3d3d', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0 },
})
