'use client';

import { useEffect, useRef } from 'react';

/*
  Lineage data — five tiers (top → bottom):
    patriarch → grandMasters → seniorGurus → gurus → Anirban
*/

// Top-most tier — BABA alone
const patriarch = [
  { id: 'baba', label: 'Ud. Allauddin\nKhan', img: '/Baba.jpeg' },
];

const grandMasters = [
  { id: 'aak',  label: 'Ud. Ali Akbar\nKhan',          img: '/AAK.jpg' },
  { id: 'vgj',  label: 'Pt. V.G.\nJog',                img: '/vgJoglineage.jpeg' },
  { id: 'rmm',  label: 'Pt. Radhika Mohan\nMaitra',    img: '/Radhika_Mohan_Maitra.jpg' },
  { id: 'asr',  label: 'Pt. Ajay\nSinha Roy',           img: '/ASR.jpg' },
  { id: 'ot',   label: 'Pt. Omkarnath\nThakur',         img: '/OT.jpg' },
];

const seniorGurus = [
  { id: 'skdc', label: 'Dr. Sisirkana\nDhar Choudhury', img: '/sisirkana-choudhury.jpg', role: '' },
  { id: 'bdg',  label: 'Pt. Buddhadev\nDasgupta',       img: '/Bdg.jpeg',                role: '' },
  { id: 'dc',   label: 'Pt. Debaprasad\nChakraborty',   img: '/DC.webp',                 role: '' },
  { id: 'nr',   label: "Dr. N.\nRajam",                 img: '/Dr_N_RajamsLineage.jpeg', role: '' },
];

const gurus = [
  { id: 'jb',   label: 'Shri Jitesh\nBhattacharjee',    role: '',      img: '/jitesh-bhattacharjee.jpg' },
  { id: 'ad',   label: 'Shri Ashim\nDutta',              role: '',    img: '/ashim-dutta.jpg' },
  { id: 'mb',   label: 'Shri Manoj\nBaruah',             role: '',    img: '/manoj-baruah.jpg' },
  { id: 'brc',  label: 'Prof. Biswajit\nRoy Choudhury',  role: '', img: '/biswajit-roy-choudhury.jpeg' },
  { id: 'ss',   label: 'Shri Supratik\nSengupta',        role: '',     img: '/supratik-sengupta.jpg' },
  { id: 'sk',   label: 'Dr. Swarna\nKhuntia',            role: '',           img: '/swarna-khuntia.jpeg' },
];

// All connections: [fromId, toId]
const connections = [
  // Patriarch → Grand Master
  ['baba', 'aak'],
  ['baba', 'vgj'],
  ['baba', 'asr'],
  // Grand Master → Senior Guru
  ['aak',  'skdc'],
  ['vgj',  'skdc'],
  ['rmm',  'bdg'],
  ['asr',  'dc'],
  ['ot',   'nr'],
  // Senior Guru → Guru
  ['skdc', 'mb'],
  ['bdg',  'ss'],
  ['dc',   'ss'],
  ['nr',   'sk'],
];

// Skip-tier connections (drawn with offset arc so they bypass intermediate nodes)
const skipTierLinks = [
  { from: 'skdc', to: 'anirban', offsetX: -60 },  // SKDC → Anirban
  { from: 'vgj',  to: 'brc',    offsetX: 50 },    // VGJ → BRC
];

const GOLD = '#b8922a';
const GOLD_LIGHT = '#d4aa4a';

const VB_W = 960;
const VB_H = 820;

// Physics constants
const SPRING = 0.05;
const DAMPING = 0.78;
const PROPAGATION_DIRECT = 0.4;
const PROPAGATION_INDIRECT = 0.15;

