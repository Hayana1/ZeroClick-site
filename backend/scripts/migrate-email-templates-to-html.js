#!/usr/bin/env node
/*
  Migrate stored batch email templates from MJML to HTML-as-source.
  - Batches.emailTemplates is a Map: groupName -> { mjmlSource, htmlRendered, metadata? }
  - After migration: mjmlSource will contain the HTML (editor edits HTML),
    metadata.mjmlBackup keeps the original MJML, htmlRendered updated to HTML.

  Safe: does not touch entries that already look like HTML source.
*/
require('dotenv').config();
const mongoose = require('mongoose');
const fetch = global.fetch || require('node-fetch');
const Batch = require('../models/Batch');

function looksHtml(src = '') {
  const s = String(src || '');
  return /<\s*(html|body|table|div|p|span)/i.test(s) && !/^\s*<mjml[\s>]/i.test(s);
}
function looksMjml(src = '') {
  const s = String(src || '');
  return /^\s*<mjml[\s>]/i.test(s) || /<\s*mj-[a-z]/i.test(s);
}
async function mjmlToHtml(mjml) {
  const APP_ID = process.env.MJML_APP_ID;
  const API_SECRET = process.env.MJML_API_SECRET;
  if (!APP_ID || !API_SECRET) throw new Error('MJML credentials missing');
  const auth = Buffer.from(`${APP_ID}:${API_SECRET}`).toString('base64');
  const r = await fetch('https://api.mjml.io/v1/render', {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mjml: String(mjml || ''), keepComments: false, validationLevel: 'strict' }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.message || data?.error || `MJML HTTP ${r.status}`);
  return String(data?.html || '');
}

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = process.env.MONGODB_DB || 'email-campaigns';
  await mongoose.connect(uri, { dbName });

  const batches = await Batch.find({}).lean();
  let total = 0, migrated = 0, skipped = 0, failed = 0;
  for (const b of batches) {
    const map = b.emailTemplates || new Map();
    const entries = Array.isArray(map) ? map : Object.entries(map);
    if (!entries || !entries.length) continue;
    for (const [groupName, tpl] of entries) {
      total++;
      const src = tpl?.mjmlSource || '';
      if (!src || looksHtml(src)) { skipped++; continue; }
      if (!looksMjml(src)) { skipped++; continue; }
      try {
        const html = await mjmlToHtml(src);
        await Batch.updateOne(
          { _id: b._id },
          {
            $set: {
              [`emailTemplates.${groupName}.mjmlSource`]: html,
              [`emailTemplates.${groupName}.htmlRendered`]: html,
              [`emailTemplates.${groupName}.updatedAt`]: new Date(),
              [`emailTemplates.${groupName}.metadata.migratedAt`]: new Date().toISOString(),
              [`emailTemplates.${groupName}.metadata.sourceType`]: 'html',
              [`emailTemplates.${groupName}.metadata.mjmlBackup`]: src,
            },
          }
        );
        migrated++;
        console.log(`[OK] ${b._id} / ${groupName}`);
      } catch (e) {
        failed++;
        console.warn(`[FAIL] ${b._id} / ${groupName} -> ${e.message}`);
      }
    }
  }
  console.log(`Done. total=${total} migrated=${migrated} skipped=${skipped} failed=${failed}`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error('Migration error:', e?.message || e);
  process.exit(1);
});

