/**
 * Chargeur WASM pour sql.js
 * Ce fichier expose les fichiers WASM nécessaires depuis node_modules
 */

// Configuration pour que sql.js puisse charger ses fichiers WASM
window.SQL_WASM_URL = '/node_modules/sql.js/dist/sql-wasm.wasm';
window.SQL_JS_URL = '/node_modules/sql.js/dist/sql-wasm.js';

console.log('SQL.js WASM loader configured');