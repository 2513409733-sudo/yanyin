import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useStore } from '../store/useStore'

try { SplashScreen.preventAutoHideAsync() } catch {}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Cubic11: require('../assets/fonts/Cubic11.ttf'),
  })

  useEffect(() => {
    if (loaded || error) {
      try { SplashScreen.hideAsync() } catch {}
    }
  }, [loaded, error])

  if (!loaded && !error) return null

  return <RootLayoutNav />
}

function RootLayoutNav() {
  const isLoggedIn = useStore(s => s.isLoggedIn)
  const user = useStore(s => s.user)

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="goals" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="plans" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ledger" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="checkin" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="period" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="period-history" options={{ animation: 'slide_from_right' }} />
      </Stack>
    </>
  )
}
