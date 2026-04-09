import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useStore } from '../store/useStore'
import {
  logsFor, calcAvgCycle, predictNextPeriod,
  isCurrentlyInPeriod, currentPeriodDay, daysUntilNext,
  getPeriodDaysInMonth, getPredictedDaysInMonth, logDuration,
} from '../store/periodUtils'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

const toDateStr = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

// ── Status badge ──────────────────────────────────────────
function StatusBadge({ logs, color }) {
  const avgCycle = calcAvgCycle(logs)
  const nextDate = predictNextPeriod(logs, avgCycle)
  const inPeriod = isCurrentlyInPeriod(logs)
  const day = currentPeriodDay(logs)
  const daysLeft = daysUntilNext(nextDate)

  if (inPeriod) {
    return (
      <View style={[pd.badge, { backgroundColor: color + '22', borderColor: color }]}>
        <Text style={[pd.badgeText, { fontFamily: 'Cubic11', color }]}>经期中 第 {day} 天</Text>
      </View>
    )
  }
  if (daysLeft !== null) {
    return (
      <View style={[pd.badge, { backgroundColor: '#74b9ff22', borderColor: '#74b9ff' }]}>
        <Text style={[pd.badgeText, { fontFamily: 'Cubic11', color: '#0984e3' }]}>距下次约 {daysLeft} 天</Text>
      </View>
    )
  }
  return (
    <View style={[pd.badge, { backgroundColor: '#e8dfa8', borderColor: '#b2bec3' }]}>
      <Text style={[pd.badgeText, { fontFamily: 'Cubic11', color: '#aaa' }]}>周期未知</Text>
    </View>
  )
}

// ── Selectable calendar ───────────────────────────────────
function SelectableCalendar({ year, month, periodDays, predictedDays, color, pickStart, pickEnd, onDayPress }) {
  const today = new Date().toISOString().slice(0, 10)
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isInPickRange = (ds) => {
    if (!pickStart || !pickEnd) return false
    return ds > pickStart && ds < pickEnd
  }

  return (
    <View style={pd.calendar}>
      {/* Weekday header */}
      <View style={pd.calRow}>
        {WEEKDAYS.map(w => (
          <View key={w} style={pd.calCell}>
            <Text style={[pd.calWeekday, { fontFamily: 'Cubic11' }]}>{w}</Text>
          </View>
        ))}
      </View>

      {/* Day rows */}
      {Array.from({ length: Math.ceil(cells.length / 7) }, (_, row) => (
        <View key={row} style={pd.calRow}>
          {cells.slice(row * 7, row * 7 + 7).map((d, i) => {
            if (!d) return <View key={i} style={pd.calCell} />
            const ds = toDateStr(year, month, d)
            const isPeriod = periodDays.has(ds)
            const isPredicted = !isPeriod && predictedDays.has(ds)
            const isPickStart = ds === pickStart
            const isPickEnd = ds === pickEnd
            const inRange = isInPickRange(ds)
            const isToday = ds === today
            const isSelected = isPickStart || isPickEnd

            return (
              <TouchableOpacity
                key={i}
                style={[
                  pd.calCell,
                  isPeriod && !isSelected && { backgroundColor: color + '88' },
                  isPredicted && !isSelected && { backgroundColor: color + '30' },
                  inRange && { backgroundColor: color + '40' },
                  isSelected && { backgroundColor: color, borderWidth: 2, borderColor: '#3d3d3d' },
                  isToday && !isSelected && !isPeriod && { borderWidth: 2, borderColor: color },
                ]}
                onPress={() => onDayPress(ds)}
                activeOpacity={0.7}
              >
                <Text style={[
                  pd.calDay,
                  { fontFamily: 'Cubic11' },
                  isPeriod && !isSelected && { color: '#fff', fontWeight: '700' },
                  isPredicted && !isSelected && { color: color },
                  isToday && !isSelected && !isPeriod && { color },
                  isSelected && { color: '#fff', fontWeight: '700' },
                  inRange && { color: color },
                ]}>
                  {d}
                </Text>
              </TouchableOpacity>
            )
          })}
          {cells.slice(row * 7, row * 7 + 7).length < 7 &&
            Array.from({ length: 7 - cells.slice(row * 7, row * 7 + 7).length }, (_, k) => (
              <View key={`pad${k}`} style={pd.calCell} />
            ))
          }
        </View>
      ))}
    </View>
  )
}

