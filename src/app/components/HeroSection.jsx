// components/HeroSection.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Great_Vibes } from "next/font/google";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
});

/**
 * HeroSection Component
 * Displays a full-screen hero section with a dynamic background slideshow.
 * @param {object} props
 * @param {string[]} props.images - Array of image URLs for the background slideshow.
 * @param {string} [props.title] - Optional title for the hero section.
 * @param {string} [props.subtitle] - Optional subtitle.
 * @param {string} [props.ctaLink] - URL for the Call-to-Action button.
 * @param {string} [props.ctaText] - Text for the Call-to-Action button.
 */
export default function HeroSection({
    images,
    title = "Anirban Bhattacharjee",
    subtitle = "Pioneer of the Violin in the Senia-Shahjahanpur Gharana",
    ctaLink = "/#about",
    ctaText = "Discover My Journey"
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const slideDuration = 3000; // 3 seconds

  useEffect(() => {
    if (!images || images.length === 0) return;

    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % images.length
      );
    }, slideDuration);

    return () => clearInterval(intervalId);
  }, [images, slideDuration]);

  // Handle case where no images are provided
  if (!images || images.length === 0) {
      return (
          <section className="h-screen flex items-end justify-start bg-[#0c0905]">
              <h2 className="text-[#f5efe4] text-3xl px-12 pb-24">Loading Hero Content...</h2>
          </section>
      );
  }

  return (
    <section className="relative h-screen flex items-end overflow-hidden">

      {/* Background Slideshow Container */}
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`
              absolute inset-0 bg-cover bg-center transition-opacity duration-1000
              ${index === currentImageIndex ? 'opacity-[0.42]' : 'opacity-0'}
            `}
            style={{
              backgroundImage: `url('${image}')`,
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1209]/92 via-[#1a1209]/28 to-transparent" />

      {/* Content Overlay - bottom left aligned */}
      <div className="relative z-10 max-w-[640px] px-[clamp(22px,6vw,52px)] pb-[clamp(48px,9vw,88px)]">

        {/* Eyebrow */}
        <p className="text-[10px] tracking-[0.24em] text-[#d4aa4a] font-medium mb-3.5 uppercase animate-fade-in">
          Hindustani Classical Violin
        </p>

        {/* Title */}
        <h1
          className={`
            ${greatVibes.className}
            text-[clamp(3.2rem,9vw,6rem)] font-light italic text-[#f5efe4] leading-[0.97]
            animate-fade-in-up
          `}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p
          className="font-[family-name:var(--font-cormorant)] italic text-[clamp(1rem,2.5vw,1.3rem)] text-[#f5efe4]/50 mb-7 mt-3 animate-fade-in-up"
          style={{ animationDelay: '150ms' }}
        >
          {subtitle}
        </p>

        {/* CTA Button */}
        <a
          href={ctaLink}
          className="
            inline-block border border-[#b8922a] text-[#b8922a]
            px-5 py-2.5 text-[10px] font-medium tracking-[0.15em] uppercase
            hover:bg-[#b8922a] hover:text-[#f5efe4]
            transition-all duration-300
            animate-fade-in-up
          "
          style={{ animationDelay: '300ms' }}
        >
          {ctaText}
        </a>
      </div>

      {/* Scroll Hint - bottom right */}
      <div className="absolute bottom-[clamp(32px,6vw,64px)] right-[clamp(22px,4vw,48px)] z-10 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '600ms' }}>
        <span className="text-[9px] tracking-[0.22em] uppercase text-[#f5efe4]/30 font-medium">
          Scroll
        </span>
        <span className="block w-px h-8 bg-[#f5efe4]/20 animate-pulse" />
      </div>
    </section>
  );
}
