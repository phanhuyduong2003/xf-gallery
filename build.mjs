// Builds xenforo-thread-gallery.user.js from the parts in src/, joined in file-name order.
// The parts are not modules: they are consecutive pieces of one function and share its scope,
// so the built file is exactly what a userscript manager (and Greasy Fork) expects.
//
//   node build.mjs           write the userscript
//   node build.mjs --check   exit 1 if the userscript is not up to date with src/
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
const srcDir = join(root, 'src');
const out = join(root, 'xenforo-thread-gallery.user.js');

const parts = readdirSync(srcDir).filter((f) => f.endsWith('.js')).sort();
const code = parts.map((f) => {
  const text = readFileSync(join(srcDir, f), 'utf8').replace(/\r\n/g, '\n');
  return text.endsWith('\n') ? text : text + '\n';
}).join('');

if (process.argv.includes('--check')) {
  let current = '';
  try { current = readFileSync(out, 'utf8').replace(/\r\n/g, '\n'); } catch { /* missing */ }
  if (current !== code) {
    console.error('xenforo-thread-gallery.user.js is out of date: run "node build.mjs"');
    process.exit(1);
  }
  console.log('xenforo-thread-gallery.user.js is up to date');
} else {
  writeFileSync(out, code);
  console.log(`built xenforo-thread-gallery.user.js from ${parts.length} parts (${code.split('\n').length - 1} lines)`);
}
