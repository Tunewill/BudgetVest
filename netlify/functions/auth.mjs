import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

export const config = { path: "/api/auth/*" };

const J = (o, status = 200, h = {}) =>
  new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...h } });
const hmac = (s) => crypto.createHmac("sha256", process.env.AUTH_SECRET).update(s).digest("hex");
const eq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const cookie = (v, age) => `bv_session=${v}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${age}`;
const DAY = 864e5;

const sign = (email) => {
  const p = Buffer.from(JSON.stringify({ e: email, exp: Date.now() + 7 * DAY })).toString("base64url");
  return p + "." + hmac("s:" + p);
};
const session = (req) => {
  const m = (req.headers.get("cookie") || "").match(/bv_session=([^;]+)/);
  if (!m) return null;
  const [p, sig] = m[1].split(".");
  if (!p || !sig || !eq(sig, hmac("s:" + p))) return null;
  try { const d = JSON.parse(Buffer.from(p, "base64url")); return d.exp > Date.now() ? d.e : null; } catch { return null; }
};

export default async (req, context) => {
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) return J({ error: "Sign-in isn’t set up yet." }, 500);
  const route = new URL(req.url).pathname.replace(/^\/api\/auth\//, "").replace(/\/$/, "");
  const store = getStore({ name: "bv-auth", consistency: "strong" });

  if (req.method === "GET") {
    if (route === "config") return J({ googleClientId: process.env.GOOGLE_CLIENT_ID || null });
    if (route === "session") { const e = session(req); return e ? J({ email: e }) : J({}, 401); }
    return J({ error: "Not found" }, 404);
  }
  if (req.method !== "POST") return J({ error: "Not allowed" }, 405);

  // CSRF defence: same-origin JSON only (cookie is also SameSite=Strict)
  const origin = req.headers.get("origin");
  if ((origin && new URL(origin).host !== new URL(req.url).host) || !(req.headers.get("content-type") || "").includes("application/json"))
    return J({ error: "Blocked request" }, 403);
  let body; try { body = await req.json(); } catch { return J({ error: "Bad request" }, 400); }

  const bump = async (key, max, win) => {
    const now = Date.now(), r = await store.get(key, { type: "json" });
    const s = r && now - r.s < win ? r : { s: now, n: 0 };
    if (s.n >= max) return false;
    s.n++; await store.setJSON(key, s); return true;
  };
  const ok = (email) => J({ ok: true, email }, 200, { "set-cookie": cookie(sign(email), 7 * 86400) });

  if (route === "logout") return J({ ok: true }, 200, { "set-cookie": cookie("", 0) });

  if (route === "request-otp") {
    const email = String(body.email || "").trim().toLowerCase();
    if (!EMAIL.test(email)) return J({ error: "Enter a valid email address." }, 400);
    if (!(await bump("cd-" + hmac(email), 1, 60e3))) return J({ error: "Wait a minute before asking for another code." }, 429);
    if (!(await bump("rq-" + hmac(email), 5, 3600e3)) || !(await bump("ip-" + hmac(context.ip || "x"), 20, 3600e3)))
      return J({ error: "Too many requests. Try again later." }, 429);
    const code = String(crypto.randomInt(0, 1e6)).padStart(6, "0");
    await store.setJSON("otp-" + hmac(email), { h: hmac(`otp:${email}:${code}`), exp: Date.now() + 10 * 60e3, tries: 0 });
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({ from: process.env.MAIL_FROM, to: [email], subject: "Your BudgetVest sign-in code",
        text: `Your BudgetVest code is ${code}. It works once and expires in 10 minutes.\n\nIf you didn’t ask for it, you can ignore this email.` }),
    });
    if (!r.ok) return J({ error: "We couldn’t send the email. Try again in a moment." }, 502);
    return J({ ok: true });
  }

  if (route === "verify-otp") {
    const email = String(body.email || "").trim().toLowerCase(), code = String(body.code || "").trim();
    if (!EMAIL.test(email) || !/^\d{6}$/.test(code)) return J({ error: "Enter the 6-digit code." }, 400);
    const key = "otp-" + hmac(email), rec = await store.get(key, { type: "json" });
    if (!rec || rec.exp < Date.now()) return J({ error: "That code has expired. Ask for a new one." }, 400);
    if (rec.tries >= 5) { await store.delete(key); return J({ error: "Too many attempts. Ask for a new code." }, 429); }
    rec.tries++;
    if (!eq(rec.h, hmac(`otp:${email}:${code}`))) { await store.setJSON(key, rec); return J({ error: "That code isn’t right." }, 401); }
    await store.delete(key);
    return ok(email);
  }

  if (route === "google") {
    const r = await fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(String(body.credential || "")));
    const t = await r.json().catch(() => ({}));
    const good = r.ok && t.aud === process.env.GOOGLE_CLIENT_ID && t.email && String(t.email_verified) === "true" &&
      ["accounts.google.com", "https://accounts.google.com"].includes(t.iss) && Number(t.exp) * 1000 > Date.now();
    return good ? ok(String(t.email).toLowerCase()) : J({ error: "Google sign-in failed." }, 401);
  }
  return J({ error: "Not found" }, 404);
};
