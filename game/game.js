// Checked Out - side-view prototype: one night at The Shelley.
(() => {
const { defs, grandma, influencer, hunter, developer, kid, mortimer, bellhop, maid, girl,
  bubble, plaque, OUT } = CO;

const params = new URLSearchParams(location.search);
const SIM_SPEED = +params.get('speed') || 1;   // test hook: run faster
const BOT = params.has('bot');                // test hook: auto-play

const NS = 'http://www.w3.org/2000/svg';
const svg = document.getElementById('game');
const el = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};
const T = (x, y, s, txt, o = {}) =>
  `<text x="${x}" y="${y}" font-size="${s}" font-family="${o.f || 'Caladea, serif'}" font-weight="${o.w || 400}"
    ${o.it ? 'font-style="italic"' : ''} fill="${o.c || '#f3e6c8'}" text-anchor="${o.a || 'start'}"
    letter-spacing="${o.ls || 0}">${txt}</text>`;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------------- layout ----------------
const FLOOR_H = 116, BAND = 8;
const floorTop = f => 542 - f * (FLOOR_H + BAND);
const floorY = f => floorTop(f) + FLOOR_H - 14;          // where feet stand
const SHAFT_X = 195, SHAFT_L = 170, SHAFT_R = 220;
const GUEST_SCALE = 0.72;
const DESK_X = 262, DOOR_X = 46;

const ROOMS = [
  { id: 'r13', name: 'ROOM 13', f: 3, x0: 20, x1: 170, paper: 'paper-plum', kind: 'guest' },
  { id: 'r14', name: 'ROOM 14', f: 3, x0: 220, x1: 370, paper: 'paper-gold', kind: 'guest' },
  { id: 'r7', name: 'ROOM 7', f: 2, x0: 20, x1: 170, paper: 'paper-gold', kind: 'guest', ambient: 1.4 },
  { id: 'r8', name: 'ROOM 8', f: 2, x0: 220, x1: 370, paper: 'paper-plum', kind: 'guest' },
  { id: 'rest', name: 'RESTAURANT', f: 1, x0: 20, x1: 170, paper: 'paper-red', kind: 'rest', ambient: 1.2 },
  { id: 'lib', name: 'LIBRARY', f: 1, x0: 220, x1: 370, paper: 'paper-green', kind: 'lib', ambient: 1.2 },
  { id: 'lobby', name: 'LOBBY', f: 0, x0: 20, x1: 370, paper: 'paper-plum', kind: 'lobby' },
];
const ROOM = Object.fromEntries(ROOMS.map(r => [r.id, r]));
// where guests like to stand in each room
const SPOTS = {
  r13: [40, 100], r14: [240, 300], r7: [40, 100], r8: [240, 300],
  rest: [36, 96], lib: [236, 296],
};

// ---------------- guest types ----------------
const TYPES = {
  influencer: { name: 'Kayleigh', art: s => influencer(s), fearMul: 1.25, decay: 2.0, tip: 1.6, fee: 60, funMul: 1.1,
    bored: ['Zero views. Zero.', 'Is the ghost\non break?', 'My followers\nare asleep. Same.'],
    sweet: ['This is SO\ngoing viral.', 'Did you SEE that?', 'Chat is losing it.'],
    terror: ['Stop recording.\nSTOP RECORDING.', 'I want my\nring light.'] },
  hunter: { name: 'Dale', art: s => hunter(s), fearMul: 0.9, decay: 2.3, tip: 1.0, fee: 40, funMul: 1.2,
    bored: ['Dead zone.\nLiterally.', 'EMF reads...\nnothing.', 'I drove nine\nhours for this?'],
    sweet: ['EMF is off\nthe charts!!', 'Finally. FINALLY.', 'Mom was wrong\nabout me.'],
    terror: ['Okay this is\ntoo real.', 'I take it back.\nI take it ALL back.'] },
  grandma: { name: 'Pearl', art: s => grandma(s), fearMul: 0.55, decay: 1.0, tip: 1.4, fee: 50, funMul: 1.0,
    bored: ["I've buried\nscarier men.", 'Is that it, dear?', 'My third husband\nwas spookier.'],
    sweet: ['Oh, that was\na good one.', 'Ha! Do it again.', 'Reminds me\nof Harold.'],
    terror: ['Not in front\nof my hip.', 'Young man, that\nis ENOUGH.'] },
  kid: { name: 'Tommy', art: s => kid(s, false), fearMul: 1.0, decay: 1.5, tip: 0.5, fee: 30, funMul: 1.3,
    bored: ['Can we go see\nthe ghost?', 'I can see you,\nyou know.', 'Boring.'],
    sweet: ['The closet girl\nwants to play.', 'Again! Again!', 'Best. Hotel. Ever.'],
    terror: ['MOM.', 'I want to\ngo home.'] },
  developer: { name: 'Mr. Crane', art: s => developer(s), fearMul: 0.72, decay: 1.6, tip: 0.9, fee: 80, funMul: 0.9,
    bored: ['Charming. Shame\nabout the bulldozers.', 'Parking lot.\nRight here.', 'Knock it all down.'],
    sweet: ['...Was that in\nthe inspection?', 'Hm. Character.', 'Who approved\nTHAT?'],
    terror: ['My lawyer will\nhear about this.', 'Not worth it.\nNOT WORTH IT.'] },
};
const FLEE_LINES = ["I'M OUT!", 'KEEP THE\nDEPOSIT!', 'AAAAAAA', 'NOPE.'];
const RIDE_LINES = ['Why is the\nelevator humming?', 'Who pressed 13?', 'Smells like 1962.'];
const REVIEWS = {
  5: ['Terrifying. Ten out of ten. Would die here.', "Didn't sleep. Best night of my life.", 'Staff very attentive. Possibly dead.'],
  4: ['Good scares. Weird soup.', 'Chilly, in a fun way. Mints on the pillow.', 'Something touched my foot. Five stars minus one for that.'],
  3: ['Some spooks. Mostly vibes.', 'Fine. The elevator hums.', 'Haunted-ish.'],
  2: ['The ghost seemed tired. Honestly, same.', 'Expected more screaming.'],
  1: ['Not haunted. Just a sad man in a robe.', 'Not even a draft.'],
  fled: ["I left my shoes. I'm not going back for them.", 'Never again. Keep the deposit.', 'I saw a teacup do something unholy.'],
};

// ---------------- scares ----------------
const SCARES = [
  { id: 'door', name: 'Creaky Door', cost: 4, cd: 2.5, amt: 18,
    icon: `<rect x="-12" y="-18" width="22" height="36" fill="#5a3a26" class="o"/><path d="M10 -18 L18 -14 L18 22 L10 18 Z" fill="#3a2418" class="o"/><circle cx="5" cy="2" r="1.8" fill="#ecc96c"/><path d="M22 -10 q5 6 0 12 M26 -14 q8 10 0 20" stroke="#b6fff6" stroke-width="1.6" fill="none"/>` },
  { id: 'lights', name: 'Flicker Lights', cost: 5, cd: 3.5, amt: 26,
    icon: `<circle cx="0" cy="-6" r="11" fill="#ffe08a" class="o" filter="url(#glow)"/><rect x="-5" y="5" width="10" height="9" fill="#9a9aa4" class="o"/><path d="M-20 -16 l5 4 -4 3 5 4 M20 -16 l-5 4 4 3 -5 4" stroke="#ffe08a" stroke-width="1.8" fill="none"/>` },
  { id: 'teacup', name: 'Floating Teacup', cost: 7, cd: 4.5, amt: 36,
    icon: `<g transform="rotate(-14)"><path d="M-10 -6 h20 l-3 13 h-14 Z" fill="#f4efe6" class="o"/><path d="M10 -3 q7 2 0 7" fill="none" stroke="${OUT}" stroke-width="1.6"/><ellipse cx="0" cy="9" rx="14" ry="3" fill="#f4efe6" class="o"/></g><path d="M-16 14 q-5 4 -1 9 M16 14 q5 4 1 9" stroke="#b6fff6" stroke-width="1.6" fill="none"/>` },
  { id: 'portrait', name: 'Portrait Eyes', cost: 9, cd: 6, amt: 50,
    icon: `<rect x="-14" y="-18" width="28" height="34" fill="#2a1a12" stroke="#c9a24a" stroke-width="3"/><circle cx="0" cy="-4" r="7" fill="#6b5244"/><path d="M-9 16 Q0 4 9 16" fill="#6b5244"/><circle cx="-3" cy="-5" r="1.8" fill="#ff5a4e" filter="url(#glow)"/><circle cx="3" cy="-5" r="1.8" fill="#ff5a4e" filter="url(#glow)"/>` },
];

const SWEET_LO = 40, SWEET_HI = 72;
const NIGHT_LEN = 180;            // seconds of play from 9 PM to 6 AM
const PRESENCE_MAX = 30, PRESENCE_REGEN = 1.8;

// ---------------- state ----------------
let S;
function newState() {
  return {
    t: 0, money: 0, presence: 20, guests: [], reviews: [], served: 0, fled: 0,
    spawnT: 1.5, selected: 2, cooldowns: {}, speed: 1, over: false, started: false,
    elev: { y: floorY(0), f: 0, dir: 1, target: null, state: 'idle', doors: 0, doorT: 0, riders: [] },
    signOut: 0, signFlickT: rand(8, 20), nextId: 1,
  };
}

// ---------------- static scene ----------------
svg.innerHTML = defs;
const L = {};
for (const id of ['bg', 'staff', 'carBack', 'guests', 'carFront', 'fx', 'bubbles', 'hits', 'hud', 'cards', 'overlay'])
  L[id] = el('g', { id }, svg);

function bed(x, y, flip = false) {
  const s = flip ? -1 : 1;
  return `<g transform="translate(${x} ${y}) scale(${s} 1)">
    <rect x="0" y="-26" width="8" height="26" rx="2" fill="#5a3a22" class="o"/>
    <rect x="6" y="-16" width="56" height="12" rx="3" fill="#7a2f3f" class="o"/>
    <rect x="8" y="-21" width="16" height="7" rx="3" fill="#efe6d6" class="o"/>
    <circle cx="16" cy="-17.5" r="2" fill="#bfe9ff"/>
    <rect x="6" y="-5" width="56" height="5" fill="#4a2e1e" class="o"/></g>`;
}
const lampGlow = (x, y, r = 70) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.8}" fill="url(#lamp)"/>`;

function roomRect(x, y, w, h, paper, inner, key) {
  return `<clipPath id="c${key}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>
    <g clip-path="url(#c${key})">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${paper})"/>
      <rect x="${x}" y="${y + h - 14}" width="${w}" height="14" fill="url(#wood)"/>
      <rect x="${x}" y="${y + h - 17}" width="${w}" height="3" fill="#1d1218"/>
      ${inner}
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#0a0610" opacity=".18"/>
    </g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${OUT}" stroke-width="2"/>`;
}

function furniture(r) {
  const top = floorTop(r.f), fy = floorY(r.f);
  switch (r.id) {
    case 'r13': return lampGlow(120, top + 50) + bed(108, fy) +
      `<rect x="70" y="${top + 18}" width="28" height="34" fill="#2a1a12" stroke="#c9a24a" stroke-width="3"/>
       <circle cx="84" cy="${top + 32}" r="7" fill="#6b5244"/><path d="M75 ${top + 52} Q84 ${top + 38} 93 ${top + 52}" fill="#6b5244"/>
       <circle class="pEyes" cx="81" cy="${top + 31}" r="1.4" fill="#ff5a4e"/><circle class="pEyes" cx="87" cy="${top + 31}" r="1.4" fill="#ff5a4e"/>`;
    case 'r14': return lampGlow(300, top + 50) + bed(366, fy, true) +
      `<ellipse cx="270" cy="${top + 38}" rx="13" ry="18" fill="#9fb3c4" stroke="#c9a24a" stroke-width="3"/>
       <path d="M262 ${top + 30} l8 -6" stroke="#fff" stroke-width="2" opacity=".6"/>`;
    case 'r7': return lampGlow(80, top + 50) + bed(24, fy) +
      `<rect x="122" y="${top + 26}" width="42" height="76" fill="#4a2e1e" class="o"/>
       <rect x="126" y="${top + 30}" width="18" height="70" fill="#3a2418" class="o"/>
       <rect x="145" y="${top + 31}" width="17" height="69" fill="#08060c"/>`;
    case 'r8': return lampGlow(300, top + 50) + bed(366, fy, true) +
      `<rect x="236" y="${top + 22}" width="36" height="26" fill="#2f5b7a" stroke="#c9a24a" stroke-width="2.5"/>
       <path d="M238 ${top + 46} l12 -12 l8 8 l6 -5 l8 9" fill="none" stroke="#9cc3e8" stroke-width="1.5"/>`;
    case 'rest': return lampGlow(95, top + 40, 80) +
      `<path d="M95 ${top} v12" stroke="${OUT}" stroke-width="1.5"/>
       <path d="M80 ${top + 16} h30 l-6 8 h-18 Z" fill="url(#brass)" class="o"/>
       ${[84, 95, 106].map(x => `<circle cx="${x}" cy="${top + 15}" r="2.2" fill="#ffe0a0" filter="url(#glow)"/>`).join('')}
       <rect x="112" y="${fy - 32}" width="52" height="7" fill="#f1ead8" class="o"/>
       <path d="M112 ${fy - 25} h52 v7 q-26 5 -52 0 Z" fill="#e6dcc4" class="o"/>
       <rect x="135" y="${fy - 18}" width="6" height="18" fill="#3a2418"/>
       <path d="M124 ${fy - 32} l-3 -9 h12 l-3 9 Z" fill="#cfeaf0" opacity=".8" class="o"/>
       <path d="M122 ${fy - 41} q3 -5 5 0 q3 -5 5 0" fill="none" stroke="#ff8a7a" stroke-width="3" stroke-linecap="round"/>`;
    case 'lib': return lampGlow(280, top + 40, 80) +
      `<rect x="300" y="${top + 14}" width="64" height="${fy - top - 14}" fill="#3a2418" class="o"/>
       ${[0, 1, 2].map(rr => `<rect x="304" y="${top + 19 + rr * 28}" width="56" height="2.5" fill="#24150e"/>` +
        [...Array(8)].map((_, i) => `<rect x="${305 + i * 7}" y="${top + 22 + rr * 28 + (i % 3)}" width="5.5" height="${22 - (i % 3)}"
          fill="${['#8b2f3a', '#2f5b7a', '#c9a24a', '#3f6b45', '#6a3f7a'][(i + rr) % 5]}"/>`).join('')).join('')}`;
    default: return '';
  }
}

function buildScene() {
  let s = `<rect width="390" height="844" fill="url(#sky)"/>
    <circle cx="330" cy="135" r="24" fill="#efe6c8" opacity=".9"/><circle cx="340" cy="129" r="22" fill="#16101f"/>`;
  for (let i = 0; i < 80; i++)
    s += `<path d="M${(i * 53) % 400} ${96 + (i * 97) % 580} l-5 13" stroke="#8aa0c8" stroke-width="1" opacity=".22"/>`;
  // building shell + roof
  s += `<rect x="12" y="164" width="366" height="496" fill="#2a1b24" stroke="${OUT}" stroke-width="2.5"/>
    <path d="M6 166 L34 112 L356 112 L384 166 Z" fill="#2c2433" stroke="${OUT}" stroke-width="2.5"/>
    <rect x="300" y="84" width="16" height="30" fill="#3a2a2f" stroke="${OUT}" stroke-width="2"/>
    ${[70, 150, 300].map(x => `<rect x="${x}" y="126" width="22" height="28" rx="11" fill="#ffcf7a" opacity=".85" stroke="${OUT}" stroke-width="2"/>
      <path d="M${x + 11} 126 v28" stroke="${OUT}" stroke-width="1.5"/>`).join('')}
    <rect x="226" y="126" width="22" height="28" rx="11" fill="#1a1320" stroke="${OUT}" stroke-width="2"/>`;
  for (const r of ROOMS) {
    const top = floorTop(r.f);
    if (r.id === 'lobby') {
      s += roomRect(20, top, 150, FLOOR_H, r.paper, lampGlow(95, top + 40, 90) +
        `<rect x="24" y="${top + 24}" width="44" height="${FLOOR_H - 38}" fill="#120c16" class="o"/>
         <rect x="28" y="${top + 28}" width="36" height="${FLOOR_H - 46}" fill="#1c2840"/>
         <rect x="104" y="${top + 74}" width="18" height="28" fill="#6b3f2a" class="o"/>
         <path d="M113 ${top + 74} q-12 -14 -14 -24 M113 ${top + 74} q4 -18 -2 -28 M113 ${top + 74} q12 -12 16 -20" stroke="#6b5a3a" stroke-width="2" fill="none"/>`, 'lobL');
      s += roomRect(220, top, 150, FLOOR_H, r.paper, lampGlow(300, top + 40, 90) +
        `<rect x="300" y="${top + 16}" width="62" height="36" fill="#3a2418" class="o"/>
         ${[...Array(8)].map((_, i) => { const kx = 308 + (i % 4) * 14, ky = top + 22 + Math.floor(i / 4) * 16;
           return i === 1 ? `<text x="${kx}" y="${ky + 9}" font-size="8" font-family="Caladea" font-weight="700" fill="#b6fff6" text-anchor="middle" filter="url(#glow)">13</text>`
             : `<path d="M${kx} ${ky} v8" stroke="url(#brass)" stroke-width="2.4"/><circle cx="${kx}" cy="${ky}" r="2" fill="#c9a24a"/>`; }).join('')}
         <rect x="280" y="${floorY(0) - 38}" width="88" height="38" fill="#5a3a22" class="o"/>
         <rect x="276" y="${floorY(0) - 44}" width="94" height="8" rx="2" fill="#7a5034" class="o"/>
         <path d="M290 ${floorY(0) - 44} q6 -11 12 0 Z" fill="url(#brass)" class="o"/>`, 'lobR');
    } else {
      s += roomRect(r.x0, top, r.x1 - r.x0, FLOOR_H, r.paper, furniture(r), r.id) ;
    }
  }
  // floor bands
  for (let f = 1; f <= 3; f++) s += `<rect x="12" y="${floorTop(f) + FLOOR_H}" width="366" height="${BAND}" fill="#1a1119"/>`;
  for (const r of ROOMS) s += plaque(r.id === 'lobby' ? 26 : r.x0 + 6, floorTop(r.f) - 7, r.name);
  // elevator shaft
  const sTop = floorTop(3), sBot = floorY(0) + 14;
  s += `<rect x="${SHAFT_L}" y="${sTop}" width="${SHAFT_R - SHAFT_L}" height="${sBot - sTop}" fill="#0f0a13" stroke="${OUT}" stroke-width="2"/>
    <path d="M${SHAFT_L + 6} ${sTop} V${sBot} M${SHAFT_R - 6} ${sTop} V${sBot}" stroke="#2b2230" stroke-width="2"/>
    <path d="M${SHAFT_X} ${sTop} V${sBot}" stroke="#3a3040" stroke-width="1" stroke-dasharray="2 3"/>`;
  for (let f = 0; f <= 3; f++) {
    const fy = floorY(f);
    s += `<rect x="${SHAFT_L}" y="${fy}" width="${SHAFT_R - SHAFT_L}" height="14" fill="url(#wood)"/>
      <circle class="flamp" data-f="${f}" cx="${SHAFT_X}" cy="${floorTop(f) + 9}" r="3" fill="#3a2e3e" stroke="${OUT}"/>`;
  }
  s += `<rect x="0" y="660" width="390" height="16" fill="#1c1622"/>`;
  // sign
  s += `<rect x="96" y="92" width="198" height="28" rx="3" fill="#160e18" stroke="${OUT}" stroke-width="2"/>
    <g id="sign"></g>`;
  L.bg.innerHTML = s;
}

// THE SHELLEY: when the other letters die, it reads HELL.
const SIGN = 'THE SHELLEY';
const SIGN_KEEP = new Set([5, 6, 7, 8]);
function drawSign() {
  const g = document.getElementById('sign');
  let s = '';
  [...SIGN].forEach((ch, i) => {
    if (ch === ' ') return;
    const keep = SIGN_KEEP.has(i);
    let lit = true, col = '#ffb35c';
    if (S.signOut > 0) { if (keep) col = '#ff3b30'; else lit = false; }
    else if (S.flickIdx === i) lit = false;
    s += `<text x="${118 + i * 15.4}" y="113" font-family="Caladea, serif" font-weight="700" font-size="17" text-anchor="middle"
      fill="${lit ? col : '#3d2d33'}" ${lit ? 'filter="url(#glow)"' : ''}>${ch}</text>`;
  });
  g.innerHTML = s;
}

// staff ghosts (decor + ambient fear in their rooms)
const staff = [
  { art: bellhop(), x: 60, f: 1, s: 0.62, ph: 0 },
  { art: maid(), x: 284, f: 1, s: 0.62, ph: 1.5 },
  { art: girl(), x: 153, f: 2, s: 0.5, ph: 3 },
];
function buildStaff() {
  L.staff.innerHTML = '';
  for (const st of staff) {
    st.el = el('g', {}, L.staff);
    st.el.innerHTML = `<g transform="scale(${st.s})">${st.art}</g>`;
  }
}

// elevator car
let carBackEl, carFrontEl, doorL, doorR;
function buildCar() {
  carBackEl = el('g', {}, L.carBack);
  carBackEl.innerHTML = `<rect x="-23" y="-76" width="46" height="76" fill="#3a2a22" stroke="${OUT}" stroke-width="2"/>
    <rect x="-20" y="-72" width="40" height="70" fill="#5a4230"/>
    <ellipse cx="0" cy="-60" rx="18" ry="12" fill="url(#lamp)"/>`;
  carFrontEl = el('g', {}, L.carFront);
  carFrontEl.innerHTML = `<rect x="-24" y="-80" width="48" height="6" fill="url(#brass)" stroke="${OUT}" stroke-width="1.5"/>
    <path d="M0 -80 V-110" stroke="#2b2230" stroke-width="2"/>
    <rect x="-24" y="-2" width="48" height="4" fill="url(#brass)" stroke="${OUT}" stroke-width="1.2"/>`;
  doorL = el('rect', { x: -22, y: -74, width: 22, height: 72, fill: '#8a6a3a', opacity: 0.55, stroke: OUT }, carFrontEl);
  doorR = el('rect', { x: 0, y: -74, width: 22, height: 72, fill: '#8a6a3a', opacity: 0.55, stroke: OUT }, carFrontEl);
}

// ---------------- HUD + cards ----------------
let hudEls = {};
function buildHud() {
  L.hud.innerHTML = `<rect width="390" height="84" fill="#120b18"/><rect y="82" width="390" height="2" fill="url(#brass)"/>
    <circle cx="170" cy="25" r="9" fill="url(#brass)" stroke="${OUT}" stroke-width="1.5"/>
    ${T(170, 29, 10, '$', { f: 'Inter', w: 800, c: '#5a4210', a: 'middle' })}
    ${T(16, 68, 9.5, "MORTIMER'S PRESENCE", { f: 'Inter', w: 700, c: '#b6fff6', ls: .8 })}
    <rect x="170" y="60" width="204" height="10" rx="5" fill="#0a1a1f" stroke="#2b4a50"/>`;
  hudEls.night = el('text', { x: 16, y: 30, 'font-size': 21, 'font-family': 'Caladea, serif', 'font-weight': 700, fill: '#f3e6c8', 'letter-spacing': 1 }, L.hud);
  hudEls.night.textContent = 'NIGHT 1';
  hudEls.clock = el('text', { x: 16, y: 47, 'font-size': 11, 'font-family': 'Inter', fill: '#a99bb3' }, L.hud);
  hudEls.money = el('text', { x: 184, y: 31, 'font-size': 19, 'font-family': 'Inter', 'font-weight': 700, fill: '#f3e6c8' }, L.hud);
  hudEls.stars = el('g', {}, L.hud);
  hudEls.rating = el('text', { x: 374, y: 47, 'font-size': 11, 'font-family': 'Inter', fill: '#a99bb3', 'text-anchor': 'end' }, L.hud);
  hudEls.pres = el('rect', { x: 171, y: 61, width: 100, height: 8, rx: 4, fill: '#7cf3e6', filter: 'url(#glow)' }, L.hud);
}

function star(x, y, r, fill) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
    d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr).toFixed(1) + ' ' + (y + Math.sin(a) * rr).toFixed(1);
  }
  return `<path d="${d}Z" fill="${fill}" stroke="${OUT}" stroke-width="1.2" stroke-linejoin="round"/>`;
}
const starsRow = (x, y, n, r = 7, gap = 17) => [0, 1, 2, 3, 4].map(i => star(x + i * gap, y, r, i < Math.round(n) ? '#f2c14e' : '#3a2e3e')).join('');

