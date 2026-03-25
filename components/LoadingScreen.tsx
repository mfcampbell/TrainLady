'use client';

import { useEffect, useState } from 'react';

export default function LoadingScreen({ onDone }: { onDone?: () => void }) {
  const [visible, setVisible] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // sessionStorage persists only for the current browser tab
    const hasVisited = sessionStorage.getItem('visited');

    if (hasVisited) {
      // Skip loading screen, reveal immediately
      setVisible(false);
      onDone?.();
      return;
    }

    sessionStorage.setItem('visited', 'true');

    const fadeTimer = setTimeout(() => setFade(true), 3500);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 3500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-1000 ${
        fade ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <img
        src="/images/trainlady-paint-01.svg"
        alt="Loading..."
        className="h-96"
      />
    </div>
  );
}