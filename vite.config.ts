import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { copyFileSync, existsSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Copier sql-wasm.wasm depuis node_modules vers public
  const wasmSrc = path.join(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm');
  const wasmDest = path.join(process.cwd(), 'public/sql-wasm.wasm');
  
  if (existsSync(wasmSrc) && !existsSync(wasmDest)) {
    try {
      copyFileSync(wasmSrc, wasmDest);
      console.log('✅ sql-wasm.wasm copié vers public/');
    } catch (error) {
      console.warn('⚠️ Impossible de copier sql-wasm.wasm:', error);
    }
  }

  return {
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
  };
});