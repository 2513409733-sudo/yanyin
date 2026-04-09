import { Redirect } from 'expo-router'
import { useStore } from '../store/useStore'

export default function Index() {
  const isLoggedIn = useStore(s => s.isLoggedIn)
  const hasSetAvatar = useStore(s => s.user.hasSetAvatar)

  if (!isLoggedIn) return <Redirect href="/login" />
  if (!hasSetAvatar) return <Redirect href="/onboarding" />
  return <Redirect href="/(tabs)" />
}
