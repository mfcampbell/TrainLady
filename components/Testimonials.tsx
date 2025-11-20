// components/Testimonials.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { Playfair } from "next/font/google";

const playfairDisplay = Playfair({
  weight: "800",
  subsets: ["latin"],
});

const testimonials = [
  {
    quote: "Thank you to all for this opportunity to go on the train and learn about our history. Loved the stories    people shared about living along the tracks. Thank you again! 😊🚂",
    author: "J. Allison",
    title: "via Facebook",
  },
  {
    quote: "Thanks Linda and all the helpers in making this a special day for so many.  Thanks to all for posting great pictures.",
    author: "C. Conway",
    title: "via Facebook",
  },
  {
    quote: "Great day! Great people! Great stories! Great food! Great pictures! What a great adventure all!!",
    author: "J. Miller",
    title: "via Facebook",
  },
   {
    quote: "Had a really good time and can't wait for the next one",
    author: "J. Miller",
    title: "via Facebook",
  },
  {
    quote: "Thank you Linda for a wonderful day with a great group of people.  Thank you Ray for your interesting and entertaining stories.",
    author: "J. Miller",
    title: "via Facebook",
  },
  {
    quote: "Well done Linda, Grace, Sinclair Mills postmistress,bus driver and train staff. You all gave us a lovely family day excursion! The children will have train stories to share",
    author: "J. Miller",
    title: "via Facebook",
  },
  {
    quote: "As usual we had an awesome group travelling with us. I especially enjoy learning of the connections that some of group had to the communities and individuals that lived and worked in the area. Thanks for your input and thanks again to Linda for, once again, putting together a great group to travel with.",
    author: "J. Miller",
    title: "via Facebook",
  },
  {
    quote: "Thank you Linda for organizing this event and thank you Ray for the amazing narrative of what the east line looked like back on the day.  I just came for the train ride, but came away with a whole new appreciation of some amazing local history.  Thank you so much for!",
    author: "J. Miller",
    title: "via Facebook",
  },
];

export default function TestimonialsSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const timeout = useRef<NodeJS.Timeout | null>(null);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      mode: "snap",
      slides: { perView: 1 },
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel);
      },
    },
    [
      (slider) => {
        let clearNextTimeout = () => {
          if (timeout.current) clearTimeout(timeout.current);
        };
        let nextTimeout = () => {
          if (timeout.current) clearTimeout(timeout.current);
          timeout.current = setTimeout(() => {
            slider.next();
          }, 6000);
        };

        slider.on("created", nextTimeout);
        slider.on("dragStarted", clearNextTimeout);
        slider.on("animationEnded", nextTimeout);
        slider.on("updated", nextTimeout);
      },
    ]
  );

  return (
    <section className=" py-12 px-4">
      <h2 className={`${playfairDisplay.className} antialiased text-4xl lg:text-6xl font-bold text-center mb-12`}>What People Are Saying</h2>

      <div className="py-12">
        <div ref={sliderRef} className="keen-slider max-w-2xl mx-auto">
        {testimonials.map((t, idx) => (
          <div key={idx} className="keen-slider__slide bg-white rounded-xl p-6 shadow-md">
            <p className="text-lg md:text-4xl">“{t.quote}”</p>
            {/*
            <div className="mt-4">
              <p className="text-gray-900">{t.author}</p>
            </div>
            */}
          </div>
        ))}
      </div>
      </div>
      {/* Dots Navigation */}
      <div className="flex justify-center mt-6 space-x-2">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => instanceRef.current?.moveToIdx(idx)}
            className={`w-3 h-3 rounded-full ${
              currentSlide === idx ? "trip-button" : "bg-gray-300"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}