const cover = { FEW: 20, SCT: 40, BKN: 75, OVC: 100, VV: 100 };
export function stationDistance(lat, lon, station) {
  const rad = Math.PI / 180;
  const a = Math.sin((station.lat - lat) * rad / 2) ** 2 + Math.cos(lat * rad) * Math.cos(station.lat * rad) * Math.sin((station.lon - lon) * rad / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
}
export function selectCloudObservation(reports, lat, lon, now = Date.now()) {
  const candidates = reports.filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lon) && Number.isFinite(r.obsTime)
    && now / 1000 - r.obsTime >= -300 && now / 1000 - r.obsTime <= 5400)
    .map((r) => ({ ...r, distance: stationDistance(lat, lon, r) })).filter((r) => r.distance <= 40)
    .sort((a, b) => a.distance - b.distance);
  for (const r of candidates) {
    const layers = (r.clouds || []).filter((c) => cover[c.cover] && Number.isFinite(c.base));
    // Automated clear reports can have an instrument ceiling; don't erase
    // modelled high clouds on the strength of a clear airport report alone.
    if (!layers.length) continue;
    const levels = {};
    for (const c of layers) {
      const metres = c.base * .3048;
      const key = metres < 3000 ? "lowCloud" : metres < 8000 ? "midCloud" : "highCloud";
      levels[key] = Math.max(levels[key] || 0, cover[c.cover]);
    }
    return { station: r.icaoId, time: r.obsTime, distanceKm: Math.round(r.distance), ...levels,
      cloud: Math.max(...layers.map((c) => cover[c.cover])) };
  }
  return null;
}
export function applyCloudObservation(weather, observation) {
  if (!observation) return weather;
  // A nearby observation supplies only its reported layers. Keep the model's
  // other layers and precipitation, which may vary away from the airport.
  const total = Math.max(observation.cloud, weather.highCloud ?? 0);
  const description = total >= 95 ? "Overcast" : total >= 60 ? "Mostly cloudy" : total >= 30 ? "Partly cloudy" : "Mostly clear";
  return { ...weather, ...Object.fromEntries(["lowCloud", "midCloud", "highCloud"].filter((k) => observation[k] != null).map((k) => [k, observation[k]])),
    cloud: total, description: weather.weatherCode <= 3 ? description : weather.description,
    modelClouds: { cloud: weather.cloud, lowCloud: weather.lowCloud, midCloud: weather.midCloud, highCloud: weather.highCloud, description: weather.description }, cloudObservation: observation };
}
