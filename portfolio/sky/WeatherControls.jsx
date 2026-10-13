import { withSkyInk } from "./sky-ink";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Sun,
  Moon,
  X,
  Check,
  Cloud,
  CloudRain,
  MapPin,
  MapPinOff,
  RotateCcw,
  ChevronDown,
  Volume2,
} from "./SkyIcons";
import { localHour, regions } from "./weather";

function WeatherIcon({ cloudy, rain, size = 20 }) {
  if (rain) return <CloudRain size={size} />;
  if (cloudy) return <Cloud size={size} />;
  return <span className="sky-phase-icons"><span className="sky-phase-moon"><Moon size={size} /></span><span className="sky-phase-sun"><Sun size={size} /></span></span>;
}
function LocationIcon({ blocked }) {
  const Component = blocked ? MapPinOff : MapPin;
  return <Component size={20} />;
}
function phaseColor(time, sunrise, sunset) {
  const smooth = (value) => {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  };
  const mix = (from, to, amount) =>
    from.map((channel, i) => channel + (to[i] - channel) * amount);
  const circularDistance = (target) => Math.abs(((time - target + 36) % 24) - 12);
  const night = [101, 119, 168];
  const day = [100, 160, 207];
  const daylight = smooth((time - sunrise + 1) / 2) * (1 - smooth((time - sunset + 1) / 2));
  const sunriseGlow = Math.exp(-Math.pow(circularDistance(sunrise) / 1.35, 2));
  const sunsetGlow = Math.exp(-Math.pow(circularDistance(sunset) / 1.35, 2));
  const base = mix(night, day, daylight);
  const color = mix(mix(base, [228, 177, 94], sunriseGlow), [194, 132, 137], sunsetGlow);
  return `rgb(${color.map(Math.round).join(" ")})`;
}

