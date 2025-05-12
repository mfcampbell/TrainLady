'use client';

import { useEffect } from 'react';

export default function EventbriteCheckout({ eventId }: { eventId: string }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.eventbrite.com/static/widgets/eb_widgets.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (typeof window !== 'undefined' && (window as any).EbWidgets) {
        (window as any).EbWidgets.createWidget({
          widgetType: 'checkout',
          eventId,
          modal: true,
          modalTriggerElementId: `eventbrite-widget-trigger-${eventId}`,
        });
      }
    };
  }, [eventId]);

  return (
    <button
      id={`eventbrite-widget-trigger-${eventId}`}
      className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
    >
      Register Now
    </button>
  );
}