import AV from 'leancloud-storage'

// process.env.EXPO_PUBLIC_* → injected by Expo at build time
// In Vite builds, vite.config.js maps VITE_LEANCLOUD_* → process.env.EXPO_PUBLIC_LEANCLOUD_*
AV.init({
  appId:     process.env.EXPO_PUBLIC_LEANCLOUD_APP_ID     || '',
  appKey:    process.env.EXPO_PUBLIC_LEANCLOUD_APP_KEY    || '',
  serverURL: process.env.EXPO_PUBLIC_LEANCLOUD_SERVER_URL || '',
})

export { AV }