let cardEls = [], speedBtn, hintEl;
function buildCards() {
  L.cards.innerHTML = `<rect y="676" width="390" height="168" fill="#120b18"/><rect y="676" width="390" height="2" fill="url(#brass)"/>
    ${T(16, 699, 11, 'SCARES', { f: 'Inter', w: 800, ls: 1.5 })}`;
  hintEl = el('text', { x: 300, y: 699, 'font-size': 10.5, 'font-family': 'Inter', fill: '#8a7c95', 'text-anchor': 'end' }, L.cards);
  hintEl.textContent = 'pick a scare, then tap a room';
  speedBtn = el('g', { class: 'hit' }, L.cards);
  speedBtn.innerHTML = `<rect x="320" y="686" width="54" height="20" rx="10" fill="#1e1424" stroke="#3a2c42"/>`;
  speedBtn.label = el('text', { x: 347, y: 700, 'font-size': 10.5, 'font-family': 'Inter', 'font-weight': 700, fill: '#f3e6c8', 'text-anchor': 'middle' }, speedBtn);
  speedBtn.addEventListener('pointerdown', e => { e.stopPropagation(); S.speed = S.speed === 1 ? 2 : 1; });
  cardEls = SCARES.map((sc, i) => {
    const x = 12 + i * 93, y = 712;
    const g = el('g', { class: 'hit' }, L.cards);
    g.innerHTML = `<rect class="bg" x="${x}" y="${y}" width="86" height="118" rx="8"/>
      <g transform="translate(${x + 43} ${y + 40})">${sc.icon}</g>
      ${T(x + 43, y + 84, 10.5, sc.name, { f: 'Inter', w: 600, a: 'middle' })}
      <rect x="${x + 8}" y="${y + 93}" width="70" height="17" rx="8.5" fill="#0a1a1f" stroke="#2b4a50"/>
      ${T(x + 43, y + 105.5, 10, sc.cost + ' presence', { f: 'Inter', w: 700, c: '#7cf3e6', a: 'middle' })}`;
    const cd = el('rect', { x, y, width: 86, height: 0, rx: 8, fill: '#000', opacity: 0.55 }, g);
    g.addEventListener('pointerdown', e => { e.stopPropagation(); S.selected = i; });
    return { g, bg: g.querySelector('.bg'), cd, x, y };
  });
}

