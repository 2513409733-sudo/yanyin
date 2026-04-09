import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useStore } from '../store/useStore'

function isExpired(doneAt) {
  if (!doneAt) return false
  return (new Date() - new Date(doneAt + 'T00:00:00')) / 86400000 > 3
}

// ── Pixel checkbox ────────────────────────────────────────
function PixelCheck({ done, onPress, color = '#ff6b9d' }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[pl.check, { borderColor: done ? color : '#bbb', backgroundColor: done ? color : 'transparent' }]}
    >
      {done && <Text style={{ color: '#fff', fontSize: 9, lineHeight: 12 }}>✓</Text>}
    </TouchableOpacity>
  )
}

// ── Recursive item list ───────────────────────────────────
function ItemRow({ item, depth, onToggle, onAdd, planDone, primaryColor }) {
  const [showAdd, setShowAdd] = useState(false)
  const [newText, setNewText] = useState('')
  const [expanded, setExpanded] = useState(true)

  const children = (item.items || []).filter(it => !(it.done && isExpired(it.doneAt)))

  const commit = () => {
    if (newText.trim()) { onAdd(item.id, newText.trim()); setNewText('') }
    setShowAdd(false)
  }

  return (
    <View style={{ paddingLeft: depth * 16 }}>
      <View style={pl.itemRow}>
        <PixelCheck done={item.done} onPress={() => onToggle(item.id)} color={primaryColor} />
        <Text style={[pl.itemText, { fontFamily: 'Cubic11', color: item.done ? '#bbb' : '#3d3d3d', textDecorationLine: item.done ? 'line-through' : 'none' }]}>
          {item.title}
        </Text>
        {!planDone && depth < 2 && !item.done && (
          <TouchableOpacity onPress={() => setShowAdd(v => !v)} style={{ opacity: 0.4 }}>
            <Text style={{ fontSize: 14, color: '#3d3d3d' }}>＋</Text>
          </TouchableOpacity>
        )}
        {item.done && !isExpired(item.doneAt) && (
          <Text style={{ fontFamily: 'Cubic11', fontSize: 8, color: '#ccc' }}>3天后移除</Text>
        )}
      </View>
      {showAdd && (
        <View style={[pl.inlineAdd, { paddingLeft: 16 }]}>
          <TextInput
            style={[pl.inlineInput, { fontFamily: 'Cubic11' }]}
            placeholder="添加子项..."
            placeholderTextColor="#bbb"
            value={newText}
            onChangeText={setNewText}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={commit}
          />
          <TouchableOpacity onPress={commit} style={[pl.inlineBtn, { backgroundColor: primaryColor }]}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>✓</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setShowAdd(false); setNewText('') }} style={pl.inlineBtn}>
            <Text style={{ fontSize: 12 }}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      {children.map(child => (
        <ItemRow
          key={child.id}
          item={child}
          depth={depth + 1}
          onToggle={onToggle}
          onAdd={onAdd}
          planDone={planDone}
          primaryColor={primaryColor}
        />
      ))}
    </View>
  )
}

