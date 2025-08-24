// utils/discord.js
// Si Node < 18, décommente la ligne suivante :
// const fetch = (...a) => import('node-fetch').then(({default: f}) => f(...a));

const { DISCORD_WEBHOOK_URL } = process.env;

async function notifyDiscord({ content, embeds }) {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn("[discord] DISCORD_WEBHOOK_URL non configurée");
    return;
  }
  try {
    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // content: message en texte brut (optionnel)
        content: content || null,
        // embeds: array d'objets embed (optionnel)
        embeds: embeds || undefined,
        // username / avatar_url (optionnel, override du webhook)
        // username: "Campagnes",
        // avatar_url: "https://…"
      }),
    });
  } catch (e) {
    console.error("[discord] webhook error:", e?.message || e);
  }
}

module.exports = { notifyDiscord };
