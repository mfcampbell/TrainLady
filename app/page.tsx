// app/page.tsx
import Events from "@/components/Events";
import EventCalendar from "@/components/EventCalendar";
import ImageCarousel from "@/components/ImageCarousel";
import FAQ from "@/components/FAQ";
import Testimonials from "@/components/Testimonials";
import FadeIn from "@/components/FadeIn";
import { Playfair } from "next/font/google";
import LoadingScreen from "@/components/LoadingScreen";

const playfairDisplay = Playfair({
  weight: "800",
  subsets: ["latin"],
});


export default async function HomePage() {
  
  const images = [
     {
      src: "/images/slide5.jpg",
      title: "Local Art Showcase",
      description: "Explore beautiful artwork by local talent.",
    },
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
     {
      src: "/images/slide3.jpg",
      title: "Local Art Showcase",
      description: "Explore beautiful artwork by local talent.",
    },
     {
      src: "/images/slide4.jpg",
      title: "Local Art Showcase",
      description: "Explore beautiful artwork by local talent.",
    },
    
  ];
  return (
    <div className="min-h-screen">
      <LoadingScreen />
      <div className="imageSlider">
        <ImageCarousel images={images} />
      </div>

      <div className="intro-content py-12 px-4 bg-leaf mb-12">
        <div className="md:container md:mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="col-span-1 md:col-span-4 md:col-start-2">
              <h1
                className={`${playfairDisplay.className} antialiased text-4xl lg:text-6xl font-bold text-center mb-10`}
              >
                Our Train Trips
              </h1>
              <p className="text-center text-6md lg:text-2xl mb-10">
                Please join us for a friendly, fun and interesting train day trip from Prince George to original train stops, many now gone, along the east or west line.  You will get a glimpse into the past of these communities and share the experience with others that have similar interests.  We will bus back to Prince George and be home in the later afternoon.  It makes for a lovely day in any season!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="content">
        <FadeIn>
          <section className="upcoming-tours section pt-12 pb-12">
            <div className="md:container md:mx-auto">
              <h2
                className={`${playfairDisplay.className} antialiased text-4xl lg:text-6xl font-bold text-center mb-10`}
              >
                Upcoming Trips
              </h2>
              <div className="events">
                <Events />
              </div>
            </div>
          </section>
        </FadeIn>
        <FadeIn>
          <section className="calendar-of-events pb-12">
            <div className="md:container md:mx-auto">
              <h2
                className={`${playfairDisplay.className} antialiased text-4xl lg:text-6xl font-bold text-center mb-10`}
              >
                Calendar of Trips
              </h2>
              <div className="events-calendar pb-12">
                <EventCalendar />
              </div>
            </div>
          </section>
        </FadeIn>
        <FadeIn>
          <section className="questions section pb-12">
            <div className="md:container md:mx-auto">
              <h2
                className={`${playfairDisplay.className} antialiased text-4xl lg:text-6xl font-bold text-center mb-10`}
              >
                Frequently Asked Questions
              </h2>
              <div className="faq">
                <FAQ />
              </div>
            </div>
          </section>
        </FadeIn>
        <FadeIn>
          <section className="testimonials  py-12 px-4 section bg-[url('/images/vanderhoofbg.jpg')] bg-cover bg-center bg-no-repeat">
            <div className="md:container md:mx-auto">
              <div className="testimonials pb-12">
                <Testimonials />
              </div>
            </div>
          </section>
        </FadeIn>
      </div>
    </div>
  );
}
