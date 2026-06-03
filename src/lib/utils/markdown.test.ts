// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderMemoHtml } from './markdown';

describe('renderMemoHtml', () => {
  it('script タグを除去する', () => {
    const out = renderMemoHtml('<scr' + 'ipt>alert(1)</scr' + 'ipt>こんにちは');
    expect(out.toLowerCase()).not.toContain('<script');
    expect(out).toContain('こんにちは');
  });

  it('onerror などのイベントハンドラ属性を除去する', () => {
    const out = renderMemoHtml('<img src=x onerror="alert(1)">');
    expect(out.toLowerCase()).not.toContain('onerror');
  });

  it('javascript: スキームのリンクを無害化する', () => {
    const out = renderMemoHtml('[x](javascript:alert(1))');
    expect(out.toLowerCase()).not.toContain('javascript:');
  });

  it('基本的な Markdown は保持する', () => {
    const out = renderMemoHtml('**太字** と [link](https://example.com)');
    expect(out).toContain('<strong>太字</strong>');
    expect(out).toContain('href="https://example.com"');
  });

  it('空メモはプレースホルダを表示する', () => {
    expect(renderMemoHtml('')).toContain('メモをクリックして編集');
  });
});