// tap targets: each room, and the elevator
function buildHits() {
  for (const r of ROOMS) {
    const rects = r.id === 'lobby' ? [[20, 150], [220, 150]] : [[r.x0, r.x1 - r.x0]];
    for (const [x, w] of rects) {
      const h = el('rect', { x, y: floorTop(r.f), width: w, height: FLOOR_H, fill: 'transparent', class: 'hit' }, L.hits);
      h.addEventListener('pointerdown', () => tapTarget({ room: r }));
    }
  }
  const sh = el('rect', { x: SHAFT_L, y: floorTop(3), width: SHAFT_R - SHAFT_L, height: floorY(0) - floorTop(3) + 14, fill: 'transparent', class: 'hit' }, L.hits);
  sh.addEventListener('pointerdown', () => tapTarget({ elevator: true }));
}

// ---------------- guests ----------------
function spawnGuest() {
  const typeKey = pick(Object.keys(TYPES));
  const type = TYPES[typeKey];
  const counts = {};
  S.guests.forEach(g => { if (g.room) counts[g.room] = (counts[g.room] || 0) + 1; });
  const room = ['r13', 'r14', 'r7', 'r8'].sort((a, b) => (counts[a] || 0) - (counts[b] || 0) + rand(-.5, .5))[0];
  const g = {
    id: S.nextId++, typeKey, type, room, f: 0, x: DOOR_X, y: floorY(0), dir: 1, alpha: 0,
    state: 'enter', fear: 12, fun: 0, bored: 0, used: {}, scaredT: 0, thoughtT: rand(3, 6),
    bubble: null, look: null, fleeing: false, plan: [], stayT: 0, slot: 0, paid: 0,
  };
  g.el = el('g', {}, L.guests);
  g.art = el('g', {}, g.el);
  g.bar = el('g', {}, g.el);
  g.bar.innerHTML = `<rect x="-21.5" y="-1.5" width="43" height="8" rx="4" fill="${OUT}"/>
    <rect x="-20" y="0" width="40" height="5" rx="2.5" fill="url(#fear)"/>`;
  g.marker = el('path', { d: 'M0 -1 l-3.5 -5 l7 0 Z', fill: '#fff', stroke: OUT, 'stroke-width': 1 }, g.bar);
  g.bubEl = el('g', {}, L.bubbles);
  S.guests.push(g);
  // plan for the night
  const extras = ['rest', 'lib', room, 'rest', 'lib'].sort(() => Math.random() - .5).slice(0, 2);
  g.plan = ['checkin', room, ...extras, 'checkout'];
}

