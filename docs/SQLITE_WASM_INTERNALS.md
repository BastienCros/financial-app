# SQLite WASM Internals

How SQLite runs in the browser: the three actors, the VFS layer, and the sync/async bridge.

---

## What "SQLite WASM" means

SQLite WASM is the SQLite C source compiled to WebAssembly. It is the same C code that runs natively on Linux or macOS — the `.wasm` binary is just a different compilation target. The JS glue (`sqlite3.mjs`) loads the binary and exposes a JS API around it.

---

## The three actors

```
┌─────────────────────────────────┐
│  db.worker.ts (your Worker)     │
│                                 │
│  SQLite WASM runs here          │
│  OPFS VFS stub runs here        │
│  → blocks on Atomics.wait       │
└──────────────┬──────────────────┘
               │ SharedArrayBuffer (sabOP + sabIO)
               │ Atomics.notify / Atomics.wait
┌──────────────▼──────────────────┐
│  sqlite3-opfs-async-proxy.js    │
│  (Worker spawned by sqlite3.mjs)│
│                                 │
│  infinite waitLoop()            │
│  → calls await fileHandle.X()  │
│  → writes result back to SAB   │
└──────────────┬──────────────────┘
               │ navigator.storage OPFS API
┌──────────────▼──────────────────┐
│  Browser OPFS                   │
│  Origin Private File System     │
│  Actual file on disk            │
└─────────────────────────────────┘
```

---

## The OPFS VFS

SQLite C does not know about OPFS. It accesses files through a **VFS** (Virtual File System): a struct of C function pointers (`xOpen`, `xRead`, `xWrite`, `xClose`, `xSync`, `xTruncate`, ...). On Linux these point to `open()`/`read()`/`write()`. In the browser, `sqlite3.mjs` registers a custom VFS via `sqlite3_vfs_register` that points to JS implementations instead.

The VFS runs in `db.worker.ts` alongside SQLite. When SQLite calls `xRead`, the VFS JS code runs in that same worker.

---

## The sync/async problem

The OPFS VFS needs to call the browser's OPFS API to actually read/write the file. But:

- The browser OPFS API is **async** (`await fileHandle.read(...)`)
- SQLite C calls the VFS **synchronously** — it expects `xRead` to return a value, not a Promise

These two constraints cannot coexist in one thread. The solution is two workers with a shared-memory bridge.

---

## The bridge: SharedArrayBuffer + Atomics

Two `SharedArrayBuffer`s are allocated when the OPFS VFS is installed:

| Buffer | Purpose |
|--------|---------|
| `sabOP` | Coordination: which operation to run (`whichOp`), return code (`rc`) |
| `sabIO` | Data: file bytes for read/write, serialized function arguments |

**Protocol for one file operation (e.g. `xRead`):**

```
db.worker.ts                          proxy worker
─────────────────────────────────     ────────────────────────────
VFS xRead() is called by SQLite C
write fid, offset, n → sabIO.s11n
write opId → sabOP.whichOp
Atomics.notify(sabOP.whichOp)  ──►   wakes from Atomics.wait()
                                      reads opId from sabOP
                                      reads args from sabIO.s11n
                                      await syncHandle.read(sabIO, {at: offset})
                                      write rc → sabOP.rc
◄── Atomics.notify(sabOP.rc)
read rc → return to SQLite C
```

`db.worker.ts` is frozen during the wait. From SQLite C's perspective, `xRead` returned synchronously.

---

## The proxy worker in detail

`sqlite3-opfs-async-proxy.js` is spawned internally by `sqlite3.mjs` — not by application code. It has no SQLite code. Its only job is `waitLoop()`:

```js
while (true) {
    Atomics.wait(sabOP, opIds.whichOp, 0, idleTimeout)  // sleep
    const opId = Atomics.load(sabOP, opIds.whichOp)
    const args = s11n.deserialize()                      // read args from sabIO
    await vfsAsyncImpls[opId](...args)                   // call OPFS, then Atomics.notify(rc)
}
```

`vfsAsyncImpls` maps each VFS operation to its real browser OPFS call:

| VFS op | Browser call |
|--------|-------------|
| `xOpen` | `dirHandle.getFileHandle(name, {create})` |
| `xRead` | `syncHandle.read(sabIO, {at: offset})` |
| `xWrite` | `syncHandle.write(sabIO, {at: offset})` |
| `xClose` | `syncHandle.close()` |
| `xSync` | `syncHandle.flush()` |
| `xTruncate` | `syncHandle.truncate(size)` |
| `xDelete` | `dirHandle.removeEntry(name)` |

File data travels through `sabIO` directly — no `postMessage` copy.

---

## Why two workers, not one

`Atomics.wait` is blocking — it freezes the thread. Browsers disallow blocking on the main thread; it is only allowed in Workers.

`await` is non-blocking — the thread stays alive while waiting. You cannot `await` from inside a C call stack.

One thread cannot do both. Two workers with a SAB bridge is the only viable design.

---

## Related docs

- [SQLITE_WASM_PATCHING.md](./SQLITE_WASM_PATCHING.md) — why the library requires patching for Next.js and how
- [architecture.md](./architecture.md) — full application architecture