function TimeWheel({
  hour,
  onChange,
  onCommit,
  displayTime,
  sunrise = 6,
  sunset = 18,
  explored = false,
}) {
  const phase =
    hour < sunrise
      ? "Night"
      : hour < 12
        ? "Morning"
        : hour < Math.min(17, sunset)
          ? "Afternoon"
          : hour < sunset
            ? "Golden hour"
            : hour < 21
              ? "Evening"
              : "Night";
  const reduced = useReducedMotion();
  const caption = explored ? phase : "Drag to explore";
  const drag = useRef(null);
  function angle(event) {
    const rect = event.currentTarget
      .querySelector("svg")
      .getBoundingClientRect();
    return Math.atan2(
      event.clientX - rect.left - rect.width / 2,
      -(event.clientY - rect.top - rect.height / 2),
    );
  }
  return withSkyInk(
    <div
      className="sky-time-wheel"
      role="slider"
      tabIndex={0}
      aria-label="Preview time of day"
      aria-valuemin={0}
      aria-valuemax={23.75}
      aria-valuenow={hour}
      aria-valuetext={explored ? `${displayTime}, ${caption}` : displayTime}
      onPointerDown={(event) => {
        if (event.button !== 0 || !event.isPrimary) return;
        event.currentTarget.focus();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { angle: angle(event), hour };
      }}
      onPointerMove={(event) => {
        if (
          !drag.current ||
          !event.currentTarget.hasPointerCapture(event.pointerId)
        )
          return;
        const next = angle(event);
        let delta = next - drag.current.angle;
        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;
        drag.current.hour =
          (drag.current.hour - (delta / Math.PI) * 12 + 24) % 24;
        drag.current.angle = next;
        onChange((Math.round(drag.current.hour * 4) / 4) % 24);
      }}
      onPointerUp={(event) => {
        if (drag.current) onCommit?.();
        drag.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          event.currentTarget.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onKeyDown={(event) => {
        const offsets = {
          ArrowRight: 0.25,
          ArrowUp: 0.25,
          ArrowLeft: -0.25,
          ArrowDown: -0.25,
          PageUp: 1,
          PageDown: -1,
        };
        if (
          event.key in offsets ||
          event.key === "Home" ||
          event.key === "End"
        ) {
          event.preventDefault();
          onChange(
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? 23.75
                : (hour + offsets[event.key] + 24) % 24,
          );
          onCommit?.();
        }
      }}
    >
      <div className="sky-wheel-viewport">
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <circle className="sky-wheel-arc" cx="100" cy="100" r="84" />
          <g
            className="sky-wheel-rotor"
            transform={`rotate(${-hour * 15} 100 100)`}
          >
            {Array.from({ length: 96 }, (_, i) => {
              const time = i / 4;
              const light = phaseColor(time, sunrise, sunset);
              return (
                <line
                  key={`phase-${i}`}
                  x1="100"
                  y1="11"
                  x2="100"
                  y2="13"
                  transform={`rotate(${i * 3.75} 100 100)`}
                  className="sky-wheel-phase"
                  style={{ "--sky-phase-color": light }}
                />
              );
            })}
            {Array.from({ length: 96 }, (_, i) => (
              <line
                key={i}
                x1="100"
                y1="16"
                x2="100"
                y2={i % 12 === 0 ? 24 : i % 4 === 0 ? 21 : 18}
                transform={`rotate(${i * 3.75} 100 100)`}
                className={
                  i % 12 === 0
                    ? "sky-wheel-hour"
                    : i % 4 === 0
                      ? "sky-wheel-tick"
                      : "sky-wheel-quarter"
                }
              />
            ))}
          </g>
          <g className="sky-wheel-index" transform="translate(0 8)">
            <path className="sky-wheel-pointer" d="M100 18 108 37 100 33 92 37Z" />
            <path className="sky-wheel-pointer-facet" d="M100 18 100 33 92 37Z" />
          </g>
        </svg>
      </div>
      <div className="sky-wheel-time">
        <span>{displayTime}</span>
        <small className="sky-wheel-caption" aria-label={caption}>
          <BlurCaptionSegment
            text={explored ? phase : "Drag to explore"}
            reduced={reduced}
          />
        </small>
      </div>
    </div>
  );
}
function BlurCaptionSegment({ text, reduced }) {
  return withSkyInk(
    <span className="sky-wheel-caption-segment" aria-hidden="true">
      <AnimatePresence initial={false}>
        {text && (
          <motion.span
            key={text}
            className="sky-wheel-caption-words"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: {
                opacity: 0,
                transition: { duration: reduced ? 0 : 0.12 },
              },
              visible: {
                opacity: 1,
                transition: {
                  duration: reduced ? 0 : 0.12,
                  staggerChildren: reduced ? 0 : 0.025,
                },
              },
            }}
          >
            {text.split(" ").map((word, index, words) => (
              <motion.span
                key={index}
                variants={{
                  hidden: {
                    opacity: 0,
                    filter: reduced ? "none" : "blur(4px)",
                  },
                  visible: { opacity: 1, filter: "blur(0px)" },
                }}
                transition={{ duration: reduced ? 0 : 0.2, ease: "easeOut" }}
              >
                {word}
                {index < words.length - 1 ? "\u00a0" : ""}
              </motion.span>
            ))}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

export default function SkyControls({
  region,
  setRegion,
  locationStatus,
  locate,
  preview,
  setPreview,
  previewHour,
  setPreviewHour,
  refresh,
  weather,
  skyRain,
  skyCloud,
  skyAurora,
  status,
  now,
  paused,
  setPaused,
  soundOn,
  soundVolume,
  setSoundVolume,
  toggleRainSound,
  reduced,
  onActivity,
}) {
  const [open, setOpen] = useState(false),
    [editingCity, setEditingCity] = useState(false),
    [pendingCity, setPendingCity] = useState(null),
    [optionsOpen, setOptionsOpen] = useState(false),
    [discovered, setDiscovered] = useState(() => {
      try {
        return sessionStorage.getItem("sky-controls-discovered") === "yes";
      } catch {
        return false;
      }
    });
  const root = useRef(null),
    trigger = useRef(null),
    cityTrigger = useRef(null),
    optionsTrigger = useRef(null),
    selectionTimer = useRef(null);
  useEffect(() => () => clearTimeout(selectionTimer.current), []);
  const closeControls = useCallback((returnFocus = false) => {
    window.dispatchEvent(new Event("portfolio-sky-close"));
    clearTimeout(selectionTimer.current);
    setPendingCity(null);
    setEditingCity(false);
    setOptionsOpen(false);
    setOpen(false);
    if (returnFocus) requestAnimationFrame(() => trigger.current?.focus());
  }, []);
  const hour = previewHour ?? localHour(now, region);
  const displayTime =
    previewHour === null
      ? new Intl.DateTimeFormat("en-US", {
          timeZone: region.zone,
          hour: "numeric",
          minute: "2-digit",
        }).format(now)
      : `${Math.floor(hour) % 12 || 12}:${String(Math.round((hour % 1) * 60)).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
  const cloudy = preview === "cloud" || (preview === "live" && (skyCloud > 0.2 || /cloud|overcast/i.test(weather?.condition ?? weather?.description ?? ""))),
    rain = preview === "rain" || (preview === "live" && skyRain > 0);
  const locationUnavailable =
    !Number.isFinite(region.lat) &&
    (locationStatus === "denied" || locationStatus === "unavailable");
  const description =
    locationUnavailable
      ? locationStatus === "denied" ? "Location blocked" : "Location unavailable"
      : !Number.isFinite(region.lat)
        ? locationStatus === "locating"
          ? "Finding your region…"
          : "Choose a city"
        : status === "loading"
          ? "Checking weather…"
          : preview !== "live"
            ? { clear: "Clear", cloud: "Cloudy", rain: "Rain" }[preview]
            : weather
              ? `${skyAurora ? "Aurora" : weather.description}${status === "stale" ? " · Last update" : ""}`
              : "Unavailable · Retry";
  function retryLocation() {
    locate();
  }
  useEffect(() => {
    if (!open) return;
    function outside(event) {
      if (!root.current?.contains(event.target)) {
        closeControls();
      }
    }
    function escape(event) {
      if (event.key === "Escape") {
        clearTimeout(selectionTimer.current);
        setPendingCity(null);
        if (editingCity || optionsOpen) {
          (editingCity ? cityTrigger : optionsTrigger).current?.focus();
          setEditingCity(false);
          setOptionsOpen(false);
          return;
        }
        closeControls(true);
      }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open, editingCity, optionsOpen, closeControls]);
  function reset() {
    setPreviewHour(null);
    setPreview("live");
    onActivity?.("sky_weather_change", "live");
    refresh();
  }
  return withSkyInk(
    <aside ref={root} className="sky-environment" aria-label="Sky settings">
      <button
        ref={trigger}
        className="sky-weather-chip"
        data-discovered={discovered}
        aria-expanded={open}
        aria-controls="sky-weather-panel"
        aria-label="Open weather and time"
        onClick={() => {
          if (open) { closeControls(); return; }
          onActivity?.("sky_open", "simulator");
          window.dispatchEvent(new Event("portfolio-sky-open"));
          setDiscovered(true);
          try { sessionStorage.setItem("sky-controls-discovered", "yes"); } catch {}
          setOpen(true);
          setEditingCity(false);
          setOptionsOpen(false);
        }}
      >
        <span className="sky-phase-icons"><span className="sky-phase-moon"><Moon size={20} /></span><span className="sky-phase-sun"><Sun size={20} /></span></span>
      </button>
      <AnimatePresence initial={false}>
      {open && (
        <motion.section
          key="weather-panel"
          initial={reduced ? false : { opacity: 0, y: -8, scale: .98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: .98 }}
          transition={{ duration: reduced ? 0 : .22, ease: [.2, 0, 0, 1] }}
          id="sky-weather-panel"
          className="sky-settings-panel"
          data-region-open={editingCity}
          aria-label="Weather and time controls"
        >
          <div className="sky-settings-content">
          <header className="sky-weather-heading">
            <button
              ref={cityTrigger}
              className="sky-city-button"
              aria-label="Change region"
              title={
                region.approximate
                  ? "Approximate city from your network. Choose another city if needed."
                  : "Choose a city"
              }
              aria-expanded={editingCity}
              aria-controls="sky-region-picker"
              onClick={() => {
                clearTimeout(selectionTimer.current);
                setPendingCity(null);
                setEditingCity(!editingCity);
                setOptionsOpen(false);
              }}
            >
              {region.name}
              <ChevronDown size={20} />
            </button>
            <button
              className="sky-close-button"
              onClick={reset}
              aria-label="Reset sky to current time and weather"
              title="Reset sky"
            >
              <RotateCcw size={18} />
            </button>
            <button
              className="sky-close-button"
              aria-label="Close sky controls"
              onClick={() => {
                closeControls(true);
              }}
            >
              <X size={22} />
            </button>
          </header>
          <AnimatePresence initial={false}>
          {editingCity && (
            <motion.div
              id="sky-region-picker"
              className="sky-region-picker"
              role="group"
              aria-label="Choose region"
              initial={reduced ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.28, ease: [0.2, 0, 0, 1] }}
            >
              <div className="sky-region-list">
              <button
                type="button"
                className="sky-use-location"
                onClick={() => {
                  clearTimeout(selectionTimer.current);
                  setPendingCity(null);
                  setEditingCity(false);
                  setPreviewHour(null);
                  locate();
                  cityTrigger.current?.focus();
                }}
              >
                <MapPin size={20} aria-hidden="true" />
                <span>Use my location</span>
              </button>
              {regions.map((city) => (
                <button
                  key={city.name}
                  aria-pressed={(pendingCity ?? region.name) === city.name}
                  onClick={() => {
                    clearTimeout(selectionTimer.current);
                    setPendingCity(city.name);
                    selectionTimer.current = setTimeout(() => {
                      setRegion(city);
                      onActivity?.("sky_region_change", city.name);
                      setPendingCity(null);
                      setPreview("live");
                      setPreviewHour(null);
                    }, reduced ? 0 : 260);
                  }}
                >
                  {(pendingCity ?? region.name) === city.name && (
                    <motion.span className="sky-region-selection" layoutId="sky-region-selection" transition={{ duration: reduced ? 0 : 0.24, ease: [0.2, 0, 0, 1] }} />
                  )}
                  <span className="sky-city-check" aria-hidden="true">
                    {(pendingCity ?? region.name) === city.name && <Check size={20} />}
                  </span>
                  <span className="sky-region-name">{city.name}</span>
                </button>
              ))}
              </div>
            </motion.div>
          )}
          </AnimatePresence>
          <div className="sky-weather-meta">
            {locationUnavailable ? (
              <span className="sky-location-icon" aria-hidden="true">
                <LocationIcon blocked={locationStatus === "denied"} />
              </span>
            ) : (
              <WeatherIcon cloudy={cloudy} rain={rain} />
            )}
            {locationUnavailable ? (
              <>
                <span className="sky-weather-status" role="status">{description}</span>
                <button type="button" className="sky-location-grant" onClick={retryLocation}>
                  {locationStatus === "denied" ? "Grant access" : "Try again"}
                </button>
              </>
            ) : (
              <button
                className="sky-weather-status"
                onClick={refresh}
                title={weather?.cloudObservation
                  ? `Cloud layers checked against ${weather.cloudObservation.station} · ${weather.cloudObservation.distanceKm} km away`
                  : region.approximate ? "Approximate region from your network" : "Modelled weather · refresh"}
              >
                {description}
                {weather && status !== "loading" ? ` · ${weather.temperature}°` : ""}
              </button>
            )}
          </div>
          <TimeWheel
            hour={hour}
            displayTime={displayTime}
            explored={previewHour !== null}
            sunrise={
              Number.isFinite(weather?.rise)
                ? localHour(new Date(weather.rise * 1000), region)
                : undefined
            }
            sunset={
              Number.isFinite(weather?.set)
                ? localHour(new Date(weather.set * 1000), region)
                : undefined
            }
            onChange={setPreviewHour}
            onCommit={() => onActivity?.("sky_time_change", "dial")}
          />
          <button
            ref={optionsTrigger}
            className="sky-options-trigger"
            aria-expanded={optionsOpen}
            aria-controls="sky-extra-options"
            onClick={() => {
              setOptionsOpen(!optionsOpen);
              setEditingCity(false);
            }}
          >
            Sky options <ChevronDown size={20} />
          </button>
          <div
            id="sky-extra-options"
            className="sky-extra-options"
            data-open={optionsOpen}
            inert={!optionsOpen}
            aria-hidden={!optionsOpen}
          >
            <div className="sky-extra-options-content">
              <div
                className="sky-weather-options"
                role="group"
                aria-label="Weather"
              >
                <span>Weather</span>
                <div>
                  {[
                    ["live", "Auto"],
                    ["clear", "Clear"],
                    ["cloud", "Cloudy"],
                    ["rain", "Rain"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      aria-label={
                        label === "Auto" ? "Automatic weather" : label
                      }
                      aria-pressed={preview === value}
                      title={label}
                      onClick={() => { setPreview(value); onActivity?.("sky_weather_change", value); }}
                    >
                      {value === "live" ? (
                        "Auto"
                      ) : (
                        <WeatherIcon
                          cloudy={value === "cloud"}
                          rain={value === "rain"}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sky-motion-row">
                <span>Sky motion</span>
                <button
                  className="sky-motion-switch"
                  role="switch"
                  aria-label="Sky motion"
                  aria-checked={!paused && !reduced}
                  disabled={reduced}
                  onClick={() => setPaused(!paused)}
                >
                  <span />
                </button>
              </div>
              <div className="sky-motion-row">
                <span>Nature sound</span>
                <span className="sky-volume-control">
                <Volume2 size={18} aria-hidden="true" />
                <input className="sky-volume-slider" type="range" min="10" max="100" step="1"
                  aria-label="Nature sound volume" aria-valuetext={`${Math.round(soundVolume * 100)} percent`}
                  value={Math.round(soundVolume * 100)} disabled={!soundOn}
                  style={{ "--volume-fill": `${(soundVolume - .1) / .9 * 100}%` }}
                  onChange={event => setSoundVolume(Number(event.target.value) / 100)} />
                </span>
                <button
                  className="sky-motion-switch"
                  role="switch"
                  aria-label="Weather and nature sound"
                  aria-checked={soundOn}
                  onClick={toggleRainSound}
                >
                  <span />
                </button>
              </div>
            </div>
          </div>
          </div>
        </motion.section>
      )}
      </AnimatePresence>
    </aside>
  );
}
