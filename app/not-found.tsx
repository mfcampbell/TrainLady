// app/not-found.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-center px-6">
        <Link href="/" className="text-2xl font-bold text-blue-600">
            <Image
                src="images/trainlady-paint-01.svg"
                alt="Trainlady"
                className="w-60"
            />
        </Link>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-6">it looks like the page you’re looking for doesn’t exist.</p>
      <Link
        href="/"
        className="px-6 py-2 bg-lime-500 text-white rounded hover:bg-lime-600 transition"
      >
        Go Home
      </Link>
    </div>
  );
}