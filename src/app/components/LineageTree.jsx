'use client';

import { useEffect, useRef } from 'react';

/*
  Lineage data — four tiers (top → bottom):
    grandMasters → seniorGurus → gurus → Anirban
*/

// Top-most tier — BABA alone
const patriarch = [
  { id: 'baba', label: 'Ud. Allauddin\nKhan', img: '/Baba.jpeg' },
];

const grandMasters = [
  { id: 'aak',  label: 'Ud. Ali Akbar\nKhan',          img: '/AAK.jpg' },
  { id: 'vgj',  label: 'Pt. V.G.\nJog',                img: '/vgJoglineage.jpeg' },
  { id: 'ot',   label: 'Pt. Omkarnath\nThakur',         img: '/OT.jpg' },
  { id: 'rmm',  label: 'Pt. Radhika Mohan\nMaitra',    img: '/Radhika_Mohan_Maitra.jpg' },
];

const seniorGurus = [
  { id: 'skdc', label: 'Dr. Sisirkana\nDhar Choudhury', img: '/sisirkana-choudhury.jpg', role: 'Senia-Maihar' },
  { id: 'nr',   label: "Dr. N.\nRajam",                 img: '/Dr_N_RajamsLineage.jpeg', role: 'Gayaki Pioneer' },
  { id: 'bdg',  label: 'Pt. Buddhadev\nDasgupta',       img: '/Bdg.jpeg',                role: 'Senia-Shahjahanpur' },
];

const gurus = [
  { id: 'jb',   label: 'Shri Jitesh\nBhattacharjee',    role: 'Rhythm & Melody',      img: '/jitesh-bhattacharjee.jpg' },
  { id: 'ad',   label: 'Shri Ashim\nDutta',              role: 'First Violin Guru',    img: '/ashim-dutta.jpg' },
  { id: 'mb',   label: 'Shri Manoj\nBaruah',             role: 'Tantrakari Violin',    img: '/manoj-baruah.jpg' },
  { id: 'brc',  label: 'Prof. Biswajit\nRoy Choudhury',  role: 'Tantrakari Tradition', img: '/biswajit-roy-choudhury.jpeg' },
  { id: 'sk',   label: 'Dr. Swarna\nKhuntia',            role: 'Gayaki Ang',           img: '/swarna-khuntia.jpeg' },
  { id: 'ss',   label: 'Shri Supratik\nSengupta',        role: 'Sitar Aesthetics',     img: '/supratik-sengupta.jpg' },
];

// All connections: [fromId, toId]
const connections = [
  // Grand Master → Grand Master
  ['baba', 'aak'],
  ['baba', 'vgj'],
  // Grand Master → Senior Guru
  ['aak',  'skdc'],
  ['vgj',  'skdc'],
  ['ot',   'nr'],
  ['rmm',  'bdg'],
  // Senior Guru → Guru
  ['skdc', 'mb'],
  ['nr',   'sk'],
  ['bdg',  'ss'],
];

// Skip-tier connections (drawn with offset arc so they bypass intermediate nodes)
const skipTierLinks = [
  { from: 'skdc', to: 'anirban', offsetX: -60 },  // SKDC → Anirban
  { from: 'vgj',  to: 'brc',    offsetX: 50 },    // VGJ → BRC
];

const GOLD = '#b8922a';
const GOLD_LIGHT = '#d4aa4a';

const VB_W = 820;
const VB_H = 820;

