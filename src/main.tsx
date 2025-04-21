
import { createRoot } from 'react-dom/client'
import React from 'react' // Explicitly import React
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from './contexts/theme-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a client outside of the render function
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Ensure we have the React object in scope
const root = createRoot(document.getElementById("root")!);

// Use React.createElement or JSX with explicit React import
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
