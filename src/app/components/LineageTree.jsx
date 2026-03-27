'use client';

import { useEffect, useRef, useState } from 'react';

/*
  Lineage data — three tiers:
    ancestors (tradition roots)  →  gurus (direct teachers)  →  Anirban
*/
const ancestors = [
  { id: 'maihar',  label: 'Senia-Maihar\nGharana',       color: '#d4aa4a', img: '/Senia-MaiharGharana.jpeg' },
  { id: 'rajam',   label: "Dr. N. Rajam's\nLineage",     color: '#d4aa4a', img: '/Dr_N_RajamsLineage.jpeg' },
  { id: 'jog',     label: "Pandit V.G. Jog's\nLegacy",   color: '#d4aa4a', img: '/vgJoglineage.jpeg' },
  { id: 'shah',    label: 'Senia-Shahjahanpur\nGharana',  color: '#d4aa4a', img: '/seniaShahjahanpurGharana.jpeg' },
];

const gurus = [
  { id: 'jitesh',    label: 'Shri Jitesh\nBhattacharjee',      role: 'Rhythm & Melody',     img: '/jitesh-bhattacharjee.jpg',      ancestor: null },
  { id: 'ashim',     label: 'Shri Ashim\nDutta',                role: 'First Violin Guru',   img: '/ashim-dutta.jpg',               ancestor: 'maihar' },
  { id: 'manoj',     label: 'Shri Manoj\nBaruah',               role: 'Tantrakari Violin',   img: '/manoj-baruah.jpg',              ancestor: 'maihar' },
  { id: 'sisirkana', label: 'Dr. Sisirkana\nDhar Choudhury',    role: 'Raga Mastery',        img: '/sisirkana-choudhury.jpg',       ancestor: 'maihar' },
  { id: 'swarna',    label: 'Dr. Swarna\nKhuntia',              role: 'Gayaki Ang',          img: '/swarna-khuntia.jpeg',           ancestor: 'rajam' },
  { id: 'biswajit',  label: 'Prof. Biswajit\nRoy Choudhury',   role: 'Tantrakari Tradition',img: '/biswajit-roy-choudhury.jpeg',   ancestor: 'jog' },
  { id: 'supratik',  label: 'Shri Supratik\nSengupta',          role: 'Sitar Aesthetics',    img: '/supratik-sengupta.jpg',         ancestor: 'shah' },
];

// Extra connections between gurus
const guruLinks = [
  ['sisirkana', 'manoj'],
  ['ashim', 'manoj'],
];

const GOLD = '#b8922a';
const GOLD_LIGHT = '#d4aa4a';

