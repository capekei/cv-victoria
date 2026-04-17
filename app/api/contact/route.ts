import nodemailer from "nodemailer";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { contactSchema } from "./schema";

/* ═══════════════════════════════════════════════════════════════
   Contact form handler — SMTP via GoDaddy (or any other provider)
   ═══════════════════════════════════════════════════════════════
   Env vars required (set in Vercel dashboard + .env.local):
     SMTP_HOST          e.g. smtpout.secureserver.net  (Workspace)
                             smtp.office365.com        (M365)
     SMTP_PORT          465 (SSL) or 587 (STARTTLS)
     SMTP_USER          hello@victoriazeder.com
     SMTP_PASS          the mailbox password
     CONTACT_TO_EMAIL   (optional) where the messages go.
                        Defaults to SMTP_USER if not set.

   Optional (Upstash Marketplace integration — distributed rate limit):
     UPSTASH_REDIS_REST_URL
     UPSTASH_REDIS_REST_TOKEN
   Absent → falls back to in-memory Map (per-instance, best-effort).
   ─────────────────────────────────────────────────────────────── */

/* nodemailer needs Node's `net` + `tls` modules — Edge runtime
   cannot open raw TCP sockets, so this handler must run on Node. */
export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

/* ── Upstash distributed rate limit (preferred) ──
   Lazy init so missing env vars fall back to in-memory without
   crashing the route module at import time. */
let upstashLimiter: Ratelimit | null = null;
function getUpstashLimiter(): Ratelimit | null {
  if (upstashLimiter) return upstashLimiter;
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }
  try {
    upstashLimiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX, "5 m"),
      analytics: true,
      prefix: "cv-victoria:contact",
    });
    return upstashLimiter;
  } catch (err) {
    console.warn("Upstash init failed, falling back to in-memory rate limit", err);
    return null;
  }
}

/* ── In-memory fallback (local dev, or if Upstash unreachable) ──
   Per-instance Map — combined with honeypot below, enough to stop
   casual abuse. Only used when Upstash env vars are absent. */
const rateStore = new Map<string, number[]>();

function allowInMemory(ip: string): boolean {
  const now = Date.now();
  const history = (rateStore.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );
  if (history.length >= RATE_LIMIT_MAX) {
    rateStore.set(ip, history);
    return false;
  }
  history.push(now);
  rateStore.set(ip, history);

  /* Cheap periodic cleanup */
  if (rateStore.size > 500) {
    for (const [k, v] of rateStore) {
      const filtered = v.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (filtered.length === 0) rateStore.delete(k);
      else rateStore.set(k, filtered);
    }
  }
  return true;
}

/* Unified rate-limit check. Returns { allowed, retryAfter } where
   retryAfter is in seconds (surfaced to the client as a friendlier wait). */
async function checkRateLimit(
  ip: string,
): Promise<{ allowed: boolean; retryAfter: number }> {
  const limiter = getUpstashLimiter();
  if (limiter) {
    const result = await limiter.limit(ip);
    const retryAfter = Math.max(
      1,
      Math.ceil((result.reset - Date.now()) / 1000),
    );
    return { allowed: result.success, retryAfter };
  }
  return {
    allowed: allowInMemory(ip),
    retryAfter: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000),
  };
}

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/* Strip CRLF from name/email to prevent header injection */
function sanitize(s: string): string {
  return s.replace(/[\r\n]+/g, " ").trim();
}

/* Minimal HTML escaping for the email body */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { allowed, retryAfter } = await checkRateLimit(ip);
    if (!allowed) {
      return Response.json(
        {
          success: false,
          error: "Too many requests. Please try again in a few minutes.",
        },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        },
      );
    }

    const body = await request.json();

    /* Honeypot: hidden field that humans never touch but bots fill in.
       Respond with success so the bot thinks it worked and moves on. */
    if (
      body &&
      typeof body.website === "string" &&
      body.website.length > 0
    ) {
      return Response.json({ success: true });
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { success: false, errors: parsed.error.issues },
        { status: 400 },
      );
    }

    const name = sanitize(parsed.data.name);
    const email = sanitize(parsed.data.email);
    const message = parsed.data.message.trim();

    /* ── SMTP config ── */
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 465);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    /* `||` not `??` — `.env` files turn an unset var like `CONTACT_TO_EMAIL=`
       into an empty string, which `??` treats as defined. `||` correctly
       falls through empty strings back to the SMTP_USER default. */
    const to = process.env.CONTACT_TO_EMAIL || user;

    if (!host || !user || !pass || !to) {
      console.error(
        "Contact form: missing SMTP env vars (SMTP_HOST / SMTP_USER / SMTP_PASS / CONTACT_TO_EMAIL)",
      );
      return Response.json(
        { success: false, error: "Email is not configured on the server." },
        { status: 500 },
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      /* Port 465 = implicit TLS (SMTPS), port 587 = STARTTLS upgrade */
      secure: port === 465,
      auth: { user, pass },
    });

    const subject = `New conversation from ${name}`;

    /* Plain-text body — clean and scannable */
    const text = [
      `${name} <${email}>`,
      "",
      message,
      "",
      "—",
      "Sent from victoriazeder.com/contact",
    ].join("\n");

    /* HTML body — matches the site's editorial aesthetic */
    const html = `<!doctype html>
<html>
  <body style="margin:0;padding:40px 20px;background:#F7F6F2;font-family:Georgia,'Times New Roman',serif;color:#111111;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="540" style="width:540px;max-width:100%;margin:0 auto;background:#F7F6F2;">
      <tr>
        <td style="padding:24px 32px 8px 32px;">
          <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:#B9D4F4;">New conversation</p>
          <hr style="border:none;border-top:1px solid #CFCFCF;margin:12px 0 24px 0;" />
        </td>
      </tr>
      <tr>
        <td style="padding:0 32px;">
          <p style="margin:0 0 6px 0;font-family:Georgia,serif;font-style:italic;font-size:20px;line-height:1.4;color:#111111;">${escapeHtml(name)}</p>
          <p style="margin:0 0 28px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#555555;">
            <a href="mailto:${escapeHtml(email)}" style="color:#555555;text-decoration:none;">${escapeHtml(email)}</a>
          </p>
          <div style="font-family:Georgia,serif;font-size:16px;line-height:1.6;color:#111111;white-space:pre-wrap;">${escapeHtml(message)}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:40px 32px 32px 32px;">
          <hr style="border:none;border-top:1px solid #CFCFCF;margin:0 0 16px 0;" />
          <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#555555;">
            Sent from victoriazeder.com/contact
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    await transporter.sendMail({
      from: `"Victoria Zeder — Contact Form" <${user}>`,
      to,
      /* Reply-To points to the visitor so hitting "Reply" in your
         inbox goes straight to them, not back to the form address. */
      replyTo: `"${name}" <${email}>`,
      subject,
      text,
      html,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return Response.json(
      {
        success: false,
        error: "Could not send message. Please try again.",
      },
      { status: 500 },
    );
  }
}
