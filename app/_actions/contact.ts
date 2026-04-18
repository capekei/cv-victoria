"use server";

import { headers } from "next/headers";
import nodemailer from "nodemailer";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { contactSchema } from "@/app/_lib/contact-schema";

export type ContactActionResult =
  | { ok: true }
  | { ok: false; error: string; retryAfter?: number };

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

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

  if (rateStore.size > 500) {
    for (const [k, v] of rateStore) {
      const filtered = v.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (filtered.length === 0) rateStore.delete(k);
      else rateStore.set(k, filtered);
    }
  }
  return true;
}

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

async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

function sanitize(s: string): string {
  return s.replace(/[\r\n]+/g, " ").trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function submitContact(
  input: unknown,
): Promise<ContactActionResult> {
  try {
    const ip = await getClientIp();
    const { allowed, retryAfter } = await checkRateLimit(ip);
    if (!allowed) {
      return {
        ok: false,
        error: "Too many requests. Please try again in a few minutes.",
        retryAfter,
      };
    }

    const body = input as { website?: unknown } | null;

    if (
      body &&
      typeof body.website === "string" &&
      body.website.length > 0
    ) {
      return { ok: true };
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }

    const name = sanitize(parsed.data.name);
    const email = sanitize(parsed.data.email);
    const message = parsed.data.message.trim();

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 465);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const to = process.env.CONTACT_TO_EMAIL || user;

    if (!host || !user || !pass || !to) {
      console.error(
        "Contact form: missing SMTP env vars (SMTP_HOST / SMTP_USER / SMTP_PASS / CONTACT_TO_EMAIL)",
      );
      return { ok: false, error: "Email is not configured on the server." };
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const subject = `New conversation from ${name}`;

    const text = [
      `${name} <${email}>`,
      "",
      message,
      "",
      "—",
      "Sent from victoriazeder.com/contact",
    ].join("\n");

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
      replyTo: `"${name}" <${email}>`,
      subject,
      text,
      html,
    });

    return { ok: true };
  } catch (err) {
    console.error("Contact form error:", err);
    return {
      ok: false,
      error: "Could not send message. Please try again.",
    };
  }
}
