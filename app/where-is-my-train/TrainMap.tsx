"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMap } from "react-leaflet";

/* =========================
   DYNAMIC IMPORTS
========================= */
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});
const Polyline = dynamic(
  () => import("react-leaflet").then((m) => m.Polyline),
  { ssr: false },
);

/* =========================
   TYPES
========================= */
export type Train = {
  id: string;
  latitude: number | null;
  longitude: number | null;
  speedKph: number | null;
  extra?: {
    from?: string;
    to?: string;
    times?: {
      station: string;
      latitude?: number;
      longitude?: number;
      arrival?: { estimated?: string };
      departure?: { estimated?: string };
    }[];
  };
};

type TrainAnim = Train & {
  displayLat: number;
  displayLng: number;
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  animStartTime: number;
};

type Props = {
  initialTrains: Train[];
};

/* =========================
   CONSTANTS
========================= */
const POLL_INTERVAL_MS = 30_000;
const ANIM_DURATION_MS = 28_000;

const TRAIN_COLORS: Record<string, string> = {
  "5": "#2563eb", // blue  – Toronto → Vancouver
  "6": "#dc2626", // red   – Vancouver → Toronto
};
const FALLBACK_COLOR = "#6b7280";

/* =========================
   HELPERS
========================= */
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function formatETA(iso: string) {
  return new Date(iso).toLocaleString("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getNextStation(train: Train) {
  if (!train.extra?.times) return null;
  const now = new Date();
  return (
    train.extra.times.find(
      (stop) =>
        stop.arrival?.estimated && new Date(stop.arrival.estimated) > now,
    ) ?? null
  );
}

function splitRoute(train: TrainAnim): {
  travelled: [number, number][];
  remaining: [number, number][];
} {
  const stops = train.extra?.times ?? [];
  const stopsWithCoords = stops.filter((s) => s.latitude && s.longitude);
  if (stopsWithCoords.length < 2) return { travelled: [], remaining: [] };

  const now = new Date();
  const nextIdx = stopsWithCoords.findIndex(
    (s) => s.arrival?.estimated && new Date(s.arrival.estimated) > now,
  );

  const all: [number, number][] = stopsWithCoords.map((s) => [
    s.latitude!,
    s.longitude!,
  ]);

  const current: [number, number] = [train.displayLat, train.displayLng];

  if (nextIdx <= 0) {
    return { travelled: [], remaining: [current, ...all] };
  }

  return {
    travelled: [...all.slice(0, nextIdx), current],
    remaining: [current, ...all.slice(nextIdx)],
  };
}

/* =========================
   MAP READY HELPER
========================= */
function MapReadyHandler({
  onReady,
  onUserInteract,
}: {
  onReady: (map: L.Map) => void;
  onUserInteract: () => void;
}) {
  const map = useMap();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    onReady(map);
    map.on("dragstart", onUserInteract);
    map.on("zoomstart", onUserInteract);
    return () => {
      map.off("dragstart", onUserInteract);
      map.off("zoomstart", onUserInteract);
    };
  }, [map, onReady, onUserInteract]);

  return null;
}

