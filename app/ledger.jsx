import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, FlatList, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useStore } from '../store/useStore'

const FALLBACK_RATES = {
  USD: 0.138, EUR: 0.127, JPY: 20.83, GBP: 0.109,
  HKD: 1.076, KRW: 192.3, TWD: 4.55,  SGD: 0.186,
}

const CURRENCIES = ['CNY', 'USD', 'EUR', 'JPY', 'GBP', 'HKD', 'KRW', 'TWD', 'SGD']
const CURRENCY_SYMBOL = { CNY: '¥', USD: '$', EUR: '€', JPY: '¥', GBP: '£', HKD: 'HK$', KRW: '₩', TWD: 'NT$', SGD: 'S$' }

const PIE_COLORS = [
  '#FD85AB','#92C6D9','#3FEECE','#FDCB6E','#a29bfe',
  '#fd79a8','#74b9ff','#00cec9','#e17055','#6c5ce7',
]

const QUICK_EMOJIS = ['📌','🎀','☕','🎸','🐾','🎨','✈️','🏋️','📚','💅','🍰','🌺']

// ── Bar chart (one bar per category) ─────────────────────
function BarChart({ data, total }) {
  if (total === 0) {
    return (
      <View style={lc.emptyChart}>
        <Text style={[{ fontFamily: 'Cubic11', fontSize: 11, color: '#ccc' }]}>暂无数据</Text>
      </View>
    )
  }
  const sorted = [...data].sort((a, b) => b.value - a.value)
  return (
    <View style={{ gap: 8 }}>
      {sorted.map((d, i) => {
        const pct = total > 0 ? (d.value / total) * 100 : 0
        return (
          <View key={i} style={{ gap: 3 }}>
            {/* Label row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text style={{ fontSize: 12 }}>{d.emoji}</Text>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: '#555', flex: 1 }]} numberOfLines={1}>
                {d.label}
              </Text>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: '#888' }]}>
                ¥{d.value >= 10000 ? `${(d.value / 10000).toFixed(1)}w` : d.value.toFixed(0)}
              </Text>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, fontWeight: '700', color: d.color, minWidth: 34, textAlign: 'right' }]}>
                {pct.toFixed(0)}%
              </Text>
            </View>
            {/* Bar track */}
            <View style={lc.barTrack}>
              <View style={[lc.barFill, { width: `${pct}%`, backgroundColor: d.color }]} />
            </View>
          </View>
        )
      })}
    </View>
  )
}

