/* Vintage pocket watch clock, drawn entirely with code (SVG). No images used.
 * - Shows the real local time (smooth hands + small seconds dial at 6)
 * - Every time a new hour begins, the whole watch spins 360° for 5 seconds
 */

const CONFIG = {
  dialName: "Heritage",   // text printed on the dial; change it to anything you like
  spinSeconds: 5,         // how long the hourly rotation lasts
};

const NS = "http://www.w3.org/2000/svg";
const CX = 300, CY = 400;          // dial centre
const SX = 300, SY = 517;          // small-seconds dial centre
const SERIF = '"Playfair Display","Bodoni MT","Didot","Libre Bodoni",Georgia,serif';

const $ = (id) => document.getElementById(id);

function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}

// polar -> cartesian (0° = 12 o'clock, clockwise)
function pol(r, deg, cx = CX, cy = CY) {
  const a = (deg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

/* case */
function buildCase() {
  const g = $("case");

  // bow (the ring you hang the chain from)
  el("ellipse", { cx: 300, cy: 74, rx: 62, ry: 42, fill: "none", stroke: "#3b3318", "stroke-width": 14 }, g);
  el("ellipse", { cx: 300, cy: 74, rx: 62, ry: 42, fill: "none", stroke: "url(#gold)", "stroke-width": 10 }, g);
  el("ellipse", { cx: 300, cy: 70, rx: 60, ry: 39, fill: "none", stroke: "#efe3a8", "stroke-width": 1.5, opacity: 0.6 }, g);

  // neck
  el("path", { d: "M283 150 L283 118 Q300 112 317 118 L317 150 Z", fill: "url(#goldFlat)", stroke: "#4a4120", "stroke-width": 1.5 }, g);
  el("path", { d: "M290 146 L290 124 M300 146 L300 122 M310 146 L310 124", stroke: "#4a4120", "stroke-width": 1, opacity: 0.5 }, g);

  // collar + crown (winding knob)
  el("rect", { x: 262, y: 100, width: 76, height: 22, rx: 8, fill: "url(#goldFlat)", stroke: "#4a4120", "stroke-width": 1.5 }, g);
  el("rect", { x: 274, y: 78, width: 52, height: 26, rx: 9, fill: "url(#goldFlat)", stroke: "#4a4120", "stroke-width": 1.5 }, g);
  for (let x = 279; x <= 321; x += 4) {
    el("line", { x1: x, y1: 82, x2: x, y2: 101, stroke: "#3b3318", "stroke-width": 1.2, opacity: 0.7 }, g);
  }

  // main body
  el("circle", { cx: CX, cy: CY, r: 258, fill: "#4a4120" }, g);
  el("circle", { cx: CX, cy: CY, r: 255, fill: "url(#gold)" }, g);

  // engraved band
  el("circle", { cx: CX, cy: CY, r: 249, fill: "none", stroke: "#4a4120", "stroke-width": 0.8, opacity: 0.8 }, g);
  el("circle", { cx: CX, cy: CY, r: 236, fill: "none", stroke: "#4a4120", "stroke-width": 0.8, opacity: 0.8 }, g);
  for (const [phase, color] of [[0, "#3b3318"], [Math.PI / 2, "#efe3a8"]]) {
    let d = "";
    for (let deg = 0; deg <= 360; deg += 1.5) {
      const r = 242.5 + 3.2 * Math.sin(deg * Math.PI / 180 * 48 + phase);
      const [x, y] = pol(r, deg);
      d += (deg === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2);
    }
    el("path", { d: d + "Z", fill: "none", stroke: color, "stroke-width": 1.1, opacity: 0.75 }, g);
  }

  // beaded inner edge + bezel line
  el("circle", { cx: CX, cy: CY, r: 231, fill: "none", stroke: "#2e2812", "stroke-width": 3, "stroke-dasharray": "1.4 2.2" }, g);
  el("circle", { cx: CX, cy: CY, r: 228, fill: "none", stroke: "#1c1808", "stroke-width": 2 }, g);
}

/* dial */
function buildDial() {
  const g = $("dial");
  el("circle", { cx: CX, cy: CY, r: 226, fill: "url(#dialFill)" }, g);
  el("circle", { cx: CX, cy: CY, r: 226, fill: "none", stroke: "#b9b6aa", "stroke-width": 1 }, g);

  // minute ticks (every 5th is longer + thicker)
  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0;
    const [x1, y1] = pol(major ? 206 : 212, i * 6);
    const [x2, y2] = pol(221, i * 6);
    el("line", { x1, y1, x2, y2, stroke: "#222", "stroke-width": major ? 1.8 : 1.1 }, g);
  }

  // red minute numerals, turned to face outward like the original dial
  for (let m = 5; m <= 60; m += 5) {
    const deg = (m % 60) * 6;
    const [x, y] = pol(193, deg);
    const t = el("text", {
      x, y, transform: `rotate(${deg} ${x} ${y})`,
      "text-anchor": "middle", "dominant-baseline": "central",
      "font-family": SERIF, "font-size": 15, fill: "#b23a3a",
    }, g);
    t.textContent = m;
  }

  // hour numerals (no 6: the seconds dial sits there)
  for (let h = 1; h <= 12; h++) {
    if (h === 6) continue;
    const [x, y] = pol(146, h * 30);
    const t = el("text", {
      x, y, "text-anchor": "middle", "dominant-baseline": "central",
      "font-family": SERIF, "font-size": 60, "font-weight": 800, fill: "#141414",
    }, g);
    t.textContent = h;
  }

  // dial name with little arrow ornaments either side
  const name = el("text", {
    x: CX, y: 312, "text-anchor": "middle", "dominant-baseline": "central",
    "font-family": SERIF, "font-style": "italic", "font-size": 24, fill: "#6f6a5c", opacity: 0.9,
  }, g);
  name.textContent = CONFIG.dialName;
  const nameW = CONFIG.dialName.length * 11 + 14;
  for (const s of [-1, 1]) {
    const x0 = CX + s * (nameW + 4), x1 = CX + s * (nameW + 38);
    el("line", { x1: x0, y1: 312, x2: x1, y2: 312, stroke: "#6f6a5c", "stroke-width": 1.2 }, g);
    el("path", { d: `M${x1} 312 l${-s * 8} -4 M${x1} 312 l${-s * 8} 4 M${x0 + s * 8} 312 l${s * 6} -4 M${x0 + s * 8} 312 l${s * 6} 4`, stroke: "#6f6a5c", "stroke-width": 1.2, fill: "none" }, g);
  }
}

/* seconds dial */
function buildSubdial() {
  const g = $("subdial");
  el("circle", { cx: SX, cy: SY, r: 73, fill: "url(#subFill)", stroke: "#a7a498", "stroke-width": 1.6 }, g);
  el("circle", { cx: SX, cy: SY, r: 70, fill: "none", stroke: "#fff", "stroke-width": 0.8, opacity: 0.8 }, g);

  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0;
    const [x1, y1] = pol(major ? 58 : 63, i * 6, SX, SY);
    const [x2, y2] = pol(68, i * 6, SX, SY);
    el("line", { x1, y1, x2, y2, stroke: "#222", "stroke-width": major ? 1.4 : 0.8 }, g);
  }
  const labels = [60, 10, 20, 30, 40, 50];
  labels.forEach((n, i) => {
    const [x, y] = pol(45, i * 60, SX, SY);
    const t = el("text", {
      x, y, "text-anchor": "middle", "dominant-baseline": "central",
      "font-family": SERIF, "font-size": 15, fill: "#1a1a1a",
    }, g);
    t.textContent = n;
  });
}

