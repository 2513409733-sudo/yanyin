import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['fonts/*.ttf', 'icons/*.png'],
      manifest: {
        name: '盐音',
        short_name: '盐音',
        description: '我们的私密小空间',
        theme_color: '#fdf6e3',
        background_color: '#fdf6e3',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        lang: 'zh-CN',
        icons: [
          { src: '/icons/icon-64.png',  sizes: '64x64',   type: 'image/png' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,ttf,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MiB (font is 2.77 MiB)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 10 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      'react-native': path.resolve(__dirname, 'node_modules/react-native-web/dist/index.js'),
      'expo-router': path.resolve(__dirname, 'src/web/expo-router.js'),
      'expo-image': path.resolve(__dirname, 'src/web/expo-image.jsx'),
      'expo-image-picker': path.resolve(__dirname, 'src/web/expo-image-picker.js'),
      'expo-clipboard': path.resolve(__dirname, 'src/web/expo-clipboard.js'),
    },
    extensions: ['.web.jsx', '.web.js', '.web.ts', '.web.tsx', '.jsx', '.js', '.ts', '.tsx'],
  },
  define: {
    global: 'window',
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    // Map Vite env vars → process.env.EXPO_PUBLIC_* so firebase.js works in both Expo and Vite
    'process.env.EXPO_PUBLIC_FIREBASE_API_KEY':            JSON.stringify(process.env.VITE_FIREBASE_API_KEY            || ''),
    'process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN':        JSON.stringify(process.env.VITE_FIREBASE_AUTH_DOMAIN        || ''),
    'process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID':         JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID         || ''),
    'process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET':     JSON.stringify(process.env.VITE_FIREBASE_STORAGE_BUCKET     || ''),
    'process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID':JSON.stringify(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| ''),
    'process.env.EXPO_PUBLIC_FIREBASE_APP_ID':             JSON.stringify(process.env.VITE_FIREBASE_APP_ID             || ''),
  },
  build: {
    outDir: 'dist-pwa',
  },
})
