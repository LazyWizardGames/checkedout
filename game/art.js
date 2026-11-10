// Checked Out - art test. Everything is drawn in code as SVG.
// Characters are drawn with their feet at (0,0), about 70 units tall.

(() => {
const OUT = '#140d1c';
const GHOST = '#b6fff6';

const defs = `
<defs>
  <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="3.2" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="softglow" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="6"/>
  </filter>
  <radialGradient id="lamp" cx="50%" cy="35%" r="65%">
    <stop offset="0" stop-color="#ffd58a" stop-opacity=".55"/>
    <stop offset=".55" stop-color="#ffb35c" stop-opacity=".12"/>
    <stop offset="1" stop-color="#000" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="cold" cx="50%" cy="50%" r="60%">
    <stop offset="0" stop-color="#8ffcf0" stop-opacity=".35"/>
    <stop offset="1" stop-color="#8ffcf0" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="ghostbody" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${GHOST}" stop-opacity=".95"/>
    <stop offset=".75" stop-color="${GHOST}" stop-opacity=".7"/>
    <stop offset="1" stop-color="${GHOST}" stop-opacity=".15"/>
  </linearGradient>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0b0815"/><stop offset="1" stop-color="#231833"/>
  </linearGradient>
  <linearGradient id="fear" x1="0" x2="1">
    <stop offset="0" stop-color="#6d7a93"/><stop offset=".38" stop-color="#6d7a93"/>
    <stop offset=".40" stop-color="#5fd47a"/><stop offset=".72" stop-color="#5fd47a"/>
    <stop offset=".74" stop-color="#ff5a4e"/><stop offset="1" stop-color="#ff5a4e"/>
  </linearGradient>
  <linearGradient id="brass" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ecc96c"/><stop offset="1" stop-color="#a5792c"/>
  </linearGradient>
  <pattern id="paper-plum" width="14" height="14" patternUnits="userSpaceOnUse">
    <rect width="14" height="14" fill="#3b2244"/><rect width="7" height="14" fill="#432750"/>
    <circle cx="3.5" cy="7" r="1.3" fill="#5a3768"/>
  </pattern>
  <pattern id="paper-green" width="16" height="16" patternUnits="userSpaceOnUse">
    <rect width="16" height="16" fill="#203a33"/>
    <path d="M8 2 L12 8 L8 14 L4 8 Z" fill="#284840"/>
  </pattern>
  <pattern id="paper-red" width="12" height="12" patternUnits="userSpaceOnUse">
    <rect width="12" height="12" fill="#4a1f28"/><rect x="5" width="2" height="12" fill="#56262f"/>
  </pattern>
  <pattern id="paper-gold" width="18" height="18" patternUnits="userSpaceOnUse">
    <rect width="18" height="18" fill="#3c3022"/>
    <circle cx="9" cy="9" r="3" fill="none" stroke="#4d3e2a" stroke-width="1.5"/>
  </pattern>
  <pattern id="wood" width="40" height="8" patternUnits="userSpaceOnUse">
    <rect width="40" height="8" fill="#4a2e22"/><rect width="40" height="1" fill="#3a2219"/>
    <rect x="22" y="0" width="1" height="8" fill="#3a2219"/>
  </pattern>
  <pattern id="stripes" width="6" height="6" patternUnits="userSpaceOnUse">
    <rect width="6" height="6" fill="#e9e1d0"/><rect width="6" height="3" fill="#d4473f"/>
  </pattern>
</defs>`;

const g = (x, y, s, inner, extra = '') =>
  `<g transform="translate(${x} ${y}) scale(${s})" ${extra}>${inner}</g>`;

// ---------- living guests ----------
function eyes(scared, y = -57) {
  if (scared) return `
    <circle cx="-4" cy="${y}" r="3.4" fill="#fff" stroke="${OUT}" stroke-width="1.2"/>
    <circle cx="4" cy="${y}" r="3.4" fill="#fff" stroke="${OUT}" stroke-width="1.2"/>
    <circle cx="-4" cy="${y}" r="1.2" fill="${OUT}"/><circle cx="4" cy="${y}" r="1.2" fill="${OUT}"/>
    <ellipse cx="0" cy="${y + 7}" rx="2.4" ry="3" fill="${OUT}"/>`;
  return `<circle cx="-3.8" cy="${y}" r="1.7" fill="${OUT}"/><circle cx="3.8" cy="${y}" r="1.7" fill="${OUT}"/>`;
}

function body(o) {
  const legs = o.skirt
    ? `<rect x="-6.5" y="-16" width="4.5" height="16" rx="2" fill="${o.legs}" class="o"/>
       <rect x="2" y="-16" width="4.5" height="16" rx="2" fill="${o.legs}" class="o"/>`
    : `<rect x="-8" y="-24" width="7" height="24" rx="3" fill="${o.legs}" class="o"/>
       <rect x="1" y="-24" width="7" height="24" rx="3" fill="${o.legs}" class="o"/>`;
  const shoes = `<ellipse cx="-5" cy="-1" rx="5" ry="2.6" fill="${o.shoes || '#20161f'}" class="o"/>
                 <ellipse cx="5" cy="-1" rx="5" ry="2.6" fill="${o.shoes || '#20161f'}" class="o"/>`;
  const bottom = o.skirt ? -14 : -21;
  const torso = `<path d="M-12.5 ${bottom} L-11.5 -44 Q0 -49 11.5 -44 L12.5 ${bottom} Q0 ${bottom + 3} -12.5 ${bottom} Z" fill="${o.coat}" class="o"/>`;
  return legs + shoes + torso;
}

function head(o) {
  return `<circle cx="0" cy="-57" r="11" fill="${o.skin}" class="o"/>` + (o.hair || '') + eyes(o.scared);
}

const arm = (x1, y1, x2, y2, c) =>
  `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${OUT}" stroke-width="7.5" stroke-linecap="round"/>
   <path d="M${x1} ${y1} L${x2} ${y2}" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`;
const hand = (x, y, skin) => `<circle cx="${x}" cy="${y}" r="3" fill="${skin}" class="o"/>`;

const SKIN = ['#f1c7a3', '#d9a27b', '#a8714f', '#7a4a33'];

function grandma(scared = false) {
  const o = { coat: '#8f6ab3', legs: '#d9b9a0', skin: SKIN[0], skirt: true, scared,
    hair: `<circle cx="0" cy="-70" r="6" fill="#d7d3dc" class="o"/>
           <path d="M-11 -57 Q-11 -69 0 -69 Q11 -69 11 -57 Q7 -63 0 -63 Q-7 -63 -11 -57 Z" fill="#d7d3dc" class="o"/>` };
  return body(o) +
    `<path d="M-12 -34 L12 -34" stroke="#6f4f8f" stroke-width="2"/>` +
    arm(-11, -42, -17, -24, o.coat) + hand(-17, -23, o.skin) +
    `<path d="M-17 -23 L-20 0" stroke="#5a3a1e" stroke-width="2.6" stroke-linecap="round"/>` +
    arm(11, -42, 15, -27, o.coat) + hand(15, -26, o.skin) +
    `<path d="M12 -28 Q16 -36 21 -28" fill="none" stroke="${OUT}" stroke-width="1.6"/>
     <rect x="10" y="-28" width="14" height="11" rx="3" fill="#b8323f" class="o"/>` +
    head(o) +
    `<circle cx="-4" cy="-57" r="3.6" fill="none" stroke="#c9a24a" stroke-width="1.3"/>
     <circle cx="4" cy="-57" r="3.6" fill="none" stroke="#c9a24a" stroke-width="1.3"/>`;
}

function influencer(scared = false) {
  const H = '#e8b84f';
  const o = { coat: '#ff5fa2', legs: '#2f3550', skin: SKIN[1], scared, shoes: '#f4f0ea',
    hair: `<path d="M-11.5 -55 Q-13 -71 1 -70.5 Q12.5 -70 11.5 -56 Q9 -63 3 -62.5 Q-3 -66 -8 -60 Q-10 -58 -11.5 -55 Z" fill="${H}" class="o"/>` };
  // ponytail sits behind the head and body, on the side away from the phone arm
  const pony = `<path d="M-6 -68 Q-21 -68 -21 -52 Q-21 -41 -14 -35 Q-17 -45 -13 -55 Q-11 -62 -6 -63 Z" fill="${H}" class="o"/>
    <circle cx="-8" cy="-66" r="2.8" fill="#d24685" class="o"/>`;
  return pony + body(o) +
    `<path d="M-6 -44 Q0 -38 6 -44" fill="none" stroke="#d24685" stroke-width="2"/>
     <rect x="-6" y="-32" width="12" height="6" rx="2" fill="#d24685"/>` +
    arm(-11, -42, -15, -25, o.coat) + hand(-15, -24, o.skin) +
    head(o) +
    arm(11, -42, 20, -64, o.coat) + hand(20, -65, o.skin) +
    `<rect x="16" y="-79" width="9" height="15" rx="2" fill="#1d1d26" class="o"/>
     <rect x="17.5" y="-77" width="6" height="10" fill="#7fe8ff"/>
     <circle cx="20.5" cy="-82" r="2" fill="#ff3b3b" filter="url(#glow)"/>`;
}

function hunter(scared = false) {
  const o = { coat: '#7c7d78', legs: '#4b4436', skin: SKIN[2], scared,
    hair: `<path d="M-11.5 -58 Q-11 -70 0 -70 Q11 -70 11.5 -58 Z" fill="#3d5a3a" class="o"/>
           <path d="M8 -59 L19 -59" stroke="${OUT}" stroke-width="3.5" stroke-linecap="round"/>
           <path d="M8 -59 L19 -59" stroke="#3d5a3a" stroke-width="2" stroke-linecap="round"/>
           <circle cx="0" cy="-66" r="3" fill="#fff6c4" class="o"/>` };
  return `<path d="M0 -66 L-60 -40 L-55 -82 Z" fill="#fff3a6" opacity=".16"/>` +
    body(o) +
    `<path d="M-12 -42 L-12.5 -22 L-4 -22 L-4 -44 Z M12 -42 L12.5 -22 L4 -22 L4 -44 Z" fill="#5e6a3a" class="o"/>
     <rect x="-11" y="-36" width="6" height="5" fill="#4d5730"/><rect x="5" y="-36" width="6" height="5" fill="#4d5730"/>` +
    arm(-11, -42, -18, -30, o.coat) + hand(-18, -30, o.skin) +
    `<rect x="-29" y="-40" width="11" height="16" rx="2" fill="#2b2b2e" class="o"/>
     <circle cx="-26" cy="-35" r="1.6" fill="#5fd47a"/><circle cx="-23.5" cy="-35" r="1.6" fill="#ffd34a"/>
     <circle cx="-21" cy="-35" r="1.6" fill="#ff5a4e" filter="url(#glow)"/>
     <rect x="-27" y="-30" width="7" height="3" fill="#9fb"/>` +
    arm(11, -42, 14, -24, o.coat) + hand(14, -23, o.skin) +
    head(o);
}

function developer(scared = false) {
  const o = { coat: '#2c3654', legs: '#232b45', skin: SKIN[0], scared,
    hair: `<path d="M-11 -57 Q-12 -70 1 -70 Q12 -69 11 -58 Q4 -66 -11 -57 Z" fill="#2a1d14" class="o"/>` };
  return body(o) +
    `<path d="M-5 -46 L0 -36 L5 -46 Z" fill="#f3efe6"/>
     <path d="M0 -44 L-2 -36 L0 -28 L2 -36 Z" fill="#c8282e" class="o"/>` +
    arm(-11, -42, -14, -24, o.coat) + hand(-14, -23, o.skin) +
    `<rect x="-24" y="-23" width="18" height="14" rx="2" fill="#5a3a22" class="o"/>
     <rect x="-18" y="-26" width="6" height="4" fill="none" stroke="${OUT}" stroke-width="1.4"/>` +
    arm(11, -42, 10, -30, o.coat) + hand(10, -30, o.skin) +
    `<path d="M2 -30 Q11 -44 20 -30 Z" fill="#f2c14e" class="o"/><rect x="0" y="-31" width="22" height="3" rx="1.5" fill="#d9a63a" class="o"/>` +
    head(o) +
    `<path d="M-6 -50 Q0 -48 6 -50" fill="none" stroke="${OUT}" stroke-width="1.4"/>`;
}

function exorcist(scared = false) {
  const o = { coat: '#2a2534', legs: '#1d1a25', skin: SKIN[3], scared,
    hair: `<path d="M-11 -58 Q-11 -69 0 -69 Q11 -69 11 -58 Q6 -64 0 -64 Q-6 -64 -11 -58 Z" fill="#c9c2bc" class="o"/>` };
  return body(o).replace(/<path d="M-12.5[^>]*>/, '') +
    `<path d="M-14 -6 L-12 -44 Q0 -49 12 -44 L14 -6 Z" fill="#2a2534" class="o"/>
     <rect x="-5" y="-47" width="10" height="4" rx="1" fill="#fff" class="o"/>
     <path d="M0 -40 L0 -10" stroke="#3a3446" stroke-width="1.5"/>` +
    arm(-11, -42, -12, -26, o.coat) + hand(-12, -25, o.skin) +
    arm(11, -42, 17, -32, o.coat) + hand(17, -31, o.skin) +
    `<rect x="13" y="-44" width="14" height="17" rx="1.5" fill="#6b1f2a" class="o"/>
     <path d="M20 -41 L20 -30 M16.5 -37.5 L23.5 -37.5" stroke="#ecc96c" stroke-width="2"/>` +
    head(o) +
    `<path d="M-5 -49.5 L5 -49.5" stroke="${OUT}" stroke-width="1.4"/>`;
}

function kid(scared = false, balloon = true) {
  const o = { coat: 'url(#stripes)', legs: '#3b5a8f', skin: SKIN[1], scared,
    hair: `<path d="M-11 -56 Q-12 -71 0 -70 Q12 -71 11 -56 Q9 -66 3 -63 Q-4 -67 -11 -56 Z" fill="#8a4b22" class="o"/>` };
  return (balloon ? `<path d="M15 -36 Q22 -60 18 -88" fill="none" stroke="#ddd" stroke-width="1"/>
    <ellipse cx="18" cy="-98" rx="9" ry="11" fill="#e8424b" class="o"/>
    <path d="M14 -103 Q16 -106 19 -105" stroke="#fff" stroke-width="1.6" fill="none" opacity=".7"/>` : '') +
    body(o) +
    arm(-11, -42, -15, -26, '#e9e1d0') + hand(-15, -25, o.skin) +
    arm(11, -42, 15, -36, '#e9e1d0') + hand(15, -36, o.skin) +
    head(o);
}

// ---------- ghosts ----------
function ghostBase(extra, eyesSvg, opts = {}) {
  const tail = `M-14 -48 C-17 -30 -19 -16 -17 -2 Q-13 -8 -8.5 -1 Q-4 5 0 -1 Q4 -7 8.5 -1 Q13 5 17 -2 C19 -16 17 -30 14 -48 Z`;
  return `<g filter="url(#glow)" opacity="${opts.fade ?? 1}">
    <ellipse cx="0" cy="-30" rx="26" ry="38" fill="url(#cold)"/>
    <path d="${tail}" fill="url(#ghostbody)" stroke="#e8fffb" stroke-width="1.2"/>
    ${extra}
    <circle cx="0" cy="-58" r="12" fill="${GHOST}" stroke="#e8fffb" stroke-width="1.2"/>
    ${opts.hat || ''}
    ${eyesSvg}
  </g>`;
}
const hollow = (y = -58) =>
  `<ellipse cx="-4.2" cy="${y}" rx="2.4" ry="3.2" fill="#1b3340"/><ellipse cx="4.2" cy="${y}" rx="2.4" ry="3.2" fill="#1b3340"/>`;
const tired = (y = -58) =>
  `<ellipse cx="-4.2" cy="${y}" rx="2.6" ry="2" fill="#1b3340"/><ellipse cx="4.2" cy="${y}" rx="2.6" ry="2" fill="#1b3340"/>
   <path d="M-7 ${y - 1.5} L-1.5 ${y - 1.5} M1.5 ${y - 1.5} L7 ${y - 1.5}" stroke="#7cc9c0" stroke-width="1.6"/>
   <path d="M-6 ${y + 3.5} Q-4 ${y + 5} -2 ${y + 3.5} M2 ${y + 3.5} Q4 ${y + 5} 6 ${y + 3.5}" stroke="#7cc9c0" stroke-width="1" fill="none"/>`;

function mortimer(fade = 1) {
  const robe = `
    <path d="M-14 -46 L0 -30 L14 -46" fill="none" stroke="#7cc9c0" stroke-width="2.2"/>
    <path d="M-16 -26 Q0 -22 16 -26" stroke="#7cc9c0" stroke-width="3.5" fill="none"/>
    <path d="M10 -25 L13 -15 M12 -25 L17 -16" stroke="#7cc9c0" stroke-width="2"/>
    <path d="M-15 -44 L-24 -28 L-18 -26 L-12 -38" fill="${GHOST}" stroke="#e8fffb" stroke-width="1.2"/>
    <path d="M15 -44 L24 -28 L18 -26 L12 -38" fill="${GHOST}" stroke="#e8fffb" stroke-width="1.2"/>
    <path d="M18 -28 l9 0 l0 8 q-4.5 3 -9 0 Z" fill="#e8fffb" stroke="#7cc9c0" stroke-width="1"/>
    <path d="M27 -26 q4 1 0 5" fill="none" stroke="#7cc9c0" stroke-width="1.2"/>`;
  const hair = `<path d="M-10 -66 Q0 -74 11 -64 Q2 -70 -10 -66 Z" fill="#7cc9c0"/>
    <path d="M-6 -52 Q-3 -49 0 -51 Q3 -49 6 -52" stroke="#7cc9c0" stroke-width="2" fill="none"/>`;
  return ghostBase(robe, hair + tired(), { fade });
}

function bellhop() {
  const coat = `<circle cx="0" cy="-40" r="1.6" fill="#7cc9c0"/><circle cx="0" cy="-33" r="1.6" fill="#7cc9c0"/>
    <circle cx="0" cy="-26" r="1.6" fill="#7cc9c0"/>
    <path d="M14 -42 L26 -40" stroke="#e8fffb" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="30" cy="-41" rx="11" ry="2.6" fill="#e8fffb" stroke="#7cc9c0" stroke-width="1"/>
    <path d="M24 -43 Q30 -52 36 -43" fill="#e8fffb" stroke="#7cc9c0" stroke-width="1"/>`;
  const hat = `<rect x="-7" y="-75" width="14" height="7" rx="1" fill="#7cc9c0" stroke="#e8fffb" stroke-width="1"/>
    <rect x="-8" y="-69" width="16" height="2.4" fill="#e8fffb"/>`;
  return ghostBase(coat, hollow(), { hat });
}

function maid() {
  const apron = `<path d="M-9 -44 L-11 -14 Q0 -10 11 -14 L9 -44 Z" fill="#e8fffb" opacity=".8" stroke="#7cc9c0" stroke-width="1"/>
    <circle cx="-8" cy="-38" r="3.4" fill="#ecc96c"/><text x="-8" y="-36.6" font-size="4" text-anchor="middle" fill="#5a4210" font-family="Inter" font-weight="800">1</text>
    <path d="M-15 -42 L-26 -60" stroke="#c99a5a" stroke-width="2.4" stroke-linecap="round"/>
    <g fill="#e8d9ff" stroke="#b9a6e6" stroke-width=".8"><ellipse cx="-32" cy="-66" rx="3.2" ry="6" transform="rotate(-60 -32 -66)"/><ellipse cx="-22" cy="-67" rx="3.2" ry="6" transform="rotate(30 -22 -67)"/><ellipse cx="-29" cy="-71" rx="3.2" ry="6" transform="rotate(-20 -29 -71)"/><ellipse cx="-24" cy="-70" rx="3.2" ry="6" transform="rotate(15 -24 -70)"/><ellipse cx="-27" cy="-65" rx="3.2" ry="6" transform="rotate(0 -27 -65)"/></g>`;
  const hat = `<path d="M-9 -68 Q0 -76 9 -68 L7 -66 Q0 -70 -7 -66 Z" fill="#e8fffb" stroke="#7cc9c0" stroke-width="1"/>`;
  const e = `<path d="M-6.5 -58 Q-4 -61 -1.5 -58 M1.5 -58 Q4 -61 6.5 -58" stroke="#1b3340" stroke-width="1.8" fill="none"/>
    <path d="M-3 -52 Q0 -50 3 -52" stroke="#1b3340" stroke-width="1.4" fill="none"/>`;
  return ghostBase(apron, e, { hat });
}

function girl() {
  const extra = `<path d="M10 -36 l9 -6 l3 4 l-2 10 l-9 0 Z" fill="#ffd0e0" opacity=".7" stroke="#e8fffb" stroke-width="1"/>
    <circle cx="16" cy="-46" r="4" fill="#ffd0e0" opacity=".7" stroke="#e8fffb" stroke-width="1"/>`;
  const hat = `<circle cx="-13" cy="-62" r="4.5" fill="${GHOST}" stroke="#e8fffb" stroke-width="1"/>
    <circle cx="13" cy="-62" r="4.5" fill="${GHOST}" stroke="#e8fffb" stroke-width="1"/>
    <path d="M-16 -60 L-20 -50 M16 -60 L20 -50" stroke="#e8fffb" stroke-width="2.6" stroke-linecap="round"/>`;
  return ghostBase(extra, hollow(-57), { hat });
}

// ---------- UI bits ----------
function fearBar(x, y, v, w = 40) {
  const px = x - w / 2 + v * w;
  return `<g>
    <rect x="${x - w / 2 - 1.5}" y="${y - 1.5}" width="${w + 3}" height="8" rx="4" fill="${OUT}"/>
    <rect x="${x - w / 2}" y="${y}" width="${w}" height="5" rx="2.5" fill="url(#fear)"/>
    <path d="M${px} ${y - 1} l-3.5 -5 l7 0 Z" fill="#fff" stroke="${OUT}" stroke-width="1"/>
  </g>`;
}

function bubble(x, y, text, opts = {}) {
  // (x, y) is where the tail points
  const lines = text.split('\n');
  const fs = opts.fs || 9.5;
  const w = Math.max(...lines.map(l => l.length)) * fs * 0.47 + 14;
  const h = lines.length * (fs + 2.5) + 8;
  const bx = opts.left ? x - w + 16 : x - 16;
  const by = y - 8 - h;
  const tail = (st) => `<path d="M${x - 1} ${by + h - 1.5} L${x + 8} ${by + h - 1.5} L${x} ${y}" fill="#f6ecd6" ${st}/>`;
  return `<g>
    ${tail(`stroke="${OUT}" stroke-width="1.5" stroke-linejoin="round"`)}
    <rect x="${bx}" y="${by}" width="${w}" height="${h}" rx="6" fill="#f6ecd6" stroke="${OUT}" stroke-width="1.5"/>
    ${tail('')}
    ${lines.map((l, i) => `<text x="${bx + 7}" y="${by + 3 + fs + i * (fs + 2.5)}" font-size="${fs}" font-family="Caladea, serif" font-style="italic" fill="#2a1d24">${l}</text>`).join('')}
  </g>`;
}

function plaque(x, y, label) {
  const w = label.length * 6.4 + 14;
  return `<g><rect x="${x}" y="${y}" width="${w}" height="15" rx="2" fill="url(#brass)" stroke="${OUT}" stroke-width="1.2"/>
    <text x="${x + w / 2}" y="${y + 11}" text-anchor="middle" font-size="9" font-family="Caladea, serif" font-weight="700" letter-spacing="1" fill="#3a2a10">${label}</text></g>`;
}

window.CO = { defs, g, ghostBase, hollow, tired, grandma, influencer, hunter, developer, exorcist, kid, mortimer, bellhop, maid, girl,
  fearBar, bubble, plaque, OUT, GHOST };
})();
