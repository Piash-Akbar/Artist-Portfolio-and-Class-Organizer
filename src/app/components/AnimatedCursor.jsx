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

      {/* Peacock feather quill */}
      <svg
        ref={dotRef}
        style={{
          position: 'fixed',
          top: -2,
          left: -2,
          width: 44,
          height: 44,
          overflow: 'visible',
          filter: hovering
            ? 'drop-shadow(0 0 8px rgba(212,170,74,0.6))'
            : 'drop-shadow(0 0 4px rgba(184,146,42,0.35))',
          transition: 'filter 0.3s',
          willChange: 'transform',
        }}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="featherEye" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#1a5c3a" />
            <stop offset="40%" stopColor="#0e7a4a" />
            <stop offset="65%" stopColor="#b8922a" />
            <stop offset="100%" stopColor="#d4aa4a" />
          </radialGradient>
          <linearGradient id="quillShaft" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f5efe4" />
            <stop offset="40%" stopColor="#d4aa4a" />
            <stop offset="100%" stopColor="#8a6c1a" />
          </linearGradient>
          <linearGradient id="barbLeft" x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0%" stopColor="#b8922a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#6b5518" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="barbRight" x1="1" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="#d4aa4a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8a6c1a" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Feather barbs — left side (broader fan) */}
        <path d="M8 6 C12 10 14 16 16 20 C12 18 8 14 5 9Z" fill="url(#barbLeft)" opacity="0.7" />
        <path d="M11 4 C14 8 16 14 17 18 C14 16 11 11 9 6Z" fill="url(#barbLeft)" opacity="0.6" />
        <path d="M14 3 C16 7 17 12 18 17 C16 14 14 9 13 5Z" fill="url(#barbLeft)" opacity="0.5" />
        <path d="M6 9 C10 13 13 18 15 22 C11 20 7 16 4 12Z" fill="url(#barbLeft)" opacity="0.55" />

        {/* Feather barbs — right side */}
        <path d="M22 5 C22 10 20 16 19 20 C21 17 24 12 25 7Z" fill="url(#barbRight)" opacity="0.7" />
        <path d="M20 4 C20 8 19 13 18 17 C20 14 22 9 22 5Z" fill="url(#barbRight)" opacity="0.6" />
        <path d="M24 7 C23 12 21 17 20 22 C23 18 25 13 26 9Z" fill="url(#barbRight)" opacity="0.55" />

        {/* Peacock eye — the signature oval */}
        <ellipse cx="17" cy="13" rx="5.5" ry="7" fill="url(#featherEye)" opacity="0.85" />
        <ellipse cx="17" cy="12.5" rx="3" ry="4" fill="#0c0905" opacity="0.7" />
        <ellipse cx="17" cy="12" rx="1.8" ry="2.5" fill="#1a7a50" opacity="0.8" />
        <ellipse cx="17" cy="11.5" rx="0.9" ry="1.2" fill="#d4aa4a" opacity="0.9" />

        {/* Quill shaft — the main spine */}
        <path d="M17 8 C17 14 15 22 8 38 C7 40 6 42 5 43" stroke="url(#quillShaft)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M17 8 C17 14 15 22 8 38" stroke="#f5efe4" strokeWidth="0.4" strokeLinecap="round" fill="none" opacity="0.3" />

        {/* Quill tip — nib */}
        <path d="M4 43 C4.5 42 5 41.5 5.5 42.5 C5 43 4.5 43.5 4 43Z" fill="#f5efe4" opacity="0.9" />
        <circle cx="4.5" cy="43" r="1" fill="#f5efe4" opacity="0.8" />
      </svg>
    </div>
  );
}
