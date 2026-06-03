import { describe, it, expect } from 'vitest';
import { cardKey, buildCardMap } from './cardData';
import { makeCard } from '$lib/test/factories';

describe('cardKey', () => {
  it('cardID があればそれを使う', () => {
    expect(cardKey(makeCard({ cardID: 'WX-001' }))).toBe('WX-001');
  });

  it('cardID が null なら image をキーにする', () => {
    expect(cardKey({ cardID: null, image: 'header/x.webp' })).toBe('header/x.webp');
  });
});

describe('buildCardMap', () => {
  it('cardKey をキーにした Map を作る', () => {
    const a = makeCard({ cardID: 'A' });
    const b = makeCard({ cardID: 'B' });
    const map = buildCardMap([a, b]);
    expect(map.size).toBe(2);
    expect(map.get('A')).toBe(a);
    expect(map.get('B')).toBe(b);
  });

  it('同一キーは後勝ちで上書きする', () => {
    const a1 = makeCard({ cardID: 'A', name: '旧' });
    const a2 = makeCard({ cardID: 'A', name: '新' });
    const map = buildCardMap([a1, a2]);
    expect(map.size).toBe(1);
    expect(map.get('A')?.name).toBe('新');
  });
});
