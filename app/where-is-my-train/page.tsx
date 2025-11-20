"use client"; // required for useEffect and Leaflet

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

type Train = {
  id: string;
  latitude: number | null;
  longitude: number | null;
  speedKph: number | null;
  nextStop?: string | null;
  eta?: string | null;
};

export default function WheresMyTrainStatic() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use your Vercel API endpoint
  const API_URL = "https://train-lady-9sz8s6ba8-mfcampbells-projects.vercel.appapi/via-rail";

  useEffect(() => {
    const fetchTrains = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch API");
        const data = await res.json();
        setTrains(data.trains ?? []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error fetching train data");
      } finally {
        setLoading(false);
      }
    };

    fetchTrains();
    const interval = setInterval(fetchTrains, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const center: [number, number] = [56, -106]; // Canada center

  return (
    <div className="p-4 font-sans">
      <h1 className="text-3xl font-bold mb-4">Where's My Train? (Map)</h1>
      {loading && <p>Loading train data…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      {!loading && !error && trains.length === 0 && <p>No trains found.</p>}

      <div style={{ height: "600px", width: "100%" }}>
        <MapContainer center={center} zoom={4} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {trains
            .filter((t) => t.latitude !== null && t.longitude !== null)
            .map((train) => (
              <Marker key={train.id} position={[train.latitude!, train.longitude!]}>
                <Popup>
                  <strong>Train {train.id}</strong>
                  <br />
                  Speed: {train.speedKph ?? "-"} kph
                  <br />
                  Next Stop: {train.nextStop ?? "-"}
                  <br />
                  ETA: {train.eta ?? "-"}
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
}