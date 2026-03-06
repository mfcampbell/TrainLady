// app/events/page.tsx
import Link from "next/link";

type EventSummary = {
  id: string;
  name: { text: string };
  start: { local: string };
  logo?: { url: string };
};

// Fetch events from your serverless API route
async function fetchEvents(): Promise<EventSummary[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/eventbrite`, {
      cache: "no-store", // always fresh
    });
    if (!res.ok) throw new Error("Failed to fetch events");
    const data = await res.json();
    return data.events || [];
  } catch (err) {
    console.error("Error fetching events:", err);
    return [];
  }
}

export default async function EventsPage() {
  const events = await fetchEvents();

  if (!events.length) {
    return (
      <p className="text-center py-12 text-gray-600">
        No upcoming events found.
      </p>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl lg:text-6xl font-bold text-center mb-10">
        Upcoming Events
      </h1>

      <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <li key={event.id} className="border rounded-md overflow-hidden shadow-sm bg-white">
            {event.logo?.url && (
              <img
                src={event.logo.url}
                alt={event.name.text}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{event.name.text}</h2>
              <p className="mb-4 text-gray-600">
                {new Date(event.start.local).toLocaleString()}
              </p>
              <Link
                href={`/events/details/${event.id}`}
                className="trip-button px-4 py-2 rounded font-semibold inline-block"
              >
                View Details
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}