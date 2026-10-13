const origins = new Set([
  "https://thoufik-abdullah.vercel.app",
  "https://thoufik-green.vercel.app",
  "http://127.0.0.1:4173",
  "http://localhost:4173",
]);
const kinds = new Set([
  "visit_start",
  "page_time",
  "section_time",
  "project_time",
  "form_open",
  "sky_open",
  "sky_time_change",
  "sky_region_change",
  "sky_weather_change",
  "sky_time",
]);
const targets: Record<string, Set<string>> = {
  visit_start: new Set(["sky", "case-study"]),
  page_time: new Set(["sky", "case-study"]),
  section_time: new Set(["work", "play", "about", "footer", "case-study"]),
  project_time: new Set(["zyephr", "sap", "learning", "notch"]),
  form_open: new Set(["contact"]),
  sky_open: new Set(["simulator"]),
  sky_time_change: new Set(["dial"]),
  sky_region_change: new Set([
    "Chennai",
    "Dubai",
    "London",
    "San Francisco",
    "Antarctica",
  ]),
  sky_weather_change: new Set(["live", "clear", "cloud", "rain"]),
  sky_time: new Set(["simulator"]),
};
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const attempts = new Map<string, { count: number; reset: number }>();
const eventRates = new Map<string, { count: number; reset: number }>();
const b64 = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
const unb64 = (value: string) =>
  Uint8Array.from(
    atob(
      value.replace(/-/g, "+").replace(/_/g, "/") +
        "=".repeat((4 - (value.length % 4)) % 4),
    ),
    (c) => c.charCodeAt(0),
  );
const equal = (a: Uint8Array, b: Uint8Array) =>
  a.length === b.length && a.reduce((v, byte, i) => v | (byte ^ b[i]), 0) === 0;
