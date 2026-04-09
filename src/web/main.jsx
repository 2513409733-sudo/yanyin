import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'

// Load Cubic11 font
const font = new FontFace('Cubic11', 'url(/fonts/Cubic11.ttf)')
font.load().then(f => document.fonts.add(f)).catch(() => {})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
)
