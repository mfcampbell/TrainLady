"use client";

import React, { useEffect, useState } from "react";
import { Playfair } from "next/font/google";
import FAQ from "@/components/FAQ";

const playfairDisplay = Playfair({
  weight: "800",
  subsets: ["latin"],
});

type EventData = {
  name: { text: string };
  description: { html: string };
  url: string;
  start: { local: string };
  logo: {
    url: string;
    original?: { url: string };
  } | null;
  capacity?: number;
  venue?: {
    address: { localized_address_display: string };
    name: string;
  };
  structured_content?: {
    modules?: {
      id: string;
      type: string;
      data: { body?: { text: string }; image?: { original: { url: string } } };
    }[];
  };
};

type Ticket = {
  name: string;
  free: boolean;
  cost?: { display: string };
  on_sale_status: string;
  quantity_total?: number;
  quantity_sold?: number;
};

export default function EventDetailsClient({ id }: { id?: string }) {
  const [event, setEvent] = useState<EventData | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string | null>(null);

  const soldOut =
    tickets.length > 0 &&
    tickets.every((ticket) => ticket.on_sale_status === "SOLD_OUT");

  // Fetch event details from your Vercel serverless function
  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/eventbrite/${id}`);
        if (!res.ok) throw new Error("Failed to fetch event details");
        const data = await res.json();
        setEvent(data.event);
        setTickets(data.tickets ?? []);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Unable to load event details");
      }
    };

    fetchEvent();
  }, [id]);

  // Eventbrite widget
  useEffect(() => {
    if (!event || soldOut || !document.getElementById("custom-eventbrite-button"))
      return;

    const script = document.createElement("script");
    script.src = "https://www.eventbrite.com/static/widgets/eb_widgets.js";
    script.async = true;

    script.onload = () => {
      // @ts-ignore
      if (window.EBWidgets) {
        // @ts-ignore
        window.EBWidgets.createWidget({
          widgetType: "checkout",
          eventId: id,
          modal: true,
          modalTriggerElementId: "custom-eventbrite-button",
          theme: "light",
        });
      }
    };

    document.body.appendChild(script);
  }, [event]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!event) return <p>Loading...</p>;

  const fullAddress = event.venue?.address?.localized_address_display;
  const imageUrl = event.logo?.original?.url || event.logo?.url;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={event.name.text}
          className="w-full max-h-[400px] object-cover rounded-md mb-6"
        />
      )}

      <h1
        className={`${playfairDisplay.className} antialiased text-4xl lg:text-6xl font-bold`}
      >
        {event.name.text}
      </h1>
      <p className="mb-12 font-bold">
        <span>Date/Time:</span> {new Date(event.start.local).toLocaleString()}
      </p>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">About this Event</h2>
        <div className="prose max-w-none">
          {event.structured_content?.modules?.map((module) => {
            if (module.type === "text" && module.data?.body?.text) {
              return (
                <div
                  key={module.id}
                  dangerouslySetInnerHTML={{ __html: module.data.body.text }}
                />
              );
            }

            if (module.type === "image" && module.data?.image?.original?.url) {
              return (
                <img
                  key={module.id}
                  src={module.data.image.original.url}
                  alt=""
                  className="my-4 rounded"
                />
              );
            }

            return null;
          })}
        </div>
      </div>

      {tickets.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Tickets</h2>
          <ul className="list-disc list-inside">
            {tickets.map((ticket) => {
              const isSoldOut = ticket.on_sale_status === "SOLD_OUT";
              return (
                <li key={ticket.name}>
                  {ticket.name} — {ticket.free ? "Free" : ticket.cost?.display ?? "Price TBA"}{" "}
                  {isSoldOut && <span className="ml-2">(Sold Out)</span>}
                  {!isSoldOut &&
                    ticket.quantity_total != null &&
                    ticket.quantity_sold != null && (
                      <span className="ml-2">
                        ({ticket.quantity_total - ticket.quantity_sold} remaining)
                      </span>
                    )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {fullAddress && (
        <div className="mb-12">
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
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              fullAddress
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Google Maps →
          </a>

          <div>
            <button
              id="custom-eventbrite-button"
              disabled={soldOut}
              className={`mt-6 px-6 py-2 rounded font-semibold transition ${
                soldOut
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "trip-button"
              }`}
            >
              {soldOut ? "Sold Out" : "Buy Tickets"}
            </button>
          </div>
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

      <div id="eventbrite-widget-container" className="mt-8" />
    </div>
  );
}