import { useCallback, useEffect, useRef, useState } from "react";
function localFallback() {
  return {
    name: "Choose region",
    lat: null,
    lon: null,
    zone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  };
}
export default function useVisitorLocation() {
  const [region, updateRegion] = useState(localFallback);
  const [locationStatus, setStatus] = useState("locating");
  const request = useRef(0),
    lookup = useRef(null);
  const locate = useCallback((position) => {
    const id = ++request.current;
    lookup.current?.abort();
    async function approximate(failure) {
      const controller = new AbortController();
      lookup.current = controller;
      const timeout = setTimeout(() => controller.abort(), 6000);
      try {
        const response = await fetch(
          "https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en",
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Region lookup unavailable");
        const data = await response.json();
        if (
          id === request.current &&
          data.city &&
          Number.isFinite(data.latitude) &&
          Number.isFinite(data.longitude)
        ) {
          updateRegion({
            name: data.city,
            lat: Math.round(data.latitude * 100) / 100,
            lon: Math.round(data.longitude * 100) / 100,
            zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            visitor: true,
            approximate: true,
          });
          setStatus(failure);
        } else if (id === request.current) setStatus(failure);
      } catch {
        if (id === request.current) setStatus(failure);
      } finally {
        clearTimeout(timeout);
      }
    }
    if (!navigator.geolocation) {
      approximate("unavailable");
      return;
    }
    setStatus("locating");
    const received = async ({ coords }) => {
        if (id !== request.current) return;
        // City-level weather does not need device-level coordinate precision.
        const next = {
          name: "Your location",
          lat: Math.round(coords.latitude * 100) / 100,
          lon: Math.round(coords.longitude * 100) / 100,
          zone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          visitor: true,
        };
        updateRegion(next);
        setStatus("located");
        const controller = new AbortController();
        lookup.current = controller;
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
          const url = new URL(
            "https://api.bigdatacloud.net/data/reverse-geocode-client",
          );
          url.search = new URLSearchParams({
            latitude: next.lat,
            longitude: next.lon,
            localityLanguage: "en",
          });
          const response = await fetch(url, { signal: controller.signal });
          if (!response.ok) throw new Error("City lookup unavailable");
          const data = await response.json();
          const name = data.city || data.locality || data.principalSubdivision;
          if (id === request.current && name) updateRegion({ ...next, name });
        } catch {
          /* Weather still works if the city-name lookup is unavailable. */
        } finally {
          clearTimeout(timeout);
        }
      };
    if (position?.coords) {
      received(position);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      received,
      (error) => {
        if (id === request.current) {
          const failure = error.code === 1 ? "denied" : "unavailable";
          setStatus(failure);
          approximate(failure);
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 },
    );
  }, []);
  useEffect(() => {
    locate();
    return () => {
      ++request.current;
      lookup.current?.abort();
    };
  }, [locate]);
  function setRegion(next) {
    if (!next) return;
    ++request.current;
    lookup.current?.abort();
    updateRegion(next);
    setStatus("manual");
  }
  return { region, setRegion, locationStatus, locate };
}
