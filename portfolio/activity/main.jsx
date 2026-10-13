import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { activityEndpoint } from "../hooks/activity";
import "../styles/base.css";
import "./style.css";

const labels = {
  sky: "Sky portfolio", "case-study": "Case studies", work: "Work",
  play: "Playground", about: "About", footer: "Contact", zyephr: "ZyephrOS",
  sap: "Aceteroid", learning: "Airtribe", notch: "NotchPark",
  simulator: "Sky simulator", contact: "Contact form", dial: "Time dial",
  live: "Auto weather", clear: "Clear", cloud: "Cloudy", rain: "Rain", ZZ: "Unknown",
};
const regions = new Intl.DisplayNames(["en"], { type: "region" });
const pretty = (value) => labels[value] || (/^[A-Z]{2}$/.test(value) ? regions.of(value) : value);
const duration = (seconds = 0) => seconds >= 3600
  ? `${Math.floor(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`
  : seconds >= 60 ? `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s` : `${Math.round(seconds)}s`;
const totalTime = (group) => Object.values(group || {}).reduce((sum, item) => sum + (item.seconds || 0), 0);
const dateLabel = (date) => new Date(`${date}T12:00:00Z`).toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" });
const longDate = (date) => new Date(`${date}T12:00:00Z`).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

async function call(action, body = {}, token = "") {
  let response;
  try {
    response = await fetch(activityEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "X-Activity-Token": token } : {}),
      },
      body: JSON.stringify({ action, ...body }),
    });
  } catch {
    throw new Error("The activity service is unreachable. Please try again shortly.");
  }
  if (response.status === 404) throw new Error("The activity service has not been deployed yet.");
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `Activity service returned ${response.status}.`);
  return result;
}

