'use client';

import React from 'react';

/**
 * Renders a clean editorial list item for an upcoming concert performance.
 */
export default function ConcertCard({
  venue,
  date,
  time,
  location,
  ticketURL,
  style,
  className = '',
}) {
  /**
   * SAFELY PARSE DATE (Mobile-safe)
   * Accepts:
   *  - "2025-10-17" (ISO, preferred)
   *  - "10/17/2025" (fallback)
   */
  const parseDateSafely = (dateStr) => {
    if (!dateStr) return null;

    // Try ISO first (recommended)
    let d = new Date(dateStr);
    if (!isNaN(d)) return d;

    // Fallback for MM/DD/YYYY
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [month, day, year] = parts.map(Number);
      d = new Date(year, month - 1, day);
      if (!isNaN(d)) return d;
    }

    return null;
  };

  const dateObj = parseDateSafely(date);

  const fullDate = dateObj
    ? dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Date TBA';

  return (
    <div
      className={`border-b border-[#f5efe4]/8 py-4 flex items-center justify-between gap-3 transition-all duration-200 hover:pl-2 ${className}`}
      style={style}
    >
      {/* Left: Venue & Location */}
      <div className="min-w-0">
        {ticketURL ? (
          <a
            href={ticketURL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-[family-name:var(--font-cormorant)] text-[clamp(0.95rem,2.2vw,1.18rem)] text-[#f5efe4] hover:text-[#d4aa4a] transition-colors"
          >
            {venue}
          </a>
        ) : (
          <span className="font-[family-name:var(--font-cormorant)] text-[clamp(0.95rem,2.2vw,1.18rem)] text-[#f5efe4]">
            {venue}
          </span>
        )}
        {location && (
          <p className="text-[11px] text-[#7a6548] mt-0.5">{location}</p>
        )}
      </div>

      {/* Right: Date */}
      <span className="text-[12px] text-[#b8922a] shrink-0">{fullDate}</span>
    </div>
  );
}
