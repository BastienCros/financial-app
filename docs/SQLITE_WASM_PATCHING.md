# SQLite WASM Patching in Next.js

## Introduction

This document explains the rationale for patching `@sqlite.org/sqlite-wasm` to work in Next.js, the design decisions behind the library's approach, and the security implications of the workaround.

### The Problem

The `@sqlite.org/sqlite-wasm` library does not work in Next.js out-of-the-box. Without patching:
- CORS errors prevent WASM binary loading
- OPFS (Origin Private File System) is unavailable
- Database initialization fails

**Root cause:** The library uses `import.meta.url` for file resolution, which resolves to `file://` URLs in Next.js instead of HTTP URLs.

---

## Why the Library Uses import.meta.url

### Design Intent: Static Hosting + Vanilla ES Modules

From the **SQLite WASM documentation** (https://sqlite.org/wasm/doc/trunk/index.md):

> "The canonical builds are designed to be loaded as ES6 modules via `<script type=module>` tags or `import` statements in JS code."

The library assumes:
1. All files (`sqlite3.mjs`, `sqlite3.wasm`, `sqlite3-opfs-async-proxy.js`) are in the same directory
2. Files are served from a static file server (Apache, Nginx, GitHub Pages)
3. No bundler is involved

**Example target use case:**
```html
<script type="module">
  import sqlite3InitModule from './sqlite-wasm/jswasm/sqlite3.mjs';
  const sqlite3 = await sqlite3InitModule();
</script>
```

With this setup, `import.meta.url` points to `https://example.com/assets/sqlite3.mjs`, allowing the library to construct paths to adjacent files.

### Emscripten's Default Behavior

From the **Emscripten documentation** (https://emscripten.org/docs/api_reference/module.html#Module.locateFile):

> "This function is called by `Module.locate`. By default it returns `Module.locatePrefix + path` for normal paths, and for data files (extensions .js.mem, .wasm, .data) it returns `script_dir + path`, where `script_dir` is determined from `import.meta.url`."

Emscripten's rationale:
- C/C++ compiled to WASM has no knowledge of JavaScript module systems
- The generated "glue code" must locate the WASM binary
- Default assumption: WASM binary is adjacent to the JavaScript module
- ES6 standard provides `import.meta.url` to get the current module's location

From **Emscripten issue tracker** discussions:
> "The reason for using `import.meta.url` is that it's the only reliable way to determine the location of the module in ES6 module contexts. Other approaches like `document.currentScript` don't work in modules."

**Why hardcoded in pre-JS:**

Emscripten injects initialization code (called "pre-JS") that runs before user configuration is processed. The `Module['locateFile']` assignment happens in this pre-JS phase because the WASM loading process needs to know where to find files before user configuration can be applied.

Timeline:
1. Pre-JS sets default `Module['locateFile']` (line 62)
2. WASM loading begins using `Module.locateFile()`
3. User configuration merged (too late - locateFile already called)

---

## Why It Breaks in Next.js

### Bundler Differences

| Environment        | import.meta.url Resolution                                              | Result |
|--------------------|--------------------------------------------------------------------------|--------|
| Vite (dev)         | http://localhost:5173/node_modules/.vite/deps/sqlite3.js                  | Works |
| Next.js (dev)      | file:///Users/.../node_modules/@sqlite.org/sqlite-wasm/.../sqlite3.wasm   | Blocked |
| Next.js (prod)     | Internal .next chunk / server path                                        | Not accessible |
| Static hosting     | https://example.com/assets/sqlite3.mjs                                    | Works |

### Why

- Vite
  - Serves node_modules over HTTP in dev
  - Copies WASM to output and rewrites URLs
- Next.js
  - Does not serve node_modules to the browser
  - Does not rewrite import.meta.url
  - Leaves file:// URLs, which browsers block

### Result

import.meta.url works in Vite because it becomes a web URL.  
In Next.js it becomes a filesystem URL, which the browser cannot load.

---

## The Patching Solution

### Two Required Patches

**Patch #1 (sqlite3.mjs line 62-65):** Disable hardcoded `Module['locateFile']`

Original:
```javascript
Module['locateFile'] = function (path, prefix) {
  return new URL(path, import.meta.url).href;
}.bind(sIMS);
```

Patched:
```javascript
// SQLITE PATCH: Disable hardcoded locateFile to allow custom file resolution
// Module['locateFile'] = function (path, prefix) {
//   return new URL(path, import.meta.url).href;
// }.bind(sIMS);
```

**Rationale:** Complete removal is necessary because this code runs in Emscripten's pre-JS phase, before user configuration is processed. A conditional check wouldn't work because the user's custom `locateFile` hasn't been merged yet.

**Patch #2 (sqlite3.mjs line 11700):** Use custom locateFile for proxy worker

Original:
```javascript
const W = new Worker(new URL(options.proxyUri, import.meta.url));
```

Patched:
```javascript
const W = new Worker(
  locateFile(options.proxyUri) ?? new URL(options.proxyUri, import.meta.url)
);
```

**Rationale:** OPFS requires a separate worker (`sqlite3-opfs-async-proxy.js`). The original code also uses `import.meta.url`, which fails in Next.js for the same reason.

### The Workaround Architecture

With patches applied, we provide a custom `locateFile` function (in `src/lib/db/db.worker.ts`) that routes file requests to Next.js API routes:

- `sqlite3.wasm` → GET `/sqlite` (serves from `node_modules`)
- `sqlite3-opfs-async-proxy.js` → GET `/sqlite-proxy` (serves from `node_modules`)

Files are read from `node_modules` at server startup and served with appropriate headers.

**Why API routes instead of copying to `/public`:**
- Automation: Files auto-update when library version changes
- No manual copy step
- No version mismatch risk
- Single source of truth (node_modules)

---

## Security Implications

### Required: COOP and COEP Headers

From **MDN SharedArrayBuffer documentation**:

> "As a baseline requirement, your document needs to be cross-origin isolated... This is achieved using the COOP and COEP headers."

`next.config.ts` sets:
```typescript
'Cross-Origin-Opener-Policy': 'same-origin'
'Cross-Origin-Embedder-Policy': 'require-corp'
```

**Why mandatory:**

1. **SharedArrayBuffer requirement:** OPFS synchronous API requires SharedArrayBuffer
2. **Browser enforcement:** Without COOP+COEP, SharedArrayBuffer is undefined
3. **Security trade-off:** These headers isolate your site (can't interact with cross-origin windows/iframes)

**Impact:** Your application becomes "cross-origin isolated" - external sites cannot embed your pages, and you cannot embed external resources without proper CORP headers.

Sources:
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements

### Same-Origin Resource Policy

API routes set `'Cross-Origin-Resource-Policy': 'same-origin'` on WASM files.

**Purpose:**
- Prevents other origins from loading your WASM binary
- Required to comply with COEP
- Mitigates resource timing attacks

**Implication:** WASM files cannot be served from a separate CDN. They must be deployed with your application.

### File Serving Considerations

The implementation serves specific hardcoded files from `node_modules`:
- `sqlite3.wasm`
- `sqlite3-opfs-async-proxy.js`

These file paths are hardcoded in the API route source code. No user input determines which files are served, eliminating path traversal risks.

---

## Maintenance

### Verifying Patches

```bash
grep "SQLITE PATCH" node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/sqlite3.mjs
```

Should return two matches. If empty, patches are not applied (run `pnpm install`).

### Updating the Library

When updating `@sqlite.org/sqlite-wasm`, the patch may fail to apply if the line numbers changed.

**Regenerate patch:**
```bash
pnpm patch @sqlite.org/sqlite-wasm
# Manually apply the same two changes
pnpm patch-commit <path>
```

Verify functionality after updating:
- Check browser console for "OPFS is available" message
- Verify no CORS errors
- Test database operations

### Common Issues

**OPFS unavailable:** Patch #2 not applied or `/sqlite-proxy` route not working

**CORS errors:** Patch #1 not applied or `/sqlite` route not working

**SharedArrayBuffer undefined:** Missing COOP/COEP headers in `next.config.ts`

---

## Why Not Alternative Approaches?

### Copy to /public Directory

**Rejected because:**
- Manual copy step (easy to forget on updates)
- Version mismatch risk (outdated files)
- Still requires patching (doesn't solve `import.meta.url` issue)

### Use Bundler-Friendly Variant

From SQLite docs: "Experimental build variant for webpack/rollup. Completely untested."

**Rejected because:**
- Marked experimental and untested
- Missing features compared to main build
- No official Next.js compatibility

### Fork the Library

**Rejected because:**
- High maintenance burden
- Misses upstream security fixes
- Not justified for a 2-line patch

**Conclusion:** pnpm patches are the pragmatic solution for minimal third-party modifications.

---

## Design Trade-offs Accepted

**Benefits:**
- Client-side SQL database with persistent storage
- No backend infrastructure required
- Complete data privacy (never leaves device)

**Costs:**
- Patch maintenance (regenerate on library updates)
- Cannot use CDN for WASM files (same-origin requirement)
- Site becomes cross-origin isolated (COOP/COEP headers)

**Verdict:** Benefits outweigh costs for this use case.

---

## References

### Official Documentation
1. SQLite WASM: https://sqlite.org/wasm/doc/trunk/index.md
2. Emscripten Module API: https://emscripten.org/docs/api_reference/module.html
3. MDN import.meta: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta
4. MDN COOP: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy
5. MDN COEP: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy
6. MDN SharedArrayBuffer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer

### Related Documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture decisions
- [CONCURRENCY_RACE_CONDITION.md](./CONCURRENCY_RACE_CONDITION.md) - MessageChannel issues
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Implementation status

---

*Last updated: 2025-12-22*