export default function LineageTree() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 820, h: 560 });

  useEffect(() => {
    const draw = () => {
      const svg = svgRef.current;
      if (!svg) return;

      const container = containerRef.current;
      const cw = container?.offsetWidth || 820;
      const W = Math.max(cw, 700);
      const H = 560;

      setDims({ w: W, h: H });
      svg.innerHTML = '';

      // Row Y positions
      const ROW = [80, 270, 470];
      const R = 34;   // guru photo radius
      const AR = 26;  // ancestor node radius
      const BR = 48;  // anirban radius

      // Defs
      const ns = 'http://www.w3.org/2000/svg';
      const el = (tag) => document.createElementNS(ns, tag);

      const defs = el('defs');

      // Gold gradient for connectors
      const grad = el('linearGradient');
      grad.id = 'goldLine';
      grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%');
      grad.setAttribute('x2', '0%'); grad.setAttribute('y2', '100%');
      const s1 = el('stop'); s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', GOLD_LIGHT); s1.setAttribute('stop-opacity', '0.6');
      const s2 = el('stop'); s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', GOLD); s2.setAttribute('stop-opacity', '0.35');
      grad.appendChild(s1); grad.appendChild(s2);
      defs.appendChild(grad);

      // Radial glow for Anirban
      const rglow = el('radialGradient'); rglow.id = 'aglow';
      rglow.innerHTML = `<stop offset="0%" stop-color="${GOLD_LIGHT}" stop-opacity=".9"/><stop offset="100%" stop-color="${GOLD}" stop-opacity=".35"/>`;
      defs.appendChild(rglow);

      svg.appendChild(defs);

      // Calculate positions
      const ancestorSpacing = W / (ancestors.length + 1);
      const ancestorPos = ancestors.map((a, i) => ({
        ...a,
        x: ancestorSpacing * (i + 1),
        y: ROW[0],
      }));

      const guruSpacing = W / (gurus.length + 1);
      const guruPos = gurus.map((g, i) => ({
        ...g,
        x: guruSpacing * (i + 1),
        y: ROW[1],
      }));

      const anirbanPos = { x: W / 2, y: ROW[2] };

      // Helper: bezier path
      const bezier = (x1, y1, x2, y2) => {
        const my = y1 + (y2 - y1) * 0.5;
        return `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`;
      };

      const drawPath = (x1, y1, x2, y2, dashed = false) => {
        const path = el('path');
        path.setAttribute('d', bezier(x1, y1, x2, y2));
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'url(#goldLine)');
        path.setAttribute('stroke-width', '1.5');
        if (dashed) path.setAttribute('stroke-dasharray', '4,4');
        svg.appendChild(path);
      };

      // Draw ancestor → guru connections
      guruPos.forEach((g) => {
        if (g.ancestor) {
          const a = ancestorPos.find((ap) => ap.id === g.ancestor);
          if (a) drawPath(a.x, a.y + AR, g.x, g.y - R - 4);
        }
      });

      // Draw guru → guru connections (dashed)
      guruLinks.forEach(([fromId, toId]) => {
        const from = guruPos.find((g) => g.id === fromId);
        const to = guruPos.find((g) => g.id === toId);
        if (from && to) {
          const path = el('path');
          const mx = (from.x + to.x) / 2;
          path.setAttribute('d', `M${from.x + R},${from.y} Q${mx},${from.y - 30} ${to.x - R},${to.y}`);
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke', `${GOLD}44`);
          path.setAttribute('stroke-width', '1');
          path.setAttribute('stroke-dasharray', '3,3');
          svg.appendChild(path);
        }
      });

      // Draw guru → Anirban connections
      guruPos.forEach((g) => {
        drawPath(g.x, g.y + R + 4, anirbanPos.x, anirbanPos.y - BR - 4);
      });

      // Jitesh (no ancestor) → Anirban direct
      const jitesh = guruPos.find((g) => g.id === 'jitesh');
      if (jitesh) {
        drawPath(jitesh.x, jitesh.y + R + 4, anirbanPos.x, anirbanPos.y - BR - 4);
      }

      // Draw ancestor nodes (circular photos with text)
      ancestorPos.forEach((a, i) => {
        const clipId = `ancestor-clip-${i}`;
        const clip = el('clipPath'); clip.id = clipId;
        const clipCircle = el('circle');
        clipCircle.setAttribute('cx', a.x); clipCircle.setAttribute('cy', a.y); clipCircle.setAttribute('r', AR);
        clip.appendChild(clipCircle);
        defs.appendChild(clip);

        // Ring
        const ring = el('circle');
        ring.setAttribute('cx', a.x); ring.setAttribute('cy', a.y); ring.setAttribute('r', AR + 1.5);
        ring.setAttribute('fill', 'none');
        ring.setAttribute('stroke', `${GOLD}55`);
        ring.setAttribute('stroke-width', '1');
        svg.appendChild(ring);

        // Photo
        if (a.img) {
          const img = el('image');
          img.setAttribute('x', a.x - AR); img.setAttribute('y', a.y - AR);
          img.setAttribute('width', AR * 2); img.setAttribute('height', AR * 2);
          img.setAttribute('href', a.img);
          img.setAttribute('clip-path', `url(#${clipId})`);
          img.setAttribute('preserveAspectRatio', 'xMidYMid slice');
          svg.appendChild(img);
        } else {
          const circle = el('circle');
          circle.setAttribute('cx', a.x); circle.setAttribute('cy', a.y); circle.setAttribute('r', AR);
          circle.setAttribute('fill', 'rgba(26,18,9,0.8)');
          svg.appendChild(circle);
        }

        const lines = a.label.split('\n');
        lines.forEach((line, li) => {
          const txt = el('text');
          txt.setAttribute('x', a.x); txt.setAttribute('y', a.y + AR + 16 + li * 13);
          txt.setAttribute('text-anchor', 'middle');
          txt.setAttribute('fill', `${GOLD}88`);
          txt.setAttribute('font-size', '9');
          txt.setAttribute('letter-spacing', '0.08em');
          txt.textContent = line;
          svg.appendChild(txt);
        });
      });

      // Draw guru nodes (circular photos)
      guruPos.forEach((g, i) => {
        const clipId = `guru-clip-${i}`;
        const clip = el('clipPath'); clip.id = clipId;
        const clipCircle = el('circle');
        clipCircle.setAttribute('cx', g.x); clipCircle.setAttribute('cy', g.y); clipCircle.setAttribute('r', R);
        clip.appendChild(clipCircle);
        defs.appendChild(clip);

        // Ring
        const ring = el('circle');
        ring.setAttribute('cx', g.x); ring.setAttribute('cy', g.y); ring.setAttribute('r', R + 2);
        ring.setAttribute('fill', 'none');
        ring.setAttribute('stroke', GOLD_LIGHT);
        ring.setAttribute('stroke-width', '1.5');
        ring.setAttribute('stroke-opacity', '0.5');
        svg.appendChild(ring);

        // Photo
        const img = el('image');
        img.setAttribute('x', g.x - R); img.setAttribute('y', g.y - R);
        img.setAttribute('width', R * 2); img.setAttribute('height', R * 2);
        img.setAttribute('href', g.img);
        img.setAttribute('clip-path', `url(#${clipId})`);
        img.setAttribute('preserveAspectRatio', 'xMidYMid slice');
        svg.appendChild(img);

        // Name below
        const lines = g.label.split('\n');
        lines.forEach((line, li) => {
          const txt = el('text');
          txt.setAttribute('x', g.x); txt.setAttribute('y', g.y + R + 16 + li * 14);
          txt.setAttribute('text-anchor', 'middle');
          txt.setAttribute('fill', '#f5efe4');
          txt.setAttribute('font-size', '11');
          txt.setAttribute('font-family', 'var(--font-cormorant), Cormorant Garamond, serif');
          txt.textContent = line;
          svg.appendChild(txt);
        });

        // Role
        const role = el('text');
        role.setAttribute('x', g.x); role.setAttribute('y', g.y + R + 16 + lines.length * 14 + 2);
        role.setAttribute('text-anchor', 'middle');
        role.setAttribute('fill', `${GOLD}88`);
        role.setAttribute('font-size', '8');
        role.setAttribute('letter-spacing', '0.1em');
        role.textContent = g.role.toUpperCase();
        svg.appendChild(role);
      });

      // Draw Anirban (large node)
      const aClipId = 'anirban-clip';
      const aClip = el('clipPath'); aClip.id = aClipId;
      const aClipC = el('circle');
      aClipC.setAttribute('cx', anirbanPos.x); aClipC.setAttribute('cy', anirbanPos.y); aClipC.setAttribute('r', BR);
      aClip.appendChild(aClipC);
      defs.appendChild(aClip);

      // Glow ring
      const glow = el('circle');
      glow.setAttribute('cx', anirbanPos.x); glow.setAttribute('cy', anirbanPos.y); glow.setAttribute('r', BR + 6);
      glow.setAttribute('fill', 'none');
      glow.setAttribute('stroke', 'url(#aglow)');
      glow.setAttribute('stroke-width', '3');
      svg.appendChild(glow);

      // Ring
      const aRing = el('circle');
      aRing.setAttribute('cx', anirbanPos.x); aRing.setAttribute('cy', anirbanPos.y); aRing.setAttribute('r', BR + 2);
      aRing.setAttribute('fill', 'none');
      aRing.setAttribute('stroke', GOLD_LIGHT);
      aRing.setAttribute('stroke-width', '2');
      svg.appendChild(aRing);

      // Photo
      const aImg = el('image');
      aImg.setAttribute('x', anirbanPos.x - BR); aImg.setAttribute('y', anirbanPos.y - BR);
      aImg.setAttribute('width', BR * 2); aImg.setAttribute('height', BR * 2);
      aImg.setAttribute('href', '/anirbanda.jpg');
      aImg.setAttribute('clip-path', `url(#${aClipId})`);
      aImg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      svg.appendChild(aImg);

      // Name
      const aName = el('text');
      aName.setAttribute('x', anirbanPos.x); aName.setAttribute('y', anirbanPos.y + BR + 22);
      aName.setAttribute('text-anchor', 'middle');
      aName.setAttribute('fill', '#f5efe4');
      aName.setAttribute('font-size', '15');
      aName.setAttribute('font-family', 'var(--font-cormorant), Cormorant Garamond, serif');
      aName.setAttribute('font-style', 'italic');
      aName.textContent = 'Anirban Bhattacharjee';
      svg.appendChild(aName);

      const aSub = el('text');
      aSub.setAttribute('x', anirbanPos.x); aSub.setAttribute('y', anirbanPos.y + BR + 38);
      aSub.setAttribute('text-anchor', 'middle');
      aSub.setAttribute('fill', `${GOLD}77`);
      aSub.setAttribute('font-size', '9');
      aSub.setAttribute('letter-spacing', '0.15em');
      aSub.textContent = 'THE CONFLUENCE OF TRADITIONS';
      svg.appendChild(aSub);
    };

    draw();
    const timer = setTimeout(draw, 150);
    window.addEventListener('resize', draw);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', draw);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full py-8">
      <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <svg
          ref={svgRef}
          width={dims.w}
          height={dims.h}
          viewBox={`0 0 ${dims.w} ${dims.h}`}
          className="block mx-auto"
        />
      </div>
    </div>
  );
}
