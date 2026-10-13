import { useEffect, useState } from "react";
import { solarPosition } from "./solar";
import { solarPalette } from "./sky-palette";
import { applyCloudObservation } from "./cloud-observations.js";
export const regions = [
  { name: "Chennai", lat: 13.0827, lon: 80.2707, zone: "Asia/Kolkata" },
  { name: "Dubai", lat: 25.2048, lon: 55.2708, zone: "Asia/Dubai" },
  { name: "London", lat: 51.5074, lon: -0.1278, zone: "Europe/London" },
  {
    name: "San Francisco",
    lat: 37.7749,
    lon: -122.4194,
    zone: "America/Los_Angeles",
  },
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
    top: "#388bca",
    bottom: "#c9e4f3",
    glow: "#edf3ff",
    cloud: 0.25,
    light: 1,
    sun: 0.66,
    rain: 0,
  },
  golden: {
    name: "Golden hour",
    top: "#3e7195",
    bottom: "#f3b56e",
    glow: "#ffd1a0",
    cloud: 0.3,
    light: 0.8,
    sun: 0.08,
    rain: 0,
  },
  dusk: {
    name: "Dusk",
    top: "#6976a3",
    bottom: "#e99c9d",
    glow: "#f0b5b0",
    cloud: 0.35,
    light: 0.5,
    sun: -0.08,
    rain: 0,
  },
  night: {
    name: "Night",
    top: "#172340",
    bottom: "#2b3b56",
    glow: "#3a4b68",
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
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorms";
}
export function rainIntensity(weather) {
  if (!weather) return 0;
  const amount = Math.max(0, weather.rain ?? 0, weather.precipitation ?? 0);
  const code = weather.weatherCode;
  const drizzle = code >= 51 && code <= 57;
  const codedRain = code >= 61 && code <= 67 || code >= 80 && code <= 82;
  const storm = code >= 95;
  // Model precipitation is accumulated over an interval, not observed rain at
  // the visitor's exact location. Trace amounts must not create a downpour.
  if (amount <= .1) return 0;
  if (Number.isFinite(code) && !drizzle && !codedRain && !storm) return 0;
  return Math.min(drizzle ? .24 : 1, amount / 2);
}
function weatherDescription(code, amount) {
  return code >= 51 && code <= 57 && amount <= .1 ? "Possible drizzle" : condition(code);
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
  if (weather?.cloudObservation && +now / 1000 - weather.cloudObservation.time > 5400) weather = { ...weather, ...weather.modelClouds, cloudObservation: null };
  const hour = previewHour ?? localHour(now, region);
  const solar = solarPosition(now, region, previewHour);
  const altitude = solar?.altitude ?? (hour >= 6 && hour <= 18 ? Math.sin((hour - 6) / 12 * Math.PI) * 65 : -18);
  const rising = solar?.rising ?? hour < 12;
  // Solar elevation owns the phase, including long twilight and polar days.
  const key = altitude < -12 ? "night" : altitude < -4 ? "dusk" : rising ? (altitude < 3 ? "dawn" : "day") : altitude < 0 ? "dusk" : altitude < 10 ? "golden" : "day";
  const base = { ...atmospheres[key], ...solarPalette(altitude, rising, solar?.moonLight ?? 0) };
  const antarcticNight = region.name === "Antarctica" && altitude < -6;
  const cloud = weather ? weather.cloud / 100 : base.cloud;
  const precipitation = rainIntensity(weather);
  const aurora = antarcticNight || (Math.abs(region.lat) >= 65 && key === "night" && cloud <= 0.35 && precipitation === 0);
  const rain = aurora ? 0 : precipitation;
  return {
    ...base,
    name: base.name,
    cloud: aurora ? Math.min(cloud, 0.08) : rain ? Math.max(cloud, 0.72 + rain * 0.18) : cloud,
    rain,
    sun: Math.max(-0.4, Math.sin(altitude * Math.PI / 180) * .85),
    sunX: solar ? .5 + Math.sin((solar.azimuth - 180) * Math.PI / 180) * .38 : .72,
    solarAltitude: altitude,
    solarAzimuth: solar?.azimuth ?? null,
    solarRising: rising,
    moonLight: solar?.moonLight ?? 0,
    temperature: weather?.temperature,
    polar: Math.abs(region.lat) >= 66,
    wind: weather?.wind ?? 5,
    windGust: weather?.windGust ?? weather?.wind ?? 5,
    windX: weather?.windDirection == null ? 1 : -Math.sin(weather.windDirection * Math.PI / 180),
    windY: weather?.windDirection == null ? 0 : -Math.cos(weather.windDirection * Math.PI / 180) * .2,
    lowCloud: aurora ? 0.025 : Math.max((weather?.lowCloud ?? weather?.cloud ?? 35) / 100, rain * 0.9),
    midCloud: aurora ? 0.035 : Math.max((weather?.midCloud ?? 20) / 100, rain * 0.75),
    highCloud: aurora ? 0.06 : (weather?.highCloud ?? 15) / 100,
    warmth: Math.exp(-Math.pow((altitude - 1) / 7, 2)),
    seed: (region.lat * .13 + region.lon * .07),
    hour,
    previewHour,
    aurora,
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
            "temperature_2m,cloud_cover,rain,showers,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
          hourly: "temperature_2m,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,rain,showers,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
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
          weather: applyCloudObservation({
            temperature: Math.round(c.temperature_2m),
            cloud: c.cloud_cover,
            rain: (c.rain ?? 0) + (c.showers ?? 0),
            precipitation: c.precipitation ?? 0,
            weatherCode: c.weather_code,
            lowCloud: data.hourly?.cloud_cover_low?.[currentIndex],
            midCloud: data.hourly?.cloud_cover_mid?.[currentIndex],
            highCloud: data.hourly?.cloud_cover_high?.[currentIndex],
            wind: c.wind_speed_10m,
            windGust: c.wind_gusts_10m ?? data.hourly?.wind_gusts_10m?.[currentIndex],
            windDirection: c.wind_direction_10m,
            description: weatherDescription(c.weather_code, (c.rain ?? 0) + (c.showers ?? 0)),
            rise: data.daily?.sunrise?.[0],
            set: data.daily?.sunset?.[0],
            zone: data.timezone,
            updated: c.time,
            hourly: (data.hourly?.time ?? []).map((time, i) => ({
              time,
              temperature: Math.round(data.hourly.temperature_2m[i]),
              cloud: data.hourly.cloud_cover[i],
              rain: (data.hourly.rain?.[i] ?? 0) + (data.hourly.showers?.[i] ?? 0),
              precipitation: data.hourly.precipitation?.[i] ?? 0,
              weatherCode: data.hourly.weather_code[i],
              lowCloud: data.hourly.cloud_cover_low?.[i],
              midCloud: data.hourly.cloud_cover_mid?.[i],
              highCloud: data.hourly.cloud_cover_high?.[i],
              wind: data.hourly.wind_speed_10m[i],
              windGust: data.hourly.wind_gusts_10m?.[i],
              windDirection: data.hourly.wind_direction_10m[i],
              description: weatherDescription(data.hourly.weather_code[i], (data.hourly.rain?.[i] ?? 0) + (data.hourly.showers?.[i] ?? 0)),
            })),
          }, null),
        });
        const observationResponse = await fetch(`/api/clouds?${new URLSearchParams({ lat: region.lat, lon: region.lon })}`, { signal: controller.signal }).catch(() => null);
        const observation = observationResponse?.ok ? (await observationResponse.json().catch(() => ({}))).observation : null;
        if (observation && !controller.signal.aborted) setState((previous) => ({ ...previous, weather: applyCloudObservation(previous.weather, observation) }));
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

export function weatherAtHour(weather, hour, region, now = new Date()) {
  if (weather?.cloudObservation && +now / 1000 - weather.cloudObservation.time > 5400) weather = { ...weather, ...weather.modelClouds, cloudObservation: null };
  if (hour === null || !weather?.hourly?.length) return weather;
  const nearest = weather.hourly.reduce((best, entry) => {
    const distance = Math.abs(localHour(new Date(entry.time * 1000), region) - hour);
    return distance < best.distance ? { entry, distance } : best;
  }, { entry: null, distance: Infinity }).entry;
  return nearest ? { ...weather, ...nearest, cloudObservation: null } : weather;
}
