import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { TournamentProvider } from './context/TournamentContext'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* AuthProvider wraps everything — provee sesión y perfil a toda la app */}
    <AuthProvider>
      <TournamentProvider>
        <App />
      </TournamentProvider>
    </AuthProvider>
  </StrictMode>,
)
