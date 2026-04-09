// Shim for expo-router when running under Vite
import { useNavigate, useSearchParams } from 'react-router-dom'

export const useRouter = () => {
  const navigate = useNavigate()
  return {
    back: () => navigate(-1),
    push: (path) => navigate(path),
    replace: (path) => navigate(path, { replace: true }),
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
