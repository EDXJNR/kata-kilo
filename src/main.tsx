import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { NavProvider } from '@/context/NavContext'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <NavProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </NavProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)
