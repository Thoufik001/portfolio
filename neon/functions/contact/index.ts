// Public portfolio contact endpoint. Email credentials never enter the browser.
const allowedOrigins = new Set([
  'https://thoufik-abdullah.vercel.app', 'https://thoufik-green.vercel.app',
  'http://127.0.0.1:4173', 'http://localhost:4173',
]);
const requests = new Map<string, { count: number; reset: number }>();
export function createContactHandler(env: Record<string, string | undefined>, send: typeof fetch = fetch) {
return async (request: Request) => {
  const origin = request.headers.get('origin') || '';
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': allowedOrigins.has(origin) ? origin : 'null',
    'Access-Control-Allow-Headers': 'content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Vary': 'Origin' };
  const reply = (status: number, data: unknown) => new Response(JSON.stringify(data), { status, headers });
  if (!allowedOrigins.has(origin)) return reply(403, { success: false });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method === 'GET') return reply(200, { ready: Boolean(env.RESEND_API_KEY && env.CONTACT_FROM) });
  if (request.method !== 'POST') return reply(405, { success: false });
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const now = Date.now();
  for (const [key, value] of requests) if (value.reset < now) requests.delete(key);
  const rate = requests.get(ip) || { count: 0, reset: now + 60000 };
  requests.set(ip, rate);
  if (++rate.count > 5) return reply(429, { success: false, message: 'Please wait a minute and try again.' });
  try {
    const raw = await request.text();
    if (raw.length > 12000) return reply(413, { success: false });
    const fields = JSON.parse(raw);
    if (fields._honey || fields.website) return reply(400, { success: false });
    const name = typeof fields.name === 'string' ? fields.name.trim() : '';
    const email = typeof fields.email === 'string' ? fields.email.trim() : '';
    const message = typeof fields.message === 'string' ? fields.message.trim() : '';
    if (!name || name.length > 100 || /[\r\n]/.test(name) || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !message || message.length > 2000)
      return reply(400, { success: false, message: 'Please check the fields and try again.' });
    const key = env.RESEND_API_KEY;
    const from = env.CONTACT_FROM;
    if (!key || !from) return reply(503, { success: false, message: 'Your note couldn’t be sent. Please try again later.' });
    const result = await send('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(12000),
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: ['thoufikabdullah3360@gmail.com'], reply_to: email,
        subject: `Portfolio note from ${name}`, text: `From: ${name}\nEmail: ${email}\n\n${message}` }),
    });
    const data = await result.json();
    if (!result.ok || !data.id) return reply(502, { success: false, message: 'Your note couldn’t be sent. Please try again later.' });
    return reply(200, { success: true });
  } catch {
    return reply(400, { success: false, message: 'Your note couldn’t be sent. Please try again.' });
  }
};
}
export default { fetch: createContactHandler(process.env) };
