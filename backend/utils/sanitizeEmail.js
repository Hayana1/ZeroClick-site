// backend/utils/sanitizeEmail.js
// Minimal sanitizer for scenario email HTML to avoid script/JS URLs and event handlers.

function sanitizeEmailHtml(html) {
  if (!html) return '';
  let out = String(html);
  // Remove script and style blocks
  out = out.replace(/<script[\s\S]*?<\/script>/gi, '');
  out = out.replace(/<style[\s\S]*?<\/style>/gi, '');
  // Remove on* event handler attributes
  out = out.replace(/\s+on[a-z]+\s*=\s*(["']).*?\1/gi, '');
  // Neutralize javascript: and data: URLs in href/src
  out = out.replace(/(href|src)\s*=\s*(["'])(javascript:|data:)/gi, '$1=$2#');
  // Allow basic tags only? keep broadly but strip iframe/object/embed
  out = out.replace(/<\/?(iframe|object|embed|link|meta)[^>]*>/gi, '');
  return out;
}

module.exports = { sanitizeEmailHtml };

