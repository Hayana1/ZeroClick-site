// backend/routes/viewer.js
const express = require('express');
const mongoose = require('mongoose');
const { requireTenantViewer } = require('../middleware/requireTenantViewer');
const Batch = require('../models/Batch');
const Target = require('../models/Target');
const Employee = require('../models/Employee');
const ClickEvent = require('../models/ClickEvent');
const router = express.Router();

// Overview (same format as /tenants/:id/results/overview)
router.get('/api/viewer/results/overview', requireTenantViewer, async (req, res) => {
  const tenantId = req.viewerTenantId;
  try {
    const batches = await Batch.find({ tenantId }).sort({ dateCreated: -1 }).lean();
    const clicksAgg = await Target.aggregate([
      { $match: { tenantId: new mongoose.Types.ObjectId(tenantId) } },
      { $group: { _id: '$batchId', clickCount: { $sum: { $cond: [{ $gt: ['$clickCount', 0] }, 1, 0] } } } },
    ]);
    const clicksMap = new Map(clicksAgg.map((r) => [String(r._id), r.clickCount]));
    const overview = batches.map((b) => {
      const selections = b.selections || {};
      const sentCount = Object.values(selections).filter(Boolean).length;
      const totalEmployees = b.totalEmployees ?? (Array.isArray(b.employees) ? b.employees.length : 0) ?? 0;
      const clickCount = clicksMap.get(String(b._id)) || 0;
      const progress = totalEmployees > 0 ? Math.round((sentCount / totalEmployees) * 100) : 0;
      return { _id: b._id, name: b.name, dateCreated: b.dateCreated, dateUpdated: b.dateUpdated, totalEmployees, sentCount, clickCount, progress };
    });
    res.json(overview);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Erreur overview' });
  }
});

// Batch details (same format as /tenants/:id/batches/:bid/results)
router.get('/api/viewer/batches/:batchId/results', requireTenantViewer, async (req, res) => {
  const tenantId = req.viewerTenantId;
  const { batchId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(batchId)) return res.status(400).json({ error: 'batchId invalide' });
  const batch = await Batch.findOne({ _id: batchId, tenantId }).lean();
  if (!batch) return res.status(404).json({ error: 'Batch introuvable' });
  const targets = await Target.find(
    { batchId },
    { employeeId: 1, clickCount: 1, lastClickedAt: 1, lastIp: 1, lastUserAgent: 1, lastSuspiciousAt: 1, trainingCompletedAt: 1, quizScore: 1 }
  ).populate('employeeId').lean();
  const clicked = targets.filter((t) => (t.clickCount || 0) > 0);
  const byDept = new Map();
  for (const t of clicked) {
    const e = t.employeeId; if (!e) continue;
    const dept = e.department || '—';
    if (!byDept.has(dept)) byDept.set(dept, []);
    byDept.get(dept).push({ _id: e._id, name: e.name, email: e.email, department: e.department || '—', firstClickAt: t.lastClickedAt || null, ip: t.lastIp || null, userAgent: t.lastUserAgent || null, isLikelyBot: !!t.lastSuspiciousAt, trainingCompleted: !!t.trainingCompletedAt, trainingCompletedAt: t.trainingCompletedAt || null, quizScore: typeof t.quizScore === 'number' ? t.quizScore : null });
  }
  const rows = Array.from(byDept.entries()).sort(([a],[b])=>a.localeCompare(b)).map(([department, employees]) => {
    const themesByGroup = batch.themesByGroup || {};
    const groupConfigs = batch.groupConfigs || {};
    const theme = themesByGroup instanceof Map ? themesByGroup.get(department) || '' : themesByGroup[department] || '';
    const cfg = groupConfigs instanceof Map ? groupConfigs.get(department) || {} : groupConfigs[department] || {};
    const scenarioId = cfg.scenarioId || null;
    const category = cfg.category || null;
    return { department, clickCount: employees.length, config: { theme, scenarioId, category }, employees: employees.sort((a,b)=> (a.name||'').localeCompare(b.name||'')) };
  });
  const totalEmployees = batch.totalEmployees ?? (Array.isArray(batch.employees)? batch.employees.length : 0) ?? 0;
  res.json({ batch: { _id: batch._id, name: batch.name, dateCreated: batch.dateCreated, totalEmployees, clickCount: clicked.length }, rows });
});

