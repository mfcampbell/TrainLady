'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type Train = {
  trainid: string;
  trainnumber: string;
  lat: number;
  lng: number;
  status: string;
};

export default function TrainTracker() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const res = await fetch('https://tsimobile.viarail.ca/data/allData.json');
        const data = await res.json();
        const parsed: Train[] = data.map((t: any) => ({
          trainid: t.trainid,
          trainnumber: t.trainnumber,
          lat: parseFloat(t.lat),
          lng: parseFloat(t.lng),
          status: t.status,
        }));
        setTrains(parsed);
      } catch (error) {
        console.error('Error fetching train data:', error);
      }
    };

    fetchTrains();
    const interval = setInterval(fetchTrains, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const filteredTrains = filter
    ? trains.filter((t) => t.trainnumber.includes(filter))
    : trains;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter by train number..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full"
        />
      </div>

      <MapContainer>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {filteredTrains.map((train) => (
          <Marker key={train.trainid} position={[train.lat, train.lng]}>
            <Popup>
              <strong>Train {train.trainnumber}</strong>
              <br />
              Status: {train.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}