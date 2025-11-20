// app/events/details/page.tsx
import { Suspense } from "react";
import EventDetailsClient from "./details/EventDetailsClient";

export default function EventDetailsPage() {
  return (
    <Suspense fallback={<p className="text-center py-12">Loading event...</p>}>
      <EventDetailsClient />
    </Suspense>
  );
}