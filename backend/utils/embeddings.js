const EMBED_ENDPOINT = 'https://api.openai.com/v1/embeddings';

async function embedTexts(texts = []) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.EMBED_MODEL || 'text-embedding-3-small';
  if (!apiKey) throw new Error('OPENAI_API_KEY missing');
  const input = texts.map((t) => String(t || '').slice(0, 8000));
  const r = await fetch(EMBED_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, input }),
  });
  if (!r.ok) throw new Error(`embed HTTP ${r.status}`);
  const data = await r.json();
  return (data.data || []).map((d) => d.embedding);
}

function cosine(a = [], b = []) {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) { const x = a[i] || 0; const y = b[i] || 0; dot += x*y; na += x*x; nb += y*y; }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

module.exports = { embedTexts, cosine };