/* hands */
let hourHand, minuteHand, secondHand;

function buildHands() {
  const g = $("hands");

  // seconds hand (small dial, drawn first so the big hands pass over it)
  secondHand = el("g", {}, g);
  el("path", { d: `M${SX} ${SY - 60} L${SX + 2} ${SY} L${SX + 1} ${SY + 14} L${SX - 1} ${SY + 14} L${SX - 2} ${SY} Z`, fill: "#111" }, secondHand);
  el("circle", { cx: SX, cy: SY, r: 5.5, fill: "#111" }, secondHand);

  // hour hand: slim stem with a spade near the tip
  hourHand = el("g", {}, g);
  el("path", {
    d: `M${CX} ${CY - 128}
        C${CX + 4} ${CY - 112} ${CX + 12} ${CY - 92} ${CX + 11} ${CY - 78}
        C${CX + 10} ${CY - 66} ${CX + 4} ${CY - 62} ${CX + 3} ${CY - 56}
        L${CX + 3} ${CY + 22} L${CX - 3} ${CY + 22} L${CX - 3} ${CY - 56}
        C${CX - 4} ${CY - 62} ${CX - 10} ${CY - 66} ${CX - 11} ${CY - 78}
        C${CX - 12} ${CY - 92} ${CX - 4} ${CY - 112} ${CX} ${CY - 128} Z`,
    fill: "#111",
  }, hourHand);

  // minute hand: long tapered needle
  minuteHand = el("g", {}, g);
  el("path", {
    d: `M${CX} ${CY - 206} L${CX + 4.5} ${CY - 40} L${CX + 2.5} ${CY + 30} L${CX - 2.5} ${CY + 30} L${CX - 4.5} ${CY - 40} Z`,
    fill: "#0d0d28",
  }, minuteHand);

  // centre pin
  el("circle", { cx: CX, cy: CY, r: 13, fill: "#55565a" }, g);
  el("circle", { cx: CX, cy: CY, r: 13, fill: "none", stroke: "#222", "stroke-width": 2 }, g);
  el("circle", { cx: CX - 2, cy: CY - 2, r: 5, fill: "#9a9ba0" }, g);
  el("circle", { cx: CX, cy: CY, r: 2.5, fill: "#222" }, g);
}