async function signingKey() {
  const secret = process.env.ACTIVITY_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("Missing session secret");
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}
async function token() {
  const body = b64(
    encoder.encode(JSON.stringify({ exp: Date.now() + 30 * 60_000 })),
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    await signingKey(),
    encoder.encode(body),
  );
  return `${body}.${b64(new Uint8Array(signature))}`;
}
async function validToken(value: string) {
  try {
    const [body, signature, extra] = value.split(".");
    if (!body || !signature || extra) return false;
    const payload = JSON.parse(decoder.decode(unb64(body)));
    if (
      !Number.isFinite(payload.exp) ||
      payload.exp < Date.now() ||
      payload.exp > Date.now() + 31 * 60_000
    )
      return false;
    return crypto.subtle.verify(
      "HMAC",
      await signingKey(),
      unb64(signature),
      encoder.encode(body),
    );
  } catch {
    return false;
  }
}
async function passwordMatches(password: string) {
  const encoded = process.env.ACTIVITY_PASSWORD_HASH || "";
  const [salt64, hash64] = encoded.split(":");
  if (!salt64 || !hash64 || password.length > 256) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: unb64(salt64),
      iterations: 210000,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return equal(new Uint8Array(bits), unb64(hash64));
}
export default { async fetch(request: Request) {
  const origin = request.headers.get("origin") || "";
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": origins.has(origin) ? origin : "null",
    "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-activity-token",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
  const reply = (status: number, data: unknown) =>
    new Response(JSON.stringify(data), { status, headers });
  if (!origins.has(origin)) return reply(403, { error: "Forbidden" });
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers });
  if (request.method !== "POST")
    return reply(405, { error: "Method not allowed" });
  try {
    const raw = await request.text();
    if (raw.length > 1400) return reply(413, { error: "Too large" });
    const data = JSON.parse(raw);
    if (data.action === "collect") {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
      const ipHash = await crypto.subtle.digest("SHA-256", encoder.encode(ip));
      const rateId = b64(new Uint8Array(ipHash));
      const now = Date.now();
      const rate = eventRates.get(rateId) || { count: 0, reset: now + 60_000 };
      if (rate.reset < now) {
        rate.count = 0;
        rate.reset = now + 60_000;
      }
      eventRates.set(rateId, rate);
      if (++rate.count > 120) return reply(429, { error: "Too many events" });
      const { kind, target, duration } = data;
      if (
        !kinds.has(kind) ||
        !targets[kind]?.has(target) ||
        !Number.isInteger(duration) ||
        duration < 0 ||
        duration > 60
      )
        return reply(400, { error: "Invalid event" });
      if (
        (kind.endsWith("_time") && duration < 1) ||
        (!kind.endsWith("_time") && duration !== 0)
      )
        return reply(400, { error: "Invalid duration" });
      const countryHeader = request.headers.get("cf-ipcountry") || "ZZ";
      const country = /^[A-Z]{2}$/.test(countryHeader) ? countryHeader : "ZZ";
      await pool.query(`insert into portfolio_activity_daily
        (day, kind, target, country_code, event_count, duration_seconds)
        values ((now() at time zone 'UTC')::date, $1, $2, $3, 1, $4)
        on conflict (day, kind, target, country_code) do update set
        event_count = portfolio_activity_daily.event_count + 1,
        duration_seconds = portfolio_activity_daily.duration_seconds + excluded.duration_seconds`,
        [kind, target, country, duration]);
      return reply(202, { ok: true });
    }
    if (data.action === "login") {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
      const key = await crypto.subtle.digest("SHA-256", encoder.encode(ip));
      const id = b64(new Uint8Array(key));
      const now = Date.now();
      const rate = attempts.get(id) || { count: 0, reset: now + 15 * 60_000 };
      if (rate.reset < now) {
        rate.count = 0;
        rate.reset = now + 15 * 60_000;
      }
      attempts.set(id, rate);
      if (++rate.count > 8) return reply(429, { error: "Try again later." });
      if (
        data.username !== (process.env.ACTIVITY_USERNAME || "Thoufik") ||
        typeof data.password !== "string" ||
        !(await passwordMatches(data.password))
      )
        return reply(401, { error: "Invalid credentials." });
      rate.count = 0;
      return reply(200, { token: await token() });
    }
    if (data.action === "summary") {
      const bearer = request.headers.get("x-activity-token") || "";
      if (!(await validToken(bearer)))
        return reply(401, { error: "Please sign in again." });
      const days = [7, 30, 90].includes(data.days) ? data.days : 30;
      const since = new Date(Date.now() - (days - 1) * 86400000)
        .toISOString()
        .slice(0, 10);
      await pool.query("delete from portfolio_activity_daily where day < (now() at time zone 'UTC')::date - 90");
      const { rows } = await pool.query(`select to_char(day, 'YYYY-MM-DD') as day,
        kind, target, event_count, duration_seconds, country_code
        from portfolio_activity_daily where day >= $1
        order by day, kind, target, country_code limit 50000`, [since]);
      const groups: Record<
        string,
        Record<string, { count: number; seconds: number }>
      > = {};
      const daily: Record<string, number> = {};
      const dailyGroups: Record<string, Record<string, Record<string, { count: number; seconds: number }>>> = {};
      let events = 0;
      for (const row of rows) {
        const kind = String(row.kind),
          target = String(row.target);
        const count = Number(row.event_count) || 0;
        const seconds = Number(row.duration_seconds) || 0;
        events += count;
        const day = String(row.day);
        if (kind === "visit_start") daily[day] = (daily[day] || 0) + count;
        const group = (groups[kind] ||= {});
        const item = (group[target] ||= { count: 0, seconds: 0 });
        item.count += count;
        item.seconds += seconds;
        const dayItem = (((dailyGroups[day] ||= {})[kind] ||= {})[target] ||= { count: 0, seconds: 0 });
        dayItem.count += count;
        dayItem.seconds += seconds;
        if (kind === "visit_start") {
          const country = String(row.country_code);
          const countryItem = ((groups.country ||= {})[country] ||= {
            count: 0,
            seconds: 0,
          });
          countryItem.count += count;
        }
        if (kind === "page_time") {
          const country = String(row.country_code);
          const countryItem = ((groups.country ||= {})[country] ||= { count: 0, seconds: 0 });
          countryItem.seconds += seconds;
        }
        if (kind === "visit_start" || kind === "page_time") {
          const country = String(row.country_code);
          const countryDay = (((dailyGroups[day] ||= {}).country ||= {})[country] ||= { count: 0, seconds: 0 });
          if (kind === "visit_start") countryDay.count += count;
          else countryDay.seconds += seconds;
        }
      }
      return reply(200, {
        days,
        visits: Object.values(daily).reduce((a, b) => a + b, 0),
        events,
        truncated: rows.length >= 50000,
        daily,
        dailyGroups,
        groups,
      });
    }
    return reply(400, { error: "Unknown action" });
  } catch (error) {
    console.error("Activity endpoint error", error);
    return reply(503, { error: "Activity is unavailable." });
  }
} };
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
