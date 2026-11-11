// Checked Out - ten nights at The Shelley.
(() => {
const { defs, grandma, influencer, hunter, developer, exorcist, kid, mortimer, bellhop, maid, girl,
  bubble, plaque, OUT, ghostBase, hollow, tired } = CO;

const params = new URLSearchParams(location.search);
const SIM_SPEED = +params.get('speed') || 1;   // test hook: run faster
const BOT = params.get('bot');                // test hook: auto-play ('1' careful, 'wild' reckless)

const NS = 'http://www.w3.org/2000/svg';
const svg = document.getElementById('game');
const ui = document.getElementById('ui');
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
const buzz = ms => { try { window.AndroidBridge && AndroidBridge.vibrate(ms); } catch (e) { /* no vibration */ } };

// ---------------- layout ----------------
const FLOOR_H = 116, BAND = 8;
const floorTop = f => 542 - f * (FLOOR_H + BAND);
const floorY = f => floorTop(f) + FLOOR_H - 14;
const SHAFT_X = 195, SHAFT_L = 170, SHAFT_R = 220;
const GUEST_SCALE = 0.72;
const DESK_X = 262, DOOR_X = 46;
const LAST_NIGHT = 10;

const ROOMS = [
  { id: 'r13', name: 'ROOM 13', f: 3, x0: 20, x1: 170, paper: 'paper-plum' },
  { id: 'r14', name: 'ROOM 14', f: 3, x0: 220, x1: 370, paper: 'paper-gold' },
  { id: 'r7', name: 'ROOM 7', f: 2, x0: 20, x1: 170, paper: 'paper-gold' },
  { id: 'r8', name: 'ROOM 8', f: 2, x0: 220, x1: 370, paper: 'paper-plum' },
  { id: 'rest', name: 'RESTAURANT', f: 1, x0: 20, x1: 170, paper: 'paper-red' },
  { id: 'lib', name: 'LIBRARY', f: 1, x0: 220, x1: 370, paper: 'paper-green' },
  { id: 'lobby', name: 'LOBBY', f: 0, x0: 20, x1: 370, paper: 'paper-plum' },
];
const ROOM = Object.fromEntries(ROOMS.map(r => [r.id, r]));
const ROOM_NAME = id => id === 'lobby' ? 'Lobby' : id === 'rest' ? 'Restaurant' : id === 'lib' ? 'Library' : ROOM[id].name.replace('ROOM', 'Room');
const SPOTS = { r13: [40, 100], r14: [240, 300], r7: [40, 100], r8: [240, 300], rest: [36, 96], lib: [236, 296] };
const STAFF_SPOTS = { r13: [150, 128], r14: [238, 262], r7: [153, 128], r8: [240, 264], rest: [58, 150], lib: [284, 258], lobby: [336, 140] };
const GUEST_ROOMS = ['r13', 'r14', 'r7', 'r8'];

// ---------------- guest types ----------------
const TYPES = {
  influencer: { name: 'Kayleigh', job: 'influencer', art: s => influencer(s), fearMul: 1.25, decay: 2.0, tip: 1.6, fee: 60, funMul: 1.1,
    bored: ['Zero views. Zero.', 'Is the ghost\non break?', 'My followers\nare asleep. Same.'],
    sweet: ['This is SO\ngoing viral.', 'Did you SEE that?', 'Chat is losing it.'],
    terror: ['Stop recording.\nSTOP RECORDING.', 'I want my\nring light.'] },
  hunter: { name: 'Dale', job: 'ghost hunter', art: s => hunter(s), fearMul: 0.9, decay: 2.3, tip: 1.0, fee: 40, funMul: 1.2,
    bored: ['Dead zone.\nLiterally.', 'EMF reads...\nnothing.', 'I drove nine\nhours for this?'],
    sweet: ['EMF is off\nthe charts!!', 'Finally. FINALLY.', 'Mom was wrong\nabout me.'],
    terror: ['Okay this is\ntoo real.', 'I take it back.\nI take it ALL back.'] },
  grandma: { name: 'Pearl', job: 'widow, three times', art: s => grandma(s), fearMul: 0.55, decay: 1.0, tip: 1.4, fee: 50, funMul: 1.0,
    bored: ["I've buried\nscarier men.", 'Is that it, dear?', 'My third husband\nwas spookier.'],
    sweet: ['Oh, that was\na good one.', 'Ha! Do it again.', 'Reminds me\nof Harold.'],
    terror: ['Not in front\nof my hip.', 'Young man, that\nis ENOUGH.'] },
  kid: { name: 'Tommy', job: 'kid who can see you', art: s => kid(s, false), fearMul: 1.0, decay: 1.5, tip: 0.5, fee: 30, funMul: 1.3,
    bored: ['Can we go see\nthe ghost?', 'I can see you,\nyou know.', 'Boring.'],
    sweet: ['The closet girl\nwants to play.', 'Again! Again!', 'Best. Hotel. Ever.'],
    terror: ['MOM.', 'I want to\ngo home.'] },
  developer: { name: 'Mr. Crane', job: 'developer', art: s => developer(s), fearMul: 0.72, decay: 1.6, tip: 0.9, fee: 80, funMul: 0.9,
    bored: ['Charming. Shame\nabout the bulldozers.', 'Parking lot.\nRight here.', 'Knock it all down.'],
    sweet: ['...Was that in\nthe inspection?', 'Hm. Character.', 'Who approved\nTHAT?'],
    terror: ['My lawyer will\nhear about this.', 'Not worth it.\nNOT WORTH IT.'] },
  exorcist: { name: 'Father Doyle', job: 'exorcist', art: s => exorcist(s), fearMul: 0.5, decay: 2.6, tip: 0, fee: 50, funMul: 0,
    bored: ['I sense... a\nbellhop.', 'Show yourselves.', 'The power of\nmint compels you.'],
    sweet: ['A strong one.\nGood.', 'Begone!'],
    terror: ['Lord, not the\nteacup.', 'This was not in\nthe seminary.'] },
};
const FLEE_LINES = ["I'M OUT!", 'KEEP THE\nDEPOSIT!', 'AAAAAAA', 'NOPE.'];
const RIDE_LINES = ['Why is the\nelevator humming?', 'Who pressed 13?', 'Smells like 1962.'];
const REVIEWS = {
  5: ['Terrifying. Ten out of ten. Would die here.', "Didn't sleep. Best night of my life.", 'Staff very attentive. Possibly dead.', 'Room was clean. My husband is gone. Would stay again.'],
  4: ['Good scares. Weird soup.', 'Chilly, in a fun way. Mints on the pillow.', 'Something touched my foot. Minus one star for that.'],
  3: ['Some spooks. Mostly vibes.', 'Fine. The elevator hums.', 'Haunted-ish.'],
  2: ['The ghost seemed tired. Honestly, same.', 'Expected more screaming.'],
  1: ['Not haunted. Just a sad man in a robe.', 'Not even a draft.'],
  fled: ["I left my shoes. I'm not going back for them.", 'Never again. Keep the deposit.', 'I saw a teacup do something unholy.'],
};
const DEATHS = {
  flee: ['tripped on a pillow mint', 'fell down the laundry chute', 'ran into the elevator shaft. The elevator was not there', 'had a heart attack. Happy, though'],
  chandelier: ['was bonked by the chandelier', 'met the chandelier. Briefly'],
  shrimp: ['ate the 1962 shrimp cocktail', 'asked for seconds of the 1962 shrimp'],
};

// ---------------- scares ----------------
const ICONS = {
  door: `<rect x="-12" y="-18" width="22" height="36" fill="#5a3a26" class="o"/><path d="M10 -18 L18 -14 L18 22 L10 18 Z" fill="#3a2418" class="o"/><circle cx="5" cy="2" r="1.8" fill="#ecc96c"/><path d="M22 -10 q5 6 0 12 M26 -14 q8 10 0 20" stroke="#b6fff6" stroke-width="1.6" fill="none"/>`,
  lights: `<circle cx="0" cy="-6" r="11" fill="#ffe08a" class="o" filter="url(#glow)"/><rect x="-5" y="5" width="10" height="9" fill="#9a9aa4" class="o"/><path d="M-20 -16 l5 4 -4 3 5 4 M20 -16 l-5 4 4 3 -5 4" stroke="#ffe08a" stroke-width="1.8" fill="none"/>`,
  teacup: `<g transform="rotate(-14)"><path d="M-10 -6 h20 l-3 13 h-14 Z" fill="#f4efe6" class="o"/><path d="M10 -3 q7 2 0 7" fill="none" stroke="${OUT}" stroke-width="1.6"/><ellipse cx="0" cy="9" rx="14" ry="3" fill="#f4efe6" class="o"/></g><path d="M-16 14 q-5 4 -1 9 M16 14 q5 4 1 9" stroke="#b6fff6" stroke-width="1.6" fill="none"/>`,
  portrait: `<rect x="-14" y="-18" width="28" height="34" fill="#2a1a12" stroke="#c9a24a" stroke-width="3"/><circle cx="0" cy="-4" r="7" fill="#6b5244"/><path d="M-9 16 Q0 4 9 16" fill="#6b5244"/><circle cx="-3" cy="-5" r="1.8" fill="#ff5a4e" filter="url(#glow)"/><circle cx="3" cy="-5" r="1.8" fill="#ff5a4e" filter="url(#glow)"/>`,
  cold: `<path d="M0 -18 V18 M-15.6 -9 L15.6 9 M-15.6 9 L15.6 -9" stroke="#b6fff6" stroke-width="3" stroke-linecap="round" filter="url(#glow)"/><path d="M-4 -14 L0 -10 L4 -14 M-4 14 L0 10 L4 14" stroke="#b6fff6" stroke-width="2" fill="none"/>`,
  stall: `<rect x="-13" y="-18" width="26" height="36" fill="#3a2a22" class="o"/><rect x="-10" y="-15" width="9.5" height="30" fill="#8a6a3a" class="o"/><rect x="0.5" y="-15" width="9.5" height="30" fill="#8a6a3a" class="o"/><path d="M-6 -30 l12 12 M6 -30 l-12 12" stroke="#ff5a4e" stroke-width="2.4"/>`,
  pipes: `<path d="M-20 -8 H-4 V14 H20" fill="none" stroke="${OUT}" stroke-width="8" stroke-linejoin="round"/><path d="M-20 -8 H-4 V14 H20" fill="none" stroke="#9a9aa4" stroke-width="5" stroke-linejoin="round"/><path d="M-12 -16 q4 -5 8 0 M4 -2 q4 -5 8 0 M12 -14 q4 -5 8 0" stroke="#b6fff6" stroke-width="1.8" fill="none"/>`,
  chandelier: `<path d="M0 -22 v8" stroke="${OUT}" stroke-width="1.5"/><path d="M-17 -12 h34 l-7 10 h-20 Z" fill="url(#brass)" class="o"/><circle cx="-12" cy="-13" r="2.5" fill="#ffe0a0" filter="url(#glow)"/><circle cx="0" cy="-13" r="2.5" fill="#ffe0a0" filter="url(#glow)"/><circle cx="12" cy="-13" r="2.5" fill="#ffe0a0" filter="url(#glow)"/><path d="M-10 6 l-4 8 M0 6 v10 M10 6 l4 8" stroke="#ff5a4e" stroke-width="2"/>`,
};
const SCARES = {
  door: { name: 'Creaky Door', cost: 4, cd: 2.5, amt: 18, desc: 'Small and cheap.' },
  lights: { name: 'Flicker Lights', cost: 5, cd: 3.5, amt: 26, desc: 'The sign goes out too.' },
  teacup: { name: 'Floating Teacup', cost: 7, cd: 4.5, amt: 36, desc: 'A classic.' },
  portrait: { name: 'Portrait Eyes', cost: 9, cd: 6, amt: 50, desc: 'Big. Easy to overdo.' },
  cold: { name: 'Cold Spot', cost: 3, cd: 1.2, amt: 12, price: 150, desc: 'A tiny nudge. Spam it.' },
  stall: { name: 'Elevator Stall', cost: 6, cd: 6, amt: 48, price: 250, elevator: true, desc: 'Elevator only. Stops it between floors.' },
  pipes: { name: 'Wailing Pipes', cost: 8, cd: 5, amt: 28, price: 350, floor: true, desc: 'Hits both rooms on a floor.' },
  chandelier: { name: 'Chandelier Drop', cost: 12, cd: 8, amt: 70, price: 450, desc: 'Huge. Sometimes lethal.' },
};
for (const k in SCARES) SCARES[k].id = k;

const UPGRADES = {
  beds: { name: 'New Mattresses', price: 250, desc: 'Room fee +$15. The old ones had history.' },
  gift: { name: 'Gift Shop', price: 300, desc: 'Happy guests (4+ stars) buy an "I Survived" shirt: +$25.' },
  shrimp: { name: 'The 1962 Menu', price: 200, desc: 'Restaurant earns 60% more. The shrimp is original. Some diners will not survive.' },
  ads: { name: 'Restless Reviews Ad', price: 200, desc: 'More guests every night.' },
  candles: { name: 'Seance Candles', price: 350, desc: 'Max presence +10.' },
  coffee: { name: 'Coffee for Mortimer', price: 200, desc: 'Presence refills faster. He has not slept since 1962.' },
};

// grief stages for staff who died here
const STAGES = [
  { name: 'Denial', amb: 0, desc: 'Still thinks they are a guest. Does nothing.',
    lines: ['Where is my\nroom service?', 'I want to\ncheck out.', 'Why is it\nso cold?'] },
  { name: 'Anger', amb: 1.2, burst: true, desc: 'Throws things. Big random scares. Can overdo it.',
    lines: ['WHO DID THIS.', 'I had PLANS.', 'GET OUT OF\nMY ROOM.'] },
  { name: 'Bargaining', amb: 0.8, upsell: true, desc: 'Upsells guests in the room. Extra money.',
    lines: ['Robe? Ten bucks.', 'I can get you\nan upgrade.', 'Mints. Fresh.\nMostly.'] },
  { name: 'Depression', amb: 2.0, desc: 'Moans. Steady, gentle fear.',
    lines: ['...', 'Ohhhhhh.', 'Is it Tuesday?'] },
  { name: 'Acceptance', amb: 2.4, desc: 'Fully trained. Might move on any morning.',
    lines: ['Welcome to\nThe Shelley.', 'Mind the step.', 'Lovely evening.'] },
];
const ORIGINAL_STAFF = [
  { id: 's1', name: 'Eugene', kind: 'bellhop', room: 'rest', since: 1974, desc: 'Bellhop. Still waiting on a tip from 1974.' },
  { id: 's2', name: 'Doris', kind: 'maid', room: 'lib', since: 1987, desc: 'Employee of the Month since 1987.' },
  { id: 's3', name: 'Lottie', kind: 'girl', room: 'r7', since: 1958, desc: 'Wants to play hide and seek.' },
];
const ORIG_AMB = 1.3;

const MEMOS = [
  'Reminder: rattling chains after 10 PM violates the noise policy.',
  'Employee of the Month: Doris (deceased 1987). Doris has been Employee of the Month since 1987.',
  'Your request to Move On has been received. Current wait time: 340 years.',
  'Please stop walking through the walls of the staff kitchen. It upsets the soup.',
  'The elevator is not "possessed." It is "pre-owned."',
  'Mandatory training this week: Haunting Without Lawsuits.',
  'Lost and found: one (1) leg. Please claim by Friday.',
  'Reminder: the guests can hear you sigh. All of you. Constantly.',
];

const SWEET_LO = 40, SWEET_HI = 72;
const NIGHT_LEN = 180;

// ---------------- campaign (saved) ----------------
const SAVE_KEY = 'checkedout-save-v1';
let C;
function newCampaign() {
  return { night: 1, money: 200, owned: ['door', 'lights', 'teacup', 'portrait'], loadout: ['door', 'lights', 'teacup', 'portrait'],
    upgrades: {}, staff: ORIGINAL_STAFF.map(s => ({ ...s, orig: true })), ratings: [], debtNights: 0, deaths: 0,
    accepted: 0, memo: null, nextStaffId: 10 };
}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(C)); } catch (e) { /* storage unavailable */ } }
function load() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); return s && s.night ? s : null; } catch (e) { return null; } }
function wipe() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* storage unavailable */ } }
const bill = n => 500 + 170 * (n - 1);

