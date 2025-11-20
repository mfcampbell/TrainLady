"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Facebook, House } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="shadow-md fixed w-full z-40 navbar">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          <img
            src="/images/trainlady-wordmark.svg"
            alt="Trainlady"
            className="w-18 md:w-24"
          />
        </Link>
        {/* Desktop Links */}
        <div className="flex items-center space-x-6">
          <NavLink href="/wheres-my-train">Where's My Train?</NavLink>
          <NavLink href="https://www.facebook.com/groups/1047823936706604">
            <Facebook className="w-6 h-6" />
          </NavLink>
          <a
            className="px-6 py-2 rounded font-semibold transition trip-button"
            href="mailto:linda@trainlady.ca?subject=Website%20Inquiry"
            onClick={toggleMenu}
          >
            <Mail className="w-6 h-6 inline-block" />{" "}
            <span className="">Get in Touch</span>
          </a>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className="block transition-colors">
      {children}
    </Link>
  );
}