// ── Currency picker modal ─────────────────────────────────
function CurrencyPicker({ value, onChange, onClose }) {
  return (
    <Modal animationType="slide" transparent presentationStyle="overFullScreen">
      <TouchableOpacity style={lc.overlay} activeOpacity={1} onPress={onClose}>
        <View style={[lc.pickerSheet, { backgroundColor: '#fdf6e3' }]}>
          <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, color: '#3d3d3d', marginBottom: 12, fontWeight: '700' }]}>选择货币</Text>
          {CURRENCIES.map(c => (
            <TouchableOpacity
              key={c}
              onPress={() => { onChange(c); onClose() }}
              style={[lc.currencyRow, value === c && { backgroundColor: '#ff6b9d22', borderColor: '#ff6b9d' }]}
            >
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 13, fontWeight: '700', color: '#3d3d3d', flex: 1 }]}>{c}</Text>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 11, color: '#888' }]}>{CURRENCY_SYMBOL[c]}</Text>
              {value === c && <Text style={{ fontSize: 12, color: '#ff6b9d' }}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

// ── Add entry sheet ───────────────────────────────────────
function AddEntrySheet({ onClose, categories, exchangeRates, theme }) {
  const { addLedgerEntry, addLedgerCategory } = useStore()
  const [entryType, setEntryType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('CNY')
  const [categoryId, setCategoryId] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatLabel, setNewCatLabel] = useState('')
  const [newCatEmoji, setNewCatEmoji] = useState('📌')

  const filteredCats = categories.filter(c => c.type === entryType)

  const getRateFromCNY = (cur) => {
    if (cur === 'CNY') return 1
    const r = exchangeRates[cur] || FALLBACK_RATES[cur] || 1
    return 1 / r
  }
  const cnyAmount = amount ? parseFloat(amount) * getRateFromCNY(currency) : 0

  const handleAddCat = () => {
    if (!newCatLabel.trim()) return
    const newId = `custom_${Date.now()}`
    addLedgerCategory({ id: newId, label: newCatLabel.trim(), emoji: newCatEmoji, type: entryType })
    setCategoryId(newId)
    setNewCatLabel('')
    setShowNewCat(false)
  }

  const handleSave = () => {
    const raw = parseFloat(amount)
    if (!raw || raw <= 0 || !categoryId) return
    addLedgerEntry({
      date,
      type: entryType,
      amount: parseFloat(cnyAmount.toFixed(2)),
      rawAmount: raw,
      currency,
      categoryId,
      note: note.trim(),
      from: 'A',
    })
    onClose()
  }

  return (
    <Modal animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={lc.overlay}>
        <View style={[lc.sheet, { backgroundColor: theme.bg, maxHeight: '90%' }]}>
          {/* Header */}
          <View style={[lc.sheetHeader, { backgroundColor: theme.bgHeader }]}>
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, color: '#3d3d3d', fontWeight: '700' }]}>记一笔</Text>
            <TouchableOpacity onPress={onClose} style={lc.closeBtn}>
              <Text style={{ fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 20 }}>
            {/* Type toggle */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {[{ v: 'expense', label: '支出', color: '#e57373' }, { v: 'income', label: '收入', color: '#4CAF50' }].map(({ v, label, color }) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => { setEntryType(v); setCategoryId('') }}
                  style={[lc.typeBtn, entryType === v && { backgroundColor: color, borderColor: color }]}
                >
                  <Text style={[{ fontFamily: 'Cubic11', fontSize: 13, fontWeight: '700', color: entryType === v ? '#fff' : '#888' }]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Amount + currency */}
            <Text style={[lc.fieldLabel, { fontFamily: 'Cubic11' }]}>金额</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 3, borderColor: '#3d3d3d', backgroundColor: '#fffef5' }}>
                <Text style={[{ fontFamily: 'Cubic11', fontSize: 13, color: '#888', paddingLeft: 10 }]}>{CURRENCY_SYMBOL[currency]}</Text>
                <TextInput
                  style={[{ fontFamily: 'Cubic11', flex: 1, paddingHorizontal: 6, paddingVertical: 10, fontSize: 14, fontWeight: '700', color: '#3d3d3d' }]}
                  placeholder="0.00"
                  placeholderTextColor="#bbb"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
              <TouchableOpacity onPress={() => setShowCurrencyPicker(true)} style={lc.currBtn}>
                <Text style={[{ fontFamily: 'Cubic11', fontSize: 11, color: '#3d3d3d', fontWeight: '700' }]}>{currency}</Text>
                <Text style={{ fontSize: 10, color: '#aaa' }}>▾</Text>
              </TouchableOpacity>
            </View>
            {currency !== 'CNY' && amount && cnyAmount > 0 && (
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: theme.accent, marginBottom: 8, marginTop: -8 }]}>
                ≈ ¥{cnyAmount.toFixed(2)} CNY
              </Text>
            )}

            {/* Category */}
            <Text style={[lc.fieldLabel, { fontFamily: 'Cubic11' }]}>分类</Text>
            <View style={lc.catGrid}>
              {filteredCats.map(c => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setCategoryId(c.id)}
                  style={[lc.catBtn, categoryId === c.id && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                >
                  <Text style={{ fontSize: 20 }}>{c.emoji}</Text>
                  <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: categoryId === c.id ? '#fff' : '#555' }]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setShowNewCat(v => !v)}
                style={[lc.catBtn, showNewCat && { borderStyle: 'solid', borderColor: theme.accent }]}
              >
                <Text style={{ fontSize: 20 }}>➕</Text>
                <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: showNewCat ? theme.accent : '#aaa' }]}>新类目</Text>
              </TouchableOpacity>
            </View>

            {/* New category inline form */}
            {showNewCat && (
              <View style={[lc.newCatBox, { borderColor: theme.accent, backgroundColor: theme.bgHeader }]}>
                <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: theme.accent, marginBottom: 6 }]}>选择图标</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                  {QUICK_EMOJIS.map(e => (
                    <TouchableOpacity key={e} onPress={() => setNewCatEmoji(e)} style={[lc.emojiBtn, newCatEmoji === e && { borderColor: theme.accent, backgroundColor: theme.accent + '22' }]}>
                      <Text style={{ fontSize: 18 }}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <View style={lc.emojiPreview}>
                    <Text style={{ fontSize: 20 }}>{newCatEmoji}</Text>
                  </View>
                  <TextInput
                    style={[lc.newCatInput, { fontFamily: 'Cubic11', flex: 1 }]}
                    placeholder="类目名称"
                    placeholderTextColor="#bbb"
                    value={newCatLabel}
                    onChangeText={setNewCatLabel}
                    returnKeyType="done"
                    onSubmitEditing={handleAddCat}
                  />
                  <TouchableOpacity onPress={handleAddCat} style={[lc.newCatSaveBtn, { backgroundColor: theme.primary, opacity: newCatLabel.trim() ? 1 : 0.4 }]}>
                    <Text style={{ fontFamily: 'Cubic11', fontSize: 12, color: '#fff', fontWeight: '700' }}>创建</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Date */}
            <Text style={[lc.fieldLabel, { fontFamily: 'Cubic11', marginTop: 4 }]}>日期</Text>
            <TextInput
              style={[lc.input, { fontFamily: 'Cubic11', marginBottom: 12 }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#bbb"
              value={date}
              onChangeText={setDate}
            />

            {/* Note */}
            <Text style={[lc.fieldLabel, { fontFamily: 'Cubic11' }]}>备注（可选）</Text>
            <TextInput
              style={[lc.input, { fontFamily: 'Cubic11' }]}
              placeholder="备注..."
              placeholderTextColor="#bbb"
              value={note}
              onChangeText={setNote}
            />
          </ScrollView>

          {/* Save button */}
          <View style={[lc.saveRow, { borderTopColor: '#e8dfa8' }]}>
            <TouchableOpacity onPress={onClose} style={[lc.outlineBtn, { flex: 1 }]}>
              <Text style={{ fontFamily: 'Cubic11', fontSize: 13 }}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={!amount || !categoryId}
              style={[lc.primaryBtn, { flex: 1, backgroundColor: theme.primary, opacity: (!amount || !categoryId) ? 0.4 : 1 }]}
            >
              <Text style={{ fontFamily: 'Cubic11', fontSize: 13, color: '#fff', fontWeight: '700' }}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {showCurrencyPicker && (
        <CurrencyPicker value={currency} onChange={setCurrency} onClose={() => setShowCurrencyPicker(false)} />
      )}
    </Modal>
  )
}

// ── Converter sheet ───────────────────────────────────────
function ConverterSheet({ onClose, exchangeRates, ratesUpdatedAt, onRefresh, theme }) {
  const [fromCur, setFromCur] = useState('USD')
  const [toCur, setToCur] = useState('CNY')
  const [inputVal, setInputVal] = useState('100')
  const [loading, setLoading] = useState(false)
  const [showFromPicker, setShowFromPicker] = useState(false)
  const [showToPicker, setShowToPicker] = useState(false)

  const getRateCNY = (cur) => {
    if (cur === 'CNY') return 1
    const r = exchangeRates[cur] || FALLBACK_RATES[cur] || 1
    return 1 / r
  }

  const convert = () => {
    const v = parseFloat(inputVal)
    if (!v) return '—'
    const inCNY = v * getRateCNY(fromCur)
    const result = inCNY / getRateCNY(toCur)
    return result >= 1 ? result.toFixed(2) : result.toFixed(4)
  }

  const swap = () => { setFromCur(toCur); setToCur(fromCur) }

  const handleRefresh = async () => {
    setLoading(true)
    await onRefresh()
    setLoading(false)
  }

  return (
    <Modal animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={lc.overlay}>
        <View style={[lc.sheet, { backgroundColor: theme.bg }]}>
          <View style={lc.sheetHeader}>
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, color: '#3d3d3d', fontWeight: '700' }]}>汇率换算</Text>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              {ratesUpdatedAt && <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: '#aaa' }]}>更新于 {ratesUpdatedAt}</Text>}
              <TouchableOpacity onPress={handleRefresh} style={lc.closeBtn}>
                <Text style={{ fontSize: 14, color: loading ? theme.accent : '#3d3d3d' }}>↻</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={lc.closeBtn}>
                <Text style={{ fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {/* Amount input */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              <TextInput
                style={[lc.input, { fontFamily: 'Cubic11', flex: 1, fontWeight: '700' }]}
                keyboardType="decimal-pad"
                placeholder="金额"
                placeholderTextColor="#bbb"
                value={inputVal}
                onChangeText={setInputVal}
              />
              <TouchableOpacity onPress={() => setShowFromPicker(true)} style={lc.currBtn}>
                <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, fontWeight: '700' }]}>{fromCur}</Text>
                <Text style={{ color: '#aaa' }}>▾</Text>
              </TouchableOpacity>
            </View>

            {/* Swap */}
            <TouchableOpacity onPress={swap} style={[lc.swapBtn, { borderColor: '#3d3d3d' }]}>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 12 }]}>⇅ 换向</Text>
            </TouchableOpacity>

            {/* Result */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, marginTop: 12 }}>
              <View style={[lc.resultBox, { backgroundColor: theme.bgHeader, flex: 1 }]}>
                <Text style={[{ fontFamily: 'Cubic11', fontSize: 18, fontWeight: '700', color: theme.primary }]}>{convert()}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowToPicker(true)} style={lc.currBtn}>
                <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, fontWeight: '700' }]}>{toCur}</Text>
                <Text style={{ color: '#aaa' }}>▾</Text>
              </TouchableOpacity>
            </View>

            {/* Rate table */}
            <View style={{ borderTopWidth: 2, borderTopColor: '#e8dfa8', paddingTop: 12 }}>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: '#888', marginBottom: 8 }]}>1 CNY =</Text>
              <View style={lc.rateGrid}>
                {['USD','EUR','JPY','GBP','HKD','KRW','TWD','SGD'].map(cur => {
                  const r = exchangeRates[cur] || FALLBACK_RATES[cur] || 1
                  return (
                    <View key={cur} style={[lc.rateCard, { backgroundColor: theme.bgHeader }]}>
                      <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: '#aaa' }]}>{cur}</Text>
                      <Text style={[{ fontFamily: 'Cubic11', fontSize: 11, fontWeight: '700', color: '#3d3d3d' }]}>
                        {r < 1 ? r.toFixed(4) : r.toFixed(2)}
                      </Text>
                    </View>
                  )
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
      {showFromPicker && <CurrencyPicker value={fromCur} onChange={setFromCur} onClose={() => setShowFromPicker(false)} />}
      {showToPicker && <CurrencyPicker value={toCur} onChange={setToCur} onClose={() => setShowToPicker(false)} />}
    </Modal>
  )
}