// ---------------- night state ----------------
let S;
function newNight() {
  const u = C.upgrades;
  return {
    t: 0, earned: 0, presence: 20, guests: [], reviews: [], served: 0, fled: 0, died: [], banished: [],
    spawnT: 1.5, selected: 0, cooldowns: {}, speed: 1, over: false, started: false, paused: false,
    elev: { y: floorY(0), f: 0, dir: 1, target: null, state: 'idle', doors: 0, doorT: 0, riders: [], stallT: 0 },
    signOut: 0, signFlickT: rand(8, 20), nextId: 1,
    presMax: 30 + (u.candles ? 10 : 0), regen: 1.8 + (u.coffee ? 0.5 : 0),
    exorcistAt: C.night >= 4 && (C.night % 3 === 0 || Math.random() < 0.4) ? rand(30, 80) : null,
  };
}

// ---------------- static scene ----------------
svg.innerHTML = defs;
const L = {};
for (const id of ['bg', 'staff', 'carBack', 'guests', 'carFront', 'fx', 'bubbles', 'hits', 'hud', 'cards'])
  L[id] = el('g', { id }, svg);

function bed(x, y, flip = false) {
  return `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)">
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
       <circle cx="81" cy="${top + 31}" r="1.4" fill="#ff5a4e"/><circle cx="87" cy="${top + 31}" r="1.4" fill="#ff5a4e"/>`;
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
         <path d="M290 ${floorY(0) - 44} q6 -11 12 0 Z" fill="url(#brass)" class="o"/>
         <g id="giftshop" style="display:none"><rect x="226" y="${top + 58}" width="40" height="30" fill="#4a2e1e" class="o"/>
           <rect x="230" y="${top + 62}" width="14" height="12" fill="#ff5fa2" class="o"/><rect x="248" y="${top + 62}" width="14" height="12" fill="#e8b84f" class="o"/>
           ${T(246, top + 56, 7, 'GIFTS', { f: 'Inter', w: 800, c: '#ecc96c', a: 'middle', ls: .5 })}</g>`, 'lobR');
    } else {
      s += roomRect(r.x0, top, r.x1 - r.x0, FLOOR_H, r.paper, furniture(r), r.id);
    }
  }
  for (let f = 1; f <= 3; f++) s += `<rect x="12" y="${floorTop(f) + FLOOR_H}" width="366" height="${BAND}" fill="#1a1119"/>`;
  for (const r of ROOMS) s += plaque(r.id === 'lobby' ? 26 : r.x0 + 6, floorTop(r.f) - 7, r.name);
  const sTop = floorTop(3), sBot = floorY(0) + 14;
  s += `<rect x="${SHAFT_L}" y="${sTop}" width="${SHAFT_R - SHAFT_L}" height="${sBot - sTop}" fill="#0f0a13" stroke="${OUT}" stroke-width="2"/>
    <path d="M${SHAFT_L + 6} ${sTop} V${sBot} M${SHAFT_R - 6} ${sTop} V${sBot}" stroke="#2b2230" stroke-width="2"/>
    <path d="M${SHAFT_X} ${sTop} V${sBot}" stroke="#3a3040" stroke-width="1" stroke-dasharray="2 3"/>`;
  for (let f = 0; f <= 3; f++)
    s += `<rect x="${SHAFT_L}" y="${floorY(f)}" width="${SHAFT_R - SHAFT_L}" height="14" fill="url(#wood)"/>
      <circle class="flamp" data-f="${f}" cx="${SHAFT_X}" cy="${floorTop(f) + 9}" r="3" fill="#3a2e3e" stroke="${OUT}"/>`;
  s += `<rect x="0" y="660" width="390" height="16" fill="#1c1622"/>
    <rect x="96" y="92" width="198" height="28" rx="3" fill="#160e18" stroke="${OUT}" stroke-width="2"/><g id="sign"></g>`;
  L.bg.innerHTML = s;
}

// THE SHELLEY: when the other letters die, it reads HELL.
const SIGN = 'THE SHELLEY';
const SIGN_KEEP = new Set([5, 6, 7, 8]);
let lastSign = '';
function drawSign() {
  const key = S.signOut > 0 ? 'out' : 'f' + S.flickIdx;
  if (key === lastSign) return;
  lastSign = key;
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
  document.getElementById('sign').innerHTML = s;
}

// ---------------- staff ghosts ----------------
const GL = '#7cc9c0', GW = '#e8fffb';
function hireArt(typeKey, stage) {
  const eyes = [
    hollow(),
    hollow() + `<path d="M-8 -64 L-2 -61 M8 -64 L2 -61" stroke="#1b3340" stroke-width="2"/>`,
    hollow() + `<path d="M-3 -51 Q0 -48 3 -51" stroke="#1b3340" stroke-width="1.4" fill="none"/>`,
    tired(),
    `<path d="M-6.5 -58 Q-4 -61 -1.5 -58 M1.5 -58 Q4 -61 6.5 -58" stroke="#1b3340" stroke-width="1.8" fill="none"/>
     <path d="M-3 -52 Q0 -50 3 -52" stroke="#1b3340" stroke-width="1.4" fill="none"/>`,
  ][stage] || hollow();
  let extra = '', hat = '';
  switch (typeKey) {
    case 'influencer':
      extra = `<path d="M14 -42 L22 -62" stroke="${GW}" stroke-width="4" stroke-linecap="round"/><rect x="18" y="-76" width="8" height="13" rx="2" fill="${GW}" stroke="${GL}"/>`;
      hat = `<path d="M-6 -68 Q-21 -68 -21 -52 Q-20 -44 -15 -40 Q-16 -50 -12 -60 Z" fill="${GW}" opacity=".85" stroke="${GL}"/>`; break;
    case 'hunter':
      hat = `<path d="M-12 -61 Q-11 -72 0 -72 Q11 -72 12 -61 Z" fill="${GL}" stroke="${GW}"/><path d="M8 -62 L20 -62" stroke="${GL}" stroke-width="3" stroke-linecap="round"/><circle cx="0" cy="-68" r="2.6" fill="#fff6c4"/>`; break;
    case 'grandma':
      hat = `<circle cx="0" cy="-72" r="6" fill="${GW}" stroke="${GL}"/>`; break;
    case 'kid':
      extra = `<path d="M14 -36 Q20 -56 17 -78" stroke="${GW}" stroke-width="1" fill="none"/><ellipse cx="17" cy="-86" rx="8" ry="10" fill="#ffd0e0" opacity=".75" stroke="${GW}"/>`; break;
    case 'developer':
      extra = `<path d="M0 -46 L-2.5 -38 L0 -28 L2.5 -38 Z" fill="${GL}" stroke="${GW}" stroke-width=".8"/>`;
      hat = `<path d="M-11 -62 Q-8 -72 2 -71 Q11 -70 11 -62 Q4 -68 -11 -62 Z" fill="${GL}"/>`; break;
    case 'exorcist':
      extra = `<rect x="-5" y="-47" width="10" height="3.5" rx="1" fill="#fff" stroke="${GL}" stroke-width=".8"/>`; break;
  }
  const specs = typeKey === 'grandma' ? `<circle cx="-4.2" cy="-58" r="4" fill="none" stroke="${GL}" stroke-width="1.2"/><circle cx="4.2" cy="-58" r="4" fill="none" stroke="${GL}" stroke-width="1.2"/>` : '';
  return ghostBase(extra, eyes + specs, { hat });
}
function staffArt(st) {
  if (st.orig) return st.kind === 'bellhop' ? bellhop() : st.kind === 'maid' ? maid() : girl();
  return hireArt(st.typeKey, st.stage);
}
function staffScale(st) { return st.kind === 'girl' || st.typeKey === 'kid' ? 0.5 : 0.62; }
function staffAmb(st) { return st.orig ? ORIG_AMB : STAGES[st.stage].amb; }
const cap = s => s[0].toUpperCase() + s.slice(1);
function staffDesc(st) { return st.orig ? st.desc : `${cap(TYPES[st.typeKey].job)}. ${cap(st.cause)}.`; }

let nightStaff = [];
function placeStaff() {
  L.staff.innerHTML = '';
  for (const n of nightStaff) n.bub.remove();
  nightStaff = [];
  const used = {};
  for (const st of C.staff) {
    const i = used[st.room] = (used[st.room] || 0) + 1;
    addNightStaff(st, STAFF_SPOTS[st.room][Math.min(i - 1, 1)], 1);
  }
}
function addNightStaff(st, x, alpha) {
  const n = { st, x, f: ROOM[st.room].f, ph: rand(0, 6), el: el('g', {}, L.staff), alpha, burstT: rand(8, 16), upT: rand(6, 10),
    talkT: rand(5, 15), bub: el('g', {}, L.bubbles), bubT: 0, rising: 0 };
  n.el.innerHTML = `<g transform="scale(${staffScale(st)})">${staffArt(st)}</g>`;
  nightStaff.push(n);
  return n;
}

// ---------------- elevator car ----------------
let carBackEl, carFrontEl, doorL, doorR;
function buildCar() {
  carBackEl = el('g', {}, L.carBack);
  carBackEl.innerHTML = `<rect x="-23" y="-76" width="46" height="76" fill="#3a2a22" stroke="${OUT}" stroke-width="2"/>
    <rect x="-20" y="-72" width="40" height="70" fill="#5a4230"/><ellipse cx="0" cy="-60" rx="18" ry="12" fill="url(#lamp)"/>`;
  carFrontEl = el('g', {}, L.carFront);
  carFrontEl.innerHTML = `<rect x="-24" y="-80" width="48" height="6" fill="url(#brass)" stroke="${OUT}" stroke-width="1.5"/>
    <path d="M0 -80 V-110" stroke="#2b2230" stroke-width="2"/>
    <rect x="-24" y="-2" width="48" height="4" fill="url(#brass)" stroke="${OUT}" stroke-width="1.2"/>`;
  doorL = el('rect', { x: -22, y: -74, width: 22, height: 72, fill: '#8a6a3a', opacity: 0.55, stroke: OUT }, carFrontEl);
  doorR = el('rect', { x: 0, y: -74, width: 22, height: 72, fill: '#8a6a3a', opacity: 0.55, stroke: OUT }, carFrontEl);
}

// ---------------- HUD + cards ----------------
const hudEls = {};
function buildHud() {
  L.hud.innerHTML = `<rect width="390" height="84" fill="#120b18"/><rect y="82" width="390" height="2" fill="url(#brass)"/>
    <circle cx="170" cy="25" r="9" fill="url(#brass)" stroke="${OUT}" stroke-width="1.5"/>
    ${T(170, 29, 10, '$', { f: 'Inter', w: 800, c: '#5a4210', a: 'middle' })}
    ${T(16, 68, 9.5, "MORTIMER'S PRESENCE", { f: 'Inter', w: 700, c: '#b6fff6', ls: .8 })}
    <rect x="170" y="60" width="204" height="10" rx="5" fill="#0a1a1f" stroke="#2b4a50"/>`;
  hudEls.night = el('text', { x: 16, y: 30, 'font-size': 21, 'font-family': 'Caladea, serif', 'font-weight': 700, fill: '#f3e6c8', 'letter-spacing': 1 }, L.hud);
  hudEls.clock = el('text', { x: 16, y: 47, 'font-size': 11, 'font-family': 'Inter', fill: '#a99bb3' }, L.hud);
  hudEls.money = el('text', { x: 184, y: 31, 'font-size': 19, 'font-family': 'Inter', 'font-weight': 700, fill: '#f3e6c8' }, L.hud);
  hudEls.stars = el('g', {}, L.hud);
  hudEls.rating = el('text', { x: 374, y: 47, 'font-size': 11, 'font-family': 'Inter', fill: '#a99bb3', 'text-anchor': 'end' }, L.hud);
  hudEls.pres = el('rect', { x: 171, y: 61, width: 100, height: 8, rx: 4, fill: '#7cf3e6', filter: 'url(#glow)' }, L.hud);
  hudEls.banner = el('g', { style: 'display:none' }, L.hud);
  hudEls.banner.innerHTML = `<rect x="95" y="132" width="200" height="22" rx="11" fill="#ff5a4e" stroke="${OUT}" stroke-width="1.5"/>
    ${T(195, 147, 10.5, 'EXORCIST CHECKING IN', { f: 'Inter', w: 800, c: '#fff', a: 'middle', ls: .6 })}`;
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
const starText = n => '★'.repeat(n) + '☆'.repeat(5 - n);

let cardEls = [], speedBtn, pauseBtn, hintEl;
function buildCards() {
  L.cards.innerHTML = `<rect y="676" width="390" height="168" fill="#120b18"/><rect y="676" width="390" height="2" fill="url(#brass)"/>
    ${T(16, 699, 11, 'SCARES', { f: 'Inter', w: 800, ls: 1.5 })}`;
  hintEl = el('text', { x: 82, y: 699, 'font-size': 10, 'font-family': 'Inter', fill: '#8a7c95' }, L.cards);
  speedBtn = el('g', { class: 'hit' }, L.cards);
  speedBtn.innerHTML = `<rect x="286" y="686" width="52" height="20" rx="10" fill="#1e1424" stroke="#3a2c42"/>`;
  speedBtn.label = el('text', { x: 312, y: 700, 'font-size': 10.5, 'font-family': 'Inter', 'font-weight': 700, fill: '#f3e6c8', 'text-anchor': 'middle' }, speedBtn);
  speedBtn.addEventListener('pointerdown', e => { e.stopPropagation(); S.speed = S.speed === 1 ? 2 : 1; });
  pauseBtn = el('g', { class: 'hit' }, L.cards);
  pauseBtn.innerHTML = `<rect x="344" y="686" width="30" height="20" rx="10" fill="#1e1424" stroke="#3a2c42"/>
    <rect x="354" y="691" width="3" height="10" fill="#f3e6c8"/><rect x="361" y="691" width="3" height="10" fill="#f3e6c8"/>`;
  pauseBtn.addEventListener('pointerdown', e => { e.stopPropagation(); showPause(); });
}
function buildCardSlots() {
  for (const c of cardEls) c.g.remove();
  cardEls = C.loadout.map((id, i) => {
    const sc = SCARES[id];
    const x = 12 + i * 93, y = 712;
    const g = el('g', { class: 'hit' }, L.cards);
    g.innerHTML = `<rect class="bg" x="${x}" y="${y}" width="86" height="118" rx="8"/>
      <g transform="translate(${x + 43} ${y + 40})">${ICONS[id]}</g>
      ${T(x + 43, y + 84, sc.name.length > 14 ? 9.5 : 10.5, sc.name, { f: 'Inter', w: 600, a: 'middle' })}
      <rect x="${x + 8}" y="${y + 93}" width="70" height="17" rx="8.5" fill="#0a1a1f" stroke="#2b4a50"/>
      ${T(x + 43, y + 105.5, 10, sc.cost + ' presence', { f: 'Inter', w: 700, c: '#7cf3e6', a: 'middle' })}`;
    const cd = el('rect', { x, y, width: 86, height: 0, rx: 8, fill: '#000', opacity: 0.55 }, g);
    g.addEventListener('pointerdown', e => { e.stopPropagation(); S.selected = i; });
    return { g, bg: g.querySelector('.bg'), cd, x, y, id };
  });
}

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
function typesTonight() {
  const t = ['influencer', 'hunter', 'kid'];
  if (C.night >= 2) t.push('grandma');
  if (C.night >= 3) t.push('developer');
  return t;
}

function spawnGuest(typeKey = pick(typesTonight())) {
  const type = TYPES[typeKey];
  const counts = {};
  S.guests.forEach(g => { if (g.room) counts[g.room] = (counts[g.room] || 0) + 1; });
  const room = [...GUEST_ROOMS].sort((a, b) => (counts[a] || 0) - (counts[b] || 0) + rand(-.5, .5))[0];
  const g = {
    id: S.nextId++, typeKey, type, room, f: 0, x: DOOR_X, y: floorY(0), dir: 1, alpha: 0,
    state: 'enter', fear: 12, fun: 0, bored: 0, used: {}, scaredT: 0, thoughtT: rand(3, 6),
    bubble: null, look: null, fleeing: false, plan: [], stayT: 0, slot: 0, banish: 0,
  };
  g.el = el('g', {}, L.guests);
  g.art = el('g', {}, g.el);
  g.bar = el('g', {}, g.el);
  g.bar.innerHTML = `<rect x="-21.5" y="-1.5" width="43" height="8" rx="4" fill="${OUT}"/>
    <rect x="-20" y="0" width="40" height="5" rx="2.5" fill="url(#fear)"/>`;
  g.marker = el('path', { d: 'M0 -1 l-3.5 -5 l7 0 Z', fill: '#fff', stroke: OUT, 'stroke-width': 1 }, g.bar);
  g.bubEl = el('g', {}, L.bubbles);
  S.guests.push(g);
  if (typeKey === 'exorcist') {
    g.banishBar = el('g', { style: 'display:none' }, g.el);
    g.banishBar.innerHTML = `<rect x="-21.5" y="-13" width="43" height="7" rx="3.5" fill="${OUT}"/>`;
    g.banishFill = el('rect', { x: -20, y: -11.5, width: 0, height: 4, rx: 2, fill: '#ff5a4e' }, g.banishBar);
    const staffRooms = [...new Set(C.staff.map(s => s.room))].filter(r => r !== 'lobby').sort(() => Math.random() - .5);
    g.plan = ['checkin', ...staffRooms.slice(0, 3), 'checkout'];
    hudEls.banner.style.display = '';
    hint('Keep him scared or he banishes your staff.');
    setTimeout(() => { hudEls.banner.style.display = 'none'; }, 4000);
    buzz(80);
  } else {
    const extras = ['rest', 'lib', room, 'rest', 'lib'].sort(() => Math.random() - .5).slice(0, 2);
    g.plan = ['checkin', room, ...extras, 'checkout'];
  }
}

function say(g, text, dur = 2.8) { g.bubble = { text, t: dur }; g.bubText = null; }
const zone = g => g.fear < SWEET_LO ? 'bored' : g.fear < SWEET_HI ? 'sweet' : 'terror';
const isExo = g => g.typeKey === 'exorcist';
const active = g => !['gone', 'exit', 'enter', 'dying'].includes(g.state);

function goTo(g, f, x, then) {
  g.dest = { f, x }; g.then = then; g.state = 'walk'; g.waitX = SHAFT_X + rand(-12, 12);
}

function nextStep(g) {
  if (S.t > NIGHT_LEN * 0.86 && g.plan[0] !== 'checkout' && g.plan[0] !== 'leave') g.plan = ['checkout'];
  const step = g.plan.shift();
  if (!step) return;
  if (step === 'checkin' || step === 'checkout') {
    goTo(g, 0, DESK_X + rand(-4, 4), () => { g.state = 'desk'; g.stayT = 1.4; g.onDesk = step; });
  } else if (step === 'leave') {
    goTo(g, 0, DOOR_X, () => { g.state = 'exit'; });
  } else {
    const r = ROOM[step];
    const [a, b] = SPOTS[step] || [r.x0 + 20, r.x1 - 40];
    goTo(g, r.f, rand(a, b), () => { g.state = 'stay'; g.stayT = isExo(g) ? 16 : rand(11, 17); g.at = step; });
  }
}

function money(n, x, y, col) {
  if (!n) return;
  S.earned += n;
  C.money += n;
  floatText(x, y, (n > 0 ? '+$' : '-$') + Math.abs(n), col || (n > 0 ? '#7ee08f' : '#ff7a6e'));
}

function checkOut(g) {
  if (isExo(g)) { say(g, 'I will return.'); return; }
  const stars = clamp(1 + Math.floor(g.fun / 10) - Math.floor(g.bored / 45), 1, 5);
  money(Math.round(g.fun * g.type.tip), g.x, g.y - 60);
  if (C.upgrades.gift && stars >= 4) { const x = g.x, y = g.y; setTimeout(() => { if (!S.over) money(25, x, y - 90, '#ffcf7a'); }, 500); }
  S.served++;
  addReview(g, stars, pick(REVIEWS[stars]));
  floatText(g.x, g.y - 76, '★'.repeat(stars), '#f2c14e');
}
function addReview(g, stars, text) {
  S.reviews.push({ stars, text, who: `${g.type.name}, ${ROOM_NAME(g.room)}` });
}

function flee(g) {
  g.fleeing = true;
  S.fled++;
  if (isExo(g)) say(g, 'This is not\nover, demon!', 3);
  else { addReview(g, 1, pick(REVIEWS.fled)); say(g, pick(FLEE_LINES), 3); }
  g.plan = [];
  buzz(40);
  for (const o of S.guests) if (o !== g && !o.fleeing && active(o) && o.state !== 'ride' && roomOf(o) === roomOf(g)) addFear(o, 14);
  if (!isExo(g) && Math.random() < (g.state === 'ride' ? 0.22 : 0.1)) { kill(g, pick(DEATHS.flee)); return; }
  if (g.state === 'ride') { g.dest = { f: 0, x: DOOR_X }; g.then = () => { g.state = 'exit'; }; }
  else goTo(g, 0, DOOR_X, () => { g.state = 'exit'; });
}

function kill(g, cause) {
  if (g.state === 'dying' || g.state === 'gone') return;
  if (g.state === 'ride') {
    const E = S.elev;
    E.riders.splice(E.riders.indexOf(g), 1);
    g.f = E.f; g.x = SHAFT_X + g.slot;
  }
  g.y = floorY(g.f);
  g.state = 'dying'; g.dieT = 1.6; g.cause = cause;
  g.bubble = null; g.bubEl.innerHTML = '';
  if (g.banishBar) g.banishBar.style.display = 'none';
  S.died.push({ name: g.type.name, cause });
  C.deaths++;
  money(-100, g.x, g.y - 60);
  floatText(g.x, g.y - 90, 'CLEANUP', '#ff7a6e');
  buzz(220);
}

function becomeStaff(g) {
  let rid = roomOf(g);
  if (!STAFF_SPOTS[rid]) rid = 'lobby';
  const st = { id: 's' + C.nextStaffId++, name: g.type.name, typeKey: g.typeKey, stage: 0, room: rid, cause: g.cause, hired: C.night };
  C.staff.push(st);
  const n = addNightStaff(st, clamp(g.x, ROOM[rid].x0 + 18, ROOM[rid].x1 - 18), 0);
  n.rising = 1.2;
  sayStaff(n, pick(STAGES[0].lines));
  hint(`${g.type.name} ${g.cause}. New hire.`);
}

function roomOf(g) {
  if (g.state === 'ride') return 'elevator';
  for (const r of ROOMS) if (r.f === g.f && g.x >= r.x0 && g.x <= r.x1 && !(r.f > 0 && g.x > SHAFT_L && g.x < SHAFT_R)) return r.id;
  return 'hall';
}

function addFear(g, amt) {
  g.fear = clamp(g.fear + amt, 0, 110);
  g.scaredT = 1.3;
  if (g.fear >= 100 && !g.fleeing) flee(g);
}

function roomAmbient(rid) {
  let a = 0;
  for (const n of nightStaff) if (n.st.room === rid && !n.gone) a += staffAmb(n.st);
  return a;
}

function updateGuest(g, dt) {
  const tp = g.type;
  if (g.state === 'dying') {
    g.dieT -= dt;
    if (g.dieT <= 0) { becomeStaff(g); g.state = 'gone'; g.el.remove(); g.bubEl.remove(); }
    return;
  }
  const rid = roomOf(g);
  const amb = g.state === 'stay' || g.state === 'walk' || g.state === 'desk' ? roomAmbient(rid) : 0;
  const ride = g.state === 'ride' && S.elev.stallT > 0 ? 3 : 0;
  const cool = g.state === 'wait' || g.state === 'ride' ? 0.5 : 1;   // nervous in the hallway
  g.fear = clamp(g.fear - tp.decay * cool * dt + (amb + ride) * dt * tp.fearMul, 0, 110);
  if (g.fear >= 100 && !g.fleeing && active(g)) { flee(g); if (g.state === 'dying') return; }
  if (!g.fleeing && g.state !== 'enter') {
    const z = zone(g);
    if (z === 'bored') g.bored += dt;
    else g.fun += dt * tp.funMul * (z === 'terror' ? 1.4 : 1);
  }
  g.scaredT = Math.max(0, g.scaredT - dt);
  for (const k in g.used) g.used[k] = Math.max(0, g.used[k] - dt / 18);

  const speed = g.fleeing ? 72 : 30;
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
    case 'stay':
      g.stayT -= dt;
      if (isExo(g)) exorcise(g, dt);
      if (g.stayT <= 0) {
        if (g.at === 'rest' && !isExo(g)) {
          if (zone(g) !== 'bored') money(Math.round(rand(12, 24) * (C.upgrades.shrimp ? 1.6 : 1)), g.x, g.y - 60);
          if (C.upgrades.shrimp && Math.random() < 0.05) { kill(g, pick(DEATHS.shrimp)); return; }
        }
        g.at = null;
        if (g.banishBar) g.banishBar.style.display = 'none';
        nextStep(g);
      }
      break;
    case 'desk':
      g.stayT -= dt;
      if (g.stayT <= 0) {
        if (g.onDesk === 'checkin') { money(tp.fee + (C.upgrades.beds && !isExo(g) ? 15 : 0), g.x, g.y - 60); nextStep(g); }
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

  if (g.bubble) { g.bubble.t -= dt; if (g.bubble.t <= 0) { g.bubble = null; g.bubEl.innerHTML = ''; } }
  g.thoughtT -= dt;
  if (g.thoughtT <= 0 && !g.bubble && active(g)) {
    g.thoughtT = rand(7, 12);
    if (S.guests.filter(o => o.bubble).length < 3) say(g, g.state === 'ride' && Math.random() < .5 ? pick(RIDE_LINES) : pick(tp[zone(g)]));
  }
}

function exorcise(g, dt) {
  const here = nightStaff.filter(n => !n.gone && n.st.room === g.at);
  if (!here.length || g.fleeing) { g.banishBar.style.display = 'none'; return; }
  g.banishBar.style.display = '';
  if (g.fear >= SWEET_LO) { g.banishFill.setAttribute('fill', '#8a7c95'); return; }   // too rattled to concentrate
  g.banishFill.setAttribute('fill', '#ff5a4e');
  g.banish += dt / 11;
  g.banishFill.setAttribute('width', (40 * Math.min(1, g.banish)).toFixed(1));
  if (g.banish >= 1) {
    g.banish = 0;
    const n = pick(here);
    n.gone = true; n.fade = 1;
    C.staff = C.staff.filter(s => s !== n.st);
    S.banished.push(n.st.name);
    floatText(n.x, floorY(n.f) - 70, 'BANISHED', '#ff5a4e');
    say(g, 'Begone!');
    buzz(160);
  }
}

function renderGuest(g) {
  if (g.state === 'gone') return;
  const scaredLook = g.scaredT > 0 || g.fear >= SWEET_HI || g.fleeing || g.state === 'dying';
  const look = (scaredLook ? 's' : 'c') + g.dir;
  if (look !== g.look) {
    g.look = look;
    g.art.innerHTML = `<g transform="scale(${g.dir * GUEST_SCALE} ${GUEST_SCALE})">${g.type.art(scaredLook)}</g>`;
  }
  if (g.state === 'dying') {
    const k = 1 - g.dieT / 1.6;
    g.art.setAttribute('transform', `rotate(${(-Math.min(1, k * 2.5) * 90 * g.dir).toFixed(1)})`);
    g.el.setAttribute('opacity', Math.max(0, 1 - k * 1.2).toFixed(2));
    g.bar.style.display = 'none';
    g.el.setAttribute('transform', `translate(${g.x.toFixed(1)} ${g.y.toFixed(1)})`);
    return;
  }
  const hop = g.scaredT > 0.9 ? -Math.sin((1.3 - g.scaredT) / 0.4 * Math.PI) * 7 : 0;
  const bob = g.state === 'walk' ? Math.abs(Math.sin(S.t * (g.fleeing ? 18 : 9))) * -1.5 : 0;
  g.el.setAttribute('transform', `translate(${g.x.toFixed(1)} ${(g.y + hop + bob).toFixed(1)})`);
  g.el.setAttribute('opacity', g.alpha.toFixed(2));
  g.bar.setAttribute('transform', 'translate(0 -66)');
  g.marker.setAttribute('transform', `translate(${(-20 + clamp(g.fear, 0, 100) / 100 * 40).toFixed(1)} 0)`);
  g.bar.style.display = g.state === 'enter' || g.state === 'exit' ? 'none' : '';
  if (g.banishBar) g.banishBar.setAttribute('transform', 'translate(0 -66)');
  if (g.bubble) {
    if (g.bubText !== g.bubble.text) {
      g.bubText = g.bubble.text;
      g.bubEl.innerHTML = bubble(0, 0, g.bubble.text, { fs: 9, left: g.x > 250 });
    }
    g.bubEl.setAttribute('transform', `translate(${g.x.toFixed(1)} ${(g.y - 72).toFixed(1)})`);
  }
}

function sayStaff(n, text) { n.bubT = 2.6; n.bub.innerHTML = bubble(0, 0, text, { fs: 9, left: n.x > 250 }); }
function updateStaff(dt) {
  for (const n of nightStaff) {
    if (n.rising > 0) { n.rising -= dt; n.alpha = Math.min(1, n.alpha + dt); }
    if (n.gone) {
      n.fade -= dt;
      if (n.fade <= 0 && n.el.parentNode) { n.el.remove(); n.bub.remove(); }
      continue;
    }
    if (n.bubT > 0) { n.bubT -= dt; if (n.bubT <= 0) n.bub.innerHTML = ''; }
    if (n.st.orig) continue;
    const stage = STAGES[n.st.stage];
    n.talkT -= dt;
    if (n.talkT <= 0) { n.talkT = rand(14, 24); if (S.guests.filter(o => o.bubble).length < 3) sayStaff(n, pick(stage.lines)); }
    const here = S.guests.filter(g => active(g) && g.state !== 'ride' && roomOf(g) === n.st.room);
    if (stage.burst) {
      n.burstT -= dt;
      if (n.burstT <= 0) {
        n.burstT = rand(10, 18);
        if (here.length) { here.forEach(g => addFear(g, 16 * g.type.fearMul)); fx('teacup', n.x, floorY(n.f) - 6); }
      }
    }
    if (stage.upsell) {
      n.upT -= dt;
      if (n.upT <= 0) { n.upT = rand(8, 12); const g = here.find(o => !isExo(o) && zone(o) !== 'bored'); if (g) money(8, g.x, g.y - 60, '#ffcf7a'); }
    }
  }
}
function renderStaff() {
  for (const n of nightStaff) {
    if (!n.el.parentNode) continue;
    const y = floorY(n.f) - 10 + Math.sin(S.t * 2 + n.ph) * 3 - (n.rising > 0 ? n.rising * 20 : 0);
    n.el.setAttribute('transform', `translate(${n.x} ${y.toFixed(1)})`);
    n.el.setAttribute('opacity', (n.gone ? Math.max(0, n.fade) : n.alpha).toFixed(2));
    n.bub.setAttribute('transform', `translate(${n.x} ${(y - 46).toFixed(1)})`);
  }
}

// ---------------- elevator ----------------
const CAP = 3, SLOTS = [-11, 11, 0];
function updateElevator(dt) {
  const E = S.elev;
  E.stallT = Math.max(0, E.stallT - dt);
  const waiting = S.guests.filter(g => g.state === 'wait');
  if (E.state === 'idle') {
    const floors = new Set(E.riders.map(g => g.dest.f));
    if (E.riders.length < CAP) waiting.forEach(g => floors.add(g.f));
    if (floors.size) {
      const ahead = [...floors].filter(f => E.dir > 0 ? f >= E.f : f <= E.f);
      const pool = ahead.length ? ahead : [...floors];
      let best = pool[0];
      for (const f of pool) if (Math.abs(f - E.f) < Math.abs(best - E.f)) best = f;
      if (best !== E.f) E.dir = Math.sign(best - E.f);
      E.target = best;
      E.state = best === E.f ? 'open' : 'moving';
      E.doorT = 0.8;
    }
  } else if (E.state === 'moving') {
    if (E.stallT > 0) return;
    const ty = floorY(E.target);
    const d = ty - E.y;
    if (Math.abs(d) < 1) { E.y = ty; E.f = E.target; E.state = 'open'; E.doorT = 0.8; }
    else E.y += Math.sign(d) * Math.min(Math.abs(d), 135 * dt);
  } else if (E.state === 'open') {
    E.doors = Math.min(1, E.doors + dt * 3);
    if (E.doors >= 1) {
      for (const g of [...E.riders]) if (g.dest.f === E.f) {
        E.riders.splice(E.riders.indexOf(g), 1);
        g.f = E.f; g.state = 'walk'; g.x = SHAFT_X + g.slot;
      }
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
  const shake = E.stallT > 0 ? Math.sin(S.t * 60) * 1.2 : 0;
  const tr = `translate(${(SHAFT_X + shake).toFixed(1)} ${E.y.toFixed(1)})`;
  carBackEl.setAttribute('transform', tr);
  carFrontEl.setAttribute('transform', tr);
  const w = 22 * (1 - E.doors);
  doorL.setAttribute('width', w.toFixed(1));
  doorR.setAttribute('x', (22 - w).toFixed(1));
  doorR.setAttribute('width', w.toFixed(1));
  document.querySelectorAll('.flamp').forEach(l => {
    l.setAttribute('fill', Math.abs(floorY(+l.dataset.f) - E.y) < 2 ? '#ffcf7a' : '#3a2e3e');
  });
}

// ---------------- scaring ----------------
let mort = null;
function tapTarget(t) {
  if (!S.started || S.over || S.paused) return;
  const id = C.loadout[S.selected];
  const sc = SCARES[id];
  if (!sc) return;
  if (sc.elevator && !t.elevator) return hint('Elevator Stall only works on the elevator.');
  if ((S.cooldowns[id] || 0) > 0) return hint('Still recharging...');
  if (S.presence < sc.cost) return hint('Not enough presence. Rest a moment.');
  S.presence -= sc.cost;
  S.cooldowns[id] = sc.cd;
  const inTarget = g => {
    if (!active(g)) return false;
    if (t.elevator) return g.state === 'ride' || g.state === 'wait';
    if (g.state === 'ride') return false;
    if (sc.floor && t.room.id !== 'lobby') return g.f === t.room.f && roomOf(g) !== 'hall';
    return roomOf(g) === t.room.id;
  };
  const victims = S.guests.filter(inTarget);
  for (const g of victims) {
    const worn = Math.pow(0.7, g.used[id] || 0);
    g.used[id] = (g.used[id] || 0) + 1;
    addFear(g, sc.amt * g.type.fearMul * worn * (t.elevator ? 1.3 : 1));
    if (!g.fleeing && Math.random() < .55 && !g.bubble) say(g, pick(g.type[zone(g)]));
  }
  if (id === 'chandelier' && Math.random() < 0.3) {
    const v = pick(victims.filter(g => active(g) && !isExo(g)));
    if (v) kill(v, pick(DEATHS.chandelier));
  }
  if (id === 'stall') S.elev.stallT = 3;
  let mx, my;
  if (t.elevator) { mx = SHAFT_X; my = S.elev.y - 4; }
  else {
    const r = t.room;
    const near = victims.length ? victims.reduce((a, g) => a + g.x, 0) / victims.length : (r.x0 + r.x1) / 2;
    mx = clamp(near + (near < (r.x0 + r.x1) / 2 ? 34 : -34), r.x0 + 20, r.x1 - 20);
    my = floorY(r.f) - 8;
  }
  mort = { x: mx, y: my, t: 1.4 };
  fx(id, mx, my, t);
  if (id === 'pipes' && t.room && t.room.id !== 'lobby') {
    const other = ROOMS.find(r => r.f === t.room.f && r !== t.room);
    if (other) fx(id, (other.x0 + other.x1) / 2, floorY(other.f) - 8, { room: other });
  }
  if (id === 'lights') S.signOut = 2.5;
  buzz(25);
  if (!victims.length) hint("No one's there. Mortimer haunts for himself.");
}

let hintT = 0;
const HINT = 'pick a scare, tap a room';
function hint(msg) { hintEl.textContent = msg.length > 40 ? msg.slice(0, 39) + '…' : msg; hintT = 2.6; }

const effects = [];
function fx(id, x, y, t) {
  const g = el('g', {}, L.fx);
  const e = { g, t: 1.3, id, x, y };
  if ((id === 'lights' || id === 'chandelier') && t && t.room) {
    const r = t.room;
    e.dark = el('rect', { x: r.x0, y: floorTop(r.f), width: r.x1 - r.x0, height: FLOOR_H, fill: id === 'lights' ? '#05030a' : '#fff6d0' }, g);
  }
  e.icon = el('g', {}, g);
  e.icon.innerHTML = ICONS[id];
  effects.push(e);
}
const floaters = [];
function floatText(x, y, txt, col) {
  const t = el('text', { x: clamp(x, 30, 360), y, 'font-size': 12, 'font-family': 'Inter', 'font-weight': 800, fill: col,
    'text-anchor': 'middle', stroke: OUT, 'stroke-width': 3, 'paint-order': 'stroke' }, L.fx);
  t.textContent = txt;
  floaters.push({ el: t, t: 1.6 });
}
function updateFx(dt) {
  for (let i = effects.length - 1; i >= 0; i--) {
    const e = effects[i];
    e.t -= dt;
    const k = 1 - e.t / 1.3;
    if (e.dark) e.dark.setAttribute('opacity', e.id === 'lights' ? (Math.sin(k * 40) > 0 ? 0.6 : 0.15) * (1 - k) : Math.max(0, 0.5 - k));
    const drop = e.id === 'chandelier' ? Math.min(1, k * 3) * 50 : -k * 24;
    e.icon.setAttribute('transform', `translate(${e.x + (e.id === 'teacup' ? Math.sin(k * 12) * 6 : 0)} ${e.y - 70 + drop}) scale(${0.7 + Math.min(k * 3, 1) * 0.3})`);
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

let mortEl;
function renderMort(dt) {
  if (!mortEl || !mortEl.parentNode) { mortEl = el('g', {}, L.fx); mortEl.innerHTML = `<g transform="scale(.72)">${mortimer()}</g>`; }
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
  let h = Math.floor(mins / 60) % 24;
  const m = Math.floor(mins % 60), ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ap}`;
}
const avgOf = rs => rs.length ? rs.reduce((a, r) => a + r.stars, 0) / rs.length : 0;
let lastStars = -1;
function renderHud(dt) {
  hudEls.night.textContent = `NIGHT ${C.night}`;
  const inside = S.guests.filter(g => g.state !== 'gone' && g.state !== 'dying').length;
  hudEls.clock.textContent = `${clockText()} · ${inside} guest${inside === 1 ? '' : 's'}`;
  hudEls.money.textContent = C.money.toLocaleString();
  hudEls.money.setAttribute('fill', C.money < 0 ? '#ff7a6e' : '#f3e6c8');
  const avg = avgOf(S.reviews);
  if (S.reviews.length !== lastStars) {
    lastStars = S.reviews.length;
    hudEls.stars.innerHTML = starsRow(296, 24, avg, 7.5, 18);
    const last = S.reviews[S.reviews.length - 1];
    hudEls.rating.textContent = last ? `${avg.toFixed(1)} · "${last.text.length > 26 ? last.text.slice(0, 25) + '…' : last.text}"` : 'no reviews yet';
  }
  hudEls.pres.setAttribute('width', (202 * S.presence / S.presMax).toFixed(1));
  cardEls.forEach((c, i) => {
    const sc = SCARES[c.id], sel = i === S.selected;
    const cd = (S.cooldowns[c.id] || 0) / sc.cd;
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
  if (hintT > 0) { hintT -= dt; if (hintT <= 0) hintEl.textContent = HINT; }
}

// ---------------- screens (HTML) ----------------
function show(html) { ui.innerHTML = `<div class="col">${html}</div>`; ui.classList.add('show'); ui.scrollTop = 0; }
function hide() { ui.classList.remove('show'); ui.innerHTML = ''; }
const on = (id, fn) => { const b = document.getElementById(id); if (b) b.addEventListener('click', fn); };
const svgArt = (art, s = 1, w = 64, h = 76, y = 72) =>
  `<svg viewBox="${-w / 2} ${y - h} ${w} ${h}" width="${w}" height="${h}"><g transform="translate(0 ${y - 2}) scale(${s})">${art}</g></svg>`;

function showTitle() {
  const saved = load();
  show(`<div style="height:6vh"></div>
    <h1>CHECKED OUT</h1>
    <p class="sub">Checkout was at 11. In 1962.</p>
    <div style="text-align:center">${svgArt(mortimer(), 1.5, 140, 130, 120)}</div>
    <p style="text-align:center">You are Mortimer. You died in Room 13 and never left.<br>The Shelley is broke, and Mr. Crane wants to build a parking garage.<br>Ten nights to save it.</p>
    <p style="text-align:center;margin-top:16px">Pick a scare, then tap a room or the elevator.<br>Keep guests in the <b style="color:var(--green)">green</b>: scared enough to pay,<br>not so scared they <b style="color:var(--red)">run</b>.</p>
    ${saved ? `<button class="btn" id="cont">CONTINUE · NIGHT ${saved.night}</button><button class="btn ghost" id="new">NEW GAME</button>`
      : `<button class="btn" id="new">OPEN THE DOORS</button>`}`);
  on('cont', () => { C = saved; startNight(); });
  on('new', () => { wipe(); C = newCampaign(); startNight(); });
}

function showPause() {
  if (!S.started || S.over || S.paused) return;
  S.paused = true;
  show(`<div style="height:20vh"></div><h1>PAUSED</h1><p class="sub">Mortimer stares at the wall. He's good at it.</p>
    <button class="btn" id="res">RESUME</button><button class="btn ghost" id="quit">QUIT TO TITLE</button>
    <p class="small" style="text-align:center;margin-top:14px">Quitting loses tonight. Your mornings are saved.</p>`);
  on('res', () => { hide(); S.paused = false; });
  on('quit', () => { S.over = true; showTitle(); });
}
window.appPause = () => { if (S && S.started && !S.over) showPause(); };
window.androidBack = () => {
  if (S && S.paused) { hide(); S.paused = false; }
  else if (!ui.classList.contains('show')) showPause();
};
document.addEventListener('visibilitychange', () => { if (document.hidden && S && S.started && !S.over) showPause(); });

function reviewCards(rs) {
  return rs.map(r => `<div class="review"><div class="s">${starText(r.stars)}</div><div class="t">${r.text}</div><div class="w">— ${r.who}</div></div>`).join('');
}

function endNight() {
  S.over = true;
  const avg = avgOf(S.reviews);
  C.ratings.push(+avg.toFixed(2));
  const sorted = [...S.reviews].sort((a, b) => b.stars - a.stars);
  const shown = sorted.length ? [sorted[0]] : [];
  if (sorted.length > 2) shown.push(sorted[Math.floor(sorted.length / 2)]);
  if (sorted.length > 1) shown.push(sorted[sorted.length - 1]);
  const verdict = avg >= 4 ? 'The Shelley lives another night.' : avg >= 2.5 ? 'The bank calls. You let it ring.' : 'Mr. Crane measures the lobby for parking.';
  window.__result = { night: C.night, earned: S.earned, money: C.money, served: S.served, fled: S.fled, died: S.died.length, banished: S.banished.length, avg: +avg.toFixed(2), staff: C.staff.length };
  console.log('night', JSON.stringify(window.__result));
  show(`<h1>6:00 AM</h1><p class="sub">${verdict}</p>
    <div class="row"><span>EARNED TONIGHT</span><b class="${S.earned < 0 ? 'neg' : ''}">$${S.earned}</b></div>
    <div class="row"><span>CHECKED OUT</span><b>${S.served}</b></div>
    <div class="row"><span>RAN SCREAMING</span><b class="${S.fled ? 'neg' : ''}">${S.fled}</b></div>
    ${S.died.length ? `<div class="row"><span>DIED (NOW STAFF)</span><b class="neg">${S.died.length}</b></div>` : ''}
    ${S.banished.length ? `<div class="row"><span>BANISHED</span><b class="neg">${S.banished.join(', ')}</b></div>` : ''}
    <div class="row"><span>RATING</span><b style="color:#f2c14e">${starText(Math.round(avg))}</b></div>
    ${reviewCards(shown)}
    <button class="btn" id="morning">GOOD MORNING</button>`);
  on('morning', () => morning());
  if (BOT) setTimeout(morning, 50);
}

function morning() {
  const due = bill(C.night);
  C.money -= due;
  const movedOn = [];
  for (const st of [...C.staff]) {
    if (st.orig || st.hired === C.night) continue;
    if (st.stage === 4 && Math.random() < 0.25) { movedOn.push(st.name); C.staff.splice(C.staff.indexOf(st), 1); C.accepted++; continue; }
    if (st.stage < 4) st.stage++;
  }
  C.debtNights = C.money < 0 ? C.debtNights + 1 : 0;
  let memo = pick(MEMOS);
  if (S.died.length) memo = `Welcome to the team, ${S.died.map(d => d.name).join(' and ')}. Orientation is forever. Please stop asking about checkout.`;
  if (S.banished.length) memo = `${S.banished.join(' and ')} has been "relocated" by a member of the clergy. Their locker will be cleared out.`;
  if (movedOn.length) memo = `${movedOn.join(' and ')} has Moved On. We are very happy for them. The bell rang once at 6 AM. Nobody was at the desk.`;
  if (C.debtNights === 1) memo = 'FINAL NOTICE from the bank. One more morning in the red and The Shelley is theirs. Mr. Crane sends his regards.';
  if (C.debtNights >= 2) return ending('foreclosed');
  if (C.night >= LAST_NIGHT) return ending();
  C.night++;
  C.memo = memo;
  C.lastDue = due;
  save();
  dayScreen();
}

function dayScreen() {
  const due = C.lastDue || 0;
  const staffHtml = C.staff.map(st => {
    const stage = st.orig ? null : STAGES[st.stage];
    return `<div class="card"><div class="art">${svgArt(staffArt(st), staffScale(st) * 1.05)}</div>
      <div class="body"><div class="name">${st.name.toUpperCase()}</div>
        <div class="desc">${staffDesc(st)}</div>
        ${stage ? `<div class="stages">${STAGES.map((_, i) => `<i class="${i <= st.stage ? 'on' : ''}"></i>`).join('')}</div>
          <div class="meta">${stage.name}: ${stage.desc}</div>` : `<div class="meta">Since ${st.since}. Steady, gentle fear.</div>`}
      </div><button data-staff="${st.id}">${ROOM_NAME(st.room)}</button></div>`;
  }).join('') || '<p class="small">Nobody left but Mortimer.</p>';
  const upHtml = Object.entries(UPGRADES).map(([k, u]) => `<div class="card"><div class="body"><div class="name">${u.name}</div>
      <div class="desc">${u.desc}</div></div>
      ${C.upgrades[k] ? '<span class="tag cy">OWNED</span>' : `<button data-up="${k}" ${C.money < u.price ? 'disabled' : ''}>$${u.price}</button>`}</div>`).join('');
  const scHtml = Object.values(SCARES).map(sc => {
    const owned = C.owned.includes(sc.id), eq = C.loadout.includes(sc.id);
    return `<div class="card"><div class="art" style="height:56px;flex-basis:56px"><svg viewBox="-28 -28 56 56" width="56" height="56">${ICONS[sc.id]}</svg></div>
      <div class="body"><div class="name">${sc.name}</div><div class="desc">${sc.desc}</div>
      <div class="meta">${sc.cost} presence · fear ${sc.amt}</div></div>
      ${owned ? `<button data-eq="${sc.id}" class="${eq ? 'on' : ''}">${eq ? 'EQUIPPED' : 'EQUIP'}</button>`
        : `<button data-buy="${sc.id}" ${C.money < sc.price ? 'disabled' : ''}>$${sc.price}</button>`}</div>`;
  }).join('');
  const avgAll = C.ratings.length ? C.ratings.reduce((a, b) => a + b, 0) / C.ratings.length : 0;
  show(`<h1>MORNING</h1><p class="sub">Night ${C.night} of ${LAST_NIGHT} is next. The bank never sleeps either.</p>
    <div class="row"><span>THE BANK TOOK</span><b class="neg">-$${due}</b></div>
    <div class="row"><span>BALANCE</span><b class="${C.money < 0 ? 'neg' : 'pos'}">$${C.money}</b></div>
    <div class="row"><span>AVERAGE RATING</span><b style="color:#f2c14e">${avgAll.toFixed(1)} ★</b></div>
    <div class="row"><span>TOMORROW'S BILL</span><b>$${bill(C.night)}</b></div>
    <div class="memo"><div class="hd">ETERNAL HOSPITALITY GROUP</div>${C.memo}</div>
    <h2>STAFF · TAP THE ROOM TO MOVE THEM</h2>${staffHtml}
    <h2>SCARES · BRING FOUR</h2>${scHtml}
    <h2>THE HOTEL</h2>${upHtml}
    <button class="btn" id="open">OPEN FOR NIGHT ${C.night}</button>`);
  ui.querySelectorAll('[data-staff]').forEach(b => b.addEventListener('click', () => {
    const st = C.staff.find(s => s.id === b.dataset.staff);
    const order = ['lobby', 'rest', 'lib', 'r7', 'r8', 'r13', 'r14'];
    let i = order.indexOf(st.room);
    for (let k = 0; k < order.length; k++) {
      i = (i + 1) % order.length;
      if (C.staff.filter(s => s !== st && s.room === order[i]).length < 2) break;
    }
    st.room = order[i];
    save(); keepScroll(dayScreen);
  }));
  ui.querySelectorAll('[data-up]').forEach(b => b.addEventListener('click', () => {
    const u = UPGRADES[b.dataset.up];
    if (C.money < u.price) return;
    C.money -= u.price; C.upgrades[b.dataset.up] = true; save(); keepScroll(dayScreen);
  }));
  ui.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => {
    const sc = SCARES[b.dataset.buy];
    if (C.money < sc.price) return;
    C.money -= sc.price; C.owned.push(sc.id);
    if (C.loadout.length < 4) C.loadout.push(sc.id);
    save(); keepScroll(dayScreen);
  }));
  ui.querySelectorAll('[data-eq]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.eq;
    if (C.loadout.includes(id)) { if (C.loadout.length > 1) C.loadout = C.loadout.filter(x => x !== id); }
    else if (C.loadout.length < 4) C.loadout.push(id);
    else { C.loadout.shift(); C.loadout.push(id); }
    save(); keepScroll(dayScreen);
  }));
  on('open', () => startNight());
  if (BOT) setTimeout(() => {
    const up = Object.entries(UPGRADES).find(([k, u]) => !C.upgrades[k] && C.money - u.price > bill(C.night));
    if (up) { C.money -= up[1].price; C.upgrades[up[0]] = true; }
    const sc = Object.values(SCARES).find(s => s.price && !C.owned.includes(s.id) && C.money - s.price > bill(C.night));
    if (sc) { C.money -= sc.price; C.owned.push(sc.id); if (sc.id === 'cold') C.loadout[0] = 'cold'; }
    startNight();
  }, 50);
}
function keepScroll(fn) { const y = ui.scrollTop; fn(); ui.scrollTop = y; }

