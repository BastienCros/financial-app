import path from 'node:path';
import fs from 'node:fs';

const wasmPath = path.join(process.cwd(), 'public', 'sqlite', 'sqlite3.wasm');
const wasmBuffer = fs.readFileSync(wasmPath);

export async function GET() {

    return new Response(wasmBuffer, {
        headers: {
            'Content-Type': 'application/wasm',
            'Cross-Origin-Resource-Policy': 'same-origin',
        }
    });
}