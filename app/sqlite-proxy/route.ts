  import path from 'node:path';
  import fs from 'node:fs';

  const proxyPath = 'node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/sqlite3-opfs-async-proxy.js';
  const proxyContent = fs.readFileSync(path.resolve(process.cwd(), proxyPath), 'utf-8');

  export async function GET() {
      return new Response(proxyContent, {
          headers: {
              'Content-Type': 'application/javascript',
              'Cross-Origin-Resource-Policy': 'same-origin',
          }
      });
  }