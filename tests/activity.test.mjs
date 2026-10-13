import assert from "node:assert/strict";
import test from "node:test";

test("anonymous analytics respects earlier refusal and stores no session identifier", async () => {
  const data = new Map([["portfolio-activity-consent-v1", "no"], ["portfolio-activity-session-v1", "old-id"]]);
  const storage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
  const previous = { localStorage: globalThis.localStorage, sessionStorage: globalThis.sessionStorage, window: globalThis.window, fetch: globalThis.fetch };
  globalThis.localStorage = storage;
  globalThis.sessionStorage = storage;
  globalThis.window = { dispatchEvent() {} };
  const calls = [];
  globalThis.fetch = async (_url, request) => { calls.push(JSON.parse(request.body)); return { ok: true }; };
  try {
    const activity = await import("../portfolio/hooks/activity.js");
    assert.equal(activity.activityOptedOut(), true);
    assert.equal(data.has("portfolio-activity-session-v1"), false);
    activity.recordActivity("visit_start", "sky");
    assert.equal(calls.length, 0);
    activity.setActivityOptOut(false);
    activity.recordActivity("visit_start", "sky");
    assert.deepEqual(calls, [{ action: "collect", kind: "visit_start", target: "sky", duration: 0 }]);
    assert.equal(data.has("portfolio-activity-session-v1"), false);
    activity.setActivityOptOut(true);
    activity.recordActivity("form_open", "contact");
    assert.equal(calls.length, 1);
  } finally {
    Object.assign(globalThis, previous);
  }
});