function ending(kind) {
  const avgAll = C.ratings.length ? C.ratings.reduce((a, b) => a + b, 0) / C.ratings.length : 0;
  if (!kind) kind = C.money < 0 || avgAll < 3 ? 'demolished' : C.accepted >= 2 ? 'checkout' : 'saved';
  const E = {
    foreclosed: ['FORECLOSED', 'Two mornings in the red.', ['The bank took The Shelley on a Tuesday.', 'Mr. Crane built his parking garage in eleven weeks.', 'It is haunted now. Level B, space 13. The car alarms go off at 2:13 AM.', 'Mortimer stands in the space. Nobody parks there.']],
    demolished: ['DEMOLISHED', `Ten nights. ${avgAll.toFixed(1)} stars. Not enough.`, ['The wrecking ball came at 11 AM sharp. Checkout time.', 'The parking garage is haunted now. Space B-13.', 'Somewhere under the concrete, the 1962 shrimp cocktail waits.']],
    saved: ['THE SHELLEY LIVES', `Ten nights. ${avgAll.toFixed(1)} stars. $${C.money} in the bank.`, ['Mr. Crane withdrew his offer and asked for a room. He has not checked out.', 'Mortimer works the front desk now. Forever.', '"Living the dream," he says. "Well. Not living."']],
    checkout: ['CHECKED OUT', `Ten nights. ${avgAll.toFixed(1)} stars. ${C.accepted} of the staff found peace.`, ['The Shelley runs itself now. The staff know what they are doing.', 'On the last morning, the bell at the front desk rang once.', 'The desk was empty. Room 13 was made up, mints on the pillow.', 'Mortimer finally checked out.']],
  }[kind];
  wipe();
  window.__ending = kind;
  console.log('ending', kind);
  show(`<div class="end"><div style="height:8vh"></div><h1>${E[0]}</h1><p class="sub">${E[1]}</p>
    <div style="text-align:center;opacity:${kind === 'checkout' ? .35 : 1}">${svgArt(mortimer(), 1.4, 130, 120, 112)}</div>
    ${E[2].map(l => `<p>${l}</p>`).join('')}
    <p class="small" style="text-align:center;margin-top:20px">Guests who died here: ${C.deaths}. Staff who moved on: ${C.accepted}.</p>
    <button class="btn" id="again">CHECK IN AGAIN</button></div>`);
  on('again', () => { C = newCampaign(); startNight(); });
}

