// This component creates a "Back to Top" button that appears when the user scrolls down the page.
"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    isVisible && (
      <button
        onClick={scrollToTop}
        className="fixed trip-button bottom-6 right-6 z-50 p-3 rounded-full  shadow-lg transition-opacity duration-300"
        aria-label="Scroll to top"
      >
        <ArrowUp />
      </button>
    )
  );
}