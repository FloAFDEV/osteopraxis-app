
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from './contexts/theme-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <Router>
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster position="top-right" richColors closeButton />
          <App />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  </Router>
);
