import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://trainlady.ca"),
  title: {
    default: "Train Lady",
    template: "%s | Train Lady",
  },
  description: "Historic Train Tours across Northern British Columbia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-grow md:pt-16">
          {children}
        </main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}