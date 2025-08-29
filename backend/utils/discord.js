// utils/discord.js
// Node 18+ : fetch est natif

const { DISCORD_WEBHOOK_URL } = process.env;

async function notifyDiscord({ content, embeds }) {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn("[discord] DISCORD_WEBHOOK_URL non configurée");
    return;
  }
  try {
    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Discord accepte "content" OU "embeds" (ou les deux)
      body: JSON.stringify({
        content: content || null,
        embeds: embeds && embeds.length ? embeds : undefined,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "<no body>");
      console.error("[discord] HTTP", res.status, text);
    } else {
      // Discord renvoie 204 No Content en succès
      console.log("[discord] sent OK (", res.status, ")");
    }
  } catch (e) {
    console.error("[discord] fetch error:", e?.message || e);
  }
}

module.exports = { notifyDiscord };