export default function LineageTree() {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const W = VB_W;
    svg.innerHTML = '';

    // Row Y positions (5 tiers)
    const ROW = [60, 200, 340, 500, 690];

    // Node radii per tier
    const PR  = 24;
    const GMR = 22;
    const SR  = 26;
    const GR  = 30;
    const BR  = 46;

    const ns = 'http://www.w3.org/2000/svg';
    const el = (tag) => document.createElementNS(ns, tag);

    // --- State tracking ---
    const nodeGroups = {};     // id → <g> element
    const nodeScale = {};      // id → target scale
    const nodeRings = {};      // id → { ring, tier } for hover ring styling
    const physics = {};        // id → { dx, dy, vx, vy }
    const allDrawnPaths = [];  // { path, fromId, toId, type, dashed, offsetX }

    let hoveredNodeId = null;
    let draggedNodeId = null;  // currently dragged node
    let mouseX = 0, mouseY = 0;

    // --- CSS (no transform transition — physics handles it) ---
    const style = el('style');
    style.textContent = `
      .lt-node { opacity: 1; transition: opacity 0.3s ease; transform-origin: var(--ox) var(--oy); }
      .lt-node:hover { cursor: grab; }
      .lt-node.dragging { cursor: grabbing; }
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
    const gmSpacing = W / (grandMasters.length + 1);
    const gmPos = grandMasters.map((g, i) => ({
      ...g, x: gmSpacing * (i + 1), y: ROW[1], r: GMR,
    }));

    const aakX = gmSpacing * 1;
    const vgjX = gmSpacing * 2;
    const patriarchPos = [
      { ...patriarch[0], x: (aakX + vgjX) / 2, y: ROW[0], r: PR },
    ];

    const guruSpacing = W / (gurus.length + 1);
    const guruXById = {};
    gurus.forEach((g, i) => { guruXById[g.id] = guruSpacing * (i + 1); });

    const srPos = [
      { ...seniorGurus[0], x: (guruXById['ad'] + guruXById['mb']) / 2,    y: ROW[2], r: SR },
      { ...seniorGurus[1], x: (guruXById['brc'] + guruXById['ss']) / 2,   y: ROW[2], r: SR },
      { ...seniorGurus[2], x: (guruXById['ss'] + guruXById['sk']) / 2 - 15, y: ROW[2], r: SR },
      { ...seniorGurus[3], x: guruXById['sk'] + 10,                      y: ROW[2], r: SR },
    ];

    const guruPos = gurus.map((g, i) => ({
      ...g, x: guruSpacing * (i + 1), y: ROW[3], r: GR,
    }));

    const anirbanPos = { id: 'anirban', x: W / 2, y: ROW[4], r: BR };

    // Build lookup map
    const allNodes = {};
    patriarchPos.forEach(n => { allNodes[n.id] = n; });
    gmPos.forEach(n => { allNodes[n.id] = n; });
    srPos.forEach(n => { allNodes[n.id] = n; });
    guruPos.forEach(n => { allNodes[n.id] = n; });
    allNodes['anirban'] = anirbanPos;

    // Init physics for every node
    Object.keys(allNodes).forEach(id => {
      physics[id] = { dx: 0, dy: 0, vx: 0, vy: 0 };
      nodeScale[id] = 1;
    });

    // --- Path helpers ---
    const bezierVertD = (x1, y1, x2, y2) => {
      const my = y1 + (y2 - y1) * 0.5;
      return `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`;
    };

    const arcHorizD = (x1, y1, x2, y2, r) => {
      const mx = (x1 + x2) / 2;
      const bow = y1 - 35;
      return `M${x1},${y1 - r} Q${mx},${bow} ${x2},${y2 - r}`;
    };

    const drawPath = (d, dashed, opacity, fromId, toId, type, offsetX) => {
      const path = el('path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'url(#goldLine)');
      path.setAttribute('stroke-width', '1.5');
      path.setAttribute('opacity', opacity);
      path.classList.add('lt-path');
      if (dashed) path.setAttribute('stroke-dasharray', '4,4');
      svg.appendChild(path);
      path._fromId = fromId;
      path._toId = toId;
      allDrawnPaths.push({ path, fromId, toId, type, dashed, offsetX: offsetX || 0 });
      return path;
    };

    // --- Draw connections ---
    connections.forEach(([fromId, toId]) => {
      const from = allNodes[fromId];
      const to = allNodes[toId];
      if (!from || !to) return;

      if (from.y === to.y) {
        drawPath(arcHorizD(from.x, from.y, to.x, to.y, from.r), true, 0.7, fromId, toId, 'arc', 0);
      } else {
        drawPath(bezierVertD(
          from.x, from.y + from.r + 3,
          to.x, to.y - to.r - 3
        ), false, 1, fromId, toId, 'vert', 0);
      }
    });

    guruPos.forEach((g) => {
      drawPath(bezierVertD(g.x, g.y + GR + 3, anirbanPos.x, anirbanPos.y - BR - 3), false, 1, g.id, 'anirban', 'vert', 0);
    });

    skipTierLinks.forEach(({ from: fromId, to: toId, offsetX }) => {
      const from = allNodes[fromId];
      const to = allNodes[toId];
      if (!from || !to) return;
      const x1 = from.x, y1 = from.y + from.r + 3;
      const x2 = to.x, y2 = to.y - to.r - 3;
      const my = y1 + (y2 - y1) * 0.5;
      const d = `M${x1},${y1} C${x1 + offsetX},${my} ${x2 + offsetX},${my} ${x2},${y2}`;
      drawPath(d, false, 1, fromId, toId, 'skip', offsetX);
    });

    // --- Build directed graph ---
    const downAdj = {};
    const upAdj = {};
    const pathByEdge = {};

    allDrawnPaths.forEach(({ path, fromId, toId }) => {
      pathByEdge[`${fromId}→${toId}`] = path;
      if (!downAdj[fromId]) downAdj[fromId] = [];
      downAdj[fromId].push(toId);
      if (!upAdj[toId]) upAdj[toId] = [];
      upAdj[toId].push(fromId);
    });

    // DFS: trace paths to Anirban
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

    // Get all directly connected node ids
    const getConnected = (id) => {
      const set = new Set();
      (downAdj[id] || []).forEach(c => set.add(c));
      (upAdj[id] || []).forEach(c => set.add(c));
      return set;
    };

    // Get 2nd-degree connections
    const getSecondDegree = (id) => {
      const direct = getConnected(id);
      const second = new Set();
      direct.forEach(did => {
        getConnected(did).forEach(sid => {
          if (sid !== id && !direct.has(sid)) second.add(sid);
        });
      });
      return second;
    };

    // --- SVG coordinate helper (declared early so touch handlers can use it) ---
    const getSVGPoint = (clientX, clientY) => {
      const rect = svg.getBoundingClientRect();
      return {
        x: (clientX - rect.left) * (VB_W / rect.width),
        y: (clientY - rect.top) * (VB_H / rect.height),
      };
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
        txt.setAttribute('fill', '#f5efe4');
        txt.setAttribute('font-size', fontSize);
        txt.setAttribute('font-family', 'var(--font-cormorant), Cormorant Garamond, serif');
        if (tier <= 1) txt.setAttribute('letter-spacing', '0.06em');
        txt.textContent = line;
        g.appendChild(txt);
      });

      // Role
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
      nodeRings[node.id] = { ring, tier };

      // --- Hover handlers ---
      g.addEventListener('mouseenter', () => {
        if (draggedNodeId) return; // don't change highlight while dragging
        hoveredNodeId = node.id;
        nodeScale[node.id] = 1.1;
        ring.setAttribute('stroke', GOLD_LIGHT);
        ring.setAttribute('stroke-width', '2.5');
        ring.style.filter = `drop-shadow(0 0 6px ${GOLD_LIGHT})`;

        const { hitNodes, hitPaths } = traceToAnirban(node.id);

        Object.entries(nodeGroups).forEach(([nid, ng]) => {
          if (!hitNodes.has(nid)) ng.classList.add('dim');
        });
        svg.querySelectorAll('.lt-path').forEach(p => p.classList.add('dim'));

        hitPaths.forEach(p => { p.classList.remove('dim'); p.classList.add('glow'); });
        hitNodes.forEach(nid => {
          const ng = nodeGroups[nid];
          if (ng && nid !== node.id) {
            ng.classList.remove('dim');
            nodeScale[nid] = 1.06;
          }
        });
      });

      g.addEventListener('mouseleave', () => {
        if (draggedNodeId) return; // keep state while dragging
        hoveredNodeId = null;
        nodeScale[node.id] = 1;
        ring.setAttribute('stroke', tier <= 1 ? `${GOLD}55` : GOLD_LIGHT);
        ring.setAttribute('stroke-width', tier <= 1 ? '1' : '1.5');
        ring.style.filter = '';

        Object.keys(nodeGroups).forEach(nid => {
          nodeGroups[nid].classList.remove('dim');
          nodeScale[nid] = 1;
        });
        svg.querySelectorAll('.lt-path').forEach(p => { p.classList.remove('dim', 'glow'); });
      });

      // --- Drag handler (left-click / touch and hold to pull) ---
      g.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        draggedNodeId = node.id;
        nodeScale[node.id] = 1.15;
        g.classList.add('dragging');
      });

      g.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const pt = getSVGPoint(touch.clientX, touch.clientY);
        mouseX = pt.x;
        mouseY = pt.y;
        draggedNodeId = node.id;
        nodeScale[node.id] = 1.15;
        g.classList.add('dragging');

        // Trigger highlight (same as mouseenter)
        hoveredNodeId = node.id;
        ring.setAttribute('stroke', GOLD_LIGHT);
        ring.setAttribute('stroke-width', '2.5');
        ring.style.filter = `drop-shadow(0 0 6px ${GOLD_LIGHT})`;
        const { hitNodes, hitPaths } = traceToAnirban(node.id);
        Object.entries(nodeGroups).forEach(([nid, ng]) => {
          if (!hitNodes.has(nid)) ng.classList.add('dim');
        });
        svg.querySelectorAll('.lt-path').forEach(p => p.classList.add('dim'));
        hitPaths.forEach(p => { p.classList.remove('dim'); p.classList.add('glow'); });
        hitNodes.forEach(nid => {
          const ng = nodeGroups[nid];
          if (ng && nid !== node.id) {
            ng.classList.remove('dim');
            nodeScale[nid] = 1.06;
          }
        });
      }, { passive: false });
    };

    // --- Draw all nodes ---
    patriarchPos.forEach((n, i) => drawNode(n, PR, 0, i));
    gmPos.forEach((n, i) => drawNode(n, GMR, 1, i));
    srPos.forEach((n, i) => drawNode(n, SR, 2, i));
    guruPos.forEach((n, i) => drawNode(n, GR, 3, i));

    // --- Draw Anirban ---
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

    const glowRing = el('circle');
    glowRing.classList.add('lt-ring-hover');
    glowRing.setAttribute('cx', anirbanPos.x);
    glowRing.setAttribute('cy', anirbanPos.y);
    glowRing.setAttribute('r', BR + 6);
    glowRing.setAttribute('fill', 'none');
    glowRing.setAttribute('stroke', 'url(#aglow)');
    glowRing.setAttribute('stroke-width', '3');
    aG.appendChild(glowRing);

    const aRing = el('circle');
    aRing.classList.add('lt-ring-hover');
    aRing.setAttribute('cx', anirbanPos.x);
    aRing.setAttribute('cy', anirbanPos.y);
    aRing.setAttribute('r', BR + 2);
    aRing.setAttribute('fill', 'none');
    aRing.setAttribute('stroke', GOLD_LIGHT);
    aRing.setAttribute('stroke-width', '2');
    aG.appendChild(aRing);

    const aImg = el('image');
    aImg.setAttribute('x', anirbanPos.x - BR);
    aImg.setAttribute('y', anirbanPos.y - BR);
    aImg.setAttribute('width', BR * 2);
    aImg.setAttribute('height', BR * 2);
    aImg.setAttribute('href', '/anirbanda.jpg');
    aImg.setAttribute('clip-path', `url(#${aClipId})`);
    aImg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    aG.appendChild(aImg);

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
    aSub.textContent = '';
    aG.appendChild(aSub);

    svg.appendChild(aG);
    nodeGroups['anirban'] = aG;
    nodeRings['anirban'] = { ring: aRing, tier: 4 };

    // Anirban hover
    aG.addEventListener('mouseenter', () => {
      if (draggedNodeId) return;
      hoveredNodeId = 'anirban';
      nodeScale['anirban'] = 1.1;
      glowRing.setAttribute('stroke-width', '5');
      glowRing.style.filter = `drop-shadow(0 0 10px ${GOLD_LIGHT})`;

      Object.keys(nodeGroups).forEach(nid => { nodeScale[nid] = 1.06; });
      nodeScale['anirban'] = 1.1;
      svg.querySelectorAll('.lt-path').forEach(p => p.classList.add('glow'));
    });

    aG.addEventListener('mouseleave', () => {
      if (draggedNodeId) return;
      hoveredNodeId = null;
      glowRing.setAttribute('stroke-width', '3');
      glowRing.style.filter = '';
      Object.keys(nodeGroups).forEach(nid => {
        nodeGroups[nid].classList.remove('dim');
        nodeScale[nid] = 1;
      });
      svg.querySelectorAll('.lt-path').forEach(p => { p.classList.remove('dim', 'glow'); });
    });

    // Anirban drag
    aG.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      draggedNodeId = 'anirban';
      nodeScale['anirban'] = 1.1;
      aG.classList.add('dragging');
    });

    aG.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const pt = getSVGPoint(touch.clientX, touch.clientY);
      mouseX = pt.x;
      mouseY = pt.y;
      draggedNodeId = 'anirban';
      hoveredNodeId = 'anirban';
      nodeScale['anirban'] = 1.1;
      aG.classList.add('dragging');
      glowRing.setAttribute('stroke-width', '5');
      glowRing.style.filter = `drop-shadow(0 0 10px ${GOLD_LIGHT})`;
      Object.keys(nodeGroups).forEach(nid => { nodeScale[nid] = 1.06; });
      nodeScale['anirban'] = 1.1;
      svg.querySelectorAll('.lt-path').forEach(p => p.classList.add('glow'));
    }, { passive: false });

    // --- SVG mouse & touch tracking ---
    svg.addEventListener('mousemove', (e) => {
      const pt = getSVGPoint(e.clientX, e.clientY);
      mouseX = pt.x;
      mouseY = pt.y;
    });

    svg.addEventListener('touchmove', (e) => {
      if (!draggedNodeId) return;
      e.preventDefault();
      const touch = e.touches[0];
      const pt = getSVGPoint(touch.clientX, touch.clientY);
      mouseX = pt.x;
      mouseY = pt.y;
    }, { passive: false });

    // Release drag on mouseup / touchend
    const resetDrag = () => {
      if (!draggedNodeId) return;
      const g = nodeGroups[draggedNodeId];
      if (g) g.classList.remove('dragging');
      draggedNodeId = null;
      // Reset all scales and highlights
      hoveredNodeId = null;
      Object.keys(nodeScale).forEach(id => { nodeScale[id] = 1; });
      Object.values(nodeGroups).forEach(ng => ng.classList.remove('dim'));
      svg.querySelectorAll('.lt-path').forEach(p => { p.classList.remove('dim', 'glow'); });
      // Reset Anirban glow ring
      glowRing.setAttribute('stroke-width', '3');
      glowRing.style.filter = '';
      // Reset all node rings
      Object.keys(nodeRings).forEach(nid => {
        const { ring: r, tier: t } = nodeRings[nid];
        r.setAttribute('stroke', t <= 1 ? `${GOLD}55` : GOLD_LIGHT);
        r.setAttribute('stroke-width', t <= 1 ? '1' : '1.5');
        r.style.filter = '';
      });
    };

    window.addEventListener('mouseup', resetDrag);
    window.addEventListener('touchend', resetDrag);
    window.addEventListener('touchcancel', resetDrag);

    svg.addEventListener('mouseleave', () => {
      if (draggedNodeId) return; // keep dragging even outside SVG until mouseup
      hoveredNodeId = null;
      Object.keys(nodeScale).forEach(id => { nodeScale[id] = 1; });
      Object.values(nodeGroups).forEach(ng => ng.classList.remove('dim'));
      svg.querySelectorAll('.lt-path').forEach(p => { p.classList.remove('dim', 'glow'); });
    });

    // --- Recompute a path's `d` from displaced positions ---
    const recomputePath = (entry) => {
      const { path, fromId, toId, type, offsetX } = entry;
      const from = allNodes[fromId];
      const to = allNodes[toId];
      const fp = physics[fromId];
      const tp = physics[toId];
      if (!from || !to || !fp || !tp) return;

      const fx = from.x + fp.dx;
      const fy = from.y + fp.dy;
      const tx = to.x + tp.dx;
      const ty = to.y + tp.dy;

      let d;
      if (type === 'arc') {
        d = arcHorizD(fx, fy, tx, ty, from.r);
      } else if (type === 'skip') {
        const y1 = fy + from.r + 3;
        const y2 = ty - to.r - 3;
        const my = y1 + (y2 - y1) * 0.5;
        d = `M${fx},${y1} C${fx + offsetX},${my} ${tx + offsetX},${my} ${tx},${y2}`;
      } else {
        const y1 = fy + from.r + 3;
        const y2 = ty - to.r - 3;
        const my = y1 + (y2 - y1) * 0.5;
        d = `M${fx},${y1} C${fx},${my} ${tx},${my} ${tx},${y2}`;
      }
      path.setAttribute('d', d);
    };

    // --- Animation loop ---
    const allNodeIds = Object.keys(allNodes);

    const animate = () => {
      allNodeIds.forEach(id => {
        const p = physics[id];
        const node = allNodes[id];
        let targetDx = 0, targetDy = 0;

        if (draggedNodeId === id) {
          // Dragged node follows mouse directly
          targetDx = mouseX - node.x;
          targetDy = mouseY - node.y;
        } else if (draggedNodeId) {
          // Propagate drag through elastic connections
          const directlyConnected = getConnected(draggedNodeId);
          const secondDegree = getSecondDegree(draggedNodeId);
          const dp = physics[draggedNodeId];

          if (directlyConnected.has(id)) {
            targetDx = dp.dx * PROPAGATION_DIRECT;
            targetDy = dp.dy * PROPAGATION_DIRECT;
          } else if (secondDegree.has(id)) {
            targetDx = dp.dx * PROPAGATION_INDIRECT;
            targetDy = dp.dy * PROPAGATION_INDIRECT;
          }
        }
        // else: targetDx/Dy stay 0 → springs back to rest

        // Spring physics
        p.vx += (targetDx - p.dx) * SPRING;
        p.vy += (targetDy - p.dy) * SPRING;
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.dx += p.vx;
        p.dy += p.vy;

        // Apply combined transform (translate + scale)
        const g = nodeGroups[id];
        if (g) {
          const s = nodeScale[id] || 1;
          g.style.transform = `translate(${p.dx}px, ${p.dy}px) scale(${s})`;
        }
      });

      // Redraw all paths with displaced positions
      allDrawnPaths.forEach(recomputePath);

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('mouseup', resetDrag);
      window.removeEventListener('touchend', resetDrag);
      window.removeEventListener('touchcancel', resetDrag);
    };
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
