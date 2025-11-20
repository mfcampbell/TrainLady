// app/events/details/page.tsx

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import EventDetailsClient from './EventDetailsClient';

function EventDetailsPageInner() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  if (!id) {
    return <p className="text-center py-12 text-red-500">No event ID provided in the URL.</p>;
  }

  return <EventDetailsClient id={id} />;
}

export default function EventDetailsPage() {
  return (
    <Suspense fallback={<p className="text-center py-12">Loading event...</p>}>
      <EventDetailsPageInner />
    </Suspense>
  );
}