function say(g, text, dur = 2.8) { g.bubble = { text, t: dur }; g.bubEl.innerHTML = ''; g.bubText = null; }

function zone(g) { return g.fear < SWEET_LO ? 'bored' : g.fear < SWEET_HI ? 'sweet' : 'terror'; }

function goTo(g, f, x, then) {
  g.dest = { f, x };
  g.then = then;
  g.state = 'walk';
  g.waitX = SHAFT_X + rand(-12, 12);
}

function nextStep(g) {
  if (S.t > NIGHT_LEN * 0.86 && g.plan[0] !== 'checkout' && g.plan[0] !== 'leave') g.plan = ['checkout'];
  const step = g.plan.shift();
  if (!step) return;
  if (step === 'checkin') {
    goTo(g, 0, DESK_X + rand(-4, 4), () => { g.state = 'desk'; g.stayT = 1.4; g.onDesk = 'checkin'; });
  } else if (step === 'checkout') {
    goTo(g, 0, DESK_X + rand(-4, 4), () => { g.state = 'desk'; g.stayT = 1.4; g.onDesk = 'checkout'; });
  } else if (step === 'leave') {
    goTo(g, 0, DOOR_X, () => { g.state = 'exit'; });
  } else {
    const r = ROOM[step];
    const [a, b] = SPOTS[step];
    goTo(g, r.f, rand(a, b), () => { g.state = 'stay'; g.stayT = rand(11, 17); g.at = step; });
  }
}

