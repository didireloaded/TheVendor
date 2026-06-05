export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escapeAttr(value = '') {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

export function safeCssColor(value, fallback = 'var(--primary-500)') {
  const text = String(value || '').trim();
  if (
    /^#[0-9a-f]{3,8}$/i.test(text) ||
    /^var\(--[a-z0-9-]+\)$/i.test(text) ||
    /^linear-gradient\([#%,.\s\w()-]+\)$/i.test(text)
  ) {
    return text;
  }
  return fallback;
}

export function safeHexColor(value, fallback = '#1A6FEF') {
  const text = String(value || '').trim();
  return /^#[0-9a-f]{3,8}$/i.test(text) ? text : fallback;
}

export function safeUrl(value, fallback = '#') {
  const text = String(value || '').trim();
  if (/^(https?:|mailto:|tel:)/i.test(text)) return text;
  return fallback;
}
