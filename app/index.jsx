import { Redirect } from 'expo-router'
import { useStore } from '../store/useStore'

export default function Index() {
  const isLoggedIn = useStore(s => s.isLoggedIn)
  const hasSetAvatar = useStore(s => s.user.hasSetAvatar)
  const isBound = useStore(s => s.isBound)
  const skippedBind = useStore(s => s.skippedBind)

  if (!isLoggedIn) return <Redirect href="/login" />
  if (!hasSetAvatar) return <Redirect href="/onboarding" />
  if (!isBound && !skippedBind) return <Redirect href="/bind-partner" />
  return <Redirect href="/(tabs)" />
}
