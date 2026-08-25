// Finder contact form → Resend email
// Deploy:
//   1. npm i -g wrangler  &&  wrangler login
//   2. wrangler put secret RESEND_API_KEY   (paste your key from resend.com)
//   3. Edit TO_EMAIL below (use your Resend account email until you verify a domain)
//   4. wrangler deploy
//   5. Put the printed URL into index.html → CONTACT_ENDPOINT

const TO_EMAIL = "anshdadhich@gmail.com"; // ← change after verifying a domain on Resend

const CORS = {
  "Access-Control-Allow-Origin": "https://anshdadhich.github.io",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "POST") return json({ error: "method" }, 405);

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "bad json" }, 400);
    }

    const name = String(body.name || "").slice(0, 80).trim();
    const email = String(body.email || "").slice(0, 120).trim();
    const message = String(body.message || "").slice(0, 2000).trim();

    if (!email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "invalid fields" }, 400);
    }

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Finder Contact <onboarding@resend.dev>",
        to: [TO_EMAIL],
        reply_to: email,
        subject: `Finder feedback${name ? " from " + name : ""}`,
        text: `From: ${name || "anonymous"} <${email}>\n\n${message}`,
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return json({ error: "resend", detail: detail.slice(0, 200) }, 502);
    }
    return json({ ok: true }, 200);
  },
};