// ── Plan card ─────────────────────────────────────────────
function PlanCard({ plan, onToggle, onToggleItem, onAddItem, onDelete, userName, partnerName, theme }) {
  const isMe = plan.from === 'A'
  const color = isMe ? theme.primary : theme.secondary
  const isDone = plan.done
  const canRevert = isDone && !isExpired(plan.doneAt)
  const [showAddRoot, setShowAddRoot] = useState(false)
  const [rootText, setRootText] = useState('')

  const visibleItems = (plan.items || []).filter(it => !(it.done && isExpired(it.doneAt)))

  const commitRoot = () => {
    if (rootText.trim()) { onAddItem(null, rootText.trim()); setRootText('') }
    setShowAddRoot(false)
  }

  return (
    <View style={[pl.card, { borderLeftColor: color, borderLeftWidth: 6 }]}>
      {/* Title row */}
      <View style={pl.planTitleRow}>
        <PixelCheck done={isDone} onPress={onToggle} color={color} />
        <View style={{ flex: 1 }}>
          <Text style={[pl.planTitle, { fontFamily: 'Cubic11', color: isDone ? '#bbb' : '#3d3d3d', textDecorationLine: isDone ? 'line-through' : 'none' }]}>
            {plan.title}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
            {plan.time && (
              <Text style={[pl.planMeta, { fontFamily: 'Cubic11', color: isDone ? '#ccc' : theme.accent }]}>📅 {plan.time}</Text>
            )}
            <Text style={[pl.planMeta, { fontFamily: 'Cubic11', color: '#ccc' }]}>{isMe ? userName : partnerName} 创建</Text>
            {canRevert && <Text style={[pl.planMeta, { fontFamily: 'Cubic11', color: theme.secondary }]}>3天内可撤销</Text>}
          </View>
        </View>
        <TouchableOpacity onPress={onDelete} style={{ opacity: 0.3 }}>
          <Text style={{ fontSize: 16, color: '#e57373' }}>🗑</Text>
        </TouchableOpacity>
      </View>

      {/* Items */}
      {!isDone && (
        <View style={[pl.itemsSection, { borderTopColor: '#e8dfa8' }]}>
          {visibleItems.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              depth={0}
              onToggle={itemId => onToggleItem(itemId)}
              onAdd={(parentId, title) => onAddItem(parentId, title)}
              planDone={false}
              primaryColor={color}
            />
          ))}
          {/* Add root item */}
          {showAddRoot ? (
            <View style={pl.inlineAdd}>
              <TextInput
                style={[pl.inlineInput, { fontFamily: 'Cubic11' }]}
                placeholder="添加事项..."
                placeholderTextColor="#bbb"
                value={rootText}
                onChangeText={setRootText}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={commitRoot}
              />
              <TouchableOpacity onPress={commitRoot} style={[pl.inlineBtn, { backgroundColor: color }]}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowAddRoot(false); setRootText('') }} style={pl.inlineBtn}>
                <Text style={{ fontSize: 12 }}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setShowAddRoot(true)} style={pl.addItemBtn}>
              <Text style={{ fontSize: 12, opacity: 0.4 }}>＋</Text>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: '#3d3d3d', opacity: 0.4 }]}>添加事项</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}

