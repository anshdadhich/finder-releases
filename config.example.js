// Copy this file to config.js and fill in your values.
// config.js is gitignored — NEVER commit your API key.
//
// Two ways to send the contact form:
//
// 1. RECOMMENDED — Cloudflare Worker (key stays server-side):
//    deploy worker.js (see its header comments), then set:
//    window.FINDER_CONFIG = { CONTACT_ENDPOINT: "https://finder-contact.<you>.workers.dev" };
//
// 2. Direct Resend (simple, but the key is visible in page source —
//    only okay for local testing):
//    window.FINDER_CONFIG = { RESEND_API_KEY: "re_...", TO_EMAIL: "you@..." };
window.FINDER_CONFIG = {
  CONTACT_ENDPOINT: "",
  RESEND_API_KEY: "",
  TO_EMAIL: "anshdadhich@gmail.com"
};
