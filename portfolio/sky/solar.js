import SunCalc from "suncalc";

export function zonedHour(date, zone) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: zone, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const value = (name) => Number(parts.find((p) => p.type === name).value);
  return value("hour") + value("minute") / 60 + value("second") / 3600;
}

export function solarPosition(now, region, previewHour = null) {
  if (!Number.isFinite(region.lat) || !Number.isFinite(region.lon)) return null;
  let date = new Date(now);
  if (previewHour !== null) {
    // Select the dial time on this region's local date, including DST offsets.
    date = new Date(+date + (previewHour - zonedHour(date, region.zone)) * 3600000);
    date = new Date(+date + (previewHour - zonedHour(date, region.zone)) * 3600000);
  }
  const position = SunCalc.getPosition(date, region.lat, region.lon);
  const later = SunCalc.getPosition(new Date(+date + 60000), region.lat, region.lon);
  const moon = SunCalc.getMoonPosition(date, region.lat, region.lon);
  return {
    date,
    altitude: position.altitude * 180 / Math.PI,
    azimuth: (position.azimuth * 180 / Math.PI + 180 + 360) % 360,
    rising: later.altitude > position.altitude,
    moonLight: Math.max(0, Math.sin(moon.altitude)) * SunCalc.getMoonIllumination(date).fraction,
    times: SunCalc.getTimes(date, region.lat, region.lon),
  };
}
