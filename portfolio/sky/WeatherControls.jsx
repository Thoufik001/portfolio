import { withSkyInk } from "./sky-ink";
import React, { useEffect, useRef, useState } from "react";
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
} from "./SkyIcons";
import { localHour, regions } from "./weather";

function WeatherIcon({ cloudy, rain, night, size = 20 }) {
  const Component = rain ? CloudRain : cloudy ? Cloud : night ? Moon : Sun;
  return <Component size={size} />;
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
  const circularDistance = (target) =>
    Math.abs(((time - target + 36) % 24) - 12);
  // Four-hour twilight bands, with a soft warm peak at each horizon crossing.
  const daylight =
    smooth((time - sunrise + 2) / 4) * (1 - smooth((time - sunset + 2) / 4));
  const warmth = Math.exp(
    -Math.pow(
      Math.min(circularDistance(sunrise), circularDistance(sunset)) / 1.75,
      2,
    ),
  );
  const base = mix([110, 133, 166], [189, 153, 94], daylight);
  const color = mix(base, [197, 142, 120], warmth);
  return `rgb(${color.map(Math.round).join(" ")})`;
}

function TimeWheel({
  hour,
  onChange,
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
            {[0, 3, 6, 9, 12, 15, 18, 21].map((value) => {
              const x = 100 + Math.sin((value / 12) * Math.PI) * 65,
                y = 104 - Math.cos((value / 12) * Math.PI) * 65;
              return (
                <text
                  key={value}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  className="sky-wheel-number"
                  transform={`rotate(${hour * 15} ${x} ${y})`}
                >
                  {String(value).padStart(2, "0")}
                </text>
              );
            })}
          </g>
          <g className="sky-wheel-index">
            <path
              className="sky-wheel-pointer"
              d="M100 3 L97.5 11 L100 15.5 L102.5 11 Z"
            />
            <path className="sky-wheel-pointer-glint" d="M100 5.5 V12" />
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

// The native control can reopen a denied permission in supporting browsers.
// Legacy geolocation requires the user to change the browser's site settings.
function LocationPermission({ locate }) {
  const native = useRef(null);
  const supported = typeof window.HTMLGeolocationElement === "function";
  useEffect(() => {
    const element = native.current;
    if (!element) return;
    const received = () => {
      if (element.position) locate(element.position);
    };
    element.addEventListener("location", received);
    return () => element.removeEventListener("location", received);
  }, [locate]);
  return withSkyInk(
    <div className="sky-location-help" role="status">
      {supported ? (
        <geolocation ref={native} className="sky-native-location" />
      ) : (
        <>Allow location in your browser’s site settings, then retry.</>
      )}
      <p>You can also choose a city above.</p>
    </div>
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
  status,
  now,
  paused,
  setPaused,
  reduced,
}) {
  const [open, setOpen] = useState(false),
    [editingCity, setEditingCity] = useState(false),
    [permissionHint, setPermissionHint] = useState(false),
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
    optionsTrigger = useRef(null);
  const hour = previewHour ?? localHour(now, region),
    night = hour < 6 || hour > 19;
  const displayTime =
    previewHour === null
      ? new Intl.DateTimeFormat("en-US", {
          timeZone: region.zone,
          hour: "numeric",
          minute: "2-digit",
        }).format(now)
      : `${Math.floor(hour) % 12 || 12}:${String(Math.round((hour % 1) * 60)).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
  const cloudy =
      preview === "cloud" || (preview === "live" && weather?.cloud > 45),
    rain = preview === "rain" || (preview === "live" && weather?.rain > 0);
  const locationNeeded =
    locationStatus === "denied" ||
    locationStatus === "unavailable" ||
    region.approximate;
  const description =
    permissionHint && locationStatus === "denied"
      ? "Location blocked"
      : !Number.isFinite(region.lat)
        ? locationStatus === "locating"
          ? "Finding your region…"
          : "Choose a city"
        : status === "loading"
          ? "Checking weather…"
          : preview !== "live"
            ? { clear: "Clear", cloud: "Cloudy", rain: "Rain" }[preview]
            : weather
              ? `${weather.description}${status === "stale" ? " · Last update" : ""}`
              : "Unavailable · Retry";
  function retryLocation() {
    setPermissionHint(true);
    locate();
  }
  useEffect(() => {
    if (locationStatus === "located" || locationStatus === "manual")
      setPermissionHint(false);
  }, [locationStatus]);
  useEffect(() => {
    if (!open) return;
    function outside(event) {
      if (!root.current?.contains(event.target)) {
        setOpen(false);
        setEditingCity(false);
        setOptionsOpen(false);
      }
    }
    function escape(event) {
      if (event.key === "Escape") {
        if (editingCity || optionsOpen) {
          (editingCity ? cityTrigger : optionsTrigger).current?.focus();
          setEditingCity(false);
          setOptionsOpen(false);
          return;
        }
        setOpen(false);
        setEditingCity(false);
        trigger.current?.focus();
      }
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open, editingCity, optionsOpen]);
  function reset() {
    setPreviewHour(null);
    setPreview("live");
    refresh();
  }
  return withSkyInk(
    <aside ref={root} className="sky-environment" aria-label="Sky settings">
      {open && (
        <section
          id="sky-weather-panel"
          className="sky-settings-panel"
          data-region-open={editingCity}
          aria-label="Weather and time controls"
        >
          <header className="sky-weather-heading">
            <button
              ref={cityTrigger}
              className="sky-city-button"
              aria-label="Change region"
              title={
                region.approximate
                  ? "Approximate city from your network. Use device location or choose another city."
                  : "Choose a city"
              }
              aria-expanded={editingCity}
              aria-controls="sky-region-picker"
              onClick={() => {
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
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              <X size={22} />
            </button>
          </header>
          {editingCity && (
            <div
              id="sky-region-picker"
              className="sky-region-picker"
              role="group"
              aria-label="Choose region"
            >
              <button
                onClick={() => {
                  retryLocation();
                  setEditingCity(false);
                  cityTrigger.current?.focus();
                }}
              >
                <MapPin size={20} />
                Use my location
              </button>
              {regions.map((city) => (
                <button
                  key={city.name}
                  aria-pressed={region.name === city.name}
                  onClick={() => {
                    setRegion(city);
                    setEditingCity(false);
                    setPreviewHour(null);
                    cityTrigger.current?.focus();
                  }}
                >
                  <span className="sky-city-check" aria-hidden="true">
                    {region.name === city.name && <Check size={20} />}
                  </span>
                  {city.name}
                </button>
              ))}
            </div>
          )}
          <div className="sky-weather-meta">
            <WeatherIcon cloudy={cloudy} rain={rain} night={night} />
            <button
              className="sky-weather-status"
              onClick={locationNeeded ? retryLocation : refresh}
              title={
                region.approximate
                  ? "Approximate region from your network. Enable device location for a more accurate city."
                  : undefined
              }
            >
              {description}
              {weather && status !== "loading" && !permissionHint
                ? ` · ${weather.temperature}°`
                : ""}
            </button>
            {locationNeeded && (
              <button
                className="sky-location-action"
                onClick={retryLocation}
                aria-label={
                  locationStatus === "denied"
                    ? "Location blocked. Allow access in browser site settings"
                    : "Enable device location"
                }
                title={
                  locationStatus === "denied"
                    ? "Allow location in browser site settings"
                    : "Enable device location"
                }
              >
                <LocationIcon blocked={locationStatus === "denied"} />
              </button>
            )}
          </div>
          {permissionHint && locationStatus === "denied" && (
            <LocationPermission locate={locate} />
          )}
          <TimeWheel
            hour={hour}
            displayTime={displayTime}
            explored={previewHour !== null}
            sunrise={
              Number.isFinite(weather?.rise)
                ? localHour(new Date(weather.rise * 1000), region)
                : 6
            }
            sunset={
              Number.isFinite(weather?.set)
                ? localHour(new Date(weather.set * 1000), region)
                : 18
            }
            onChange={setPreviewHour}
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
                      onClick={() => setPreview(value)}
                    >
                      {value === "live" ? (
                        "Auto"
                      ) : (
                        <WeatherIcon
                          cloudy={value === "cloud"}
                          rain={value === "rain"}
                          night={false}
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
            </div>
          </div>
        </section>
      )}
      <motion.button
        ref={trigger}
        className="sky-weather-chip"
        data-discovered={discovered}
        aria-expanded={open}
        aria-controls="sky-weather-panel"
        aria-label={open ? "Close weather and time" : "Open weather and time"}
        onClick={() => {
          setDiscovered(true);
          try {
            sessionStorage.setItem("sky-controls-discovered", "yes");
          } catch {}
          setOpen(!open);
          setEditingCity(false);
          setOptionsOpen(false);
        }}
      >
        <WeatherIcon cloudy={cloudy} rain={rain} night={night} size={20} />
      </motion.button>
    </aside>
  );
}
