#!/usr/bin/env node
/*
  Convert backend/data/scenarios.json: email.mjml -> email.html (preserve mjml as email.mjmlBackup).
  Keeps exact visual via MJML IO API.
*/
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const fetch = global.fetch || require('node-fetch');

const SC_PATH = path.join(__dirname, '..', 'data', 'scenarios.json');

function mjmlEntries(list = []) {
  const out = [];
  for (const s of list) {
    if (s && s.email && typeof s.email.mjml === 'string' && s.email.mjml.trim() && !s.email.html) {
      out.push(s);
    }
  }
  return out;
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
  const raw = fs.readFileSync(SC_PATH, 'utf8');
  const arr = JSON.parse(raw);
  const targets = mjmlEntries(arr);
  if (targets.length === 0) {
    console.log('No scenarios to migrate.');
    return;
  }
  const backupPath = SC_PATH.replace(/\.json$/, `.bak.${Date.now()}.json`);
  fs.copyFileSync(SC_PATH, backupPath);
  console.log('Backup:', backupPath);

  let migrated = 0, failed = 0;
  for (const s of targets) {
    try {
      const html = await mjmlToHtml(s.email.mjml);
      s.email.html = html;
      s.email.mjmlBackup = s.email.mjml;
      migrated++;
      console.log(`[OK] ${s.id}`);
    } catch (e) {
      failed++;
      console.warn(`[FAIL] ${s.id} -> ${e.message}`);
    }
  }

  fs.writeFileSync(SC_PATH, JSON.stringify(arr, null, 2) + '\n', 'utf8');
  console.log(`Done. migrated=${migrated} failed=${failed}`);
}

main().catch((e) => {
  console.error('Migration error:', e?.message || e);
  process.exit(1);
});

