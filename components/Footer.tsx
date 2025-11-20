import Link from 'next/link';
import {
  Facebook,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer py-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
        
        {/* Nav Links */}
        <div className="flex space-x-6">
          <FooterLink href="/">Home</FooterLink>
          <FooterLink href="mailto:linda@trainlady.ca?subject=Website%20Inquiry">Contact</FooterLink>
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
    <Link href={href} className="footer-link text-sm">
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
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="footer-link">
      {children}
    </a>
  );
}