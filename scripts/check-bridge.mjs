#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PALETTES =
  'white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const UTIL =
  'bg|text|border|ring|fill|stroke|divide|from|via|to|placeholder|accent|caret|outline|shadow';

const ALLOW = new Map([]);

const walk = (d) =>
  readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    if (f === 'node_modules' || f === '.svelte-kit') return [];
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.svelte') ? [p] : [];
  });

const bridged = new Set(
  [...readFileSync('src/app.css', 'utf8').matchAll(/--color-([a-z0-9-]+)\s*:/g)].map((m) => m[1]),
);

const re = new RegExp(
  `(?:^|[\\s"'\`])(?:[a-z-]+:)*(?:${UTIL})-((?:${PALETTES})(?:-\\d+)?)(?:/\\d+)?(?=[\\s"'\`]|$)`,
  'g',
);
const found = new Map();
for (const file of walk('src')) {
  for (const m of readFileSync(file, 'utf8').matchAll(/class(?:Name)?=(?:"([^"]*)"|'([^']*)')/g)) {
    for (const hit of (m[1] ?? m[2] ?? '').matchAll(re)) {
      const tok = hit[1];
      if (bridged.has(tok) || ALLOW.has(tok)) continue;
      if (!found.has(tok)) found.set(tok, new Set());
      found.get(tok).add(file);
    }
  }
}

if (found.size === 0) {
  console.log(`ブリッジ検査: 素通りなし（対応表 ${bridged.size} 色）`);
  process.exit(0);
}
console.error('★ブリッジを素通りしている色があります。Suisou のトークンに繋がっていません。\n');
for (const [tok, files] of [...found].sort()) {
  console.error(`  ${tok}`);
  for (const f of files) console.error(`      ${f}`);
}
console.error(`
直し方:
  1. 文字なら data-suisou-text="sub|accent|success|warning|error"
  2. 面・罫なら data-suisou-surface / scoped style で var(--suisou-*) を参照する
  3. ドメインの色なら :root に --… として置き、このファイルの ALLOW に理由を書く
`);
process.exit(1);
