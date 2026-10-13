const ENDPOINT = import.meta.env?.VITE_CONTACT_ENDPOINT || "https://br-raspy-lab-b4yyotag-contact.compute.c-6.us-east-2.aws.neon.tech/";
// Design preview: reconnect only when the owner explicitly asks.
export const CONTACT_DELIVERY_ENABLED = false;

export async function submitContact(fields, { signal, fetcher = fetch, sendEnabled = CONTACT_DELIVERY_ENABLED } = {}) {
  if (!sendEnabled) return { success: true, preview: true };
  const name = fields.name.trim(), email = fields.email.trim(), message = fields.message.trim();
  if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254 || !message || message.length > 2000) {
    throw new Error("Please check the fields and try again.");
  }
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) abort();
  const timer = setTimeout(abort, 15000);
  try {
    const response = await fetcher(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ name, email, message, _replyto: email, _subject: `Portfolio note from ${name}`, _template: "table", _captcha: "false", _honey: fields.website || "" }),
    });
    const result = await response.json();
    if (/activat|confirm.*email/i.test(result.message || "")) {
      throw new Error("This inbox is being set up. Please try again later.");
    }
    if (!response.ok || (result.success !== true && result.success !== "true")) {
      throw new Error("Your message wasn’t sent. Please try again.");
    }
    return result;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("Sending timed out. Please try again.");
    if (error instanceof TypeError || error instanceof SyntaxError) throw new Error("Couldn’t connect. Check your connection and try again.");
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}
