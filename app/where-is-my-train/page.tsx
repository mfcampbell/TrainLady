// app/train-tracker/page.tsx
'use client';

import dynamic from 'next/dynamic';

const TrainMap = dynamic(() => import('@/components/TrainTracker'), { ssr: false });

export default function TrainTrackerPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Live VIA Rail Train Tracker</h1>
      <TrainMap />
    </div>
  );
}