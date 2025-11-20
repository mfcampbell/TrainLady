"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type EventbriteEvent = {
  id: string;
  name: { text: string };
  description: { text: string };
  url: string;
  start: { local: string };
  logo: { url: string } | null;
};

export default function EventsClient() {
  const [events, setEvents] = useState<EventbriteEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("https://www.eventbriteapi.com/v3/organizations/2753828311591/events/?token=F4OV4MXVY5EVQK5T4HOX");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setEvents(data.events ?? []);
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error fetching events:", err);
        } else {
          // Replace with real logging tool
          fetch("/api/log-error", {
            method: "POST",
            body: JSON.stringify({ error: (err as Error).message }),
          });
        }
      
        setError("Unable to load events. Please try again later.");
      }
    };

    fetchEvents();
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12 p-4">
      {events.map((event) => (
        <div key={event.id} className="shadow-md bg-white">
         <div className="event-image">
          {event.logo?.url && (
              <img src={event.logo.url} alt={event.name.text} className="w-full object-cover" />
            )}
         </div>
         <div className="event-details p-4">
          <h2 className="text-xl font-bold">{event.name.text}</h2>
          <p className="text-gray-500 mb-2">
            {new Date(event.start.local).toLocaleString()}
          </p>
          <p className="text-sm text-gray-700 mb-4">{event.description.text?.slice(0, 100)}...</p>
          <Link className="mt-6 px-6 py-2 rounded font-semibold transition trip-button" href={`/events/details?id=${event.id}`}>View Details</Link>
          </div>
        </div>
      ))}
    </div>
  );
}