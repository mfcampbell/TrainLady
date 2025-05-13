// app/page.tsx
import React from "react";
import Events from '@/components/Events';
import ImageCarousel from "@/components/ImageCarousel";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoadingScreen from '@/components/LoadingScreen';
import {Playfair} from "next/font/google";

const playfairDisplay = Playfair({
  weight: "800",
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
        <div className="md:container md:mx-auto">
          <h1 className={`${playfairDisplay.className} antialiased text-6xl font-bold text-center mb-10`}>
            Upcoming Tours
          </h1>
          <div className="events">
            <Events />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