// ── Main Plans page ───────────────────────────────────────
export default function Plans() {
  const router = useRouter()
  const { user, partner, plans, addPlan, togglePlan, deletePlan, togglePlanItem, addPlanItem } = useStore()
  const theme = useStore(s => s.theme)
  const [tab, setTab] = useState('active')
  const [showForm, setShowForm] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formTime, setFormTime] = useState('')

  const visiblePlans = plans.filter(p => !p.done || !isExpired(p.doneAt))
  const activePlans = visiblePlans.filter(p => !p.done)
  const donePlans = visiblePlans.filter(p => p.done)
  const displayed = tab === 'active' ? activePlans : donePlans

  const handleAdd = () => {
    if (!formTitle.trim()) return
    addPlan({ title: formTitle.trim(), time: formTime.trim() || null, from: 'A' })
    setFormTitle(''); setFormTime(''); setShowForm(false)
  }

  return (
    <View style={[pl.page, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[pl.header, { backgroundColor: theme.bgHeader }]}>
        <TouchableOpacity onPress={() => router.back()} style={pl.backBtn}>
          <Text style={{ fontFamily: 'Cubic11', fontSize: 14 }}>‹ 返回</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[pl.headerTitle, { fontFamily: 'Cubic11' }]}>我们的计划</Text>
          <Text style={[pl.headerSub, { fontFamily: 'Cubic11' }]}>{activePlans.length} 个进行中</Text>
        </View>
        <TouchableOpacity onPress={() => setShowForm(v => !v)} style={[pl.addBtn, { backgroundColor: theme.primary }]}>
          <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, color: '#fff', fontWeight: '700' }]}>＋ 新计划</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Add form */}
        {showForm && (
          <View style={[pl.formCard, { borderColor: '#3d3d3d', backgroundColor: theme.bgHeader }]}>
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: '#888', marginBottom: 10 }]}>新建计划</Text>
            <TextInput
              style={[pl.formInput, { fontFamily: 'Cubic11' }]}
              placeholder="计划名称"
              placeholderTextColor="#bbb"
              value={formTitle}
              onChangeText={setFormTitle}
              autoFocus
            />
            <TextInput
              style={[pl.formInput, { fontFamily: 'Cubic11', marginTop: 8 }]}
              placeholder="计划时间（可选，如 2026-05-01）"
              placeholderTextColor="#bbb"
              value={formTime}
              onChangeText={setFormTime}
            />
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <TouchableOpacity onPress={() => { setShowForm(false); setFormTitle(''); setFormTime('') }} style={[pl.formBtn, { flex: 1 }]}>
                <Text style={{ fontFamily: 'Cubic11', fontSize: 12 }}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAdd} style={[pl.formBtn, { flex: 1, backgroundColor: theme.primary, borderColor: theme.primary }]}>
                <Text style={{ fontFamily: 'Cubic11', fontSize: 12, color: '#fff', fontWeight: '700' }}>创建</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={[pl.tabs, { borderBottomColor: '#3d3d3d' }]}>
          {[{ key: 'active', label: `进行中 (${activePlans.length})` }, { key: 'done', label: `已完成 (${donePlans.length})` }].map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setTab(key)}
              style={[pl.tab, tab === key && { borderBottomWidth: 3, borderBottomColor: theme.primary }]}
            >
              <Text style={[pl.tabText, { fontFamily: 'Cubic11', color: tab === key ? theme.primary : '#888', fontWeight: tab === key ? '700' : '400' }]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Plan list */}
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          {displayed.length === 0 ? (
            <View style={pl.empty}>
              <Text style={{ fontSize: 36, opacity: 0.2 }}>📋</Text>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: '#bbb' }]}>
                {tab === 'active' ? '还没有计划，新建一个吧' : '暂无已完成的计划'}
              </Text>
            </View>
          ) : (
            displayed.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                userName={user.name}
                partnerName={partner.name}
                theme={theme}
                onToggle={() => togglePlan(plan.id)}
                onToggleItem={(itemId) => togglePlanItem(plan.id, itemId)}
                onAddItem={(parentId, title) => addPlanItem(plan.id, parentId, title)}
                onDelete={() => deletePlan(plan.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const pl = StyleSheet.create({
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

  formCard: { margin: 16, marginBottom: 0, borderWidth: 3, padding: 14, shadowColor: '#3d3d3d', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0 },
  formInput: { borderWidth: 3, borderColor: '#3d3d3d', backgroundColor: '#fffef5', paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: '#3d3d3d' },
  formBtn: { borderWidth: 2, borderColor: '#3d3d3d', paddingVertical: 10, alignItems: 'center', backgroundColor: '#fffef5' },

  tabs: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, borderBottomWidth: 3 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabText: { fontSize: 12 },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },

  // Card
  card: {
    backgroundColor: '#fffef5', borderWidth: 3, borderColor: '#3d3d3d',
    shadowColor: '#3d3d3d', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0,
    marginBottom: 14, borderLeftWidth: 6,
  },
  planTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, paddingBottom: 8 },
  planTitle: { fontSize: 13, fontWeight: '700', lineHeight: 20 },
  planMeta: { fontSize: 9 },
  itemsSection: { borderTopWidth: 1, padding: 10 },

  // Item
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  check: { width: 15, height: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemText: { flex: 1, fontSize: 11, lineHeight: 18 },
  inlineAdd: { flexDirection: 'row', gap: 4, marginTop: 4, marginBottom: 4 },
  inlineInput: { flex: 1, borderWidth: 2, borderColor: '#3d3d3d', backgroundColor: '#fffef5', paddingHorizontal: 8, paddingVertical: 4, fontSize: 12, color: '#3d3d3d' },
  inlineBtn: { borderWidth: 2, borderColor: '#3d3d3d', width: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fffef5' },
  addItemBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
})
