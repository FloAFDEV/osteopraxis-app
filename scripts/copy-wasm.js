import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function copyWasmFiles() {
  const sqlWasmPath = resolve(__dirname, '../node_modules/sql.js/dist/sql-wasm.wasm');
  const publicDir = resolve(__dirname, '../public');
  const publicWasmPath = resolve(publicDir, 'sql-wasm.wasm');
  
  // Créer le dossier public s'il n'existe pas
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }
  
  if (existsSync(sqlWasmPath)) {
    copyFileSync(sqlWasmPath, publicWasmPath);
    console.log('✅ sql-wasm.wasm copied to public folder');
  } else {
    console.warn('⚠️ sql-wasm.wasm not found in node_modules');
  }
}

copyWasmFiles();