// ── History list ──────────────────────────────────────────
function HistoryList({ logs, color, onDelete, onEdit }) {
  const [expanded, setExpanded] = useState(false)
  const sorted = [...logs].reverse()
  const visible = expanded ? sorted : sorted.slice(0, 3)
  const hasMore = sorted.length > 3

  if (!sorted.length) {
    return (
      <View style={pd.emptyHistory}>
        <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: '#ccc' }]}>暂无记录</Text>
      </View>
    )
  }

  return (
    <View>
      <View style={pd.historyList}>
        {visible.map((log, i) => (
          <View key={log.id} style={[pd.historyRow, i < visible.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#e8dfa8' }]}>
            <View style={[pd.historyDot, { backgroundColor: color }]} />
            <View style={{ flex: 1 }}>
              <Text style={[pd.historyDate, { fontFamily: 'Cubic11' }]}>
                {log.startDate}{log.endDate ? ` — ${log.endDate}` : ' — 进行中'}
              </Text>
              <Text style={[pd.historyDur, { fontFamily: 'Cubic11' }]}>{logDuration(log)}</Text>
            </View>
            {/* Edit button */}
            <TouchableOpacity onPress={() => onEdit(log)} style={pd.historyAction}>
              <Text style={{ fontSize: 11, color: color }}>✎</Text>
            </TouchableOpacity>
            {/* Delete button */}
            <TouchableOpacity onPress={() => onDelete(log.id)} style={pd.historyAction}>
              <Text style={{ fontSize: 11, color: '#e57373', opacity: 0.5 }}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {hasMore && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)} style={pd.expandBtn}>
          <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: '#aaa' }]}>
            {expanded ? '▲ 收起' : `▼ 查看更多 (${sorted.length - 3} 条)`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

// ── Period panel (one user) ───────────────────────────────
function PeriodPanel({ title, color, logs, from, onDelete, addPeriodLog, updatePeriodLog, theme }) {
  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1)
  const [pickStart, setPickStart] = useState(null)
  const [pickEnd, setPickEnd] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const avgCycle = calcAvgCycle(logs)
  const nextDate = predictNextPeriod(logs, avgCycle)
  const inPeriod = isCurrentlyInPeriod(logs)
  const periodDays = getPeriodDaysInMonth(logs, calYear, calMonth)
  const predictedDays = getPredictedDaysInMonth(nextDate, calYear, calMonth)

  const handleDayPress = (ds) => {
    if (!pickStart) {
      setPickStart(ds)
      setPickEnd(null)
    } else if (!pickEnd) {
      if (ds === pickStart) {
        // Deselect
        setPickStart(null)
      } else if (ds < pickStart) {
        // Swap: clicked earlier date becomes start
        setPickEnd(pickStart)
        setPickStart(ds)
      } else {
        setPickEnd(ds)
      }
    } else {
      // Reset selection
      setPickStart(ds)
      setPickEnd(null)
    }
  }

  const handleConfirm = () => {
    if (!pickStart) return
    const end = pickEnd || null
    if (editingId) {
      updatePeriodLog(editingId, { startDate: pickStart, endDate: end })
    } else {
      addPeriodLog(from, pickStart, end)
    }
    setPickStart(null)
    setPickEnd(null)
    setEditingId(null)
  }

  const handleCancel = () => {
    setPickStart(null)
    setPickEnd(null)
    setEditingId(null)
  }

  const handleEdit = (log) => {
    setEditingId(log.id)
    setPickStart(log.startDate)
    setPickEnd(log.endDate || null)
    // Navigate calendar to the log's month
    const [y, m] = log.startDate.split('-').map(Number)
    setCalYear(y)
    setCalMonth(m)
  }

  const stepMonth = (dir) => {
    let m = calMonth + dir
    let y = calYear
    if (m > 12) { m = 1; y++ }
    if (m < 1) { m = 12; y-- }
    setCalMonth(m)
    setCalYear(y)
  }

  const isSelecting = !!pickStart
  const hasRange = pickStart && pickEnd

  return (
    <View style={[pd.panel, { borderColor: '#3d3d3d', shadowColor: '#3d3d3d' }]}>
      {/* Panel header */}
      <View style={[pd.panelHeader, { backgroundColor: theme.bgHeader, borderBottomColor: '#e8dfa8' }]}>
        <View style={[pd.colorDot, { backgroundColor: color }]} />
        <Text style={[pd.panelName, { fontFamily: 'Cubic11' }]}>{title}</Text>
        {editingId ? (
          <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: color }]}>修改中</Text>
        ) : avgCycle ? (
          <Text style={[pd.cycleTag, { fontFamily: 'Cubic11', color: '#aaa' }]}>周期约 {avgCycle} 天</Text>
        ) : null}
      </View>

      <View style={pd.panelBody}>
        {/* Status badge */}
        <StatusBadge logs={logs} color={color} />

        {/* Calendar with month navigation */}
        <View style={pd.calendarWrap}>
          {/* Month nav */}
          <View style={pd.monthNav}>
            <TouchableOpacity onPress={() => stepMonth(-1)} style={pd.monthNavBtn}>
              <Text style={{ fontFamily: 'Cubic11', fontSize: 12 }}>‹</Text>
            </TouchableOpacity>
            <Text style={[pd.monthLabel, { fontFamily: 'Cubic11', color: '#555' }]}>
              {calYear} 年 {calMonth} 月
            </Text>
            <TouchableOpacity onPress={() => stepMonth(1)} style={pd.monthNavBtn}>
              <Text style={{ fontFamily: 'Cubic11', fontSize: 12 }}>›</Text>
            </TouchableOpacity>
          </View>

          <SelectableCalendar
            year={calYear} month={calMonth}
            periodDays={periodDays}
            predictedDays={predictedDays}
            color={color}
            pickStart={pickStart}
            pickEnd={pickEnd}
            onDayPress={handleDayPress}
          />

          {/* Legend */}
          <View style={pd.calLegend}>
            <View style={[pd.legendDot, { backgroundColor: color + '88' }]} />
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: '#888', marginRight: 8 }]}>经期</Text>
            <View style={[pd.legendDot, { backgroundColor: color + '30' }]} />
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: '#888', marginRight: 8 }]}>预测</Text>
            <View style={[pd.legendDot, { backgroundColor: color }]} />
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: '#888' }]}>已选</Text>
          </View>
        </View>

        {/* Selection hint & confirm */}
        {isSelecting && (
          <View style={[pd.selectionBar, { borderColor: color + '88', backgroundColor: color + '11' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: '#555' }]}>
                {editingId ? '修改日期' : '新增记录'}
              </Text>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: '#888', marginTop: 2 }]}>
                {pickStart}
                {pickEnd ? ` → ${pickEnd}` : ' → 点击结束日期'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TouchableOpacity onPress={handleCancel} style={pd.selCancelBtn}>
                <Text style={{ fontFamily: 'Cubic11', fontSize: 10, color: '#888' }}>取消</Text>
              </TouchableOpacity>
              {hasRange && (
                <TouchableOpacity onPress={handleConfirm} style={[pd.selConfirmBtn, { backgroundColor: color, borderColor: color }]}>
                  <Text style={{ fontFamily: 'Cubic11', fontSize: 10, color: '#fff', fontWeight: '700' }}>确认</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Quick action button (only when not selecting) */}
        {!isSelecting && (
          <TouchableOpacity
            onPress={() => {
              const today = new Date().toISOString().slice(0, 10)
              setPickStart(today)
              setPickEnd(null)
              setEditingId(null)
              setCalYear(new Date().getFullYear())
              setCalMonth(new Date().getMonth() + 1)
            }}
            style={[pd.actionBtn, { backgroundColor: color, borderColor: '#3d3d3d', shadowColor: '#3d3d3d' }]}
          >
            <Text style={[pd.actionBtnText, { fontFamily: 'Cubic11', color: '#fff' }]}>
              {inPeriod ? '+ 记录新周期' : '+ 开始记录'}
            </Text>
          </TouchableOpacity>
        )}

        {/* History */}
        <View style={pd.historySec}>
          <Text style={[pd.sectionTitle, { fontFamily: 'Cubic11' }]}>历史记录</Text>
          <HistoryList
            logs={logs}
            color={color}
            onDelete={onDelete}
            onEdit={handleEdit}
          />
        </View>
      </View>
    </View>
  )
}

