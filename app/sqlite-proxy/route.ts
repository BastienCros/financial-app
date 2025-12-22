import path from 'node:path';
import fs from 'node:fs';

const proxyPath = path.join(process.cwd(), 'public', 'sqlite', 'sqlite3-opfs-async-proxy.js');
const proxyContent = fs.readFileSync(proxyPath);

export async function GET() {
    return new Response(proxyContent, {
        headers: {
            'Content-Type': 'application/javascript',
            'Cross-Origin-Resource-Policy': 'same-origin',
        }
    });
}