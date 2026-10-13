import test from 'node:test';
import assert from 'node:assert/strict';
import { createContactHandler } from '../neon/functions/contact/index.ts';
const env = { RESEND_API_KEY: 'test-key', CONTACT_FROM: 'Portfolio <onboarding@resend.dev>' };
const request = (fields, origin = 'http://127.0.0.1:4173') => new Request('https://contact.test', {
  method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'x-forwarded-for': crypto.randomUUID() }, body: JSON.stringify(fields),
});
const fields = { name: 'Alex', email: 'alex@example.com', message: 'A portfolio note.' };
test('valid delivery uses server credentials and the user reply-to', async () => {
  const handler = createContactHandler(env, async (url, options) => {
    assert.equal(url, 'https://api.resend.com/emails');
    assert.equal(options.headers.Authorization, 'Bearer test-key');
    assert.equal(JSON.parse(options.body).reply_to, fields.email);
    return Response.json({ id: 'accepted' });
  });
  assert.deepEqual(await (await handler(request(fields))).json(), { success: true });
});
test('invalid email, honeypot and unknown origins never send email', async () => {
  let calls = 0;
  const handler = createContactHandler(env, async () => { calls++; });
  assert.equal((await handler(request({ ...fields, email: 'ok@d.b' }))).status, 400);
  assert.equal((await handler(request({ ...fields, website: 'bot' }))).status, 400);
  assert.equal((await handler(request(fields, 'https://unknown.test'))).status, 403);
  assert.equal(calls, 0);
});
test('provider rejection and missing configuration cannot report success', async () => {
  assert.equal((await createContactHandler(env, async () => Response.json({ error: 'invalid' }, { status: 422 }))(request(fields))).status, 502);
  assert.equal((await createContactHandler({})(request(fields))).status, 503);
});