function Stat({ label, value, detail }) {
  return <article className="activity-stat"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

function Bars({ title, data, measure = "seconds", country = false, empty = "No activity for this period" }) {
  const entries = Object.entries(data || {}).sort((a, b) => (b[1][measure] || 0) - (a[1][measure] || 0));
  const max = entries[0]?.[1]?.[measure] || 1;
  return <section className="activity-card activity-ranking">
    <h2>{title}</h2>
    {entries.length ? <div className="activity-bars">{entries.map(([name, item]) =>
      <div className="activity-bar" key={name}>
        <div className="activity-bar-heading"><span>{pretty(name)}</span><strong>{measure === "seconds" ? duration(item.seconds) : item[measure].toLocaleString()}</strong></div>
        <div className="activity-track"><span style={{ width: `${Math.max(2, (item[measure] / max) * 100)}%` }} /></div>
        <small>{country ? `${item.count.toLocaleString()} visits · ${duration(item.seconds)} active time` : measure === "seconds" ? "Visible, focused time" : `${item.count.toLocaleString()} interactions`}</small>
      </div>)}</div> : <p className="activity-empty">{empty}</p>}
  </section>;
}

function Timeline({ days, daily, selectedDate, onSelect, locked = false }) {
  const today = new Date();
  const dates = Array.from({ length: days }, (_, index) => {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (days - 1 - index)));
    const key = date.toISOString().slice(0, 10);
    return [key, daily[key] || 0];
  });
  const max = Math.max(1, ...dates.map(([, count]) => count));
  const points = dates.map(([, count], index) => [24 + index * (952 / Math.max(1, dates.length - 1)), 188 - (count / max) * 154]);
  const line = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L976,188 L24,188 Z`;
  const first = dates[0]?.[0];
  const last = dates.at(-1)?.[0];
  return <section className="activity-timeline" aria-label="Visits over time">
    <div className="activity-section-heading"><div><h2>Visits over time</h2><p>Page loads per day · UTC</p></div><strong>{first && `${dateLabel(first)} — ${dateLabel(last)}`}</strong></div>
    <div className="activity-chart">
      <svg viewBox="0 0 1000 212" preserveAspectRatio="none" role="img" aria-label={`Daily visits from ${first} to ${last}`}>
        <defs><linearGradient id="visits-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#339bff" stopOpacity=".28" /><stop offset="1" stopColor="#339bff" stopOpacity="0" /></linearGradient></defs>
        <path d="M24 188H976" className="activity-axis" />
        {Object.values(daily).some(Boolean) && <><path d={area} fill="url(#visits-fill)" /><path d={line} className="activity-chart-line" /></>}
      </svg>
      {!locked && dates.map(([date, count], index) => <button key={date} className="activity-chart-hit" style={{ left: `${(index / dates.length) * 100}%`, width: `${100 / dates.length}%` }} aria-label={`${longDate(date)}: ${count} visits`} aria-pressed={selectedDate === date} onClick={() => onSelect(date)} title={`${date}: ${count} visits`} />)}
      {locked ? <span className="activity-chart-empty">Sign in to see visits by day</span> : !Object.values(daily).some(Boolean) && <span className="activity-chart-empty">No visits recorded in this period</span>}
    </div>
    <div className="activity-chart-dates"><span>{first && dateLabel(first)}</span><span>{last && dateLabel(last)}</span></div>
  </section>;
}

function App() {
  const [username, setUsername] = useState("Thoufik");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [days, setDays] = useState(30);
  const [selectedDate, setSelectedDate] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function load(auth, range = days) { setData(await call("summary", { days: range }, auth)); }
  async function login(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = await call("login", { username, password });
      const report = await call("summary", { days }, result.token);
      setPassword(""); setData(report); setToken(result.token);
    } catch (cause) { setError(cause.message); }
    finally { setBusy(false); }
  }
  async function changeDays(range) {
    setDays(range); setSelectedDate(""); setBusy(true); setError("");
    try { await load(token, range); }
    catch (cause) { setError(cause.message); if (/sign in/i.test(cause.message)) { setToken(""); setData(null); } }
    finally { setBusy(false); }
  }
  const groups = selectedDate ? data?.dailyGroups?.[selectedDate] || {} : data?.groups || {};
  const visits = selectedDate ? data?.daily?.[selectedDate] || 0 : data?.visits || 0;
  const sectionLeader = Object.entries(groups.section_time || {}).sort((a, b) => b[1].seconds - a[1].seconds)[0];
  const countryLeader = Object.entries(groups.country || {}).sort((a, b) => b[1].count - a[1].count)[0];
  if (!token) return <main className="activity-shell activity-shell-login">
    <header className="activity-header"><a href="/sky/">← Portfolio</a><span>PRIVATE / ACTIVITY</span></header>
    <section className="activity-login"><span className="activity-eyebrow">PRIVATE DASHBOARD</span><h1>Activity</h1><p>Sign in to see how people explore your portfolio.</p>
      <form onSubmit={login}><label>Username<input required autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} /></label><label>Password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><button disabled={busy}>{busy ? "Opening…" : "Open dashboard"}</button></form>
      {error && <p role="alert" className="activity-error">{error}</p>}
    </section>
  </main>;
  const locked = !data;
  const empty = locked ? "Sign in to load private metrics" : "No activity for this period";
  return <main className="activity-shell">
    <header className="activity-header"><a href="/sky/">← Portfolio</a><span>PRIVATE / ACTIVITY</span>{token && <button onClick={() => { setToken(""); setData(null); setSelectedDate(""); }}>Sign out</button>}</header>
    <div className="activity-title"><div><span className="activity-eyebrow">PORTFOLIO SIGNALS</span><h1>Activity</h1><p>See where people spend time across your work and sky.</p></div><div className="activity-range" role="group" aria-label="Report period">{[7, 30, 90].map((range) => <button key={range} aria-pressed={days === range} disabled={busy || locked} onClick={() => changeDays(range)}>{range} days</button>)}</div></div>
    {error && <p role="alert" className="activity-error">{error}</p>}
    <div className="activity-date-filter"><span>{selectedDate ? longDate(selectedDate) : `Last ${days} days`}</span>{selectedDate && <button onClick={() => setSelectedDate("")}>Show full period</button>}<label>Choose a day <input type="date" value={selectedDate} disabled={locked} min={new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10)} max={new Date().toISOString().slice(0, 10)} onChange={(event) => setSelectedDate(event.target.value)} /></label></div>
    <div className="activity-stats"><Stat label="Visits" value={locked ? "—" : visits.toLocaleString()} detail="Page loads, not unique people" /><Stat label="Active time" value={locked ? "—" : duration(totalTime(groups.page_time))} detail="Visible and focused" /><Stat label="Average per visit" value={locked ? "—" : duration(visits ? totalTime(groups.page_time) / visits : 0)} detail="Active time ÷ page loads" /><Stat label="Contact form opens" value={locked ? "—" : (groups.form_open?.contact?.count || 0).toLocaleString()} detail="No message contents collected" /></div>
    <Timeline days={days} daily={data?.daily || {}} selectedDate={selectedDate} onSelect={setSelectedDate} locked={locked} />
    <div className="activity-highlights"><div><span>Longest-viewed section</span><strong>{sectionLeader ? pretty(sectionLeader[0]) : "—"}</strong><small>{locked ? "Sign in to view" : sectionLeader ? duration(sectionLeader[1].seconds) : "No section time yet"}</small></div><div><span>Top visitor country</span><strong>{countryLeader ? pretty(countryLeader[0]) : "—"}</strong><small>{locked ? "Sign in to view" : countryLeader ? `${countryLeader[1].count} visits · approximate` : "No country data yet"}</small></div><div><span>Sky simulator</span><strong>{locked ? "—" : `${(groups.sky_open?.simulator?.count || 0).toLocaleString()} opens`}</strong><small>{locked ? "Sign in to view" : `${duration(groups.sky_time?.simulator?.seconds || 0)} active time`}</small></div></div>
    <div className="activity-grid"><Bars title="Sections by time spent" data={groups.section_time} empty={empty} /><Bars title="Projects by time spent" data={groups.project_time} empty={empty} /><Bars title="Visitor countries" data={groups.country} measure="count" country empty={empty} /><Bars title="Pages by time spent" data={groups.page_time} empty={empty} /><Bars title="Sky regions selected" data={groups.sky_region_change} measure="count" empty={empty} /><Bars title="Weather choices" data={groups.sky_weather_change} measure="count" empty={empty} /></div>
    <footer className="activity-foot">Time dial changes: <strong>{locked ? "—" : groups.sky_time_change?.dial?.count || 0}</strong> · Data is aggregated by day and kept for up to 90 days. {data?.truncated && "Report reached its 50,000-row limit."}</footer>
  </main>;
}
createRoot(document.getElementById("root")).render(<App />);