// ── Gender settings modal ─────────────────────────────────
function GenderModal({ user, partner, onClose, setGender, theme }) {
  const [userGender, setUserGenderLocal] = useState(user.gender || 'female')
  const [partnerGender, setPartnerGenderLocal] = useState(partner.gender || 'female')

  const handleSave = () => {
    setGender('user', userGender)
    setGender('partner', partnerGender)
    onClose()
  }

  const GenderToggle = ({ label, value, onChange }) => (
    <View style={pd.genderRow}>
      <Text style={[pd.genderName, { fontFamily: 'Cubic11' }]}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[{ v: 'female', label: '女 ♀' }, { v: 'male', label: '男 ♂' }].map(({ v, label: l }) => (
          <TouchableOpacity
            key={v}
            onPress={() => onChange(v)}
            style={[pd.genderBtn, value === v && { backgroundColor: theme.primary, borderColor: theme.primary }]}
          >
            <Text style={[pd.genderBtnText, { fontFamily: 'Cubic11', color: value === v ? '#fff' : '#888' }]}>
              {l}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  return (
    <Modal animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={pd.overlay}>
        <View style={[pd.modalSheet, { backgroundColor: theme.bg }]}>
          <View style={pd.modalHeader}>
            <Text style={[pd.modalTitle, { fontFamily: 'Cubic11' }]}>性别设置</Text>
            <TouchableOpacity onPress={onClose} style={pd.closeBtn}>
              <Text style={{ fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: '#aaa', marginBottom: 16 }]}>
            月经记录功能仅对女性用户显示
          </Text>
          <GenderToggle label={user.name} value={userGender} onChange={setUserGenderLocal} />
          <GenderToggle label={partner.name} value={partnerGender} onChange={setPartnerGenderLocal} />
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
            <TouchableOpacity onPress={onClose} style={[pd.outlineBtn, { flex: 1 }]}>
              <Text style={{ fontFamily: 'Cubic11', fontSize: 13 }}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[pd.primaryBtn, { flex: 1, backgroundColor: theme.primary }]}>
              <Text style={{ fontFamily: 'Cubic11', fontSize: 13, color: '#fff', fontWeight: '700' }}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

// ── Main Period page ──────────────────────────────────────
export default function Period() {
  const router = useRouter()
  const { user, partner, periodLogs, deletePeriodLog, addPeriodLog, updatePeriodLog, setGender } = useStore()
  const theme = useStore(s => s.theme)
  const [showGenderModal, setShowGenderModal] = useState(false)

  const myLogs = logsFor(periodLogs, 'A')
  const partnerLogs = logsFor(periodLogs, 'B')

  const userIsFemale = user.gender === 'female'
  const partnerIsFemale = partner.gender === 'female'
  const bothFemale = userIsFemale && partnerIsFemale

  const panelProps = (title, color, logs, from) => ({
    title, color, logs, from,
    onDelete: deletePeriodLog,
    addPeriodLog,
    updatePeriodLog,
    theme,
  })

  return (
    <View style={[pd.page, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[pd.header, { backgroundColor: theme.bgHeader }]}>
        <TouchableOpacity onPress={() => router.back()} style={pd.backBtn}>
          <Text style={{ fontFamily: 'Cubic11', fontSize: 14 }}>‹ 返回</Text>
        </TouchableOpacity>
        <Text style={[pd.headerTitle, { fontFamily: 'Cubic11', flex: 1 }]}>经期记录</Text>
        <TouchableOpacity onPress={() => setShowGenderModal(true)} style={pd.gearBtn}>
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={pd.body}>
        {!userIsFemale && !partnerIsFemale ? (
          <View style={pd.emptyPage}>
            <Text style={{ fontSize: 36, opacity: 0.2 }}>🌸</Text>
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, color: '#bbb', textAlign: 'center' }]}>
              暂无需要记录的用户{'\n'}点击右上角 ⚙️ 设置性别
            </Text>
          </View>
        ) : bothFemale ? (
          <View style={pd.dualCols}>
            <View style={{ flex: 1 }}>
              <PeriodPanel {...panelProps(user.name, theme.primary, myLogs, 'A')} compact />
            </View>
            <View style={pd.colDivider} />
            <View style={{ flex: 1 }}>
              <PeriodPanel {...panelProps(partner.name, theme.secondary, partnerLogs, 'B')} compact />
            </View>
          </View>
        ) : (
          <View style={pd.singleCol}>
            {userIsFemale && <PeriodPanel {...panelProps(user.name, theme.primary, myLogs, 'A')} />}
            {partnerIsFemale && <PeriodPanel {...panelProps(partner.name, theme.secondary, partnerLogs, 'B')} />}
          </View>
        )}
      </ScrollView>

      {showGenderModal && (
        <GenderModal
          user={user}
          partner={partner}
          onClose={() => setShowGenderModal(false)}
          setGender={setGender}
          theme={theme}
        />
      )}
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────
const pd = StyleSheet.create({
  page: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16,
    borderBottomWidth: 3, borderBottomColor: '#3d3d3d',
  },
  backBtn: { borderWidth: 2, borderColor: '#3d3d3d', paddingHorizontal: 8, paddingVertical: 4 },
  headerTitle: { fontSize: 13, fontWeight: '700', color: '#3d3d3d' },
  gearBtn: { padding: 4 },
  body: { padding: 16, paddingBottom: 40 },

  // Layout
  dualCols: { flexDirection: 'row', alignItems: 'flex-start' },
  colDivider: { width: 2, backgroundColor: '#e8dfa8', marginHorizontal: 6, alignSelf: 'stretch' },
  singleCol: { gap: 16 },
  emptyPage: { alignItems: 'center', paddingVertical: 80, gap: 16 },

  // Panel
  panel: {
    borderWidth: 3, backgroundColor: '#fffef5',
    shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
    overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 8,
    borderBottomWidth: 2,
  },
  colorDot: { width: 8, height: 8, borderWidth: 1, borderColor: '#3d3d3d' },
  panelName: { fontSize: 11, fontWeight: '700', color: '#374151', flex: 1 },
  cycleTag: { fontSize: 9 },
  panelBody: { padding: 10, gap: 10 },

  // Status badge
  badge: { borderWidth: 2, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  // Calendar
  calendarWrap: { gap: 4 },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  monthNavBtn: { borderWidth: 2, borderColor: '#e8dfa8', paddingHorizontal: 8, paddingVertical: 2 },
  monthLabel: { fontSize: 10, fontWeight: '700' },
  calendar: { gap: 1 },
  calRow: { flexDirection: 'row' },
  calCell: {
    flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', minWidth: 0,
  },
  calWeekday: { fontSize: 8, color: '#aaa' },
  calDay: { fontSize: 9, color: '#3d3d3d' },
  calLegend: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  legendDot: { width: 8, height: 8, marginRight: 3 },

  // Selection bar
  selectionBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 2, padding: 8,
  },
  selCancelBtn: { borderWidth: 2, borderColor: '#e8dfa8', paddingHorizontal: 8, paddingVertical: 4 },
  selConfirmBtn: { borderWidth: 2, paddingHorizontal: 10, paddingVertical: 4 },

  // Action button
  actionBtn: {
    borderWidth: 3, borderColor: '#3d3d3d', paddingVertical: 10, alignItems: 'center',
    shadowColor: '#3d3d3d', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0,
  },
  actionBtnText: { fontSize: 13, fontWeight: '700' },

  // History
  historySec: { gap: 6 },
  sectionTitle: { fontSize: 9, color: '#aaa' },
  historyList: { borderWidth: 2, borderColor: '#e8dfa8' },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 6 },
  historyDot: { width: 6, height: 6, flexShrink: 0 },
  historyDate: { fontSize: 9, color: '#3d3d3d' },
  historyDur: { fontSize: 9, color: '#aaa', marginTop: 1 },
  historyAction: { padding: 4 },
  emptyHistory: { alignItems: 'center', paddingVertical: 10 },
  expandBtn: { alignItems: 'center', paddingVertical: 6, borderWidth: 2, borderColor: '#e8dfa8', borderTopWidth: 0 },

  // Gender modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopWidth: 4, borderTopColor: '#3d3d3d', padding: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  modalTitle: { fontSize: 13, fontWeight: '700', color: '#3d3d3d' },
  closeBtn: { borderWidth: 2, borderColor: '#3d3d3d', padding: 6 },
  genderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  genderName: { fontSize: 13, fontWeight: '700', color: '#374151' },
  genderBtn: { borderWidth: 2, borderColor: '#3d3d3d', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fffef5' },
  genderBtnText: { fontSize: 12, fontWeight: '700' },
  outlineBtn: { borderWidth: 3, borderColor: '#3d3d3d', paddingVertical: 12, alignItems: 'center', shadowColor: '#3d3d3d', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0 },
  primaryBtn: { borderWidth: 3, borderColor: '#3d3d3d', paddingVertical: 12, alignItems: 'center', shadowColor: '#3d3d3d', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0 },
})
