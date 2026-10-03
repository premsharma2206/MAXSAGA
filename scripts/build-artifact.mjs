/**
 * Build the publishable copy of the storefront.
 *
 * Artifact pages are wrapped in a <!doctype html><head></head><body> skeleton
 * at publish time, so the page may not carry a shell of its own. This script
 * takes index.html — which IS a full document, so it opens straight off disk —
 * and emits dist/index.html with the shell removed and the <head> contents
 * hoisted to the top of the body. Stylesheets, the font link and the Tailwind
 * script all work there, so nothing else has to change.
 *
 * Asset paths are left alone: the assets/ files are published at the same
 * relative paths the markup already references.
 *
 * Usage: node scripts/build-artifact.mjs
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'index.html');
const target = resolve(root, 'dist/index.html');

const html = await readFile(source, 'utf8');

const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

if (!head || !body) {
  throw new Error('index.html is missing a <head> or <body> — cannot build the artifact copy.');
}

// <meta charset> and <meta viewport> are supplied by the artifact skeleton.
const headContent = head[1]
  .replace(/^[ \t]*<meta\s+charset[^>]*>\s*$/gim, '')
  .replace(/^[ \t]*<meta\s+name=["']viewport["'][^>]*>\s*$/gim, '')
  .trim();

const out = [
  '<!-- Built by scripts/build-artifact.mjs from index.html. Edit the source, not this file. -->',
  headContent,
  '',
  body[1].trim(),
  ''
].join('\n');

await mkdir(dirname(target), { recursive: true });
await writeFile(target, out, 'utf8');

console.log(`dist/index.html written (${(out.length / 1024).toFixed(1)} KB)`);
