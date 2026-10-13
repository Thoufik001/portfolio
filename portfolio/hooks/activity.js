const endpoint =
  "https://br-raspy-lab-b4yyotag-activity.compute.c-6.us-east-2.aws.neon.tech/";
const optOutKey = "portfolio-activity-opt-out-v2";
const oldConsentKey = "portfolio-activity-consent-v1";
const oldSessionKey = "portfolio-activity-session-v1";
const allowedKinds = new Set([
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
let optedOut;

export function activityOptedOut() {
  if (optedOut !== undefined) return optedOut;
  try {
    const previousChoice = localStorage.getItem(oldConsentKey);
    optedOut =
      localStorage.getItem(optOutKey) === "yes" || previousChoice === "no";
    if (previousChoice === "no") localStorage.setItem(optOutKey, "yes");
    localStorage.removeItem(oldConsentKey);
    sessionStorage.removeItem(oldSessionKey);
  } catch {
    optedOut = false;
  }
  return optedOut;
}

export function setActivityOptOut(value) {
  optedOut = Boolean(value);
  try {
    if (optedOut) localStorage.setItem(optOutKey, "yes");
    else localStorage.removeItem(optOutKey);
  } catch {}
  window.dispatchEvent(new Event("portfolio-activity-preference"));
}

export function recordActivity(
  kind,
  target = "",
  duration = 0,
  _beacon = false,
) {
  if (activityOptedOut() || !allowedKinds.has(kind)) return;
  const payload = JSON.stringify({ action: "collect", kind, target, duration });
  fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}

export function startActivityTracking() {
  if (location.pathname.startsWith("/activity")) return () => {};
  let active = false;
  let visitRecorded = false;
  let started = performance.now();
  let page = "sky";
  let section = "work";
  let project = "";
  let skyOpenedAt = 0;
  const detect = () => {
    const params = new URLSearchParams(location.search);
    project = ["zyephr", "sap", "learning", "notch"].includes(
      params.get("project"),
    )
      ? params.get("project")
      : "";
    page = project ? "case-study" : "sky";
    if (project) section = "case-study";
    else if (
      document.querySelector("#footer")?.getBoundingClientRect().top <
      innerHeight * 0.55
    )
      section = "footer";
    else
      section = ["play", "about"].includes(location.hash.slice(1))
        ? location.hash.slice(1)
        : "work";
  };
  const flush = (beacon = false) => {
    if (!active) return;
    const seconds = Math.min(
      60,
      Math.round((performance.now() - started) / 1000),
    );
    started = performance.now();
    if (seconds < 1) return;
    recordActivity("page_time", page, seconds, beacon);
    recordActivity("section_time", section, seconds, beacon);
    if (project) recordActivity("project_time", project, seconds, beacon);
    if (skyOpenedAt) recordActivity("sky_time", "simulator", seconds, beacon);
  };
  const update = () => {
    const nextActive =
      document.visibilityState === "visible" &&
      document.hasFocus() &&
      !activityOptedOut();
    if (active) flush();
    active = nextActive;
    if (active) {
      detect();
      started = performance.now();
      if (!visitRecorded) {
        recordActivity("visit_start", page);
        visitRecorded = true;
      }
    }
  };
  const onScroll = () => {
    if (!active) return;
    const old = section;
    detect();
    if (old !== section) {
      section = old;
      flush();
      detect();
    }
  };
  const onPageHide = () => flush(true);
  const onSkyOpen = () => {
    skyOpenedAt = performance.now();
  };
  const onSkyClose = () => {
    if (active && skyOpenedAt) flush();
    skyOpenedAt = 0;
  };
  const interval = setInterval(() => flush(), 30000);
  document.addEventListener("visibilitychange", update);
  window.addEventListener("focus", update);
  window.addEventListener("blur", update);
  window.addEventListener("hashchange", update);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pagehide", onPageHide);
  window.addEventListener("portfolio-activity-preference", update);
  window.addEventListener("portfolio-sky-open", onSkyOpen);
  window.addEventListener("portfolio-sky-close", onSkyClose);
  update();
  return () => {
    clearInterval(interval);
    flush(true);
    document.removeEventListener("visibilitychange", update);
    window.removeEventListener("focus", update);
    window.removeEventListener("blur", update);
    window.removeEventListener("hashchange", update);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pagehide", onPageHide);
    window.removeEventListener("portfolio-activity-preference", update);
    window.removeEventListener("portfolio-sky-open", onSkyOpen);
    window.removeEventListener("portfolio-sky-close", onSkyClose);
  };
}

export { endpoint as activityEndpoint };