// ---------------- bot (test hook) ----------------
let botT = 0;
function bot(dt) {
  botT -= dt;
  if (botT > 0) return;
  botT = 0.6;
  const tryScare = (r, filter) => {
    for (let i = C.loadout.length - 1; i >= 0; i--) {
      const sc = SCARES[C.loadout[i]];
      if (sc.elevator || S.presence < sc.cost || (S.cooldowns[sc.id] || 0) > 0) continue;
      if (filter && !filter(sc)) continue;
      S.selected = i; tapTarget({ room: r }); return true;
    }
    return false;
  };
  if (BOT === 'wild') {
    const busy = S.guests.filter(g => g.state === 'stay' || g.state === 'desk');
    if (busy.length) { const r = ROOM[roomOf(pick(busy))]; if (r) tryScare(r); }
    return;
  }
  const exo = S.guests.find(g => isExo(g) && active(g) && g.state !== 'ride' && !g.fleeing && ROOM[roomOf(g)]);
  if (exo) { tryScare(ROOM[roomOf(exo)], sc => sc.id !== 'chandelier'); return; }
  let best = null;
  for (const r of ROOMS) {
    const gs = S.guests.filter(g => g.state !== 'ride' && active(g) && roomOf(g) === r.id && !g.fleeing);
    if (!gs.length) continue;
    const need = gs.filter(g => g.fear < SWEET_LO + 4).length;
    if (need && (!best || need > best.need)) best = { r, need, gs };
  }
  if (best) tryScare(best.r, sc => !sc.floor && sc.id !== 'chandelier' && !best.gs.some(g => g.fear + sc.amt * g.type.fearMul > 92));
}

