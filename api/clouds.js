import { selectCloudObservation } from "../portfolio/sky/cloud-observations.js";

const cache = new Map();
export default async function clouds(req, res) {
  const query = new URL(req.url, "http://localhost").searchParams;
  const latitude = Number(query.get("lat")), longitude = Number(query.get("lon"));
  if (req.method !== "GET" || !query.has("lat") || !query.has("lon") || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    res.statusCode = 400; res.end("Invalid location"); return;
  }
  const lat = Math.round(latitude * 10) / 10, lon = Math.round(longitude * 10) / 10;
  const key = `${lat},${lon}`;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
  try {
    let record = cache.get(key);
    if (!record || Date.now() - record.time > 300000) {
      const span = Math.min(5, .6 / Math.max(.12, Math.cos(lat * Math.PI / 180)));
      const bbox = [Math.max(-90, lat - .6), Math.max(-180, lon - span), Math.min(90, lat + .6), Math.min(180, lon + span)].join(",");
      const url = new URL("https://aviationweather.gov/api/data/metar");
      url.search = new URLSearchParams({ bbox, format: "json", hours: "2" });
      const response = await fetch(url, { headers: { "User-Agent": "ThoufikPortfolioSky/1.0" }, signal: AbortSignal.timeout(6000) });
      if (!response.ok) throw new Error("Observation unavailable");
      const reports = response.status === 204 ? [] : await response.json();
      record = { time: Date.now(), reports: Array.isArray(reports) ? reports : [] };
      if (cache.size >= 200) cache.delete(cache.keys().next().value);
      cache.set(key, record);
    }
    res.end(JSON.stringify({ observation: selectCloudObservation(record.reports, latitude, longitude) }));
  } catch {
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify({ observation: null }));
  }
}