/*  glass */
function buildGlass() {
  const g = $("glassLayer");
  el("circle", { cx: CX, cy: CY, r: 226, fill: "url(#glass)", "pointer-events": "none" }, g);
  // faint hairline crack on the glass, like the reference photo
  el("path", {
    d: "M92 650 L150 664 L205 676 L262 698 L292 715",
    fill: "none", stroke: "#fff", "stroke-width": 1, opacity: 0.55,
  }, g);
  el("path", {
    d: "M92 651.5 L150 665.5 L205 677.5 L262 699.5 L292 716.5",
    fill: "none", stroke: "#555", "stroke-width": 0.6, opacity: 0.35,
  }, g);
}

/*  clock */
function setRot(node, deg, cx, cy) {
  node.setAttribute("transform", `rotate(${deg} ${cx} ${cy})`);
}

function updateHands(now) {
  const ms = now.getMilliseconds();
  const s = now.getSeconds() + ms / 1000;
  const m = now.getMinutes() + s / 60;
  const h = (now.getHours() % 12) + m / 60;
  setRot(secondHand, s * 6, SX, SY);
  setRot(minuteHand, m * 6, CX, CY);
  setRot(hourHand, h * 30, CX, CY);
}

/* hourly 5 s rotation */
const watch = $("watch");
const spinBtn = $("spinBtn");
let spinning = false;

function spin() {
  if (spinning) return;
  spinning = true;
  spinBtn.disabled = true;
  const start = performance.now();
  const dur = CONFIG.spinSeconds * 1000;

  function frame(t) {
    const p = Math.min((t - start) / dur, 1);
    const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // ease in-out
    watch.setAttribute("transform", `rotate(${eased * 360} ${CX} ${CY})`);
    if (p < 1) {
      requestAnimationFrame(frame);
    } else {
      watch.removeAttribute("transform");
      spinning = false;
      spinBtn.disabled = false;
    }
  }
  requestAnimationFrame(frame);
}

/*main */
buildCase();
buildDial();
buildSubdial();
buildHands();
buildGlass();

const demo = new URLSearchParams(location.search).has("demo"); // ?demo spins every minute
let lastHour = new Date().getHours();
let lastMinute = new Date().getMinutes();

function tick() {
  const now = new Date();
  updateHands(now);

  if (now.getHours() !== lastHour) {
    lastHour = now.getHours();
    spin();
  }
  if (demo && now.getMinutes() !== lastMinute) {
    lastMinute = now.getMinutes();
    spin();
  }
  requestAnimationFrame(tick);
}

spinBtn.addEventListener("click", spin);
document.addEventListener("keydown", (e) => { if (e.key === "r" || e.key === "R") spin(); });
requestAnimationFrame(tick);
