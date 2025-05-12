import Link from 'next/link';
import {
  Facebook,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700 py-6 border-t">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
        
        {/* Nav Links */}
        <div className="flex space-x-6">
          <FooterLink href="/">Home</FooterLink>
          <FooterLink href="/events">Events</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
          <SocialLink href="https://www.facebook.com/groups/1047823936706604" label="Facebook">
            <Facebook className="h-5 w-5" />
          </SocialLink>
        </div>

        {/* Copyright */}
        <p className="text-sm">&copy; {new Date().getFullYear()} Train Lady. All rights reserved.</p>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="hover:text-blue-600 transition-colors text-sm">
      {children}
    </Link>
  );
}

function SocialLink({
  href,
  children,
  label,
}: {
  href: string;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="hover:text-blue-600">
      {children}
    </a>
  );
}