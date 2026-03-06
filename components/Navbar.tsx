"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Facebook, House, Menu, X } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="shadow-md relative md:fixed w-full z-40 bg-white navbar ">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between relative z-60 h-68px">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          <Image
            src="/images/trainlady-wordmark.svg"
            alt="Trainlady"
            width={100}
            height={50}
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6">
          <NavLink href="/where-is-my-train">Where's My Train?</NavLink>

          <NavLink href="https://www.facebook.com/groups/1047823936706604">
            <Facebook className="w-6 h-6" />
          </NavLink>

          <a
            className="px-6 py-2 rounded font-semibold transition trip-button"
            href="mailto:linda@trainlady.ca?subject=Website%20Inquiry"
          >
            <Mail className="w-6 h-6 inline-block" /> <span>Get in Touch</span>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 rounded transition"
        >
          {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Slide-In Menu */}
      <div
        className={`fixed top-68px left-0 h-full w-full navbar transition-opacity ease-in-out duration-300 z-50 md:hidden
        ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div className="flex flex-col p-6 space-y-6 text-lg">
          <NavLink href="/" onClick={toggleMenu}>
            <House className="inline-block w-5 h-5 mr-2" />
            Home
          </NavLink>

          <NavLink href="/where-is-my-train" onClick={toggleMenu}>
            Where's My Train?
          </NavLink>

          <NavLink
            href="https://www.facebook.com/groups/1047823936706604"
            onClick={toggleMenu}
          >
            <Facebook className="inline mr-2 w-5 h-5" />
            Facebook Group
          </NavLink>

          <a
            href="mailto:linda@trainlady.ca?subject=Website%20Inquiry"
            onClick={toggleMenu}
            className="px-6 py-2 rounded font-semibold transition trip-button"
          >
            <Mail className="inline-block w-5 h-5 mr-2" />
            Get in Touch
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
