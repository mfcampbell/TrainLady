// components/FAQ.tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Where do we meet?",
    answer:
      "We meet at the VIA rail station in Prince George, BC. The address is 123 Main St, Prince George, BC V2L 1A1.",
  },
   {
    question: "What time should I arrive?",
    answer:
      "Please arrive at least 30 minutes before the scheduled departure time to allow for check-in and boarding.",
  },
  {
    question: "Is parking available?",
    answer:
      "Yes! Parking is available at the VIA rail station.",
  },
  {
    question: "What should I bring on the trip?",
    answer:
      "We recommend bringing comfortable and weather-appropriate clothing, a camera for capturing beautiful moments, personal items, and any necessary medications. Light snacks and drinks. Don’t forget to pack a sense of adventure!",
  },
  {
    question: "How do we get back to our vehicles?",
    answer:
      "After the trip, we will provide bus transportation back to the VIA rail station in Prince George where your vehicles are parked.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mx-auto py-12 px-4">
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="shadow-sm">
            <button
              className="w-full faq-button flex justify-between items-center p-4 text-left font-medium focus:outline-none"
              onClick={() => toggle(index)}
            >
              {faq.question}
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-300 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 px-4 bg-white ${
                openIndex === index ? "max-h-40 py-4" : "max-h-0"
              }`}
            >
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}