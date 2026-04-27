// Shim for expo-router when running under Vite
import { useNavigate, useSearchParams } from 'react-router-dom'

// Map Expo Router paths to web paths
function toWebPath(path) {
  if (path === '/(tabs)' || path === '/(tabs)/index') return '/'
  return path.replace(/\/\(tabs\)/, '')
}

export const useRouter = () => {
  const navigate = useNavigate()
  return {
    back: () => navigate(-1),
    push: (path) => navigate(toWebPath(path)),
    replace: (path) => navigate(toWebPath(path), { replace: true }),
  }
}

export const useLocalSearchParams = () => {
  const [params] = useSearchParams()
  return Object.fromEntries(params.entries())
}

// These are used in _layout files which we bypass in the web build
export const Link = () => null
export const Stack = { Screen: () => null }
export const Tabs = { Screen: () => null }
