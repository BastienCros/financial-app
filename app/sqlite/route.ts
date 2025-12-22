import path from 'node:path';
import fs from 'node:fs';

const wasmRelativePath = 'node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/sqlite3.wasm';
const wasmBuffer = fs.readFileSync(path.resolve(process.cwd(), wasmRelativePath)); // path from root

export async function GET() {

    return new Response(wasmBuffer, {
        headers: {
            'Content-Type': 'application/wasm',
            'Cross-Origin-Resource-Policy': 'same-origin',
        }
    });
}