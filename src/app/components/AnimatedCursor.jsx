'use client';

import { useEffect, useRef, useState } from 'react';

export default function AnimatedCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const trailRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const mouse = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const trail = useRef({ x: -100, y: -100 });
  const raf = useRef(null);

  useEffect(() => {
    // Don't render on touch devices
    if ('ontouchstart' in window) return;
    setMounted(true);

    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    const onHoverIn = () => setHovering(true);
    const onHoverOut = () => setHovering(false);

    const addHoverListeners = () => {
      document.querySelectorAll('a, button, [role="button"], input, select, textarea, [class*="cursor-pointer"]').forEach((el) => {
        el.addEventListener('mouseenter', onHoverIn);
        el.addEventListener('mouseleave', onHoverOut);
      });
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    addHoverListeners();
    // Re-add listeners when DOM changes
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    const animate = () => {
      // Dot follows instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y}px)`;
      }

      // Ring follows with smooth lag
      ring.current.x += (mouse.current.x - ring.current.x) * 0.15;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.15;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px) scale(${hovering ? 1.8 : 1})`;
      }

      // Trail follows with more lag
      trail.current.x += (mouse.current.x - trail.current.x) * 0.08;
      trail.current.y += (mouse.current.y - trail.current.y) * 0.08;
      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${trail.current.x}px, ${trail.current.y}px) scale(${hovering ? 2.2 : 1})`;
      }

      raf.current = requestAnimationFrame(animate);
    };

    raf.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      observer.disconnect();
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [hovering, visible]);

  // Don't render until mounted on client
  if (!mounted) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s',
      }}
    >
      {/* Outer trail — soft glow */}
      <div
        ref={trailRef}
        style={{
          position: 'fixed',
          top: -20,
          left: -20,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(184,146,42,0.12) 0%, transparent 70%)',
          transition: 'opacity 0.4s',
          willChange: 'transform',
        }}
      />

      {/* Ring — animated trailing circle */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: -18,
          left: -18,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: `1.5px solid ${hovering ? '#d4aa4a' : 'rgba(184,146,42,0.5)'}`,
          transition: 'border-color 0.3s, width 0.3s, height 0.3s',
          willChange: 'transform',
          ...(hovering && {
            top: -24,
            left: -24,
            width: 48,
            height: 48,
            borderColor: '#d4aa4a',
          }),
        }}
      />

      {/* Peacock feather — flipped (eye at bottom, quill tip at top = click point) */}
      <svg
        ref={dotRef}
        style={{
          position: 'fixed',
          top: -4,
          left: -6,
          width: 72,
          height: 72,
          overflow: 'visible',
          filter: hovering
            ? 'drop-shadow(0 0 8px rgba(212,170,74,0.5))'
            : 'drop-shadow(0 0 4px rgba(184,146,42,0.3))',
          transition: 'filter 0.3s',
          willChange: 'transform',
        }}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="eyeOuter" cx="50%" cy="48%" r="50%">
            <stop offset="0%" stopColor="#c49a2a" />
            <stop offset="60%" stopColor="#9a7520" />
            <stop offset="100%" stopColor="#6b5518" />
          </radialGradient>
          <radialGradient id="eyeMiddle" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#d4aa4a" />
            <stop offset="100%" stopColor="#b8922a" />
          </radialGradient>
          <linearGradient id="shaftGrad" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#f5efe4" />
            <stop offset="30%" stopColor="#d4aa4a" />
            <stop offset="100%" stopColor="#8a6c1a" />
          </linearGradient>
        </defs>

        {/* Main shaft — quill tip at TOP (click point), curves down to eye */}
        <path d="M12 4 C14 14 20 34 24 48 C28 60 32 70 30 78" stroke="url(#shaftGrad)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M12 4 C14 14 20 34 24 48" stroke="#f5efe4" strokeWidth="0.5" strokeLinecap="round" fill="none" opacity="0.35" />

        {/* Quill tip — nib at top */}
        <circle cx="12" cy="3.5" r="1.5" fill="#f5efe4" opacity="0.9" />

        {/* Left barbs — golden flowing curves */}
        <path d="M30 78 C20 76 10 68 6 60" stroke="#b8922a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M28 72 C18 71 8 64 2 54" stroke="#b8922a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M26 66 C18 65 10 58 4 48" stroke="#b8922a" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <path d="M25 60 C18 60 12 54 8 44" stroke="#c4a035" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        <path d="M24 54 C18 54 14 48 12 40" stroke="#c4a035" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M22 46 C18 46 14 42 12 34" stroke="#d4aa4a" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <path d="M20 38 C17 38 14 34 14 28" stroke="#d4aa4a" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.8" />

        {/* Left barb curls */}
        <path d="M6 60 C3 58 2 54 4 52" stroke="#b8922a" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M2 54 C-1 51 -1 47 1 45" stroke="#b8922a" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <path d="M4 48 C1 45 1 41 3 39" stroke="#c4a035" strokeWidth="0.7" fill="none" strokeLinecap="round" />
        <path d="M8 44 C5 42 5 38 7 36" stroke="#c4a035" strokeWidth="0.6" fill="none" strokeLinecap="round" />

        {/* Left dark accent wisps */}
        <path d="M29 74 C21 74 12 68 8 62" stroke="#8a6c1a" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.6" />
        <path d="M27 68 C20 68 12 62 6 54" stroke="#8a6c1a" strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M25 62 C19 62 14 56 10 48" stroke="#8a6c1a" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.45" />

        {/* Right barbs — golden flowing curves */}
        <path d="M30 78 C40 82 52 84 60 82" stroke="#b8922a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M28 72 C38 76 52 78 64 76" stroke="#b8922a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M26 66 C36 70 50 72 62 70" stroke="#b8922a" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <path d="M25 60 C34 63 48 64 58 62" stroke="#c4a035" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        <path d="M24 54 C32 56 44 56 54 54" stroke="#c4a035" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M22 46 C30 48 40 48 48 46" stroke="#d4aa4a" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <path d="M20 38 C26 40 34 40 40 38" stroke="#d4aa4a" strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.8" />

        {/* Right barb curls */}
        <path d="M60 82 C64 83 67 81 66 78" stroke="#b8922a" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M64 76 C68 77 71 74 69 71" stroke="#b8922a" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <path d="M62 70 C66 70 68 67 66 64" stroke="#c4a035" strokeWidth="0.7" fill="none" strokeLinecap="round" />
        <path d="M58 62 C62 62 64 59 62 56" stroke="#c4a035" strokeWidth="0.6" fill="none" strokeLinecap="round" />

        {/* Right dark accent wisps */}
        <path d="M29 76 C38 80 52 82 62 80" stroke="#8a6c1a" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.6" />
        <path d="M27 70 C36 74 50 76 62 74" stroke="#8a6c1a" strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M25 64 C34 67 48 68 58 66" stroke="#8a6c1a" strokeWidth="0.8" fill="none" strokeLinecap="round" opacity="0.45" />

        {/* Light golden wisps near shaft */}
        <path d="M18 40 C15 40 12 44 12 50" stroke="#e8cc6a" strokeWidth="0.6" fill="none" strokeLinecap="round" opacity="0.45" />
        <path d="M20 34 C18 36 16 40 16 46" stroke="#e8cc6a" strokeWidth="0.5" fill="none" strokeLinecap="round" opacity="0.4" />
        <path d="M22 44 C26 42 30 42 34 44" stroke="#e8cc6a" strokeWidth="0.6" fill="none" strokeLinecap="round" opacity="0.45" />

        {/* Peacock eye — outer golden ring */}
        <ellipse cx="34" cy="76" rx="10" ry="12" fill="url(#eyeOuter)" opacity="0.85" />
        {/* Eye — inner golden */}
        <ellipse cx="34" cy="77" rx="6.5" ry="8" fill="url(#eyeMiddle)" opacity="0.9" />
        {/* Eye — dark center */}
        <ellipse cx="34" cy="77.5" rx="3.5" ry="4.5" fill="#1a1209" opacity="0.8" />
        {/* Eye — warm highlight */}
        <ellipse cx="33.5" cy="78.5" rx="1.5" ry="2" fill="#b8922a" opacity="0.7" />
        <ellipse cx="34.5" cy="79" rx="0.6" ry="0.8" fill="#f5efe4" opacity="0.5" />
      </svg>
    </div>
  );
}
