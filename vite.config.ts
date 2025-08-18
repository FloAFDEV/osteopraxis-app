import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::", // Permet de lier sur toutes les interfaces
    port: 8080,
    allowedHosts: [
      '1de35501-3825-49e0-ac07-d8219f962109.lovableproject.com', // Ajoute ici le host autorisé
      // Tu peux ajouter d'autres hôtes si nécessaire
    ],
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['sql.js'],
    include: []
  },
  define: {
    global: 'globalThis'
  },
  worker: {
    format: 'es'
  },
  assetsInclude: ['**/*.wasm'],
  build: {
    rollupOptions: {
      external: (id) => {
        if (id.includes('sql.js')) return false;
        return false;
      }
    }
  }
}));
