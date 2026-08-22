#!/usr/bin/env node
/* ブリッジの取りこぼしを検査する。
 *
 * app.css の @theme は Tailwind の色名を Suisou のトークンに畳んでいるが、
 * **対応表に無い色は黙って素通りする** ―― Tailwind の生の色がそのまま出て、
 * しかも見た目は「それっぽい」ので気づけない。実際に2回やられている:
 *
 *   2026-08-21  neutral-700   モーダルの罫が Suisou を通らず、枠線が出ていないように見えた
 *   2026-08-21  white (45箇所) 文字が純白のままテーマに追従していなかった
 *
 * 対応表に足すのを忘れても CI が落ちるようにする。
 * 素通りさせたい色（ドメイン色など）は ALLOW に理由付きで書く。
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PALETTES =
  'white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const UTIL =
  'bg|text|border|ring|fill|stroke|divide|from|via|to|placeholder|accent|caret|outline|shadow';

/** 素通りを許す色と、その理由 */
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
直し方は3つのどれか:
  1. src/app.css の @theme に --color-${[...found.keys()][0]}: var(--suisou-…) を足す
  2. テンプレート側を data-suisou-* の部品に変える
  3. 現場が持つべき色なら :root に --… として置き、このファイルの ALLOW に理由を書く
`);
process.exit(1);