function money(n, x, y, col = '#7ee08f') {
  if (!n) return;
  S.money += n;
  floatText(x, y, (n > 0 ? '+$' : '-$') + Math.abs(n), col);
}

function checkOut(g) {
  let stars = clamp(1 + Math.floor(g.fun / 10) - Math.floor(g.bored / 45), 1, 5);
  const tip = Math.round(g.fun * g.type.tip);
  (S.stats = S.stats || []).push([g.typeKey, Math.round(g.fun), Math.round(g.bored), stars]);
  money(tip, g.x, g.y - 60);
  S.served++;
  addReview(g, stars, pick(REVIEWS[stars]));
  floatText(g.x, g.y - 76, '★'.repeat(stars), '#f2c14e');
}

function addReview(g, stars, text) {
  S.reviews.push({ stars, text, who: `${g.type.name}, ${ROOM[g.room].name.replace('ROOM', 'Room')}` });
}

function flee(g) {
  g.fleeing = true;
  S.fled++;
  addReview(g, 1, pick(REVIEWS.fled));
  say(g, pick(FLEE_LINES), 3);
  g.plan = [];
  // panic spreads to anyone in the same room
  for (const o of S.guests) if (o !== g && !o.fleeing && o.state !== 'ride' && sameRoom(o, g)) addFear(o, 14);
  if (g.state === 'ride') { g.dest = { f: 0, x: DOOR_X }; g.then = () => { g.state = 'exit'; }; }
  else goTo(g, 0, DOOR_X, () => { g.state = 'exit'; });
}

function roomOf(g) {
  if (g.state === 'ride') return 'elevator';
  for (const r of ROOMS) if (r.f === g.f && g.x >= r.x0 && g.x <= r.x1 && !(r.f > 0 && g.x > SHAFT_L && g.x < SHAFT_R)) return r.id;
  return 'hall';
}
const sameRoom = (a, b) => roomOf(a) === roomOf(b);

function addFear(g, amt) {
  g.fear = clamp(g.fear + amt, 0, 110);
  g.scaredT = 1.3;
  if (g.fear >= 100 && !g.fleeing) flee(g);
}

function updateGuest(g, dt) {
  const tp = g.type;
  // fear drift + fun
  const rid = roomOf(g);
  const amb = (ROOM[rid] && ROOM[rid].ambient) || 0;
  g.fear = clamp(g.fear - tp.decay * dt + amb * dt * tp.fearMul, 0, 110);
  if (!g.fleeing && g.state !== 'enter') {
    const z = zone(g);
    if (z === 'bored') g.bored += dt;
    else g.fun += dt * tp.funMul * (z === 'terror' ? 1.4 : 1);
  }
  g.scaredT = Math.max(0, g.scaredT - dt);
  for (const k in g.used) g.used[k] = Math.max(0, g.used[k] - dt / 18);

  const speed = (g.fleeing ? 72 : 30);
  switch (g.state) {
    case 'enter':
      g.alpha = Math.min(1, g.alpha + dt * 2);
      if (g.alpha >= 1) nextStep(g);
      break;
    case 'walk': {
      const tx = g.f !== g.dest.f ? g.waitX : g.dest.x;
      const d = tx - g.x;
      if (Math.abs(d) < 1.5) {
        g.x = tx;
        if (g.f !== g.dest.f) g.state = 'wait';
        else { const fn = g.then; g.then = null; fn && fn(); }
      } else { g.dir = Math.sign(d); g.x += Math.sign(d) * Math.min(Math.abs(d), speed * dt); }
      break;
    }
    case 'wait': break;   // elevator handles boarding
    case 'ride': break;
    case 'stay':
      g.stayT -= dt * (g.fleeing ? 10 : 1);
      if (g.stayT <= 0) {
        if (g.at === 'rest' && zone(g) !== 'bored') money(Math.round(rand(12, 24)), g.x, g.y - 60);
        g.at = null;
        nextStep(g);
      }
      break;
    case 'desk':
      g.stayT -= dt;
      if (g.stayT <= 0) {
        if (g.onDesk === 'checkin') { money(tp.fee, g.x, g.y - 60); nextStep(g); }
        else { checkOut(g); g.plan = ['leave']; nextStep(g); }
      }
      break;
    case 'exit':
      g.alpha -= dt * 2;
      if (g.alpha <= 0) { g.state = 'gone'; g.el.remove(); g.bubEl.remove(); }
      break;
  }
  if (g.state === 'ride') { g.x = SHAFT_X + g.slot; g.y = S.elev.y; }
  else g.y = floorY(g.f);

  // thoughts
  if (g.bubble) { g.bubble.t -= dt; if (g.bubble.t <= 0) { g.bubble = null; g.bubEl.innerHTML = ''; } }
  g.thoughtT -= dt;
  if (g.thoughtT <= 0 && !g.bubble && g.state !== 'enter' && g.state !== 'exit') {
    g.thoughtT = rand(7, 12);
    const visible = S.guests.filter(o => o.bubble).length;
    if (visible < 3) say(g, g.state === 'ride' && Math.random() < .5 ? pick(RIDE_LINES) : pick(tp[zone(g)]));
  }
}

