import { useEffect, useState } from "react";
export const regions = [
  { name: "Coimbatore", lat: 11.0168, lon: 76.9558, zone: "Asia/Kolkata" },
  { name: "Chennai", lat: 13.0827, lon: 80.2707, zone: "Asia/Kolkata" },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946, zone: "Asia/Kolkata" },
  { name: "London", lat: 51.5074, lon: -0.1278, zone: "Europe/London" },
  {
    name: "San Francisco",
    lat: 37.7749,
    lon: -122.4194,
    zone: "America/Los_Angeles",
  },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503, zone: "Asia/Tokyo" },
];
export const atmospheres = {
  dawn: {
    name: "Dawn",
    top: "#738ea9",
    bottom: "#e9c7b7",
    glow: "#f4b69d",
    cloud: 0.32,
    light: 0.75,
    sun: 0.12,
    rain: 0,
  },
  day: {
    name: "Daylight",
    top: "#4c82b4",
    bottom: "#d9e1db",
    glow: "#edf3ff",
    cloud: 0.25,
    light: 1,
    sun: 0.66,
    rain: 0,
  },
  golden: {
    name: "Golden hour",
    top: "#38607b",
    bottom: "#efc185",
    glow: "#ffd1a0",
    cloud: 0.3,
    light: 0.8,
    sun: 0.08,
    rain: 0,
  },
  dusk: {
    name: "Dusk",
    top: "#7e88a5",
    bottom: "#d9a4a5",
    glow: "#f0b5b0",
    cloud: 0.35,
    light: 0.5,
    sun: -0.08,
    rain: 0,
  },
  night: {
    name: "Night",
    top: "#172340",
    bottom: "#677082",
    glow: "#a2b6d2",
    cloud: 0.25,
    light: 0.1,
    sun: -0.4,
    rain: 0,
  },
  rain: {
    name: "Rain",
    top: "#566d7d",
    bottom: "#a8b8bd",
    glow: "#c5d0da",
    cloud: 0.9,
    light: 0.65,
    sun: 0.4,
    rain: 0.65,
  },
};
function condition(code) {
  if (code === 0) return "Clear sky";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Fog";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorms";
}
export function localHour(now, region) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: region.zone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  return (
    Number(parts.find((p) => p.type === "hour").value) +
    Number(parts.find((p) => p.type === "minute").value) / 60
  );
}
export function liveAtmosphere(now, region, weather, previewHour = null) {
  const hour = previewHour ?? localHour(now, region);
  let rise = 6,
    set = 18;
  if (weather?.rise && weather?.set) {
    rise = localHour(new Date(weather.rise * 1000), region);
    set = localHour(new Date(weather.set * 1000), region);
  }
  const key =
    hour < rise - 0.7 || hour > set + 0.9
      ? "night"
      : hour < rise + 0.75
        ? "dawn"
        : hour > set + 0.1
          ? "dusk"
          : hour > set - 1
            ? "golden"
            : "day";
  const base = atmospheres[key];
  return {
    ...base,
    name: base.name,
    cloud: weather ? weather.cloud / 100 : base.cloud,
    rain: weather ? Math.min(weather.rain / 2, 1) : 0,
    sun: key === "night" ? base.sun :
      Math.sin(
        Math.max(0, Math.min(1, (hour - rise) / (set - rise))) * Math.PI,
      ) * 0.75,
    wind: weather?.wind ?? 5,
    windX: weather?.windDirection == null ? 1 : -Math.sin(weather.windDirection * Math.PI / 180),
    windY: weather?.windDirection == null ? 0 : -Math.cos(weather.windDirection * Math.PI / 180) * .2,
    lowCloud: (weather?.lowCloud ?? weather?.cloud ?? 35) / 100,
    midCloud: (weather?.midCloud ?? 20) / 100,
    highCloud: (weather?.highCloud ?? 15) / 100,
    warmth: Math.max(Math.exp(-Math.pow((hour - rise) / .85, 2)), Math.exp(-Math.pow((hour - set) / .95, 2))),
    seed: (region.lat * .13 + region.lon * .07),
    hour,
    previewHour,
  };
}
export function useWeather(region) {
  const [state, setState] = useState({ weather: null, status: "loading" });
  const [now, setNow] = useState(new Date());
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(tick);
  }, []);
  useEffect(() => {
    if (!Number.isFinite(region.lat) || !Number.isFinite(region.lon)) {
      setState({ weather: null, status: "offline" });
      return;
    }
    const controller = new AbortController();
    setState({ weather: null, status: "loading" });
    async function fetchWeather() {
      try {
        const url = new URL("https://api.open-meteo.com/v1/forecast");
        url.search = new URLSearchParams({
          latitude: region.lat,
          longitude: region.lon,
          current:
            "temperature_2m,cloud_cover,rain,showers,precipitation,weather_code,wind_speed_10m,wind_direction_10m",
          hourly: "temperature_2m,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,rain,showers,precipitation,weather_code,wind_speed_10m,wind_direction_10m",
          daily: "sunrise,sunset",
          timezone: region.visitor ? "auto" : region.zone,
          timeformat: "unixtime",
          forecast_days: 1,
        });
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error("Weather unavailable");
        const data = await response.json();
        const c = data.current;
        if (!c || !Number.isFinite(c.cloud_cover))
          throw new Error("Invalid weather response");
        const hours = data.hourly?.time ?? [];
        const currentIndex = hours.reduce((best, time, i) => Math.abs(time - c.time) < Math.abs(hours[best] - c.time) ? i : best, 0);
        setState({
          status: "live",
          weather: {
            temperature: Math.round(c.temperature_2m),
            cloud: c.cloud_cover,
            rain: (c.rain ?? 0) + (c.showers ?? 0),
            lowCloud: data.hourly?.cloud_cover_low?.[currentIndex],
            midCloud: data.hourly?.cloud_cover_mid?.[currentIndex],
            highCloud: data.hourly?.cloud_cover_high?.[currentIndex],
            wind: c.wind_speed_10m,
            windDirection: c.wind_direction_10m,
            description: condition(c.weather_code),
            rise: data.daily?.sunrise?.[0],
            set: data.daily?.sunset?.[0],
            zone: data.timezone,
            updated: c.time,
            hourly: (data.hourly?.time ?? []).map((time, i) => ({
              time,
              temperature: Math.round(data.hourly.temperature_2m[i]),
              cloud: data.hourly.cloud_cover[i],
              rain: (data.hourly.rain?.[i] ?? 0) + (data.hourly.showers?.[i] ?? 0),
              lowCloud: data.hourly.cloud_cover_low?.[i],
              midCloud: data.hourly.cloud_cover_mid?.[i],
              highCloud: data.hourly.cloud_cover_high?.[i],
              wind: data.hourly.wind_speed_10m[i],
              windDirection: data.hourly.wind_direction_10m[i],
              description: condition(data.hourly.weather_code[i]),
            })),
          },
        });
      } catch (error) {
        if (error.name !== "AbortError")
          setState((previous) => ({
            ...previous,
            status: previous.weather ? "stale" : "offline",
          }));
      }
    }
    fetchWeather();
    const refresh = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => {
      controller.abort();
      clearInterval(refresh);
    };
  }, [region.lat, region.lon, region.zone, region.visitor, revision]);
  return { ...state, now, refresh: () => setRevision((value) => value + 1) };
}

export function weatherAtHour(weather, hour, region) {
  if (hour === null || !weather?.hourly?.length) return weather;
  const nearest = weather.hourly.reduce((best, entry) => {
    const distance = Math.abs(localHour(new Date(entry.time * 1000), region) - hour);
    return distance < best.distance ? { entry, distance } : best;
  }, { entry: null, distance: Infinity }).entry;
  return nearest ? { ...weather, ...nearest } : weather;
}
