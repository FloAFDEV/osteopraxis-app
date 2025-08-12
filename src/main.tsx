
import React from 'react' 
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


import App from './App.tsx'
import './index.css'

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
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </React.StrictMode>
      );
    } catch (error) {
      console.error("Erreur lors du rendu de l'application:", error);
    }
  }, 0);
});
