// app/events/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from 'next/link';
import Image from 'next/image';

type EventbriteEvent = {
  id: string;
  name: { text: string };
  description: { html: string };
  url: string;
  start: { local: string };
  logo: { url: string } | null;
};

async function getEvent(id: string): Promise<EventbriteEvent | null> {
  const res = await fetch(`https://www.eventbriteapi.com/v3/events/${id}/`, {
    headers: {
      Authorization: `Bearer ${process.env.EVENTBRITE_TOKEN as string}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error(`Failed to fetch event ${id}:`, await res.text());
    return null;
  }

  return await res.json();
}

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEvent(params.id);

  if (!event) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
    <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">← Back</Link>
      <div className="image-container">
        {event.logo?.url && (
          <Image
            src={event.logo.url}
            alt={event.name.text}
            className="mb-6 rounded-xl w-full"
          />
        )}
      </div>
      <h1 className="text-3xl font-bold mb-2">{event.name.text}</h1>
      <p className="text-gray-500 mb-6">
        {new Date(event.start.local).toLocaleString()}
      </p>
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: event.description?.html ?? "" }}
      />
      <a
        href={event.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-6 bg-teal-500 text-white px-6 py-2 rounded hover:bg-teal-600"
      >
        Buy Tickets
      </a>
    </main>
  );
}