function renderGuest(g) {
  if (g.state === 'gone') return;
  const scaredLook = g.scaredT > 0 || g.fear >= SWEET_HI || g.fleeing;
  const look = (scaredLook ? 's' : 'c') + g.dir;
  if (look !== g.look) {
    g.look = look;
    g.art.innerHTML = `<g transform="scale(${g.dir * GUEST_SCALE} ${GUEST_SCALE})">${g.type.art(scaredLook)}</g>`;
  }
  const hop = g.scaredT > 0.9 ? -Math.sin((1.3 - g.scaredT) / 0.4 * Math.PI) * 7 : 0;
  const bob = g.state === 'walk' ? Math.abs(Math.sin(S.t * (g.fleeing ? 18 : 9))) * -1.5 : 0;
  g.el.setAttribute('transform', `translate(${g.x.toFixed(1)} ${(g.y + hop + bob).toFixed(1)})`);
  g.el.setAttribute('opacity', g.alpha.toFixed(2));
  g.bar.setAttribute('transform', `translate(0 ${-62 * GUEST_SCALE / 0.72 - 4})`);
  g.marker.setAttribute('transform', `translate(${(-20 + clamp(g.fear, 0, 100) / 100 * 40).toFixed(1)} 0)`);
  g.bar.style.display = g.state === 'enter' || g.state === 'exit' ? 'none' : '';
  if (g.bubble) {
    if (g.bubText !== g.bubble.text) {
      g.bubText = g.bubble.text;
      g.bubEl.innerHTML = bubble(0, 0, g.bubble.text, { fs: 9, left: g.x > 250 });
    }
    g.bubEl.setAttribute('transform', `translate(${g.x.toFixed(1)} ${(g.y - 72).toFixed(1)})`);
  }
}

// ---------------- elevator ----------------
const CAP = 3, SLOTS = [-11, 11, 0];
function updateElevator(dt) {
  const E = S.elev;
  const waiting = S.guests.filter(g => g.state === 'wait');
  if (E.state === 'idle') {
    // go where riders need to go; only stop for waiters if there's room
    const floors = new Set(E.riders.map(g => g.dest.f));
    if (E.riders.length < CAP) waiting.forEach(g => floors.add(g.f));
    if (floors.size) {
      // keep going the same way while there's work that way, then turn around
      const ahead = [...floors].filter(f => E.dir > 0 ? f >= E.f : f <= E.f);
      const pool = ahead.length ? ahead : [...floors];
      let best = pool[0];
      for (const f of pool) if (Math.abs(f - E.f) < Math.abs(best - E.f)) best = f;
      if (best !== E.f) E.dir = Math.sign(best - E.f);
      E.target = best;
      E.state = best === E.f ? 'open' : 'moving';
      E.doorT = 1.2;
    }
  } else if (E.state === 'moving') {
    const ty = floorY(E.target);
    const d = ty - E.y;
    if (Math.abs(d) < 1) { E.y = ty; E.f = E.target; E.state = 'open'; E.doorT = 1.2; }
    else E.y += Math.sign(d) * Math.min(Math.abs(d), 95 * dt);
  } else if (E.state === 'open') {
    E.doors = Math.min(1, E.doors + dt * 3);
    if (E.doors >= 1) {
      // unload
      for (const g of [...E.riders]) if (g.dest.f === E.f) {
        E.riders.splice(E.riders.indexOf(g), 1);
        g.f = E.f; g.state = 'walk'; g.x = SHAFT_X + g.slot;
      }
      // load
      for (const g of waiting) if (g.f === E.f && E.riders.length < CAP) {
        E.riders.push(g); g.state = 'ride';
        g.slot = SLOTS.find(s => !E.riders.some(o => o !== g && o.slot === s)) ?? 0;
      }
      E.doorT -= dt;
      if (E.doorT <= 0) E.state = 'closing';
    }
  } else if (E.state === 'closing') {
    E.doors = Math.max(0, E.doors - dt * 3);
    if (E.doors <= 0) E.state = 'idle';
  }
}
function renderElevator() {
  const E = S.elev;
  const tr = `translate(${SHAFT_X} ${E.y.toFixed(1)})`;
  carBackEl.setAttribute('transform', tr);
  carFrontEl.setAttribute('transform', tr);
  const w = 22 * (1 - E.doors);
  doorL.setAttribute('width', w.toFixed(1));
  doorR.setAttribute('x', (22 - w).toFixed(1));
  doorR.setAttribute('width', w.toFixed(1));
  document.querySelectorAll('.flamp').forEach(l => {
    const on = Math.abs(floorY(+l.dataset.f) - E.y) < 2;
    l.setAttribute('fill', on ? '#ffcf7a' : '#3a2e3e');
  });
}

// ---------------- scaring ----------------
let mort = null;
function tapTarget(t) {
  if (!S.started || S.over) return;
  const sc = SCARES[S.selected];
  if (!sc) return;
  if ((S.cooldowns[sc.id] || 0) > 0) return hint('Still recharging…');
  if (S.presence < sc.cost) return hint('Not enough presence. Rest a moment.');
  S.presence -= sc.cost;
  S.cooldowns[sc.id] = sc.cd;
  const victims = S.guests.filter(g => !['gone', 'exit', 'enter'].includes(g.state) &&
    (t.elevator ? g.state === 'ride' : g.state !== 'ride' && roomOf(g) === t.room.id));
  for (const g of victims) {
    const tired = Math.pow(0.7, g.used[sc.id] || 0);
    g.used[sc.id] = (g.used[sc.id] || 0) + 1;
    addFear(g, sc.amt * g.type.fearMul * tired * (t.elevator ? 1.3 : 1));
    if (!g.fleeing && Math.random() < .55 && !g.bubble) say(g, pick(g.type[zone(g)]));
  }
  // show Mortimer doing it
  let mx, my;
  if (t.elevator) { mx = SHAFT_X; my = S.elev.y - 4; }
  else {
    const r = t.room;
    const near = victims.length ? victims.reduce((a, g) => a + g.x, 0) / victims.length : (r.x0 + r.x1) / 2;
    mx = clamp(near + (near < (r.x0 + r.x1) / 2 ? 34 : -34), r.x0 + 20, r.x1 - 20);
    my = floorY(r.f) - 8;
  }
  mort = { x: mx, y: my, t: 1.4 };
  fx(sc, mx, my, t);
  if (sc.id === 'lights') S.signOut = 2.5;
  if (!victims.length) hint("No one's here. Mortimer haunts for himself.");
}

let hintT = 0;
function hint(msg) { hintEl.textContent = msg; hintT = 2.2; }

