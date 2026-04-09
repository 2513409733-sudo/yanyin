import { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet,
} from 'react-native'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useStore } from '../store/useStore'

const MEALS = [
  { key: 'breakfast', label: '早餐', emoji: '☀️', time: '08:00' },
  { key: 'lunch',     label: '午餐', emoji: '🌤️', time: '12:00' },
  { key: 'dinner',    label: '晚餐', emoji: '🌙', time: '18:00' },
]

function MealCard({ meal, userA, userB, partnerName, onPublish, checkinId, comments, onComment, canEdit, theme }) {
  const [publishing, setPublishing] = useState(false)
  const [text, setText] = useState('')
  const [previewImg, setPreviewImg] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [showComments, setShowComments] = useState(false)

  const pickImage = async (useCamera = false) => {
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 })
    if (!result.canceled) setPreviewImg(result.assets[0].uri)
  }

  const handlePublish = () => {
    if (!text.trim() && !previewImg) return
    onPublish(meal.key, text, previewImg)
    setText(''); setPreviewImg(null); setPublishing(false)
  }

  const handleComment = () => {
    if (!commentText.trim()) return
    onComment(checkinId, commentText)
    setCommentText('')
  }

  return (
    <View style={mc.card}>
      {/* Meal header */}
      <View style={mc.cardHeader}>
        <Text style={{ fontSize: 18 }}>{meal.emoji}</Text>
        <Text style={[mc.mealLabel, { fontFamily: 'Cubic11' }]}>{meal.label}</Text>
        <Text style={[mc.mealTime, { fontFamily: 'Cubic11' }]}>{meal.time}</Text>
      </View>

      {/* Dual columns */}
      <View style={mc.dualCol}>
        {/* My side */}
        <View style={[mc.col, { borderRightWidth: 2, borderRightColor: '#e8dfa8' }]}>
          <View style={mc.colLabel}>
            <View style={[mc.colorDot, { backgroundColor: theme.primary }]} />
            <Text style={[mc.colLabelText, { fontFamily: 'Cubic11' }]}>我的</Text>
          </View>
          {userA ? (
            <View>
              {userA.img
                ? <Image source={{ uri: userA.img }} style={mc.photo} contentFit="cover" />
                : <View style={[mc.photoPlaceholder, { backgroundColor: theme.primary + '22' }]}><Text style={{ fontSize: 28 }}>🍽️</Text></View>
              }
              <Text style={[mc.checkinText, { fontFamily: 'Cubic11' }]}>{userA.text}</Text>
              <Text style={[mc.checkinTime, { fontFamily: 'Cubic11' }]}>{userA.time}</Text>
            </View>
          ) : publishing ? (
            <View style={{ gap: 8 }}>
              {previewImg
                ? (
                  <View>
                    <Image source={{ uri: previewImg }} style={mc.photo} contentFit="cover" />
                    <TouchableOpacity onPress={() => setPreviewImg(null)} style={mc.removeImg}>
                      <Text style={{ color: '#fff', fontSize: 12 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ gap: 6 }}>
                    <TouchableOpacity onPress={() => pickImage(true)} style={mc.photoBtn}>
                      <Text style={[{ fontFamily: 'Cubic11', fontSize: 11, color: '#3d3d3d' }]}>📷 拍照</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => pickImage(false)} style={mc.photoBtn}>
                      <Text style={[{ fontFamily: 'Cubic11', fontSize: 11, color: '#3d3d3d' }]}>🖼️ 相册</Text>
                    </TouchableOpacity>
                  </View>
                )
              }
              <TextInput
                style={[mc.textInput, { fontFamily: 'Cubic11' }]}
                placeholder="说说你吃了什么~"
                placeholderTextColor="#bbb"
                value={text}
                onChangeText={setText}
                multiline
              />
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity onPress={() => { setPublishing(false); setPreviewImg(null); setText('') }} style={mc.btnOutline}>
                  <Text style={[{ fontFamily: 'Cubic11', fontSize: 11, color: '#3d3d3d' }]}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePublish} style={[mc.btnPrimary, { backgroundColor: theme.primary }]}>
                  <Text style={[{ fontFamily: 'Cubic11', fontSize: 11, color: '#fff', fontWeight: '700' }]}>发布</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : canEdit ? (
            <TouchableOpacity onPress={() => setPublishing(true)} style={mc.addBox}>
              <Text style={{ fontSize: 20, opacity: 0.4 }}>+</Text>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: '#aaa' }]}>打卡</Text>
            </TouchableOpacity>
          ) : (
            <View style={mc.emptyBox}>
              <Text style={{ fontSize: 24, opacity: 0.3 }}>🍽️</Text>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: '#ccc' }]}>未打卡</Text>
            </View>
          )}
        </View>

        {/* Partner side */}
        <View style={mc.col}>
          <View style={mc.colLabel}>
            <View style={[mc.colorDot, { backgroundColor: theme.secondary }]} />
            <Text style={[mc.colLabelText, { fontFamily: 'Cubic11' }]}>{partnerName}</Text>
          </View>
          {userB ? (
            <View>
              {userB.img
                ? <Image source={{ uri: userB.img }} style={mc.photo} contentFit="cover" />
                : <View style={[mc.photoPlaceholder, { backgroundColor: theme.secondary + '22' }]}><Text style={{ fontSize: 28 }}>🍱</Text></View>
              }
              <Text style={[mc.checkinText, { fontFamily: 'Cubic11' }]}>{userB.text}</Text>
              <Text style={[mc.checkinTime, { fontFamily: 'Cubic11' }]}>{userB.time}</Text>
            </View>
          ) : (
            <View style={mc.emptyBox}>
              <Text style={{ fontSize: 24, opacity: 0.3 }}>🍽️</Text>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 10, color: '#ccc' }]}>TA 还没打卡</Text>
            </View>
          )}
        </View>
      </View>

      {/* Comments */}
      {checkinId && (
        <View style={mc.commentSection}>
          <TouchableOpacity onPress={() => setShowComments(v => !v)} style={mc.commentToggle}>
            <Text style={{ fontSize: 14 }}>💬</Text>
            <Text style={[mc.commentToggleText, { fontFamily: 'Cubic11' }]}>
              {comments.length > 0 ? `${comments.length} 条评论` : '留下评论'}
            </Text>
          </TouchableOpacity>
          {showComments && (
            <View style={mc.commentList}>
              {comments.map(c => (
                <View key={c.id} style={mc.commentItem}>
                  <View style={[mc.commentAvatar, { backgroundColor: c.from === 'A' ? theme.primary : theme.secondary }]}>
                    <Text style={{ color: '#fff', fontSize: 10 }}>{c.from === 'A' ? '我' : 'TA'}</Text>
                  </View>
                  <View style={mc.commentBubble}>
                    <Text style={[mc.commentText, { fontFamily: 'Cubic11' }]}>{c.text}</Text>
                    <Text style={[mc.commentTime, { fontFamily: 'Cubic11' }]}>{c.time}</Text>
                  </View>
                </View>
              ))}
              <View style={mc.commentInputRow}>
                <TextInput
                  style={[mc.commentInput, { fontFamily: 'Cubic11', flex: 1 }]}
                  placeholder="说点什么..."
                  placeholderTextColor="#bbb"
                  value={commentText}
                  onChangeText={setCommentText}
                />
                <TouchableOpacity onPress={handleComment} style={[mc.sendBtn, { backgroundColor: theme.primary }]}>
                  <Text style={{ color: '#fff', fontSize: 14 }}>➤</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

export default function Checkin() {
  const { checkins, partner, publishCheckin, addCheckinComment } = useStore()
  const theme = useStore(s => s.theme)
  const router = useRouter()
  const [dateOffset, setDateOffset] = useState(0)

  const targetDate = new Date()
  targetDate.setDate(targetDate.getDate() + dateOffset)
  const dateStr = targetDate.toISOString().slice(0, 10)
  const isToday = dateOffset === 0
  const dateLabel = isToday ? 'TODAY' : targetDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })

  return (
    <View style={[ss.page, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[ss.header, { backgroundColor: theme.bgHeader }]}>
        <View style={ss.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={ss.backBtn}>
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 20, fontWeight: '700', color: '#3d3d3d' }]}>‹</Text>
          </TouchableOpacity>
          <View>
            <Text style={[ss.title, { fontFamily: 'Cubic11' }]}>三餐打卡</Text>
            <Text style={[ss.sub, { fontFamily: 'Cubic11' }]}>记录每一餐，感受彼此的日常</Text>
          </View>
        </View>
        {/* Date nav */}
        <View style={ss.dateNav}>
          <TouchableOpacity onPress={() => setDateOffset(v => v - 1)} style={ss.navArrow}>
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 18, color: '#3d3d3d' }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[ss.dateLabel, { fontFamily: 'Cubic11' }]}>{dateLabel}</Text>
          <TouchableOpacity
            onPress={() => setDateOffset(v => Math.min(v + 1, 0))}
            style={[ss.navArrow, isToday && { opacity: 0.3 }]}
            disabled={isToday}
          >
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 18, color: '#3d3d3d' }]}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={ss.list}>
        {MEALS.map(meal => {
          const record = checkins.find(c => c.date === dateStr && c.meal === meal.key)
          return (
            <MealCard
              key={meal.key} meal={meal}
              userA={record?.userA || null}
              userB={record?.userB || null}
              partnerName={partner.name}
              checkinId={record?.id}
              comments={record?.comments || []}
              canEdit={isToday}
              onPublish={publishCheckin}
              onComment={addCheckinComment}
              theme={theme}
            />
          )
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const mc = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 16, borderWidth: 3, borderColor: '#3d3d3d', backgroundColor: '#fffef5', shadowColor:'#3d3d3d', shadowOffset:{width:4,height:4}, shadowOpacity:1, shadowRadius:0, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: '#e8dfa8' },
  mealLabel: { fontSize: 13, fontWeight: '700', color: '#3d3d3d', flex: 1 },
  mealTime: { fontSize: 11, color: '#aaa' },
  dualCol: { flexDirection: 'row' },
  col: { flex: 1, padding: 12 },
  colLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  colorDot: { width: 8, height: 8, borderWidth: 1, borderColor: '#3d3d3d' },
  colLabelText: { fontSize: 10, color: '#888' },
  photo: { width: '100%', aspectRatio: 1, marginBottom: 8, borderWidth: 2, borderColor: '#3d3d3d' },
  photoPlaceholder: { width: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderWidth: 2, borderColor: '#3d3d3d' },
  checkinText: { fontSize: 11, color: '#555', lineHeight: 16 },
  checkinTime: { fontSize: 10, color: '#aaa', marginTop: 4 },
  addBox: { width: '100%', aspectRatio: 1, borderWidth: 2, borderColor: '#3d3d3d', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  emptyBox: { width: '100%', aspectRatio: 1, backgroundColor: '#f5f5f0', borderWidth: 2, borderColor: '#ddd', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  textInput: { borderWidth: 2, borderColor: '#3d3d3d', backgroundColor: '#fffef5', paddingHorizontal: 8, paddingVertical: 6, fontSize: 12, color: '#3d3d3d', minHeight: 60 },
  photoBtn: { borderWidth: 2, borderColor: '#3d3d3d', paddingVertical: 6, alignItems: 'center' },
  btnOutline: { flex: 1, borderWidth: 2, borderColor: '#3d3d3d', paddingVertical: 8, alignItems: 'center' },
  btnPrimary: { flex: 1, borderWidth: 2, borderColor: '#3d3d3d', paddingVertical: 8, alignItems: 'center' },
  removeImg: { position: 'absolute', top: 4, right: 4, width: 20, height: 20, backgroundColor: '#3d3d3d', alignItems: 'center', justifyContent: 'center' },
  commentSection: { borderTopWidth: 2, borderTopColor: '#e8dfa8' },
  commentToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  commentToggleText: { fontSize: 12, color: '#aaa' },
  commentList: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  commentItem: { flexDirection: 'row', gap: 8 },
  commentAvatar: { width: 26, height: 26, borderWidth: 2, borderColor: '#3d3d3d', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  commentBubble: { flex: 1, borderWidth: 2, borderColor: '#3d3d3d', backgroundColor: '#f5eedc', padding: 8 },
  commentText: { fontSize: 12, color: '#3d3d3d' },
  commentTime: { fontSize: 10, color: '#aaa', marginTop: 2 },
  commentInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 8 },
  commentInput: { borderWidth: 2, borderColor: '#3d3d3d', backgroundColor: '#fffef5', paddingHorizontal: 10, paddingVertical: 8, fontSize: 12, color: '#3d3d3d' },
  sendBtn: { width: 40, height: 40, borderWidth: 2, borderColor: '#3d3d3d', alignItems: 'center', justifyContent: 'center' },
})

const ss = StyleSheet.create({
  page: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 3, borderBottomColor: '#3d3d3d' },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  backBtn: { borderWidth: 3, borderColor: '#3d3d3d', paddingHorizontal: 12, paddingVertical: 4, shadowColor:'#3d3d3d', shadowOffset:{width:3,height:3}, shadowOpacity:1, shadowRadius:0 },
  title: { fontSize: 16, fontWeight: '700', color: '#3d3d3d' },
  sub: { fontSize: 12, color: '#aaa', marginTop: 2 },
  dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  navArrow: { padding: 8 },
  dateLabel: { fontSize: 13, color: '#3d3d3d', minWidth: 100, textAlign: 'center' },
  list: { paddingBottom: 24 },
})
