import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store/useStore'

// Tab screens
import IndexScreen from '../../app/(tabs)/index'
import RecordScreen from '../../app/(tabs)/record'
import ChatScreen from '../../app/(tabs)/chat'
import MemoriesScreen from '../../app/(tabs)/memories'
import ProfileScreen from '../../app/(tabs)/profile'

// Sub-screens
import LoginScreen from '../../app/login'
import OnboardingScreen from '../../app/onboarding'
import BindPartnerScreen from '../../app/bind-partner'
import PeriodScreen from '../../app/period'
import PeriodHistoryScreen from '../../app/period-history'
import LedgerScreen from '../../app/ledger'
import GoalsScreen from '../../app/goals'
import PlansScreen from '../../app/plans'
import CheckinScreen from '../../app/checkin'

const TABS = [
  { path: '/',         emoji: '🏠', label: '主页',  Screen: IndexScreen },
  { path: '/record',   emoji: '📒', label: '记录',  Screen: RecordScreen },
  { path: '/chat',     emoji: '💬', label: '聊天',  Screen: ChatScreen },
  { path: '/memories', emoji: '🌸', label: '回忆',  Screen: MemoriesScreen },
  { path: '/profile',  emoji: '👤', label: '我的',  Screen: ProfileScreen },
]

const TAB_PATHS = new Set(TABS.map(t => t.path))

function TabBar() {
  const theme = useStore(s => s.theme)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div style={{
      display: 'flex',
      backgroundColor: '#fffef5',
      borderTop: '3px solid #3d3d3d',
      height: 72,
    }}>
      {TABS.map(({ path, emoji, label }) => {
        const active = pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '6px 0 8px',
            }}
          >
            <span style={{ fontSize: 22 }}>{emoji}</span>
            <span style={{
              fontFamily: 'Cubic11, monospace',
              fontSize: 10,
              color: active ? theme.primary : '#aaa',
            }}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

function TabsLayout() {
  const { pathname } = useLocation()
  const isTab = TAB_PATHS.has(pathname)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Routes>
          {TABS.map(({ path, Screen }) => (
            <Route key={path} path={path} element={
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
                <Screen />
              </div>
            } />
          ))}
        </Routes>
      </div>
      {isTab && <TabBar />}
    </div>
  )
}

export default function App() {
  const isLoggedIn = useStore(s => s.isLoggedIn)
  const user = useStore(s => s.user)
  const isBound = useStore(s => s.isBound)
  const skippedBind = useStore(s => s.skippedBind)

  return (
    <div style={{ height: '100%', overflow: 'hidden' }}>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/bind-partner" element={<BindPartnerScreen />} />

        {/* Sub-screens */}
        <Route path="/period" element={<PeriodScreen />} />
        <Route path="/period-history" element={<PeriodHistoryScreen />} />
        <Route path="/ledger" element={<LedgerScreen />} />
        <Route path="/goals" element={<GoalsScreen />} />
        <Route path="/plans" element={<PlansScreen />} />
        <Route path="/checkin" element={<CheckinScreen />} />

        {/* Tabs (catch all that includes / /record /chat /memories /profile) */}
        <Route
          path="/*"
          element={
            !isLoggedIn ? <Navigate to="/login" replace /> :
            !user?.hasSetAvatar ? <Navigate to="/onboarding" replace /> :
            !isBound ? <Navigate to="/bind-partner" replace /> :
            <TabsLayout />
          }
        />
      </Routes>
    </div>
  )
}