// ── Category management sheet ─────────────────────────────
function CategorySheet({ onClose, categories, theme }) {
  const { addLedgerCategory, deleteLedgerCategory } = useStore()
  const [tab, setTab] = useState('expense')
  const [newLabel, setNewLabel] = useState('')
  const [newEmoji, setNewEmoji] = useState('📌')
  const PRESET_EMOJIS = ['📌','🎀','🌺','☕','🎸','🐾','🎨','✈️','🏋️','📚','💅','🍰']

  const filtered = categories.filter(c => c.type === tab)

  const handleAdd = () => {
    if (!newLabel.trim()) return
    addLedgerCategory({ label: newLabel.trim(), emoji: newEmoji, type: tab })
    setNewLabel('')
    setNewEmoji('📌')
  }

  return (
    <Modal animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={lc.overlay}>
        <View style={[lc.sheet, { backgroundColor: theme.bg, maxHeight: '80%' }]}>
          <View style={[lc.sheetHeader, { backgroundColor: theme.bgHeader }]}>
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, color: '#3d3d3d', fontWeight: '700' }]}>分类管理</Text>
            <TouchableOpacity onPress={onClose} style={lc.closeBtn}>
              <Text style={{ fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>
          {/* Type tabs */}
          <View style={[{ flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#e8dfa8' }]}>
            {[{ v: 'expense', label: '支出分类' }, { v: 'income', label: '收入分类' }].map(({ v, label }) => (
              <TouchableOpacity key={v} onPress={() => setTab(v)} style={[lc.sheetTab, tab === v && { borderBottomWidth: 3, borderBottomColor: theme.primary }]}>
                <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, color: tab === v ? theme.primary : '#888', fontWeight: tab === v ? '700' : '400' }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {/* Existing categories */}
            <View style={lc.catGrid}>
              {filtered.map(c => (
                <View key={c.id} style={[lc.catBtn, { borderColor: '#e8dfa8', backgroundColor: theme.bgHeader }]}>
                  <Text style={{ fontSize: 20 }}>{c.emoji}</Text>
                  <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: '#555' }]}>{c.label}</Text>
                  {c.isCustom && (
                    <TouchableOpacity
                      onPress={() => deleteLedgerCategory(c.id)}
                      style={lc.catDeleteBtn}
                    >
                      <Text style={{ color: '#fff', fontSize: 8 }}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {/* Add new */}
            <View style={{ borderTopWidth: 2, borderTopColor: '#e8dfa8', paddingTop: 12, marginTop: 8 }}>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: '#888', marginBottom: 8 }]}>添加自定义分类</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                {PRESET_EMOJIS.map(e => (
                  <TouchableOpacity key={e} onPress={() => setNewEmoji(e)} style={[lc.emojiBtn, newEmoji === e && { borderColor: theme.primary, backgroundColor: theme.primary + '22' }]}>
                    <Text style={{ fontSize: 18 }}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <View style={lc.emojiPreview}>
                  <Text style={{ fontSize: 20 }}>{newEmoji}</Text>
                </View>
                <TextInput
                  style={[lc.newCatInput, { fontFamily: 'Cubic11', flex: 1 }]}
                  placeholder="分类名称"
                  placeholderTextColor="#bbb"
                  value={newLabel}
                  onChangeText={setNewLabel}
                  returnKeyType="done"
                  onSubmitEditing={handleAdd}
                />
                <TouchableOpacity onPress={handleAdd} style={[lc.newCatSaveBtn, { backgroundColor: theme.primary }]}>
                  <Text style={{ fontFamily: 'Cubic11', fontSize: 14, color: '#fff', fontWeight: '700' }}>＋</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

// ── Main Ledger page ──────────────────────────────────────
export default function Ledger() {
  const router = useRouter()
  const {
    user, partner,
    ledgerEntries, ledgerCategories,
    exchangeRates, ratesUpdatedAt,
    setExchangeRates, deleteLedgerEntry,
  } = useStore()
  const theme = useStore(s => s.theme)

  const now = new Date()
  const [viewMode, setViewMode] = useState('month')
  const [selectedMonth, setSelectedMonth] = useState(now.toISOString().slice(0, 7))
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [pieType, setPieType] = useState('expense')
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showConverter, setShowConverter] = useState(false)
  const [showCategorySheet, setShowCategorySheet] = useState(false)

  const fetchRates = async () => {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/CNY', { signal: AbortSignal.timeout(6000) })
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      if (data.rates) setExchangeRates(data.rates)
    } catch { /* keep fallback */ }
  }

  useEffect(() => {
    if (!ratesUpdatedAt) fetchRates()
  }, [])

  const filteredEntries = ledgerEntries.filter(e => {
    if (viewMode === 'month') return e.date.startsWith(selectedMonth)
    return e.date.startsWith(String(selectedYear))
  })

  const totalIncome  = filteredEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const totalExpense = filteredEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const balance = totalIncome - totalExpense

  const getDays = () => {
    if (viewMode === 'month') {
      const [y, m] = selectedMonth.split('-').map(Number)
      return new Date(y, m, 0).getDate()
    }
    return (selectedYear % 4 === 0 && (selectedYear % 100 !== 0 || selectedYear % 400 === 0)) ? 366 : 365
  }
  const days = getDays()
  const dailyExpense = totalExpense / days
  const dailyIncome  = totalIncome  / days

  // Pie/bar chart data
  const pieEntries = filteredEntries.filter(e => e.type === pieType)
  const catMap = {}
  pieEntries.forEach(e => { catMap[e.categoryId] = (catMap[e.categoryId] || 0) + e.amount })
  const pieData = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .map(([catId, value], i) => {
      const cat = ledgerCategories.find(c => c.id === catId)
      return { label: cat?.label || '其他', emoji: cat?.emoji || '📦', value, color: PIE_COLORS[i % PIE_COLORS.length] }
    })
  const pieTotal = pieData.reduce((s, d) => s + d.value, 0)

  // Grouped entries
  const sortedEntries = [...filteredEntries].sort((a, b) => b.date.localeCompare(a.date))
  const grouped = {}
  sortedEntries.forEach(e => {
    if (!grouped[e.date]) grouped[e.date] = []
    grouped[e.date].push(e)
  })
  const groupedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const stepMonth = (dir) => {
    const [y, m] = selectedMonth.split('-').map(Number)
    const d = new Date(y, m - 1 + dir, 1)
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const stepYear = (dir) => setSelectedYear(v => v + dir)

  const getFromName  = (from) => from === 'A' ? user.name : partner.name
  const getFromColor = (from) => from === 'A' ? theme.primary : theme.secondary
  const getCat       = (id) => ledgerCategories.find(c => c.id === id)

  return (
    <View style={[lc.page, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[lc.header, { backgroundColor: theme.bgHeader }]}>
        <TouchableOpacity onPress={() => router.back()} style={lc.backBtn}>
          <Text style={{ fontFamily: 'Cubic11', fontSize: 14 }}>‹ 返回</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[lc.headerTitle, { fontFamily: 'Cubic11' }]}>共同记账</Text>
          <Text style={[lc.headerSub, { fontFamily: 'Cubic11' }]}>{user.name} & {partner.name}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <TouchableOpacity onPress={() => setShowCategorySheet(true)} style={lc.iconBtn}>
            <Text style={{ fontSize: 16 }}>🏷</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowConverter(true)} style={lc.iconBtn}>
            <Text style={{ fontSize: 16 }}>💱</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAddSheet(true)} style={[lc.addBtn, { backgroundColor: theme.primary }]}>
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, color: '#fff', fontWeight: '700' }]}>＋ 记一笔</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* View mode + navigation */}
        <View style={lc.navRow}>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {[{ v: 'month', label: '月' }, { v: 'year', label: '年' }].map(({ v, label }) => (
              <TouchableOpacity
                key={v}
                onPress={() => setViewMode(v)}
                style={[lc.viewModeBtn, viewMode === v && { backgroundColor: theme.primary, borderColor: theme.primary }]}
              >
                <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, color: viewMode === v ? '#fff' : '#888', fontWeight: '700' }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity onPress={() => viewMode === 'month' ? stepMonth(-1) : stepYear(-1)} style={lc.navBtn}>
              <Text style={{ fontSize: 16 }}>‹</Text>
            </TouchableOpacity>
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, color: '#3d3d3d', minWidth: 60, textAlign: 'center' }]}>
              {viewMode === 'month' ? selectedMonth : selectedYear}
            </Text>
            <TouchableOpacity onPress={() => viewMode === 'month' ? stepMonth(1) : stepYear(1)} style={lc.navBtn}>
              <Text style={{ fontSize: 16 }}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 }}>
          {[
            { label: viewMode === 'month' ? '月结余' : '年结余', value: balance, color: balance >= 0 ? '#4CAF50' : '#e57373', emoji: '💰' },
            { label: '日均支出', value: dailyExpense, color: '#e57373', emoji: '📉' },
            { label: '日均收入', value: dailyIncome, color: '#4CAF50', emoji: '📈' },
          ].map(s => (
            <View key={s.label} style={[lc.statCard, { backgroundColor: theme.bgHeader }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Text style={{ fontSize: 10 }}>{s.emoji}</Text>
                <Text style={[{ fontFamily: 'Cubic11', fontSize: 8, color: '#888' }]}>{s.label}</Text>
              </View>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 13, fontWeight: '700', color: s.color }]}>
                ¥{Math.abs(s.value) >= 10000 ? `${(Math.abs(s.value) / 10000).toFixed(1)}w` : Math.abs(s.value).toFixed(0)}
              </Text>
            </View>
          ))}
        </View>

        {/* Chart section */}
        <View style={[lc.card, { marginHorizontal: 16, marginBottom: 12 }]}>
          <View style={[lc.cardHeader, { backgroundColor: theme.bgHeader }]}>
            <View style={{ flexDirection: 'row', gap: 4, flex: 1 }}>
              {[{ v: 'expense', label: '支出占比', color: '#e57373' }, { v: 'income', label: '收入占比', color: '#4CAF50' }].map(({ v, label, color }) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => setPieType(v)}
                  style={[lc.pieToggle, pieType === v && { backgroundColor: color, borderColor: color }]}
                >
                  <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: pieType === v ? '#fff' : '#888' }]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: theme.primary }]}>
              ¥{pieTotal >= 10000 ? `${(pieTotal / 10000).toFixed(1)}w` : pieTotal.toFixed(0)}
            </Text>
          </View>
          <View style={{ padding: 12 }}>
            <BarChart data={pieData} total={pieTotal} />
          </View>
        </View>

        {/* Entry list */}
        <View style={[lc.card, { marginHorizontal: 16 }]}>
          <View style={[lc.cardHeader, { backgroundColor: theme.bgHeader }]}>
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: '#3d3d3d', fontWeight: '700' }]}>明细</Text>
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: '#aaa' }]}>{filteredEntries.length} 笔</Text>
          </View>

          {filteredEntries.length === 0 ? (
            <View style={lc.emptyList}>
              <Text style={{ fontSize: 36, opacity: 0.2 }}>📒</Text>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: '#bbb' }]}>这段时间还没有记录</Text>
            </View>
          ) : (
            groupedDates.map(date => {
              const dayEntries = grouped[date]
              const dayIncome  = dayEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
              const dayExpense = dayEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
              return (
                <View key={date}>
                  <View style={[lc.dateHeader, { backgroundColor: theme.bgHeader }]}>
                    <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: '#888' }]}>{date}</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {dayIncome > 0  && <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: '#4CAF50' }]}>+¥{dayIncome.toFixed(0)}</Text>}
                      {dayExpense > 0 && <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: '#e57373' }]}>-¥{dayExpense.toFixed(0)}</Text>}
                    </View>
                  </View>
                  {dayEntries.map(entry => {
                    const cat = getCat(entry.categoryId)
                    return (
                      <View key={entry.id} style={[lc.entryRow, { borderBottomColor: '#f5f0e0' }]}>
                        <View style={[lc.entryIcon, {
                          backgroundColor: entry.type === 'expense' ? '#e5737322' : '#4CAF5022',
                          borderColor: entry.type === 'expense' ? '#e57373' : '#4CAF50',
                        }]}>
                          <Text style={{ fontSize: 20 }}>{cat?.emoji || '📦'}</Text>
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Text style={[{ fontFamily: 'Cubic11', fontSize: 12, fontWeight: '700', color: '#3d3d3d' }]}>{cat?.label || '其他'}</Text>
                            <View style={[lc.fromBadge, { backgroundColor: getFromColor(entry.from) }]}>
                              <Text style={{ color: '#fff', fontSize: 8 }}>{getFromName(entry.from)[0]}</Text>
                            </View>
                          </View>
                          {entry.note ? (
                            <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: '#aaa' }]} numberOfLines={1}>{entry.note}</Text>
                          ) : null}
                          {entry.currency !== 'CNY' && (
                            <Text style={[{ fontFamily: 'Cubic11', fontSize: 9, color: '#aaa' }]}>
                              {CURRENCY_SYMBOL[entry.currency]}{entry.rawAmount} {entry.currency}
                            </Text>
                          )}
                        </View>
                        <Text style={[{ fontFamily: 'Cubic11', fontSize: 14, fontWeight: '700', color: entry.type === 'expense' ? '#e57373' : '#4CAF50', flexShrink: 0 }]}>
                          {entry.type === 'expense' ? '-' : '+'}¥{entry.amount >= 10000 ? `${(entry.amount / 10000).toFixed(1)}w` : entry.amount.toFixed(0)}
                        </Text>
                        <TouchableOpacity onPress={() => deleteLedgerEntry(entry.id)} style={{ opacity: 0.35, padding: 4 }}>
                          <Text style={{ fontSize: 14, color: '#e57373' }}>🗑</Text>
                        </TouchableOpacity>
                      </View>
                    )
                  })}
                </View>
              )
            })
          )}
        </View>
      </ScrollView>

      {showAddSheet && (
        <AddEntrySheet
          onClose={() => setShowAddSheet(false)}
          categories={ledgerCategories}
          exchangeRates={exchangeRates}
          theme={theme}
        />
      )}
      {showConverter && (
        <ConverterSheet
          onClose={() => setShowConverter(false)}
          exchangeRates={exchangeRates}
          ratesUpdatedAt={ratesUpdatedAt}
          onRefresh={fetchRates}
          theme={theme}
        />
      )}
      {showCategorySheet && (
        <CategorySheet
          onClose={() => setShowCategorySheet(false)}
          categories={ledgerCategories}
          theme={theme}
        />
      )}
    </View>
  )
}