const effects = [];
function fx(sc, x, y, t) {
  const g = el('g', {}, L.fx);
  const e = { g, t: 1.3, sc, x, y };
  if (sc.id === 'lights' && t.room) {
    const r = t.room;
    e.dark = el('rect', { x: r.x0, y: floorTop(r.f), width: r.x1 - r.x0, height: FLOOR_H, fill: '#05030a' }, g);
  }
  e.icon = el('g', {}, g);
  e.icon.innerHTML = sc.icon;
  effects.push(e);
}
function updateFx(dt) {
  for (let i = effects.length - 1; i >= 0; i--) {
    const e = effects[i];
    e.t -= dt;
    const k = 1 - e.t / 1.3;
    if (e.dark) e.dark.setAttribute('opacity', (Math.sin(k * 40) > 0 ? 0.6 : 0.15) * (1 - k));
    e.icon.setAttribute('transform', `translate(${e.x + (e.sc.id === 'teacup' ? Math.sin(k * 12) * 6 : 0)} ${e.y - 70 - k * 24}) scale(${0.7 + Math.min(k * 3, 1) * 0.3})`);
    e.icon.setAttribute('opacity', (1 - k * k).toFixed(2));
    if (e.t <= 0) { e.g.remove(); effects.splice(i, 1); }
  }
  for (let i = floaters.length - 1; i >= 0; i--) {
    const f = floaters[i];
    f.t -= dt;
    f.el.setAttribute('transform', `translate(0 ${-(1.6 - f.t) * 22})`);
    f.el.setAttribute('opacity', Math.min(1, f.t * 1.5).toFixed(2));
    if (f.t <= 0) { f.el.remove(); floaters.splice(i, 1); }
  }
}
const floaters = [];
function floatText(x, y, txt, col) {
  const t = el('text', { x: clamp(x, 30, 360), y, 'font-size': 12, 'font-family': 'Inter', 'font-weight': 800, fill: col,
    'text-anchor': 'middle', stroke: OUT, 'stroke-width': 3, 'paint-order': 'stroke' }, L.fx);
  t.textContent = txt;
  floaters.push({ el: t, t: 1.6 });
}

let mortEl;
function renderMort(dt) {
  if (!mortEl) { mortEl = el('g', {}, L.fx); mortEl.innerHTML = `<g transform="scale(.72)">${mortimer()}</g>`; }
  if (!mort) { mortEl.setAttribute('opacity', 0); return; }
  mort.t -= dt;
  const a = mort.t > 1.1 ? (1.4 - mort.t) / 0.3 : Math.min(1, mort.t / 0.4);
  mortEl.setAttribute('opacity', Math.max(0, a).toFixed(2));
  mortEl.setAttribute('transform', `translate(${mort.x} ${mort.y + Math.sin(S.t * 4) * 2})`);
  if (mort.t <= 0) mort = null;
}

