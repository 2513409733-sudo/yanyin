import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { useStore } from '../../store/useStore'

function TabIcon({ emoji, label, focused, color }) {
  return (
    <View style={ti.wrap}>
      <Text style={ti.emoji}>{emoji}</Text>
      <Text style={[ti.label, { fontFamily: 'Cubic11', color: focused ? color : '#aaa' }]}>
        {label}
      </Text>
    </View>
  )
}

const ti = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 2 },
  emoji: { fontSize: 20 },
  label: { fontSize: 10 },
})

export default function TabLayout() {
  const theme = useStore(s => s.theme)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fffef5',
          borderTopWidth: 3,
          borderTopColor: '#3d3d3d',
          height: 72,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: '#aaa',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🏠" label="主页" focused={focused} color={theme.primary} />
          ),
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="📒" label="记录" focused={focused} color={theme.primary} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="💬" label="聊天" focused={focused} color={theme.primary} />
          ),
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="🌸" label="回忆" focused={focused} color={theme.primary} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon emoji="👤" label="我的" focused={focused} color={theme.primary} />
          ),
        }}
      />
    </Tabs>
  )
}
