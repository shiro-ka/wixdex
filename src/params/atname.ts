import type { ParamMatcher } from '@sveltejs/kit';

// ユーザーページ `/@xxx` 専用matcher。`@`始まり(かつ@単体でない)のみマッチさせ、
// `/login` など他のルートや `/てきとう` を巻き込まないようにする。
export const match: ParamMatcher = (param) => param.startsWith('@') && param.length > 1;