// ---------------- loop ----------------
function step(dt) {
  if (!S || !S.started || S.over || S.paused) return;
  S.t += dt;
  S.presence = Math.min(S.presMax, S.presence + S.regen * dt);
  for (const k in S.cooldowns) S.cooldowns[k] = Math.max(0, S.cooldowns[k] - dt);
  S.spawnT -= dt;
  const inside = S.guests.filter(g => g.state !== 'gone').length;
  const maxIn = 8 + Math.floor(C.night / 2);
  if (S.spawnT <= 0 && S.t < NIGHT_LEN * 0.7) {
    if (inside < maxIn) spawnGuest();
    S.spawnT = rand(6, 10) * Math.max(0.5, 1 - 0.05 * (C.night - 1)) * (C.upgrades.ads ? 0.8 : 1);
  }
  if (S.exorcistAt !== null && S.t >= S.exorcistAt) { S.exorcistAt = null; spawnGuest('exorcist'); }
  for (const g of S.guests) if (g.state !== 'gone') updateGuest(g, dt);
  S.guests = S.guests.filter(g => g.state !== 'gone');
  updateElevator(dt);
  updateStaff(dt);
  S.signOut = Math.max(0, S.signOut - dt);
  S.signFlickT -= dt;
  if (S.signFlickT <= 0) {
    if (Math.random() < .35) S.signOut = 1.6; else S.flickIdx = pick([0, 1, 2, 4, 9, 10]);
    S.signFlickT = rand(5, 14);
    setTimeout(() => { if (S) S.flickIdx = null; }, 350);
  }
  if (BOT) bot(dt);
  if ((S.t >= NIGHT_LEN && !S.guests.length) || S.t >= NIGHT_LEN + 45) endNight();
}

