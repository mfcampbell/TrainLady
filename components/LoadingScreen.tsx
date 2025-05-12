'use client';

import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [visible, setVisible] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const lastVisit = localStorage.getItem('lastVisit');
    const now = new Date().getTime();

    // Check if it's been more than 24 hours
    if (!lastVisit || now - parseInt(lastVisit) > 24 * 60 * 60 * 1000) {
      setVisible(true);
      localStorage.setItem('lastVisit', now.toString());

      const fadeTimer = setTimeout(() => setFade(true), 3000);
      const hideTimer = setTimeout(() => setVisible(false), 4000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-1000 ${
        fade ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <img
        src="images/trainlady-paint-01.svg"
        alt="Loading..."
        className="h-96"
      />
    </div>
  );
}