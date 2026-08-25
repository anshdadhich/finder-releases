// Vercel serverless function: POST /api/contact
// Set these in Vercel → Project → Settings → Environment Variables:
//   RESEND_API_KEY  (from resend.com/api-keys)
//   TO_EMAIL        (your inbox; use your Resend account email until a domain is verified)
// Then redeploy — the website form posts here, the key never touches the page.

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "method" });

  let body;
  try {
    body = typeof req.body === "object" && req.body !== null
      ? req.body
      : JSON.parse(req.body || "{}");
  } catch {
    return res.status(400).json({ error: "bad json" });
  }

  const name = String(body.name || "").slice(0, 80).trim();
  const email = String(body.email || "").slice(0, 120).trim();
  const message = String(body.message || "").slice(0, 2000).trim();

  if (!email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "invalid fields" });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(500).json({ error: "RESEND_API_KEY not set" });

  const to = process.env.TO_EMAIL || "anshdadhich@gmail.com";

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Finder <onboarding@resend.dev>",
        to: [to],
        reply_to: email,
        subject: `Finder feedback${name ? " from " + name : ""}`,
        text: `From: ${name || "anonymous"} <${email}>\n\n${message}`,
      }),
    });
    if (!r.ok) {
      const detail = await r.text();
      return res.status(502).json({ error: "resend", detail: detail.slice(0, 200) });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ error: "network", detail: String(e).slice(0, 200) });
  }
}
