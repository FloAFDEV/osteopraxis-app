
import React from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import './index.css'

// S'assurer que l'élément racine existe
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Élément racine non trouvé')
}

// Rendre l'application immédiatement (pas d'écouteur DOMContentLoaded)
const root = createRoot(rootElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