// Weekly JSON + CSV
router.get('/api/viewer/results/weekly', requireTenantViewer, async (req, res) => {
  try {
    const { viewerTenantId: tenantId } = req;
    const startStr = String(req.query.start || '');
    const endStr = String(req.query.end || '');
    let end = endStr ? new Date(endStr) : new Date();
    let start = startStr ? new Date(startStr) : new Date(end.getTime() - 7 * 24 * 3600 * 1000);
    const match = { tenantId: new mongoose.Types.ObjectId(tenantId), createdAt: { $gte: start, $lte: end }, isLikelyBot: { $ne: true } };
    const agg = await ClickEvent.aggregate([{ $match: match }, { $group: { _id: '$employeeId', clicks: { $sum: 1 }, lastAt: { $max: '$createdAt' } } }, { $sort: { clicks: -1 } }]);
    const empIds = agg.map((r) => r._id);
    const emps = await Employee.find({ _id: { $in: empIds } }, { name: 1, email: 1, department: 1 }).lean();
    const empMap = new Map(emps.map((e) => [String(e._id), e]));
    const train = await Target.aggregate([{ $match: { tenantId: new mongoose.Types.ObjectId(tenantId), trainingCompletedAt: { $ne: null } } }, { $group: { _id: '$employeeId', lastTrainingAt: { $max: '$trainingCompletedAt' } } }]);
    const trainMap = new Map(train.map((t) => [String(t._id), t.lastTrainingAt]));
    const rows = agg.map((r) => { const e = empMap.get(String(r._id)) || {}; const trainingAt = trainMap.get(String(r._id)) || null; return { employeeId: String(r._id), name: e.name || '—', email: e.email || '—', department: e.department || '—', clicks: r.clicks, lastClickAt: r.lastAt || null, trainingCompleted: !!trainingAt, trainingCompletedAt: trainingAt }; });
    res.json({ start, end, rows });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Erreur weekly results' });
  }
});

router.get('/api/viewer/results/weekly.csv', requireTenantViewer, async (req, res) => {
  try {
    const { viewerTenantId: tenantId } = req;
    const startStr = String(req.query.start || '');
    const endStr = String(req.query.end || '');
    let end = endStr ? new Date(endStr) : new Date();
    let start = startStr ? new Date(startStr) : new Date(end.getTime() - 7 * 24 * 3600 * 1000);
    const match = { tenantId: new mongoose.Types.ObjectId(tenantId), createdAt: { $gte: start, $lte: end }, isLikelyBot: { $ne: true } };
    const agg = await ClickEvent.aggregate([{ $match: match }, { $group: { _id: '$employeeId', clicks: { $sum: 1 }, lastAt: { $max: '$createdAt' } } }, { $sort: { clicks: -1 } }]);
    const empIds = agg.map((r) => r._id);
    const emps = await Employee.find({ _id: { $in: empIds } }, { name: 1, email: 1, department: 1 }).lean();
    const empMap = new Map(emps.map((e) => [String(e._id), e]));
    const train = await Target.aggregate([{ $match: { tenantId: new mongoose.Types.ObjectId(tenantId), trainingCompletedAt: { $ne: null } } }, { $group: { _id: '$employeeId', lastTrainingAt: { $max: '$trainingCompletedAt' } } }]);
    const trainMap = new Map(train.map((t) => [String(t._id), t.lastTrainingAt]));
    const rows = agg.map((r) => { const e = empMap.get(String(r._id)) || {}; const trainingAt = trainMap.get(String(r._id)) || null; return { employeeId: String(r._id), name: e.name || '', email: e.email || '', department: e.department || '', clicks: r.clicks, lastClickAt: r.lastAt || null, trainingCompleted: trainingAt ? 'Oui' : 'Non', trainingCompletedAt: trainingAt ? new Date(trainingAt).toISOString() : '' }; });
    const headers = ['employeeId','name','email','department','clicks','lastClickAt','trainingCompleted','trainingCompletedAt'];
    const lines = [headers.join(',')].concat(rows.map(r => headers.map(h => { const v = r[h] == null ? '' : r[h]; const s = String(v).replace(/"/g,'""'); return s.includes(',') || s.includes('"') ? `"${s}"` : s; }).join(',')));
    res.setHeader('Content-Type','text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=weekly-results-${tenantId}.csv`);
    res.send(lines.join('\n'));
  } catch (e) {
    res.status(500).send(e.message || 'Erreur export CSV');
  }
});

// Stop simulation: email support
router.post('/api/viewer/stop-simulation', requireTenantViewer, async (req, res) => {
  try {
    const { notifyDiscord } = require('../utils/discord');
    const nodemailer = require('nodemailer');
    const Tenant = require('../models/Tenant');
    const t = await Tenant.findById(req.viewerTenantId, { name: 1 }).lean();
    const tenantName = t?.name || req.viewerTenantId;

    const reason = (req.body && req.body.reason) || '';
    const subject = `Arrêt simulation demandé – ${tenantName}`;
    const text = `Une demande d'arrêt de simulation a été initiée.\nTenant: ${tenantName} (${req.viewerTenantId})\nHorodatage: ${new Date().toISOString()}\nRaison: ${reason}`;

    // 1) Discord (recommandé)
    await notifyDiscord({
      content: `🛑 Arrêt simulation demandé` ,
      embeds: [
        {
          title: subject,
          color: 0xff4d4f,
          fields: [
            { name: 'Tenant', value: `${tenantName} (${req.viewerTenantId})`, inline: false },
            { name: 'Horodatage', value: new Date().toISOString(), inline: false },
            { name: 'Raison', value: reason || '—', inline: false },
          ],
        },
      ],
    });

    // 2) Email (optionnel si SMTP configuré)
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (host && user && pass) {
      const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
      await transporter.sendMail({ from: `ZeroClick <no-reply@zeroclick.tech>`, to: 'support@zeroclick.tech', subject, text });
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error('stop-simulation error', e);
    return res.status(500).json({ error: 'failed' });
  }
});

module.exports = router;
