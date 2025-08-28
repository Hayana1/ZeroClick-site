const KNOWN_BOT_UA = [
  "bot",
  "crawler",
  "spider",
  "facebookexternalhit",
  "linkedinbot",
  "twitterbot",
  "slackbot",
  "skypeuripreview",
  "curl",
  "wget",
  "python-requests",
  "axios/",
  "go-http-client",
  "guzzlehttp",
  "node-fetch",
];

function uaLooksBot(ua = "") {
  const s = String(ua).toLowerCase();
  return KNOWN_BOT_UA.some((sig) => s.includes(sig));
}

function hasHumanishHeaders(headers = {}) {
  const acceptLang = headers["accept-language"];
  const secFetchSite = headers["sec-fetch-site"];
  const purpose = (
    headers["purpose"] ||
    headers["x-purpose"] ||
    ""
  ).toLowerCase();
  const isPrefetch =
    purpose.includes("prefetch") || purpose.includes("preview");
  const langOk = typeof acceptLang === "string" && acceptLang.length > 0;
  return langOk && !isPrefetch && secFetchSite !== "none";
}

function decideAntiBot(req) {
  const { method, headers } = req;
  const ua = headers["user-agent"] || "";
  if (method === "HEAD") return { mode: "challenge", reason: "HEAD request" };
  if (uaLooksBot(ua)) return { mode: "challenge", reason: "Known bot UA" };
  if (!hasHumanishHeaders(headers))
    return { mode: "challenge", reason: "Headers look robotic" };
  return { mode: "direct", reason: "Looks human enough" };
}

module.exports = { decideAntiBot };
