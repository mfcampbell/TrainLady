"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type EventbriteEvent = {
  id: string;
  name: { text: string };
  description: { text?: string };
  start: { local: string };
  logo?: { url: string };
};

export default function EventsClient() {
  const [events, setEvents] = useState<EventbriteEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/eventbrite");
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch events");
        }
        const data = await res.json();
        setEvents(data.events ?? []);
      } catch (err: any) {
        console.error("Error fetching events:", err);
        setError(err.message || "Unable to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <p className="text-center py-6">Loading events...</p>;
  if (error) return <p className="text-red-500 text-center py-6">{error}</p>;
  if (!events.length) return <p className="text-center py-6 text-gray-600">No events found.</p>;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12 p-4">
      {events.map((event) => (
        <div key={event.id} className="shadow-md bg-white rounded-md overflow-hidden">
          {event.logo?.url && (
            <img
              src={event.logo.url}
              alt={event.name.text}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <h2 className="text-xl font-bold">{event.name.text}</h2>
            <p className="text-gray-500 mb-2">
              {new Date(event.start.local).toLocaleString()}
            </p>
            {event.description?.text && (
              <p className="text-sm text-gray-700 mb-4">{event.description.text.slice(0, 100)}...</p>
            )}
            <Link
              href={`/events/details/${event.id}`}
              className="mt-2 inline-block px-6 py-2 rounded font-semibold transition trip-button"
            >
              View Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}