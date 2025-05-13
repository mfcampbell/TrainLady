'use client';

import { useEffect, useState } from 'react';
import {Playfair} from "next/font/google";
import Image from 'next/image';

const playfairDisplay = Playfair({
  variable: "--font-playfair-display",
  weight: "800",
  subsets: ["latin"],
});

interface EventbriteEvent {
  id: string;
  name: { text: string };
  description: { text: string };
  url: string;
  logo?: { url: string };
  start: { local: string };
}

export default function EventbriteEvents() {
  const [events, setEvents] = useState<EventbriteEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/eventbrite');
        if (!res.ok) throw new Error('Failed to fetch events');
        const data = await res.json();
        setEvents(data.events);
      } catch (err) {
        console.error(err);
        setError('Unable to load events.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <p>Loading events...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {events.map((event) => (
        <div key={event.id} className="bg-white shadow-md rounded-lg p-4">
          {event.logo?.url && (
            <Image
              src={event.logo.url}
              alt={event.name.text}
              className="w-full h-48 object-cover rounded"
            />
          )}
          <h2 className={`${playfairDisplay.className} text-xl font-semibold mt-2`}>{event.name.text}</h2>
          <p className="text-sm text-gray-600 mb-2">
            {new Date(event.start.local).toLocaleString()}
          </p>
          <p className="text-sm text-gray-700 line-clamp-3">
            {event.description?.text?.slice(0, 200)}...
          </p>
          <a
            href={`/events/${event.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
          >
            Learn More
          </a>
        </div>
      ))}
    </div>
  );
}