function render(dt) {
  if (!S) return;
  const live = S.paused || S.over ? 0 : dt;
  S.guests.forEach(renderGuest);
  renderStaff();
  renderElevator();
  updateFx(live);
  renderMort(live);
  renderHud(dt);
  drawSign();
}

let last = performance.now();
function frame(now) {
  const real = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (S) {
    const dt = real * S.speed * SIM_SPEED;
    const n = Math.ceil(dt / 0.05);
    for (let i = 0; i < n; i++) step(dt / n);
    render(dt);
  }
  requestAnimationFrame(frame);
}

function startNight() {
  hide();
  S = newNight();
  L.guests.innerHTML = ''; L.bubbles.innerHTML = ''; L.fx.innerHTML = '';
  mortEl = null; mort = null; effects.length = 0; floaters.length = 0; lastStars = -1; lastSign = '';
  hintEl.textContent = HINT;
  hudEls.banner.style.display = 'none';
  document.getElementById('giftshop').style.display = C.upgrades.gift ? '' : 'none';
  placeStaff();
  buildCardSlots();
  S.started = true;
}

buildScene();
buildCar();
buildHud();
buildCards();
buildHits();
C = newCampaign();
S = newNight();
placeStaff();
buildCardSlots();
hintEl.textContent = HINT;
render(0);
if (BOT) { wipe(); startNight(); }
else if (params.has('skip')) { C = load() || newCampaign(); startNight(); }
else showTitle();
window.__S = () => S;
window.__C = () => C;
window.__day = () => { C.lastDue = C.lastDue || bill(C.night - 1); C.memo = C.memo || MEMOS[2]; dayScreen(); };
requestAnimationFrame(frame);
})();