export default function LineageTree() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const draw = () => {
      const svg = svgRef.current;
      if (!svg) return;

      const W = VB_W;
      svg.innerHTML = '';

      // Row Y positions (5 tiers)
      const ROW = [60, 200, 340, 500, 690];

      // Node radii per tier
      const PR  = 24;  // patriarch (BABA) radius
      const GMR = 22;  // grand master radius
      const SR  = 26;  // senior guru radius
      const GR  = 30;  // guru radius
      const BR  = 46;  // anirban radius

      const ns = 'http://www.w3.org/2000/svg';
      const el = (tag) => document.createElementNS(ns, tag);

      // --- Track node groups & paths for hover interactions ---
      const nodeGroups = {};   // id → <g> element
      const pathsByNode = {};  // id → Set of <path> elements connected to that node

      // --- CSS transitions for hover ---
      const style = el('style');
      style.textContent = `
        .lt-node { transition: transform 0.3s ease, opacity 0.3s ease; transform-origin: var(--ox) var(--oy); }
        .lt-node:hover { cursor: pointer; }
        .lt-node.dim { opacity: 0.25; }
        .lt-path { transition: stroke-opacity 0.3s ease, stroke-width 0.3s ease, opacity 0.3s ease; }
        .lt-path.dim  { opacity: 0.08; }
        .lt-path.glow { stroke: ${GOLD_LIGHT}; stroke-width: 2.5; opacity: 1 !important; filter: drop-shadow(0 0 4px ${GOLD_LIGHT}); }
        .lt-ring-hover { transition: stroke-width 0.3s ease, filter 0.3s ease; }
      `;
      svg.appendChild(style);

      // --- Defs ---
      const defs = el('defs');

      const grad = el('linearGradient');
      grad.id = 'goldLine';
      grad.setAttribute('x1', '0%'); grad.setAttribute('y1', '0%');
      grad.setAttribute('x2', '0%'); grad.setAttribute('y2', '100%');
      const s1 = el('stop'); s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', GOLD_LIGHT); s1.setAttribute('stop-opacity', '0.6');
      const s2 = el('stop'); s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', GOLD); s2.setAttribute('stop-opacity', '0.35');
      grad.appendChild(s1); grad.appendChild(s2);
      defs.appendChild(grad);

      const rglow = el('radialGradient'); rglow.id = 'aglow';
      rglow.innerHTML = `<stop offset="0%" stop-color="${GOLD_LIGHT}" stop-opacity=".9"/><stop offset="100%" stop-color="${GOLD}" stop-opacity=".35"/>`;
      defs.appendChild(rglow);

      svg.appendChild(defs);

      // --- Calculate positions ---

      // Tier 0: Patriarch (BABA) — centered between AAK and VGJ positions
      const gmSpacing = W / (grandMasters.length + 1);
      const gmPos = grandMasters.map((g, i) => ({
        ...g, x: gmSpacing * (i + 1), y: ROW[1], r: GMR,
      }));

      // BABA centered above AAK and VGJ
      const aakX = gmSpacing * 1;
      const vgjX = gmSpacing * 2;
      const patriarchPos = [
        { ...patriarch[0], x: (aakX + vgjX) / 2, y: ROW[0], r: PR },
      ];

      // Tier 2: Senior gurus aligned with downstream gurus
      const guruSpacing = W / (gurus.length + 1);
      const guruXById = {};
      gurus.forEach((g, i) => { guruXById[g.id] = guruSpacing * (i + 1); });

      const srPos = [
        { ...seniorGurus[0], x: (guruXById['ad'] + guruXById['mb']) / 2,  y: ROW[2], r: SR },  // SKDC
        { ...seniorGurus[1], x: guruXById['sk'] - 40,                     y: ROW[2], r: SR },  // NR (shifted left)
        { ...seniorGurus[2], x: (guruXById['brc'] + guruXById['ss']) / 2 + 25, y: ROW[2], r: SR },  // BDG (shifted right)
      ];

      // Tier 3: Gurus
      const guruPos = gurus.map((g, i) => ({
        ...g, x: guruSpacing * (i + 1), y: ROW[3], r: GR,
      }));

      // Tier 4: Anirban
      const anirbanPos = { id: 'anirban', x: W / 2, y: ROW[4], r: BR };

      // Build lookup map for all nodes
      const allNodes = {};
      patriarchPos.forEach(n => { allNodes[n.id] = n; });
      gmPos.forEach(n => { allNodes[n.id] = n; });
      srPos.forEach(n => { allNodes[n.id] = n; });
      guruPos.forEach(n => { allNodes[n.id] = n; });
      allNodes['anirban'] = anirbanPos;

      // --- Helper: bezier path (vertical, top-to-bottom) ---
      const bezierVert = (x1, y1, x2, y2) => {
        const my = y1 + (y2 - y1) * 0.5;
        return `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`;
      };

      // Arc for same-tier connections (horizontal with upward bow)
      const arcHoriz = (x1, y1, x2, y2, r) => {
        const mx = (x1 + x2) / 2;
        const bow = y1 - 35; // arc upward
        return `M${x1},${y1 - r} Q${mx},${bow} ${x2},${y2 - r}`;
      };

      const drawPath = (d, dashed = false, opacity = 1, fromId = null, toId = null) => {
        const path = el('path');
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'url(#goldLine)');
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('opacity', opacity);
        path.classList.add('lt-path');
        if (dashed) path.setAttribute('stroke-dasharray', '4,4');
        svg.appendChild(path);
        // Register path for hover lookup
        [fromId, toId].forEach(nid => {
          if (!nid) return;
          if (!pathsByNode[nid]) pathsByNode[nid] = new Set();
          pathsByNode[nid].add(path);
        });
        // Store connected node ids on the path itself
        path._fromId = fromId;
        path._toId = toId;
        return path;
      };

      // --- Draw connections ---
      connections.forEach(([fromId, toId]) => {
        const from = allNodes[fromId];
        const to = allNodes[toId];
        if (!from || !to) return;

        if (from.y === to.y) {
          drawPath(arcHoriz(from.x, from.y, to.x, to.y, from.r), true, 0.7, fromId, toId);
        } else {
          drawPath(bezierVert(
            from.x, from.y + from.r + 3,
            to.x, to.y - to.r - 3
          ), false, 1, fromId, toId);
        }
      });

      // All gurus → Anirban
      guruPos.forEach((g) => {
        drawPath(bezierVert(g.x, g.y + GR + 3, anirbanPos.x, anirbanPos.y - BR - 3), false, 1, g.id, 'anirban');
      });

      // Skip-tier connections
      skipTierLinks.forEach(({ from: fromId, to: toId, offsetX }) => {
        const from = allNodes[fromId];
        const to = allNodes[toId];
        if (!from || !to) return;
        const x1 = from.x;
        const y1 = from.y + from.r + 3;
        const x2 = to.x;
        const y2 = to.y - to.r - 3;
        const my = y1 + (y2 - y1) * 0.5;
        const d = `M${x1},${y1} C${x1 + offsetX},${my} ${x2 + offsetX},${my} ${x2},${y2}`;
        drawPath(d, false, 1, fromId, toId);
      });

      // --- Build directed graph & edge→path lookup for full-chain hover ---
      const downAdj = {};   // parentId → [childId, …]
      const pathByEdge = {};  // "fromId→toId" → path element

      // Populate from all drawn paths
      svg.querySelectorAll('.lt-path').forEach(p => {
        const f = p._fromId, t = p._toId;
        if (!f || !t) return;
        pathByEdge[`${f}→${t}`] = p;
        if (!downAdj[f]) downAdj[f] = [];
        downAdj[f].push(t);
      });

      // DFS: collect every node & edge on ANY path from startId to 'anirban'
      const traceToAnirban = (startId) => {
        const hitNodes = new Set();
        const hitPaths = new Set();
        const dfs = (nid) => {
          if (nid === 'anirban') { hitNodes.add(nid); return true; }
          const kids = downAdj[nid] || [];
          let reached = false;
          kids.forEach(kid => {
            if (dfs(kid)) {
              reached = true;
              hitNodes.add(kid);
              const pe = pathByEdge[`${nid}→${kid}`];
              if (pe) hitPaths.add(pe);
            }
          });
          if (reached) hitNodes.add(nid);
          return reached;
        };
        dfs(startId);
        return { hitNodes, hitPaths };
      };

      // --- Draw node helper ---
      const drawNode = (node, radius, tier, index) => {
        const g = el('g');
        g.classList.add('lt-node');
        g.style.setProperty('--ox', `${node.x}px`);
        g.style.setProperty('--oy', `${node.y}px`);

        const clipId = `node-${tier}-${index}`;
        const clip = el('clipPath'); clip.id = clipId;
        const clipCircle = el('circle');
        clipCircle.setAttribute('cx', node.x);
        clipCircle.setAttribute('cy', node.y);
        clipCircle.setAttribute('r', radius);
        clip.appendChild(clipCircle);
        defs.appendChild(clip);

        // Ring
        const ring = el('circle');
        ring.classList.add('lt-ring-hover');
        ring.setAttribute('cx', node.x);
        ring.setAttribute('cy', node.y);
        ring.setAttribute('r', radius + 1.5);
        ring.setAttribute('fill', 'none');
        ring.setAttribute('stroke', tier <= 1 ? `${GOLD}55` : GOLD_LIGHT);
        ring.setAttribute('stroke-width', tier <= 1 ? '1' : '1.5');
        ring.setAttribute('stroke-opacity', tier <= 1 ? '1' : '0.5');
        g.appendChild(ring);

        // Photo
        if (node.img) {
          const img = el('image');
          img.setAttribute('x', node.x - radius);
          img.setAttribute('y', node.y - radius);
          img.setAttribute('width', radius * 2);
          img.setAttribute('height', radius * 2);
          img.setAttribute('href', node.img);
          img.setAttribute('clip-path', `url(#${clipId})`);
          img.setAttribute('preserveAspectRatio', 'xMidYMid slice');
          g.appendChild(img);
        }

        // Name text
        const lines = node.label.split('\n');
        const fontSize = tier <= 1 ? 8.5 : tier === 2 ? 9.5 : 10;
        const lineHeight = tier <= 1 ? 11 : tier === 2 ? 12 : 13;
        lines.forEach((line, li) => {
          const txt = el('text');
          txt.setAttribute('x', node.x);
          txt.setAttribute('y', node.y + radius + 14 + li * lineHeight);
          txt.setAttribute('text-anchor', 'middle');
          txt.setAttribute('fill', tier <= 1 ? `${GOLD}88` : '#f5efe4');
          txt.setAttribute('font-size', fontSize);
          txt.setAttribute('font-family', 'var(--font-cormorant), Cormorant Garamond, serif');
          if (tier <= 1) txt.setAttribute('letter-spacing', '0.06em');
          txt.textContent = line;
          g.appendChild(txt);
        });

        // Role (for senior gurus and gurus)
        if (node.role) {
          const role = el('text');
          role.setAttribute('x', node.x);
          role.setAttribute('y', node.y + radius + 14 + lines.length * lineHeight + 2);
          role.setAttribute('text-anchor', 'middle');
          role.setAttribute('fill', `${GOLD}88`);
          role.setAttribute('font-size', tier <= 1 ? '7' : '7.5');
          role.setAttribute('letter-spacing', '0.1em');
          role.textContent = node.role.toUpperCase();
          g.appendChild(role);
        }

        svg.appendChild(g);
        nodeGroups[node.id] = g;

        // --- Hover handlers — trace full path to Anirban ---
        g.addEventListener('mouseenter', () => {
          g.style.transform = 'scale(1.15)';
          ring.setAttribute('stroke', GOLD_LIGHT);
          ring.setAttribute('stroke-width', '2.5');
          ring.style.filter = `drop-shadow(0 0 6px ${GOLD_LIGHT})`;

          const { hitNodes, hitPaths } = traceToAnirban(node.id);

          // Dim everything first
          Object.entries(nodeGroups).forEach(([nid, ng]) => {
            if (!hitNodes.has(nid)) ng.classList.add('dim');
          });
          svg.querySelectorAll('.lt-path').forEach(p => p.classList.add('dim'));

          // Glow the traced paths & scale intermediate nodes
          hitPaths.forEach(p => { p.classList.remove('dim'); p.classList.add('glow'); });
          hitNodes.forEach(nid => {
            const ng = nodeGroups[nid];
            if (ng && nid !== node.id) {
              ng.classList.remove('dim');
              ng.style.transform = 'scale(1.06)';
            }
          });
        });

        g.addEventListener('mouseleave', () => {
          g.style.transform = '';
          ring.setAttribute('stroke', tier <= 1 ? `${GOLD}55` : GOLD_LIGHT);
          ring.setAttribute('stroke-width', tier <= 1 ? '1' : '1.5');
          ring.style.filter = '';

          Object.values(nodeGroups).forEach(ng => { ng.classList.remove('dim'); ng.style.transform = ''; });
          svg.querySelectorAll('.lt-path').forEach(p => { p.classList.remove('dim', 'glow'); });
        });
      };

      // --- Draw all nodes (connections first, then nodes on top) ---
      patriarchPos.forEach((n, i) => drawNode(n, PR, 0, i));
      gmPos.forEach((n, i) => drawNode(n, GMR, 1, i));
      srPos.forEach((n, i) => drawNode(n, SR, 2, i));
      guruPos.forEach((n, i) => drawNode(n, GR, 3, i));

      // --- Draw Anirban (special, largest) ---
      const aG = el('g');
      aG.classList.add('lt-node');
      aG.style.setProperty('--ox', `${anirbanPos.x}px`);
      aG.style.setProperty('--oy', `${anirbanPos.y}px`);

      const aClipId = 'anirban-clip';
      const aClip = el('clipPath'); aClip.id = aClipId;
      const aClipC = el('circle');
      aClipC.setAttribute('cx', anirbanPos.x);
      aClipC.setAttribute('cy', anirbanPos.y);
      aClipC.setAttribute('r', BR);
      aClip.appendChild(aClipC);
      defs.appendChild(aClip);

      // Glow ring
      const glowRing = el('circle');
      glowRing.classList.add('lt-ring-hover');
      glowRing.setAttribute('cx', anirbanPos.x);
      glowRing.setAttribute('cy', anirbanPos.y);
      glowRing.setAttribute('r', BR + 6);
      glowRing.setAttribute('fill', 'none');
      glowRing.setAttribute('stroke', 'url(#aglow)');
      glowRing.setAttribute('stroke-width', '3');
      aG.appendChild(glowRing);

      // Ring
      const aRing = el('circle');
      aRing.classList.add('lt-ring-hover');
      aRing.setAttribute('cx', anirbanPos.x);
      aRing.setAttribute('cy', anirbanPos.y);
      aRing.setAttribute('r', BR + 2);
      aRing.setAttribute('fill', 'none');
      aRing.setAttribute('stroke', GOLD_LIGHT);
      aRing.setAttribute('stroke-width', '2');
      aG.appendChild(aRing);

      // Photo
      const aImg = el('image');
      aImg.setAttribute('x', anirbanPos.x - BR);
      aImg.setAttribute('y', anirbanPos.y - BR);
      aImg.setAttribute('width', BR * 2);
      aImg.setAttribute('height', BR * 2);
      aImg.setAttribute('href', '/anirbanda.jpg');
      aImg.setAttribute('clip-path', `url(#${aClipId})`);
      aImg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      aG.appendChild(aImg);

      // Name
      const aName = el('text');
      aName.setAttribute('x', anirbanPos.x);
      aName.setAttribute('y', anirbanPos.y + BR + 20);
      aName.setAttribute('text-anchor', 'middle');
      aName.setAttribute('fill', '#f5efe4');
      aName.setAttribute('font-size', '14');
      aName.setAttribute('font-family', 'var(--font-cormorant), Cormorant Garamond, serif');
      aName.setAttribute('font-style', 'italic');
      aName.textContent = 'Anirban Bhattacharjee';
      aG.appendChild(aName);

      const aSub = el('text');
      aSub.setAttribute('x', anirbanPos.x);
      aSub.setAttribute('y', anirbanPos.y + BR + 35);
      aSub.setAttribute('text-anchor', 'middle');
      aSub.setAttribute('fill', `${GOLD}77`);
      aSub.setAttribute('font-size', '8');
      aSub.setAttribute('letter-spacing', '0.15em');
      aSub.textContent = 'THE CONFLUENCE OF TRADITIONS';
      aG.appendChild(aSub);

      svg.appendChild(aG);
      nodeGroups['anirban'] = aG;

      // Anirban hover — light up ALL paths (everything leads here)
      aG.addEventListener('mouseenter', () => {
        aG.style.transform = 'scale(1.1)';
        glowRing.setAttribute('stroke-width', '5');
        glowRing.style.filter = `drop-shadow(0 0 10px ${GOLD_LIGHT})`;

        // Every node and every path glows — Anirban is the confluence
        Object.values(nodeGroups).forEach(ng => { ng.style.transform = 'scale(1.06)'; });
        aG.style.transform = 'scale(1.1)'; // keep Anirban's own scale
        svg.querySelectorAll('.lt-path').forEach(p => p.classList.add('glow'));
      });

      aG.addEventListener('mouseleave', () => {
        aG.style.transform = '';
        glowRing.setAttribute('stroke-width', '3');
        glowRing.style.filter = '';
        Object.values(nodeGroups).forEach(ng => { ng.classList.remove('dim'); ng.style.transform = ''; });
        svg.querySelectorAll('.lt-path').forEach(p => { p.classList.remove('dim', 'glow'); });
      });
    };

    draw();
    const timer = setTimeout(draw, 150);
    return () => { clearTimeout(timer); };
  }, []);

  return (
    <div ref={containerRef} className="w-full py-4 sm:py-8">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="block mx-auto w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
}
