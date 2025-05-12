// app/page.tsx
import React from "react";
import Link from "next/link";
import Events from '@/components/Events';
import ImageCarousel from "@/components/ImageCarousel";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';
import {Playfair} from "next/font/google";

const playfairDisplay = Playfair({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

type EventbriteEvent = {
  id: string;
  name: { text: string };
  description: { text: string };
  url: string;
  start: { local: string };
  logo: { url: string } | null;
};

async function getEvents(): Promise<EventbriteEvent[]> {
  console.log("Loaded token:", process.env.EVENTBRITE_TOKEN);

  const res = await fetch(
    "https://www.eventbriteapi.com/v3/organizations/2753828311591/events/?token=",
    {
      headers: {
        Authorization: `Bearer ${process.env.EVENTBRITE_TOKEN as string}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const error = await res.text();
    console.error("Eventbrite API fetch failed:", res.status, error);
    return [];
  }

  const data = await res.json();
  return data.events ?? [];
}
export default async function HomePage() {
  const events = await getEvents();
  const images = [
    {
      src: "/images/slide1.jpg",
      title: "Historic Train Tours",
      description: "Tour the historic ghost towns of the East Line by train",
    },
    {
      src: "/images/slide2.jpg",
      title: "Local Art Showcase",
      description: "Explore beautiful artwork by local talent.",
    },
  ];
  return (
    <main className="min-h-screen">
      <LoadingScreen />
      <Navbar />
      <div className="imageSlider mb-10">
        <ImageCarousel images={images} />
      </div>
      <div className="content mb-10">
        <Events />
        <div className="md:container md:mx-auto">
          <h1 className={`${playfairDisplay.variable} antialiased`}>
            Upcoming Tours
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white p-4 shadow-sm border-1 border-solid border-slate-200"
              >
                {event.logo && (
                  <Link href={`/events/${event.id}`} className="block">
                    <img
                      src={event.logo.url}
                      alt={event.name.text}
                      className="w-full h-48 object-cover mb-4"
                    />
                  </Link>
                )}
                <Link href={`/events/${event.id}`} className="block">
                  <h2 className="text-xl font-semibold mb-2">
                    {event.name.text}
                  </h2>
                </Link>
                <p className="text-sm text-gray-600 mb-4">
                  {new Date(event.start.local).toLocaleString()}
                </p>
                <p className="text-gray-700 line-clamp-4 mb-4">
                  {event.description.text}
                </p>
                <a
                  href={`/events/${event.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
                >
                  Learn More
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
