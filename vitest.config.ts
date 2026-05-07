import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";
import react from "@vitejs/plugin-react";
import path from "node:path";
import fs from "node:fs";

// Replicates app/sqlite/route.ts and app/sqlite-proxy/route.ts for the Vite test server.
// The worker fetches /sqlite (wasm) and /sqlite-proxy (opfs async proxy) — Next.js route
// handlers serve them in production; this plugin does the same for Vitest's dev server.
function sqliteAssetsPlugin() {
    const wasmPath = path.join(process.cwd(), "public/sqlite/sqlite3.wasm");
    const proxyPath = path.join(
        process.cwd(),
        "public/sqlite/sqlite3-opfs-async-proxy.js",
    );

    return {
        name: "sqlite-assets",
        configureServer(server: any) {
            server.middlewares.use((req: any, res: any, next: any) => {
                if (req.url === "/sqlite") {
                    res.setHeader("Content-Type", "application/wasm");
                    res.setHeader(
                        "Cross-Origin-Resource-Policy",
                        "same-origin",
                    );
                    fs.createReadStream(wasmPath).pipe(res);
                    return;
                }
                if (req.url === "/sqlite-proxy") {
                    res.setHeader("Content-Type", "application/javascript");
                    res.setHeader(
                        "Cross-Origin-Resource-Policy",
                        "same-origin",
                    );
                    fs.createReadStream(proxyPath).pipe(res);
                    return;
                }
                next();
            });
        },
    };
}

// Mirrors next.config.ts Turbopack `raw` rule — Vite has no built-in .sql handler.
function sqlPlugin() {
    return {
        name: "sql-loader",
        transform(code: string, id: string) {
            if (id.endsWith(".sql")) {
                return `export default ${JSON.stringify(code)}`;
            }
        },
    };
}

export default defineConfig({
    plugins: [react(), sqliteAssetsPlugin(), sqlPlugin()],

    resolve: {
        // Array form ensures specific prefixes are checked before the catch-all @
        alias: [
            {
                find: "@/components",
                replacement: path.resolve(process.cwd(), "src/components"),
            },
            {
                find: "@/contexts",
                replacement: path.resolve(process.cwd(), "src/contexts"),
            },
            {
                find: "@/hooks",
                replacement: path.resolve(process.cwd(), "src/hooks"),
            },
            {
                find: "@/helpers",
                replacement: path.resolve(process.cwd(), "src/helpers"),
            },
            {
                find: "@/lib",
                replacement: path.resolve(process.cwd(), "src/lib"),
            },
            {
                find: "@/types",
                replacement: path.resolve(process.cwd(), "src/types"),
            },
            {
                find: "@/data",
                replacement: path.resolve(process.cwd(), "src/data"),
            },
            {
                find: "@/config",
                replacement: path.resolve(process.cwd(), "src/config"),
            },
        ],
    },

    // Pre-bundle @sqlite.org/sqlite-wasm so Vite converts any CJS parts to ESM.
    // Without this, the module worker can't import it and silently aborts before
    // running any code. entries adds the worker file to the startup scan so Vite
    // discovers the dep before any test runs (preventing a mid-run reload).
    optimizeDeps: {
        entries: ["src/lib/db/db.worker.ts", "src/tests/**/*.tsx"],
        include: ["@sqlite.org/sqlite-wasm"],
    },

    server: {
        // COOP + COEP are required for OPFS (Origin Private File System) and SharedArrayBuffer
        // inside the browser page that loads the SQLite worker.
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
        },
    },

    test: {
        setupFiles: ["./src/tests/setup.ts"],
        browser: {
            enabled: true,
            headless: true,
            detailsPanelPosition: "bottom",
            provider: playwright(),
            instances: [{ browser: "chromium" }],
        },
        env: {
            SQL_DB_DEBUG: process.env.SQL_DB_DEBUG || "false",
            NODE_ENV: process.env.NODE_ENV || "test",
        },
    },
});