// ---------------- HUD render ----------------
function clockText() {
  const mins = 21 * 60 + Math.min(S.t, NIGHT_LEN) / NIGHT_LEN * 9 * 60;
  let h = Math.floor(mins / 60) % 24, m = Math.floor(mins % 60);
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ap}`;
}
let lastStars = -1;
function renderHud(dt) {
  const inside = S.guests.filter(g => g.state !== 'gone').length;
  hudEls.clock.textContent = `${clockText()} · ${inside} guest${inside === 1 ? '' : 's'}`;
  hudEls.money.textContent = S.money.toLocaleString();
  const avg = S.reviews.length ? S.reviews.reduce((a, r) => a + r.stars, 0) / S.reviews.length : 0;
  if (avg !== lastStars) {
    lastStars = avg;
    hudEls.stars.innerHTML = starsRow(296, 24, avg, 7.5, 18);
    const last = S.reviews[S.reviews.length - 1];
    hudEls.rating.textContent = S.reviews.length ? `${avg.toFixed(1)} · "${last.text.length > 26 ? last.text.slice(0, 25) + '…' : last.text}"` : 'no reviews yet';
  }
  hudEls.pres.setAttribute('width', (202 * S.presence / PRESENCE_MAX).toFixed(1));
  cardEls.forEach((c, i) => {
    const sc = SCARES[i], sel = i === S.selected;
    const cd = (S.cooldowns[sc.id] || 0) / sc.cd;
    const poor = S.presence < sc.cost;
    c.bg.setAttribute('fill', sel ? '#1d2a2e' : '#1e1424');
    c.bg.setAttribute('stroke', sel ? '#7cf3e6' : '#3a2c42');
    c.bg.setAttribute('stroke-width', sel ? 2 : 1.5);
    const h = cd > 0 ? 118 * cd : poor ? 118 : 0;
    c.cd.setAttribute('height', h.toFixed(1));
    c.cd.setAttribute('y', (c.y + 118 - h).toFixed(1));
    c.cd.setAttribute('opacity', cd > 0 ? 0.6 : 0.4);
  });
  speedBtn.label.textContent = S.speed === 1 ? '▶ 1x' : '▶▶ 2x';
  if (hintT > 0) { hintT -= dt; if (hintT <= 0) hintEl.textContent = 'pick a scare, then tap a room'; }
}

// ---------------- overlays ----------------
function showStart() {
  L.overlay.innerHTML = `<rect width="390" height="844" fill="#0b0712" opacity=".88"/>
    ${T(195, 250, 40, 'CHECKED OUT', { w: 700, a: 'middle', ls: 3 })}
    ${T(195, 280, 15, 'Checkout was at 11. In 1962.', { it: 1, c: '#a99bb3', a: 'middle' })}
    <g transform="translate(195 400) scale(1.5)">${mortimer()}</g>
    ${T(195, 460, 14, 'You are Mortimer. The Shelley is broke.', { a: 'middle' })}
    ${T(195, 482, 14, 'Pick a scare, then tap a room or the elevator.', { a: 'middle' })}
    ${T(195, 512, 14, 'Keep guests in the', { a: 'middle' })}
    <rect x="125" y="526" width="140" height="10" rx="5" fill="url(#fear)" stroke="${OUT}"/>
    ${T(140, 552, 11, 'bored', { f: 'Inter', c: '#8a95ab', a: 'middle' })}${T(195, 552, 11, 'paying', { f: 'Inter', w: 700, c: '#5fd47a', a: 'middle' })}${T(250, 552, 11, 'running', { f: 'Inter', c: '#ff5a4e', a: 'middle' })}
    ${T(195, 580, 14, 'Scared enough to pay. Not so scared they run.', { a: 'middle' })}
    <rect x="100" y="620" width="190" height="46" rx="23" fill="#7cf3e6" filter="url(#glow)"/>
    ${T(195, 649, 16, 'OPEN THE DOORS', { f: 'Inter', w: 800, c: '#0d1a1d', a: 'middle', ls: 1 })}`;
  const hit = el('rect', { width: 390, height: 844, fill: 'transparent', class: 'hit' }, L.overlay);
  hit.addEventListener('pointerdown', () => { L.overlay.innerHTML = ''; S.started = true; });
}

function showEnd() {
  S.over = true;
  const avg = S.reviews.length ? S.reviews.reduce((a, r) => a + r.stars, 0) / S.reviews.length : 0;
  const sorted = [...S.reviews].sort((a, b) => b.stars - a.stars);
  const shown = sorted.length ? [sorted[0], sorted[sorted.length - 1]] : [];
  if (sorted.length > 2) shown.splice(1, 0, sorted[Math.floor(sorted.length / 2)]);
  const verdict = avg >= 4 ? 'The Shelley lives another night.' : avg >= 2.5 ? 'The bank calls. You let it ring.' : 'Mr. Crane measures the lobby for parking.';
  let s = `<rect width="390" height="844" fill="#0b0712" opacity=".97"/>
    ${T(195, 130, 30, '6:00 AM', { w: 700, a: 'middle', ls: 2 })}
    ${T(195, 156, 14, verdict, { it: 1, c: '#a99bb3', a: 'middle' })}
    ${T(60, 210, 13, 'EARNED', { f: 'Inter', w: 700, c: '#8a7c95', ls: 1 })}${T(330, 210, 18, '$' + S.money, { f: 'Inter', w: 800, a: 'end' })}
    ${T(60, 240, 13, 'CHECKED OUT', { f: 'Inter', w: 700, c: '#8a7c95', ls: 1 })}${T(330, 240, 18, S.served, { f: 'Inter', w: 800, a: 'end' })}
    ${T(60, 270, 13, 'RAN SCREAMING', { f: 'Inter', w: 700, c: '#8a7c95', ls: 1 })}${T(330, 270, 18, S.fled, { f: 'Inter', w: 800, c: S.fled ? '#ff5a4e' : '#f3e6c8', a: 'end' })}
    ${T(60, 300, 13, 'RATING', { f: 'Inter', w: 700, c: '#8a7c95', ls: 1 })}${starsRow(248, 295, avg, 7.5, 18)}`;
  shown.forEach((r, i) => {
    const y = 336 + i * 112;
    const words = r.text.split(' '); const lines = ['']; for (const w of words) { if ((lines[lines.length - 1] + ' ' + w).length > 34) lines.push(w); else lines[lines.length - 1] += (lines[lines.length - 1] ? ' ' : '') + w; }
    s += `<g transform="rotate(${i % 2 ? 1.2 : -1.2} 195 ${y + 50})">
      <rect x="40" y="${y}" width="310" height="98" rx="4" fill="#f3e8cf" stroke="${OUT}" stroke-width="2"/>
      ${starsRow(60, y + 20, r.stars, 7, 17)}
      ${lines.map((l, j) => T(54, y + 46 + j * 17, 14, l, { it: 1, c: '#2a1d24' })).join('')}
      ${T(336, y + 88, 10.5, '— ' + r.who, { f: 'Inter', w: 600, c: '#7a6a62', a: 'end' })}</g>`;
  });
  s += `<rect x="115" y="700" width="160" height="46" rx="23" fill="#7cf3e6" filter="url(#glow)"/>
    ${T(195, 729, 16, 'NEXT NIGHT', { f: 'Inter', w: 800, c: '#0d1a1d', a: 'middle', ls: 1 })}`;
  L.overlay.innerHTML = s;
  const hit = el('rect', { x: 115, y: 700, width: 160, height: 46, fill: 'transparent', class: 'hit' }, L.overlay);
  hit.addEventListener('pointerdown', () => start(true));
  window.__result = { money: S.money, served: S.served, fled: S.fled, avg: +avg.toFixed(2), reviews: S.reviews.length, stats: S.stats };
  console.log('night over', JSON.stringify(window.__result));
}

// ---------------- bot (test hook) ----------------
let botT = 0;
function bot(dt) {
  botT -= dt;
  if (botT > 0) return;
  botT = 0.6;
  if (params.get('bot') === 'wild') {   // a reckless player: biggest scare, random busy room
    const busy = S.guests.filter(g => g.state === 'stay' || g.state === 'desk');
    if (!busy.length) return;
    const r = ROOM[roomOf(pick(busy))];
    if (!r) return;
    for (let i = SCARES.length - 1; i >= 0; i--)
      if (S.presence >= SCARES[i].cost && !(S.cooldowns[SCARES[i].id] > 0)) { S.selected = i; tapTarget({ room: r }); return; }
    return;
  }
  let best = null;
  for (const r of ROOMS) {
    const gs = S.guests.filter(g => g.state !== 'ride' && !['gone', 'exit', 'enter'].includes(g.state) && roomOf(g) === r.id && !g.fleeing);
    if (!gs.length) continue;
    const need = gs.filter(g => g.fear < SWEET_LO + 4).length;
    const maxF = Math.max(...gs.map(g => g.fear));
    if (need && (!best || need > best.need)) best = { r, need, maxF, gs };
  }
  if (!best) return;
  for (let i = SCARES.length - 1; i >= 0; i--) {
    const sc = SCARES[i];
    if (S.presence < sc.cost || (S.cooldowns[sc.id] || 0) > 0) continue;
    if (best.gs.some(g => g.fear + sc.amt * g.type.fearMul > 92)) continue;
    S.selected = i;
    tapTarget({ room: best.r });
    return;
  }
}

// ---------------- loop ----------------
function step(dt) {
  if (!S.started || S.over) return;
  S.t += dt;
  S.presence = Math.min(PRESENCE_MAX, S.presence + PRESENCE_REGEN * dt);
  for (const k in S.cooldowns) S.cooldowns[k] = Math.max(0, S.cooldowns[k] - dt);
  // arrivals
  S.spawnT -= dt;
  const inside = S.guests.filter(g => g.state !== 'gone').length;
  if (S.spawnT <= 0 && S.t < NIGHT_LEN * 0.7) {
    if (inside < 9) spawnGuest();
    S.spawnT = rand(6, 10);
  }
  for (const g of S.guests) if (g.state !== 'gone') updateGuest(g, dt);
  S.guests = S.guests.filter(g => g.state !== 'gone');
  updateElevator(dt);
  // sign
  S.signOut = Math.max(0, S.signOut - dt);
  S.signFlickT -= dt;
  if (S.signFlickT <= 0) {
    if (Math.random() < .35) S.signOut = 1.6; else S.flickIdx = pick([0, 1, 2, 4, 9, 10]);
    S.signFlickT = rand(5, 14);
    setTimeout(() => { S.flickIdx = null; }, 350);
  }
  if (BOT) bot(dt);
  if ((S.t >= NIGHT_LEN && !S.guests.length) || S.t >= NIGHT_LEN + 45) showEnd();
}

function render(dt) {
  for (const st of staff) {
    const fy = floorY(st.f) - 10 + Math.sin(S.t * 2 + st.ph) * 3;
    st.el.setAttribute('transform', `translate(${st.x} ${fy.toFixed(1)})`);
  }
  S.guests.forEach(renderGuest);
  renderElevator();
  updateFx(dt);
  renderMort(dt);
  renderHud(dt);
  drawSign();
}

let last = performance.now();
function frame(now) {
  const real = Math.min(0.05, (now - last) / 1000);
  last = now;
  const dt = real * S.speed * SIM_SPEED;
  // big sim speeds: sub-step so nothing tunnels
  const n = Math.ceil(dt / 0.05);
  for (let i = 0; i < n; i++) step(dt / n);
  render(dt);
  requestAnimationFrame(frame);
}

function start(skipIntro) {
  S = newState();
  L.guests.innerHTML = ''; L.bubbles.innerHTML = ''; L.fx.innerHTML = ''; L.overlay.innerHTML = '';
  mortEl = null; mort = null; effects.length = 0; floaters.length = 0; lastStars = -1;
  if (skipIntro || BOT || params.has('skip')) S.started = true; else showStart();
}

buildScene();
buildStaff();
buildCar();
buildHud();
buildCards();
buildHits();
start(false);
requestAnimationFrame(frame);
window.__S = () => S;
})();
