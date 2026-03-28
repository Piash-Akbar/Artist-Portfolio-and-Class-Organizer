'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen h-full bg-[#0c0905]">
      <div className="relative flex items-center justify-center">
        <style jsx>{`
          @keyframes orbit1 { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          @keyframes orbit2 { 0% { transform: rotate(120deg); } 100% { transform: rotate(480deg); } }
          @keyframes orbit3 { 0% { transform: rotate(240deg); } 100% { transform: rotate(600deg); } }
          @keyframes pulse { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.15); } }
          @keyframes shimmer { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.35; } }
          @keyframes breathe { 0%, 100% { transform: scale(0.92); opacity: 0.6; } 50% { transform: scale(1.08); opacity: 1; } }
          @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
            20% { opacity: 1; transform: scale(1) rotate(72deg); }
            80% { opacity: 0.8; transform: scale(0.8) rotate(288deg); }
          }
          @keyframes fadeText { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; } }

          .orbit-ring {
            position: absolute;
            border-radius: 50%;
            border: 1px solid transparent;
          }
          .ring-1 {
            width: 120px; height: 120px;
            border-top-color: rgba(212,170,74,0.6);
            border-right-color: rgba(212,170,74,0.2);
            animation: orbit1 3s linear infinite;
          }
          .ring-2 {
            width: 90px; height: 90px;
            border-top-color: rgba(184,146,42,0.5);
            border-left-color: rgba(184,146,42,0.15);
            animation: orbit2 2.4s linear infinite;
          }
          .ring-3 {
            width: 60px; height: 60px;
            border-bottom-color: rgba(245,239,228,0.4);
            border-right-color: rgba(245,239,228,0.1);
            animation: orbit3 1.8s linear infinite;
          }

          .orbit-dot {
            position: absolute;
            width: 5px; height: 5px;
            border-radius: 50%;
            background: #d4aa4a;
            box-shadow: 0 0 8px rgba(212,170,74,0.8), 0 0 20px rgba(212,170,74,0.3);
          }
          .dot-1 { top: -2.5px; left: 50%; transform: translateX(-50%); }
          .dot-2 { top: -2.5px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; background: #b8922a; }
          .dot-3 { bottom: -2.5px; left: 50%; transform: translateX(-50%); width: 3px; height: 3px; background: #f5efe4; }

          .sparkle-dot {
            position: absolute;
            width: 3px; height: 3px;
            border-radius: 50%;
            background: #d4aa4a;
            box-shadow: 0 0 6px rgba(212,170,74,0.6);
          }
        `}</style>

        {/* Outer glow pulse */}
        <div
          className="absolute rounded-full"
          style={{
            width: 160, height: 160,
            background: 'radial-gradient(circle, rgba(184,146,42,0.08) 0%, transparent 70%)',
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        />

        {/* Orbiting rings */}
        <div className="orbit-ring ring-1">
          <div className="orbit-dot dot-1" />
        </div>
        <div className="orbit-ring ring-2">
          <div className="orbit-dot dot-2" />
        </div>
        <div className="orbit-ring ring-3">
          <div className="orbit-dot dot-3" />
        </div>

        {/* Sparkles */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className="sparkle-dot"
            style={{
              top: `${50 + 55 * Math.sin((i * Math.PI * 2) / 6)}%`,
              left: `${50 + 55 * Math.cos((i * Math.PI * 2) / 6)}%`,
              animation: `sparkle ${2 + i * 0.3}s ease-in-out ${i * 0.4}s infinite`,
            }}
          />
        ))}

        {/* Center — Treble clef SVG */}
        <div style={{ animation: 'breathe 2.5s ease-in-out infinite' }}>
          <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="clefGrad" x1="0.3" y1="0" x2="0.7" y2="1">
                <stop offset="0%" stopColor="#f5efe4" />
                <stop offset="50%" stopColor="#d4aa4a" />
                <stop offset="100%" stopColor="#8a6c1a" />
              </linearGradient>
            </defs>
            {/* Treble clef shape */}
            <path
              d="M52 95 C52 90 50 85 48 80 C44 70 42 60 44 50
                 C46 40 52 32 52 24 C52 16 48 10 42 10
                 C36 10 32 16 32 24 C32 30 36 36 42 38
                 C48 40 54 36 56 30 C58 24 56 18 52 14
                 M44 50 C40 55 36 62 36 70 C36 78 40 84 48 86
                 C56 88 60 82 60 76 C60 70 56 66 50 66
                 C44 66 42 72 44 78"
              stroke="url(#clefGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.9"
            />
            {/* Vertical line */}
            <line x1="52" y1="8" x2="52" y2="95" stroke="url(#clefGrad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
          </svg>
        </div>

        {/* Loading text */}
        <p
          className="absolute font-[family-name:var(--font-cormorant)] italic text-[13px] tracking-[0.2em] text-[#b8922a]"
          style={{
            bottom: -40,
            animation: 'fadeText 2s ease-in-out infinite',
          }}
        >
          Loading
        </p>
      </div>
    </div>
  );
}
