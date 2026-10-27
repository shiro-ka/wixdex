import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function renderMemoHtml(memo: string): string {
  return DOMPurify.sanitize(marked(memo || '*メモをクリックして編集*') as string);
}
