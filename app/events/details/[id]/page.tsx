// app/events/details/[id]/page.tsx
import { Playfair } from "next/font/google";
import EventDetailsWidget from "../EventDetailsWidget";
import { MapPin, Calendar } from "lucide-react";
import FAQ from "@/components/FAQ";

const playfairDisplay = Playfair({
  weight: "800",
  subsets: ["latin"],
});

interface EventDetailsPageProps {
  params: Promise<{ id: string }>;
}

type EventData = {
  id: string;
  name: { text: string };
  description?: { html?: string };
  start: { local: string };
  logo?: { url: string };
  venue?: {
    address?: { localized_address_display: string };
    name: string;
  };
  tickets?: {
    name: string;
    free: boolean;
    cost?: { display: string };
    on_sale_status: string;
    quantity_total?: number;
    quantity_sold?: number;
  }[];
};

export default async function EventDetailsPage({
  params,
}: EventDetailsPageProps) {
  const { id } = await params;

  if (!id) {
    return (
      <p className="text-center py-12 text-red-500">
        No event ID provided in the URL.
      </p>
    );
  }

  // Server-side fetch using secret token
  const token = process.env.EVENTBRITE_TOKEN;
  if (!token) {
    return (
      <p className="text-center py-12 text-red-500">
        Eventbrite token not configured.
      </p>
    );
  }

  const [eventRes, ticketsRes] = await Promise.all([
    fetch(`https://www.eventbriteapi.com/v3/events/${id}/?expand=venue`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
    fetch(`https://www.eventbriteapi.com/v3/events/${id}/ticket_classes/`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
  ]);

  if (!eventRes.ok || !ticketsRes.ok) {
    return (
      <p className="text-center py-12 text-red-500">
        Failed to fetch event details.
      </p>
    );
  }
  const eventData = await eventRes.json();
  const ticketsData = await ticketsRes.json();

  const event: EventData = {
    ...eventData,
    tickets: ticketsData.ticket_classes,
  };

  const fullAddress = event.venue?.address?.localized_address_display;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Event Image */}
      {event.logo?.url && (
        <img
          src={event.logo.url}
          alt={event.name.text}
          className="w-full max-h-[400px] object-cover mb-12"
        />
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-3 md:col-span-2">
          {/* Event Title */}
          <h1
            className={`${playfairDisplay.className} antialiased text-4xl font-bold mb-2`}
          >
            {event.name.text}
          </h1>

          {/* Event Date/Time */}
          <p className="mb-12 font-bold">
            <span className="inline-block relative top-1">
              <Calendar />
            </span>{" "}
            {new Date(event.start.local).toLocaleDateString("en-CA", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
            <br />
            <span className="inline-block inline-block relative top-1">
              <MapPin />
            </span>{" "}
            {fullAddress}
          </p>
          {/* Description */}
          {event.description?.html && (
            <div
              className="prose mb-6 max-w-none"
              dangerouslySetInnerHTML={{ __html: event.description.html }}
            />
          )}
        </div>
        <div className="col-span-3 md:col-span-1">
          <div className="shadow-md bg-white rounded-md overflow-hidden p-4">
            {/* Tickets */}
            {event.tickets && event.tickets.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Tickets</h2>
                <ul className="list-none">
                  {event.tickets.map((ticket) => {
                    const soldOut = ticket.on_sale_status === "SOLD_OUT";
                    return (
                      <li key={ticket.name}>
                        {ticket.name}:{" "}
                        {ticket.free
                          ? "Free"
                          : (ticket.cost?.display ?? "Price TBA")}{" "}
                        {soldOut && <span className="ml-2">(Sold Out)</span>}
                        {!soldOut &&
                          ticket.quantity_total != null &&
                          ticket.quantity_sold != null && (
                            <span>
                              <br />
                              ({ticket.quantity_total - ticket.quantity_sold}{" "}
                              remaining)
                            </span>
                          )}
                          <br />
                        {new Date(event.start.local).toLocaleDateString(
                          "en-CA",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          },
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {/* Eventbrite Widget */}
            <EventDetailsWidget eventId={id} tickets={event.tickets} />
          </div>
        </div>
      </div>

      {/* Venue */}
      {fullAddress && (
        <div className="py-12">
          <h2 className="text-xl font-bold mb-2">Location</h2>
          <p className="mb-4">{fullAddress}</p>
          <iframe
            title="Venue Map"
            className="w-full h-64 rounded border mb-2"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`}
          ></iframe>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps →
          </a>
        </div>
      )}
      <section className="questions section pb-12">
        <div className="md:container md:mx-auto">
          <h2
            className={`${playfairDisplay.className} antialiased text-4xl lg:text-6xl font-bold text-center mb-10`}
          >
            Frequently Asked Questions
          </h2>
          <FAQ />
        </div>
      </section>
    </div>
  );
}