const lc = StyleSheet.create({
  page: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16,
    borderBottomWidth: 3, borderBottomColor: '#3d3d3d',
  },
  backBtn: { borderWidth: 2, borderColor: '#3d3d3d', paddingHorizontal: 8, paddingVertical: 4 },
  headerTitle: { fontSize: 13, fontWeight: '700', color: '#3d3d3d' },
  headerSub: { fontSize: 10, color: '#aaa', marginTop: 1 },
  iconBtn: { borderWidth: 2, borderColor: '#3d3d3d', width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  addBtn: { borderWidth: 2, borderColor: '#3d3d3d', paddingHorizontal: 10, paddingVertical: 6, shadowColor: '#3d3d3d', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  viewModeBtn: { borderWidth: 2, borderColor: '#ddd', paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#fffef5' },
  navBtn: { borderWidth: 2, borderColor: '#3d3d3d', paddingHorizontal: 8, paddingVertical: 2 },
  statCard: { flex: 1, borderWidth: 2, borderColor: '#3d3d3d', padding: 8, gap: 3, shadowColor: '#3d3d3d', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0 },

  card: { borderWidth: 3, borderColor: '#3d3d3d', backgroundColor: '#fffef5', shadowColor: '#3d3d3d', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: '#e8dfa8' },
  pieToggle: { paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#ddd' },

  emptyChart: { alignItems: 'center', paddingVertical: 20 },
  barTrack: { height: 10, backgroundColor: '#f0ede0', borderWidth: 2, borderColor: '#3d3d3d', overflow: 'hidden' },
  barFill: { height: '100%' },

  dateHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#e8dfa8' },
  entryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1 },
  entryIcon: { width: 36, height: 36, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  fromBadge: { width: 14, height: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#3d3d3d', flexShrink: 0 },
  emptyList: { alignItems: 'center', paddingVertical: 48, gap: 10 },

  // Sheet styles
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopWidth: 4, borderTopColor: '#3d3d3d' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: '#e8dfa8' },
  closeBtn: { borderWidth: 2, borderColor: '#3d3d3d', padding: 6 },
  sheetTab: { flex: 1, paddingVertical: 10, alignItems: 'center' },

  typeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderWidth: 2, borderColor: '#ddd', backgroundColor: '#fffef5' },
  fieldLabel: { fontSize: 11, color: '#aaa', marginBottom: 6 },
  input: { borderWidth: 3, borderColor: '#3d3d3d', backgroundColor: '#fffef5', paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#3d3d3d' },
  currBtn: { borderWidth: 3, borderColor: '#3d3d3d', paddingHorizontal: 10, paddingVertical: 8, flexDirection: 'row', gap: 4, alignItems: 'center', backgroundColor: '#fffef5', flexShrink: 0 },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  catBtn: { width: '22%', paddingVertical: 8, alignItems: 'center', gap: 3, borderWidth: 2, borderColor: '#ddd', backgroundColor: '#fffef5', position: 'relative' },
  catDeleteBtn: { position: 'absolute', top: -6, right: -6, width: 16, height: 16, backgroundColor: '#e57373', borderWidth: 1, borderColor: '#3d3d3d', alignItems: 'center', justifyContent: 'center' },
  newCatBox: { borderWidth: 2, borderTopWidth: 3, padding: 10, marginBottom: 12 },
  emojiBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  emojiPreview: { width: 38, height: 38, backgroundColor: '#fffef5', borderWidth: 2, borderColor: '#3d3d3d', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  newCatInput: { borderWidth: 2, borderColor: '#3d3d3d', backgroundColor: '#fffef5', paddingHorizontal: 8, paddingVertical: 6, fontSize: 13, color: '#3d3d3d' },
  newCatSaveBtn: { borderWidth: 2, borderColor: '#3d3d3d', paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },

  saveRow: { flexDirection: 'row', gap: 8, padding: 16, borderTopWidth: 2 },
  outlineBtn: { borderWidth: 3, borderColor: '#3d3d3d', paddingVertical: 12, alignItems: 'center', shadowColor: '#3d3d3d', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0 },
  primaryBtn: { borderWidth: 3, borderColor: '#3d3d3d', paddingVertical: 12, alignItems: 'center', shadowColor: '#3d3d3d', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0 },

  // Converter
  swapBtn: { borderWidth: 3, alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fffef5', shadowColor: '#3d3d3d', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0 },
  resultBox: { borderWidth: 3, borderColor: '#3d3d3d', paddingHorizontal: 12, paddingVertical: 12, justifyContent: 'center' },
  rateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  rateCard: { width: '23%', borderWidth: 1, borderColor: '#e8dfa8', padding: 6, alignItems: 'center', gap: 2 },

  // Currency picker
  pickerSheet: { borderTopWidth: 4, borderTopColor: '#3d3d3d', padding: 20, maxHeight: '70%' },
  currencyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderWidth: 2, borderColor: '#e8dfa8', marginBottom: 4, gap: 8 },
})
