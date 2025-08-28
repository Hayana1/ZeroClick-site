const express = require("express");
const router = express.Router();
const { decideAntiBot } = require("../utils/antiBot");
const Batch = require("../models/Batch");
const Target = require("../models/Target");

async function recordClick(targetId, req, opts = {}) {
  const now = new Date();
  const ua = req.headers["user-agent"] || "";
  const ip = req.ip;
  const inc = opts.count === false ? 0 : 1;
  if (inc) {
    await Target.updateOne(
      { _id: targetId },
      {
        $set: { lastClickedAt: now, lastUserAgent: ua, lastIp: ip },
        $inc: { clickCount: 1 },
      }
    );
  } else {
    await Target.updateOne(
      { _id: targetId },
      { $set: { lastSuspiciousAt: now, lastUserAgent: ua, lastIp: ip } }
    );
  }
}

function challengeHtml(token, redirectUrl) {
  return `<!doctype html><html lang="fr"><meta charset="utf-8">
<title>Redirection…</title><meta name="robots" content="noindex,nofollow">
<body><script>
(async function(){
  try { await fetch('/api/clicks/${token}/js', { method: 'POST', credentials: 'omit' }); } catch(e){}
  setTimeout(function(){ location.replace(${JSON.stringify(
    redirectUrl
  )}); }, 150);
})();
</script><noscript>Veuillez cliquer <a href=${JSON.stringify(
    redirectUrl
  )}>ici</a>.</noscript>
</body></html>`;
}

router.get("/:token", async (req, res) => {
  const { token } = req.params;
  const target = await Target.findOne({ token }).lean();
  if (!target) return res.status(404).send("Lien invalide");
  const batch = await Batch.findById(target.batchId).lean();
  if (!batch) return res.status(404).send("Campagne introuvable");

  const redirectUrl =
    batch.trainingUrl ||
    process.env.DEFAULT_CLICK_REDIRECT ||
    "https://example.com/merci";
  const decision = decideAntiBot(req);

  if (decision.mode === "direct") {
    try {
      await recordClick(target._id, req, { count: true });
      await Batch.updateOne(
        { _id: target.batchId },
        { $inc: { clickCount: 1 } }
      );
    } catch (e) {
      console.error("Click log error:", e.message);
    }
    return res.redirect(302, redirectUrl);
  }

  try {
    await recordClick(target._id, req, { count: false });
  } catch (_) {}
  res.status(200).type("html").send(challengeHtml(token, redirectUrl));
});

router.post("/:token/js", async (req, res) => {
  const { token } = req.params;
  const target = await Target.findOne({ token }).lean();
  if (!target) return res.status(404).end();
  try {
    await recordClick(target._id, req, { count: true });
    await Batch.updateOne({ _id: target.batchId }, { $inc: { clickCount: 1 } });
  } catch (e) {
    console.error("JS click log error:", e.message);
  }
  res.status(204).end();
});

module.exports = router;