/* =========================
   LOADING OVERLAY
========================= */
function LoadingOverlay({ fadingOut }: { fadingOut: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(255,255,255,0.88)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        zIndex: 10,
        fontSize: "1.1rem",
        fontWeight: 600,
        color: "#374151",
        opacity: fadingOut ? 0 : 1,
        transition: fadingOut ? "opacity 1.5s ease" : "none",
        pointerEvents: fadingOut ? "none" : "auto",
      }}
    >
      <span
        style={{
          fontSize: "2.5rem",
          animation: "pulse 1.2s ease-in-out infinite",
        }}
      >
        🚆
      </span>
      Loading train positions…
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1);   opacity: 1; }
          50%       { transform: scale(1.2); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

/* =========================
   MAIN COMPONENT
========================= */
export default function TrainMap({ initialTrains }: Props) {
  const [animTrains, setAnimTrains] = useState<TrainAnim[]>(() =>
    initialTrains
      .filter((t) => t.latitude && t.longitude)
      .map((t) => ({
        ...t,
        displayLat: t.latitude!,
        displayLng: t.longitude!,
        fromLat: t.latitude!,
        fromLng: t.longitude!,
        toLat: t.latitude!,
        toLng: t.longitude!,
        animStartTime: performance.now(),
      })),
  );

  // Stays true until the map is ready AND fitBounds has been called
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const animTrainsRef = useRef<TrainAnim[]>(animTrains);
  animTrainsRef.current = animTrains;

  const mapRef = useRef<L.Map | null>(null);
  const rafRef = useRef<number | null>(null);
  const userInteractedRef = useRef(false);

  /* =========================
     ICONS
  ========================= */
  const greenIcon = new L.Icon({
    iconUrl: "/images/icons/train-map-icon.svg",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
  const redIcon = new L.Icon({
    iconUrl: "/images/icons/train-map-icon.svg",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  /* =========================
     AUTO-ZOOM
  ========================= */
  const fitToTrains = useCallback((trains: TrainAnim[]) => {
    const map = mapRef.current;
    if (!map || trains.length === 0 || userInteractedRef.current) return;
    const latLngs = trains.map((t) => L.latLng(t.displayLat, t.displayLng));
    map.invalidateSize();
    map.fitBounds(L.latLngBounds(latLngs), { padding: [80, 80], maxZoom: 10 });
  }, []);

  /* =========================
     MAP READY CALLBACK
  ========================= */
  const dismissOverlay = useCallback(() => {
    setIsFadingOut(true);
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  const handleMapReady = useCallback(
    (map: L.Map) => {
      mapRef.current = map;
      if (animTrainsRef.current.length > 0) {
        fitToTrains(animTrainsRef.current);
        map.once("moveend", dismissOverlay);
      } else {
        dismissOverlay();
      }
    },
    [fitToTrains, dismissOverlay],
  );

  const handleUserInteract = useCallback(() => {
    userInteractedRef.current = true;
  }, []);

  /* =========================
     rAF ANIMATION LOOP
  ========================= */
  const tick = useCallback(() => {
    const now = performance.now();
    setAnimTrains((prev) =>
      prev.map((train) => {
        const elapsed = now - train.animStartTime;
        const rawT = Math.min(elapsed / ANIM_DURATION_MS, 1);
        const t = easeInOut(rawT);
        return {
          ...train,
          displayLat: lerp(train.fromLat, train.toLat, t),
          displayLng: lerp(train.fromLng, train.toLng, t),
        };
      }),
    );
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);

  /* =========================
     POLL API
  ========================= */
  useEffect(() => {
    const fetchTrains = async () => {
      const res = await fetch("/api/via-rail");
      const data = await res.json();
      const fresh: Train[] = (data.trains ?? []).filter(
        (t: Train) => t.id === "5" || t.id === "6",
      );

      const now = performance.now();

      setAnimTrains((prev) => {
        const updated = fresh
          .filter((t) => t.latitude && t.longitude)
          .map((t) => {
            const existing = prev.find((p) => p.id === t.id);
            return {
              ...t,
              fromLat: existing?.displayLat ?? t.latitude!,
              fromLng: existing?.displayLng ?? t.longitude!,
              toLat: t.latitude!,
              toLng: t.longitude!,
              displayLat: existing?.displayLat ?? t.latitude!,
              displayLng: existing?.displayLng ?? t.longitude!,
              animStartTime: now,
            };
          });

        fitToTrains(
          updated.map((t) => ({
            ...t,
            displayLat: t.toLat,
            displayLng: t.toLng,
          })),
        );

        return updated;
      });
    };

    fetchTrains();
    const interval = setInterval(fetchTrains, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fitToTrains]);

  const handleRecentre = useCallback(() => {
    userInteractedRef.current = false;
    fitToTrains(animTrainsRef.current);
  }, [fitToTrains]);

  /* =========================
     RENDER
  ========================= */
  return (
    <div style={{ height: "800px", width: "100%", position: "relative", zIndex: "1", padding: "20px" }}>
      <MapContainer
        center={[53.9171, -122.7497]}
        zoom={8}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <MapReadyHandler
          onReady={handleMapReady}
          onUserInteract={handleUserInteract}
        />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {animTrains.map((train) => {
          const color = TRAIN_COLORS[train.id] ?? FALLBACK_COLOR;
          const { travelled, remaining } = splitRoute(train);
          const nextStop = getNextStation(train);

          return (
            <React.Fragment key={train.id}>
              {travelled.length >= 2 && (
                <Polyline
                  positions={travelled}
                  pathOptions={{
                    color,
                    weight: 3,
                    opacity: 0.25,
                    dashArray: "6 4",
                  }}
                />
              )}

              {remaining.length >= 2 && (
                <Polyline
                  positions={remaining}
                  pathOptions={{ color, weight: 4, opacity: 0.85 }}
                />
              )}

              <Marker
                position={[train.displayLat, train.displayLng]}
                icon={
                  train.speedKph && train.speedKph > 100 ? redIcon : greenIcon
                }
              >
                <Popup>
                  <div style={{ minWidth: 230 }}>
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        marginBottom: 6,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: color,
                          flexShrink: 0,
                        }}
                      />
                      Train {train.id}
                    </div>

                    <div>
                      <strong>Speed:</strong>{" "}
                      {train.speedKph ? `${train.speedKph} kph` : "—"}
                    </div>

                    <div>
                      <strong>Next Stop:</strong> {nextStop?.station ?? "—"}
                    </div>

                    <div>
                      <strong>ETA:</strong>{" "}
                      {nextStop?.arrival?.estimated
                        ? formatETA(nextStop.arrival.estimated)
                        : "—"}
                    </div>

                    <div style={{ marginTop: 6 }}>
                      <strong>Route:</strong> {train.extra?.from ?? "—"} →{" "}
                      {train.extra?.to ?? "—"}
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Re-centre button — only visible after user has interacted */}
      {!isLoading && (
        <button
          onClick={handleRecentre}
          title="Re-centre map"
          style={{
            position: "absolute",
            bottom: 30,
            right: 30,
            zIndex: 1000,
            background: "white",
            border: "2px solid rgba(0,0,0,0.2)",
            borderRadius: 6,
            width: 36,
            height: 36,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }}
        >
          🎯
        </button>
      )}

      {/* Loading overlay — dismissed only after map is ready and fitBounds has fired */}
      {isLoading && <LoadingOverlay fadingOut={isFadingOut} />}

      {/* No-trains overlay — shown only after loading completes */}
      {!isLoading && animTrains.length === 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          🚆 No trains are currently operating.
          <br />
          Please check back later.
        </div>
      )}
    </div>
  );
}
