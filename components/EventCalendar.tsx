"use client";

import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useRouter } from "next/navigation";

type EventbriteEvent = {
  id: string;
  name: { text: string };
  description: { text: string };
  url: string;
  start: { local: string };
};

export default function EventCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await fetch(
        "https://www.eventbriteapi.com/v3/organizations/2753828311591/events/?token=F4OV4MXVY5EVQK5T4HOX"
      );
      const data = await res.json();
      const formatted = data.events.map((event: EventbriteEvent) => ({
        id: event.id,
        title: event.name.text,
        start: event.start.local,
        url: `/events/details?id=${event.id}`, // Link to your local route
      }));
      setEvents(formatted);
    };
    fetchEvents();
  }, []);

  return (
    <div className="w-full px-4">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
        eventDisplay="block"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}
        eventClick={(info) => {
          info.jsEvent.preventDefault(); // Prevent full page reload
          router.push(info.event.url!); // Navigate with Next.js
        }}
      />
    </div>
  );
}