import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * デッキメモの Markdown を HTML 化し、DOMPurify で無害化して返す。
 * `<script>` やイベントハンドラ属性（onerror 等）、javascript: スキームは除去される。
 * DOMPurify はブラウザ DOM を要するため、呼び出しはクライアント側のみ（SSR では使わない）。
 */
export function renderMemoHtml(memo: string): string {
  return DOMPurify.sanitize(marked(memo || '*メモをクリックして編集*') as string);
}
