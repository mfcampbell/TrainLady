"use client";

import { useEffect } from "react";

interface EventDetailsWidgetProps {
  eventId: string;
  tickets?: any[];
}

export default function EventDetailsWidget({
  eventId,
  tickets,
}: EventDetailsWidgetProps) {
  useEffect(() => {
    if (!tickets || tickets.every((t) => t.on_sale_status === "SOLD_OUT")) return;

    const script = document.createElement("script");
    script.src = "https://www.eventbrite.com/static/widgets/eb_widgets.js";
    script.async = true;

    script.onload = () => {
      // @ts-ignore
      if (window.EBWidgets) {
        // @ts-ignore
        window.EBWidgets.createWidget({
          widgetType: "checkout",
          eventId,
          modal: true,
          modalTriggerElementId: "custom-eventbrite-button",
          theme: "light",
        });
      }
    };

    document.body.appendChild(script);
  }, [eventId, tickets]);

  const soldOut =
    tickets && tickets.every((t) => t.on_sale_status === "SOLD_OUT");

  return (
    <div>
      <button
        id="custom-eventbrite-button"
        disabled={soldOut}
        className={`mt-6 px-6 py-2 rounded font-semibold transition block w-full ${
          soldOut
            ? "bg-gray-400 text-gray-700 cursor-not-allowed"
            : "trip-button"
        }`}
      >
        {soldOut ? "Sold Out" : "Buy Tickets"}
      </button>
    </div>
  );
}