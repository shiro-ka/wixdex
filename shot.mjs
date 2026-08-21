import { chromium } from 'playwright';
const url = process.argv[2], out = process.argv[3];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 860 } });
const errs = [];
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await p.screenshot({ path: out + '-1-top.png' });
// ハンバーガーを探して押す
const btn = p.locator('button[aria-label*="メニュー"], header button').last();
try { await btn.click({ timeout: 5000 }); await p.waitForTimeout(700); } catch (e) { errs.push('click: ' + e.message); }
await p.screenshot({ path: out + '-2-menu.png' });
// ドロワーの実寸を測る
const box = await p.evaluate(() => {
  const d = document.querySelector('[data-suisou-surface~="drawer"]');
  if (!d) return 'drawer 要素が無い';
  const r = d.getBoundingClientRect(); const s = getComputedStyle(d);
  return { open: d.matches(':popover-open'), w: Math.round(r.width), h: Math.round(r.height),
           x: Math.round(r.x), pos: s.position, bg: s.backgroundColor, display: s.display };
});
console.log('drawer:', JSON.stringify(box));
console.log('errors:', errs.slice(0, 6));
await b.close();
