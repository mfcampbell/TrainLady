'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import Image from 'next/image';

interface CarouselImage {
  src: string;
  title?: string;
  description?: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  interval?: number;
}

export default function ImageCarousel({ images, interval = 7500 }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const length = images.length;

  // Autoplay effect
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % length);
    }, interval);
    return () => clearInterval(timer);
  }, [isPlaying, interval, length]);

  // Navigation functions
  const prevSlide = () => setCurrent((prev) => (prev - 1 + length) % length);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % length);
  const goToSlide = (index: number) => setCurrent(index);

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 50) prevSlide();
    else if (deltaX < -50) nextSlide();
    touchStartX.current = null;
  };

  return (
    <div
      className="relative w-full mx-auto overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      {images.map((image, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-2500 ease-in-out ${
            idx === current ? 'opacity-100 relative z-10' : 'opacity-0'
          }`}
        >
          <Image
            src={image.src}
            alt={image.title ?? `Slide ${idx + 1}`}
            className="w-full h-[500px] object-cover"
          />
          {/* Caption */}
          {(image.title || image.description) && (
            <div className="absolute bottom-0 bg-black/50 text-white p-4 w-full">
              {image.title && <h3 className="text-xl font-bold">{image.title}</h3>}
              {image.description && <p className="text-sm">{image.description}</p>}
            </div>
          )}
        </div>
      ))}

      {/* Controls */}
      <div className="absolute z-30 inset-0 flex justify-between items-center px-4">
        <button
          onClick={prevSlide}
          className="bg-white/70 hover:bg-white text-black rounded-full p-2"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="bg-white/70 hover:bg-white text-black rounded-full p-2"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Play/Pause toggle */}
      <button
        onClick={() => setIsPlaying((prev) => !prev)}
        className="absolute z-30 top-4 right-4 bg-white/70 hover:bg-white text-black rounded-full p-2"
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>

      {/* Dots */}
      <div className="absolute z-30 bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`w-3 h-3 rounded-full ${
              idx === current ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}