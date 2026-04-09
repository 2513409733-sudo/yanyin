import { useState, useEffect, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, Modal,
} from 'react-native'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useStore } from '../../store/useStore'

const QUICK_REPLIES = ['❤️', '😊', '😘', '🤗', '哈哈', '想你了', '晚安', '早安']

function MessageBubble({ msg, isMe, theme }) {
  if (msg.type === 'image') {
    return (
      <View style={[cs.imgBubble, { borderColor: isMe ? theme.primary : theme.secondary }]}>
        <Image source={{ uri: msg.mediaUrl }} style={cs.imgBubbleImg} contentFit="cover" />
      </View>
    )
  }
  return (
    <View style={[
      cs.bubble,
      isMe ? [cs.bubbleMe, { backgroundColor: theme.primary + 'cc', borderColor: theme.primary }]
           : [cs.bubbleOther, { borderColor: '#3d3d3d' }],
    ]}>
      <Text style={[cs.bubbleText, { fontFamily: 'Cubic11', color: isMe ? '#fff' : '#3d3d3d' }]}>
        {msg.text}
      </Text>
    </View>
  )
}

function MessageRow({ msg, user, partner, theme }) {
  const isMe = msg.from === 'A'
  return (
    <View style={[cs.msgRow, isMe ? cs.msgRowMe : cs.msgRowOther]}>
      <View style={[cs.avatar, { backgroundColor: isMe ? theme.primary + '33' : theme.secondary + '33', borderColor: '#3d3d3d' }]}>
        {(isMe ? user.avatarUrl : partner.avatarUrl)
          ? <Image source={{ uri: isMe ? user.avatarUrl : partner.avatarUrl }} style={cs.avatarImg} />
          : <Text style={{ fontSize: 14 }}>{isMe ? '😊' : '😊'}</Text>
        }
      </View>
      <View style={[cs.msgContent, isMe ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
        <MessageBubble msg={msg} isMe={isMe} theme={theme} />
        {isMe && (
          <Text style={[cs.readStatus, { fontFamily: 'Cubic11', color: msg.read ? theme.primary : '#ccc' }]}>
            {msg.read ? '已读' : '未读'}
          </Text>
        )}
      </View>
    </View>
  )
}

export default function Chat() {
  const { messages, user, partner, stickers, sendChatMessage, markAllRead } = useStore()
  const theme = useStore(s => s.theme)
  const [input, setInput] = useState('')
  const [showPanel, setShowPanel] = useState(false)
  const [panelTab, setPanelTab] = useState('quick')
  const listRef = useRef(null)

  useEffect(() => { markAllRead() }, [])

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    sendChatMessage({ text: input, type: 'text' })
    setInput('')
    setShowPanel(false)
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    })
    if (!result.canceled) {
      sendChatMessage({ text: '', type: 'image', mediaUrl: result.assets[0].uri })
    }
  }

  // Group messages by time
  const msgData = messages.map((msg, i) => ({
    ...msg,
    showTime: i === 0 || messages[i-1].time !== msg.time,
  }))

  return (
    <KeyboardAvoidingView
      style={[cs.page, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={[cs.header, { backgroundColor: theme.bgHeader }]}>
        <View style={[cs.partnerAvatar, { backgroundColor: theme.secondary + '33', borderColor: '#3d3d3d' }]}>
          {partner.avatarUrl
            ? <Image source={{ uri: partner.avatarUrl }} style={cs.avatarImg} />
            : <Text style={{ fontSize: 18 }}>😊</Text>
          }
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[cs.partnerName, { fontFamily: 'Cubic11' }]}>{partner.name}</Text>
          <Text style={[cs.onlineStatus, { fontFamily: 'Cubic11', color: theme.accent }]}>● ONLINE</Text>
        </View>
        <TouchableOpacity style={cs.headerBtn}><Text style={{ fontSize: 18 }}>📞</Text></TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={msgData}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={cs.msgList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => (
          <View>
            {item.showTime && (
              <View style={cs.timeRow}>
                <View style={cs.timeBadge}>
                  <Text style={[cs.timeText, { fontFamily: 'Cubic11' }]}>{item.time}</Text>
                </View>
              </View>
            )}
            <MessageRow msg={item} user={user} partner={partner} theme={theme} />
          </View>
        )}
      />

      {/* Quick reply panel */}
      {showPanel && (
        <View style={[cs.panel, { backgroundColor: theme.bgHeader }]}>
          <View style={cs.panelTabs}>
            {[['quick', '快捷回复'], ['stickers', '表情包']].map(([key, label]) => (
              <TouchableOpacity
                key={key} onPress={() => setPanelTab(key)}
                style={[cs.panelTab, panelTab === key && { borderBottomWidth: 2, borderBottomColor: theme.primary }]}
              >
                <Text style={[cs.panelTabText, { fontFamily: 'Cubic11', color: panelTab === key ? theme.primary : '#aaa' }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {panelTab === 'quick' && (
            <View style={cs.quickRow}>
              {QUICK_REPLIES.map(r => (
                <TouchableOpacity
                  key={r}
                  onPress={() => { setInput(v => v + r); setShowPanel(false) }}
                  style={cs.quickChip}
                >
                  <Text style={[cs.quickChipText, { fontFamily: 'Cubic11' }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {panelTab === 'stickers' && (
            <View style={cs.emptyStickers}>
              <Text style={{ fontSize: 32, opacity: 0.2 }}>✂️</Text>
              <Text style={[{ fontFamily: 'Cubic11', fontSize: 11, color: '#ccc' }]}>还没有表情包</Text>
            </View>
          )}
        </View>
      )}

      {/* Input bar */}
      <View style={[cs.inputBar, { backgroundColor: theme.bgHeader }]}>
        <TouchableOpacity onPress={() => setShowPanel(v => !v)} style={cs.toolBtn}>
          <Text style={{ fontSize: 20 }}>😊</Text>
        </TouchableOpacity>
        <TextInput
          style={[cs.input, { fontFamily: 'Cubic11', flex: 1 }]}
          placeholder="说点什么..."
          placeholderTextColor="#bbb"
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        {!input.trim() && (
          <TouchableOpacity onPress={pickImage} style={cs.toolBtn}>
            <Text style={{ fontSize: 20 }}>🖼️</Text>
          </TouchableOpacity>
        )}
        {input.trim() && (
          <TouchableOpacity onPress={handleSend} style={[cs.sendBtn, { backgroundColor: theme.primary }]}>
            <Text style={[{ fontFamily: 'Cubic11', fontSize: 14, color: '#fff', fontWeight: '700' }]}>发送</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const cs = StyleSheet.create({
  page: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 60, paddingBottom: 12, paddingHorizontal: 16,
    borderBottomWidth: 3, borderBottomColor: '#3d3d3d',
  },
  partnerAvatar: { width: 40, height: 40, borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  partnerName: { fontSize: 15, fontWeight: '700', color: '#3d3d3d' },
  onlineStatus: { fontSize: 10, marginTop: 2 },
  headerBtn: { borderWidth: 2, borderColor: '#3d3d3d', padding: 8 },
  msgList: { paddingHorizontal: 16, paddingVertical: 12, gap: 4 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 8 },
  msgRowMe: { flexDirection: 'row-reverse' },
  msgRowOther: {},
  avatar: { width: 30, height: 30, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' },
  msgContent: { flex: 1, gap: 2 },
  bubble: { maxWidth: 220, padding: 10, borderWidth: 2 },
  bubbleMe: { shadowColor: '#3d3d3d', shadowOffset:{width:2,height:2}, shadowOpacity:1, shadowRadius:0 },
  bubbleOther: { backgroundColor: '#fffef5', shadowColor: '#3d3d3d', shadowOffset:{width:2,height:2}, shadowOpacity:1, shadowRadius:0 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  imgBubble: { maxWidth: 160, borderWidth: 2, overflow: 'hidden' },
  imgBubbleImg: { width: 160, height: 160 },
  readStatus: { fontSize: 10 },
  timeRow: { alignItems: 'center', marginVertical: 8 },
  timeBadge: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#e8dfa8', borderWidth: 2, borderColor: '#3d3d3d' },
  timeText: { fontSize: 10, color: '#888' },
  panel: { borderTopWidth: 2, borderTopColor: '#e8dfa8' },
  panelTabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e8dfa8' },
  panelTab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  panelTabText: { fontSize: 12 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12 },
  quickChip: { borderWidth: 2, borderColor: '#3d3d3d', paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#fffef5' },
  quickChipText: { fontSize: 13, color: '#3d3d3d' },
  emptyStickers: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 3, borderTopColor: '#3d3d3d',
  },
  toolBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#3d3d3d' },
  input: {
    borderWidth: 3, borderColor: '#3d3d3d', backgroundColor: '#fffef5',
    paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: '#3d3d3d',
    minHeight: 44, maxHeight: 120,
  },
  sendBtn: { borderWidth: 3, borderColor: '#3d3d3d', paddingHorizontal: 14, paddingVertical: 10, shadowColor:'#3d3d3d', shadowOffset:{width:3,height:3}, shadowOpacity:1, shadowRadius:0 },
})
