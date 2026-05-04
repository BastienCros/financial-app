const fs = require("fs");
const path = require("path");

const SRC_DIR = path.join(
  __dirname,
  "../node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/"
);
const DEST_DIR = path.join(__dirname, "../public/sqlite");

const files = ["sqlite3.wasm", "sqlite3-opfs-async-proxy.js"];

files.forEach((filename) => {
  console.log(path.join(SRC_DIR, filename));
  console.log(DEST_DIR);
  fs.mkdirSync(DEST_DIR, { recursive: true });
  fs.copyFileSync(path.join(SRC_DIR, filename), path.join(DEST_DIR, filename));
  console.log(`✓ Copied ${filename} to public directory`);
});
