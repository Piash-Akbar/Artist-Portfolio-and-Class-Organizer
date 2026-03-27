'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '/gurus-lineage-2', label: 'Gurus & Lineage' },
  { href: '/students', label: "Students' Corner" },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50 bg-[#1a1209]/97
        transition-all duration-300
        ${scrolled ? 'py-2 px-7 shadow-[0_1px_0_rgba(255,255,255,0.05)]' : 'py-3.5 px-7'}
      `}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/logo_white.png"
            alt="Logo"
            className={`w-auto transition-all duration-300 ${scrolled ? 'h-9' : 'h-11'}`}
          />
          <span className="hidden sm:block font-[family-name:var(--font-cormorant)] italic text-[#f5efe4] text-lg tracking-wide">
            A. Bhattacharjee
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="
                relative text-[10px] font-medium tracking-[0.18em] uppercase
                text-[#f5efe4]/45 hover:text-[#f5efe4] transition-colors duration-300
                after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px
                after:bg-[#b8922a] after:transition-all after:duration-300
                hover:after:w-full
              "
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] group"
          aria-controls="mobile-menu"
          aria-expanded={isOpen}
        >
          <span
            className={`block w-5 h-px bg-[#f5efe4]/60 transition-all duration-300 origin-center
              ${isOpen ? 'rotate-45 translate-y-[3px]' : ''}`}
          />
          <span
            className={`block w-5 h-px bg-[#f5efe4]/60 transition-all duration-300
              ${isOpen ? 'opacity-0' : ''}`}
          />
          <span
            className={`block w-5 h-px bg-[#f5efe4]/60 transition-all duration-300 origin-center
              ${isOpen ? '-rotate-45 -translate-y-[3px]' : ''}`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`
          md:hidden bg-[#140d05]/98 overflow-hidden transition-all duration-400 ease-in-out
          ${isOpen ? 'max-h-80 mt-3' : 'max-h-0'}
        `}
      >
        <div className="flex flex-col gap-1 px-4 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="
                text-[10px] font-medium tracking-[0.18em] uppercase
                text-[#f5efe4]/45 hover:text-[#f5efe4] transition-colors duration-300
                py-2.5 border-b border-[#f5efe4]/5
              "
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
