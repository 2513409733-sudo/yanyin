// Shim for expo-clipboard using browser Clipboard API
export const setStringAsync = (text) =>
  navigator.clipboard?.writeText(text) ?? Promise.resolve()

export const getStringAsync = () =>
  navigator.clipboard?.readText() ?? Promise.resolve('')

export const setString = (text) => { navigator.clipboard?.writeText(text) }

export const hasStringAsync = async () => {
  const t = await navigator.clipboard?.readText()
  return !!t
}
