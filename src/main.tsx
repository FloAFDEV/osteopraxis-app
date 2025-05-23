
import React from 'react' 
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './contexts/theme-context'

import App from './App.tsx'
import './index.css'

// Import AuthProvider après les autres imports pour éviter les problèmes de dépendances circulaires
import { AuthProvider } from './contexts/AuthContext'

// Créer le QueryClient avec les options par défaut en dehors du rendu
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// S'assurer que l'élément racine existe
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Élément racine non trouvé");
}

// Créer root et puis rendre l'application de façon asynchrone pour éviter les problèmes d'initialisation
const root = createRoot(rootElement);

// Attendre que le DOM soit complètement chargé avant de monter l'application
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    try {
      root.render(
        <React.StrictMode>
          <Router>
            <ThemeProvider>
              <QueryClientProvider client={queryClient}>
                <AuthProvider>
                  <App />
                </AuthProvider>
              </QueryClientProvider>
            </ThemeProvider>
          </Router>
        </React.StrictMode>
      );
    } catch (error) {
      console.error("Erreur lors du rendu de l'application:", error);
    }
  }, 0);
});
