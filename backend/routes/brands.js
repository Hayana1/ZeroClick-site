// backend/routes/brands.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.get('/brands', async (_req, res) => {
  try {
    const p = path.join(__dirname, '../data/brands.json');
    const raw = fs.readFileSync(p, 'utf8');
    const data = JSON.parse(raw);
    // Flatten pools -> items for frontend convenience
    let items = [];
    if (Array.isArray(data)) {
      items = data;
    } else if (data && typeof data === 'object') {
      if (Array.isArray(data.items)) items = data.items;
      if (data.pools && typeof data.pools === 'object') {
        for (const [pool, arr] of Object.entries(data.pools)) {
          if (Array.isArray(arr)) {
            items.push(
              ...arr.map((b) => ({ ...b, pool }))
            );
          }
        }
      }
    }
    const identities = Array.isArray(data.identities) ? data.identities : [];
    res.json({ items, identities });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Brands file not available' });
  }
});

module.exports = router;
