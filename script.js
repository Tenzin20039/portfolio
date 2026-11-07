/* =========================================================
   "Packets & Prayer Flags": interactivity & animation
   ========================================================= */

// ---------- Skills shown on the network map and table ----------
// group must be one of: Frontend, Backend, Networks, Tools
const SKILLS = [
  { name: "HTML", group: "Frontend", used: "Every project, including this site" },
  { name: "CSS", group: "Frontend", used: "JNEC Events Hub, Task List API front end, this site" },
  { name: "JavaScript", group: "Frontend", used: "Task List API front end, this site's animations and skill map" },
  { name: "Node.js", group: "Backend", used: "Task List API (SYD204)" },
  { name: "Express", group: "Backend", used: "Task List API: REST routes and MVC structure" },
  { name: "MySQL", group: "Backend", used: "Task List API database on Aiven Cloud" },
  { name: "Networking", group: "Networks", used: "Computer System and Network programme at JNEC" },
  { name: "Packet Tracer", group: "Networks", used: "Building and simulating network topologies in class" },
  { name: "Git & GitHub", group: "Tools", used: "Version control for all my projects" },
  { name: "Vercel", group: "Tools", used: "Deploying my first portfolio (student_portfolio)" },
];

const GROUPS = {
  Frontend: { color: "var(--blue)", x: 200, y: 165 },
  Backend: { color: "var(--red)", x: 600, y: 165 },
  Networks: { color: "var(--yellow)", x: 200, y: 395 },
  Tools: { color: "var(--green)", x: 600, y: 395 },
};

const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const FLAG_COLORS = ["var(--blue)", "var(--white)", "var(--red)", "var(--green)", "var(--yellow)"];

/* ---------- Day / night theme ---------- */
const themeToggle = document.getElementById("themeToggle");

function setTheme(theme, save = true) {
  root.classList.add("theme-anim");
  root.setAttribute("data-theme", theme);
  themeToggle.setAttribute("aria-label", theme === "night" ? "Switch to day mode" : "Switch to night mode");
  if (save) { try { localStorage.setItem("theme", theme); } catch { /* storage unavailable */ } }
  setTimeout(() => root.classList.remove("theme-anim"), 700);
}
setTheme(root.getAttribute("data-theme") || "day", false);
themeToggle.addEventListener("click", () => setTheme(root.getAttribute("data-theme") === "night" ? "day" : "night"));

/* ---------- Mobile menu ---------- */
const navbar = document.getElementById("navbar");
const navLinks = document.getElementById("navLinks");
const hamburger = document.getElementById("hamburger");

function setMenu(open) {
  navLinks.classList.toggle("open", open);
  hamburger.classList.toggle("open", open);
  hamburger.setAttribute("aria-expanded", String(open));
  hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
hamburger.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
document.addEventListener("click", (e) => { if (!navbar.contains(e.target)) setMenu(false); });

/* ---------- Scroll: navbar, mountain parallax, learning trail ---------- */
const mountains = document.querySelectorAll(".mountains .m");
const hero = document.getElementById("home");
const trailBox = document.querySelector(".hops-wrap");
const trailFill = document.getElementById("trailFill");
const hiker = document.getElementById("hiker");
let ticking = false;

function onScroll() {
  const y = window.scrollY;
  navbar.classList.toggle("scrolled", y > 10);

  if (!reduceMotion && y < hero.offsetHeight) {
    // Far ridges rise faster than near ones, which gives a sense of depth
    mountains.forEach((m, i) => { m.style.transform = `translateY(${-y * [0.1, 0.05, 0][i]}px)`; });
  }

  // The trail fills as the education section scrolls past, and the hiker walks along it
  const r = trailBox.getBoundingClientRect();
  const p = Math.min(Math.max((innerHeight * 0.7 - r.top) / r.height, 0), 1);
  trailFill.style.height = `${p * 100}%`;
  hiker.style.top = `${p * 100}%`;

  ticking = false;
}
window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.querySelectorAll(".nav-link").forEach((l) => {
      l.classList.toggle("active", l.getAttribute("href") === `#${entry.target.id}`);
    });
  });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section[id]").forEach((s) => sectionObserver.observe(s));

/* ---------- Name letters that swing in like hanging flags ---------- */
(function swingName() {
  const h1 = document.querySelector(".hero-name");
  let i = 0;
  // Wrap every letter (including inside <em>) in its own span
  h1.querySelectorAll("[data-swing]").forEach((line) => {
    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest(".name-dot") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach((node) => {
      const frag = document.createDocumentFragment();
      for (const ch of node.textContent) {
        const s = document.createElement("span");
        s.className = "swing-char";
        s.setAttribute("aria-hidden", "true");
        s.textContent = ch;
        s.style.setProperty("--i", i++);
        frag.appendChild(s);
      }
      node.replaceWith(frag);
    });
  });

  // Once they have landed, letters sway again when you hover them
  setTimeout(() => h1.classList.add("done"), reduceMotion ? 0 : i * 70 + 1600);
  h1.addEventListener("mouseover", (e) => {
    const c = e.target.closest(".swing-char");
    if (!c || !h1.classList.contains("done") || c.classList.contains("sway")) return;
    c.classList.add("sway");
    c.addEventListener("animationend", () => c.classList.remove("sway"), { once: true });
  });
})();

/* ---------- Prayer flags that react to the wind ---------- */
let flagPins = [];

function buildFlags() {
  const box = document.getElementById("flags");
  const w = box.clientWidth;
  const small = w < 640;
  const flagW = small ? 22 : 30;
  const gap = small ? 34 : 50;
  const sag = Math.min(55, w * 0.05);
  const top = 10;
  const count = Math.max(7, Math.floor(w / gap));

  // Rope sags like a real string of flags: y = top + 4·sag·t·(1−t)
  let html = `<svg aria-hidden="true"><path d="M0 ${top} Q ${w / 2} ${top + sag * 2} ${w} ${top}" /></svg>`;
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const x = t * w - flagW / 2;
    const y = top + 4 * sag * t * (1 - t);
    html += `<span class="flag-pin" style="left:${x}px;top:${y}px"><span class="flag${i % 5 === 1 ? " is-white" : ""}" style="--c:${FLAG_COLORS[i % 5]};animation-delay:${(-i * 0.23).toFixed(2)}s;animation-duration:${(2.4 + (i % 3) * 0.35).toFixed(2)}s"></span></span>`;
  }
  box.innerHTML = html;
  flagPins = [...box.querySelectorAll(".flag-pin")].map((el) => ({ el, x: el.offsetLeft + flagW / 2 }));
}
buildFlags();

// Moving the mouse quickly across the sky creates a gust. Flags near the cursor swing hardest.
(function wind() {
  if (reduceMotion) return;
  let gust = 0, lastX = null, lastT = 0, cursorX = -9999, dir = 1;

  hero.addEventListener("pointermove", (e) => {
    const now = performance.now();
    if (lastX !== null) {
      const speed = Math.abs(e.clientX - lastX) / Math.max(now - lastT, 1);
      gust = Math.min(1, gust + speed * 0.12);
      dir = e.clientX >= lastX ? 1 : -1;
    }
    lastX = e.clientX; lastT = now; cursorX = e.clientX;
  });

  (function loop(t) {
    gust *= 0.965;
    if (gust > 0.01) {
      flagPins.forEach((f, i) => {
        const near = Math.max(0, 1 - Math.abs(f.x - cursorX) / 500);
        const strength = gust * (0.35 + near * 0.65);
        const angle = dir * strength * 28 + Math.sin(t / 90 + i * 0.7) * strength * 10;
        f.el.style.transform = `rotate(${angle.toFixed(2)}deg) skewY(${(-angle * 0.3).toFixed(2)}deg)`;
      });
    } else if (gust !== 0) {
      gust = 0;
      flagPins.forEach((f) => { f.el.style.transform = ""; });
    }
    requestAnimationFrame(loop);
  })(0);

  // Soft wind streaks drifting across the sky
  const windBox = document.getElementById("wind");
  let html = "";
  for (let i = 0; i < 9; i++) {
    html += `<span class="streak" style="top:${(10 + Math.random() * 65).toFixed(1)}%;width:${(80 + Math.random() * 140).toFixed(0)}px;animation-duration:${(6 + Math.random() * 6).toFixed(1)}s;animation-delay:${(-Math.random() * 10).toFixed(1)}s"></span>`;
  }
  windBox.innerHTML = html;
})();

/* ---------- Toss paper lungta into the wind ---------- */
const confettiBox = document.getElementById("confetti");

function tossLungta(x, y, count = 22) {
  if (reduceMotion) return;
  const box = confettiBox.getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.className = "lungta";
    piece.style.setProperty("--c", FLAG_COLORS[i % 5]);
    piece.style.left = `${x - box.left}px`;
    piece.style.top = `${y - box.top}px`;
    confettiBox.appendChild(piece);

    // Thrown upward, carried sideways by the wind, then slowly falling and spinning
    const up = 180 + Math.random() * 220;
    const drift = 220 + Math.random() * 380;
    const spin = (Math.random() - 0.5) * 1080;
    const flip = Math.random() * 720;
    const duration = 2600 + Math.random() * 1800;
    piece.animate([
      { transform: "translate(0, 0) rotate(0) rotateY(0)", opacity: 1 },
      { transform: `translate(${drift * 0.3}px, ${-up}px) rotate(${spin * 0.4}deg) rotateY(${flip * 0.5}deg)`, opacity: 1, offset: 0.3 },
      { transform: `translate(${drift}px, ${-up * 0.2}px) rotate(${spin}deg) rotateY(${flip}deg)`, opacity: 0 },
    ], { duration, easing: "cubic-bezier(0.2, 0.7, 0.4, 1)", delay: Math.random() * 120 }).onfinish = () => piece.remove();
  }
}

document.getElementById("tossBtn").addEventListener("click", (e) => {
  e.stopPropagation();
  const r = e.currentTarget.getBoundingClientRect();
  tossLungta(r.left + 24, r.top + r.height / 2, 30);
});

// Click or tap on empty sky (not on links, buttons or the photo)
hero.addEventListener("click", (e) => {
  if (e.target.closest("a, button, .stamp-wrap, .hero-text p, h1")) return;
  tossLungta(e.clientX, e.clientY);
});

/* ---------- Night sky stars ---------- */
(function stars() {
  const sky = document.getElementById("stars");
  let html = "";
  for (let i = 0; i < 90; i++) {
    const size = (Math.random() * 1.8 + 0.6).toFixed(1);
    html += `<span class="star" style="left:${(Math.random() * 100).toFixed(2)}%;top:${(Math.random() * 70).toFixed(2)}%;width:${size}px;height:${size}px;animation-delay:${(Math.random() * 3).toFixed(2)}s"></span>`;
  }
  sky.innerHTML = html;
})();

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(buildFlags, 150);
});

/* ---------- Skill network map ---------- */
(function topology() {
  const svg = document.getElementById("topology");
  const info = document.getElementById("nodeInfo");
  const NS = "http://www.w3.org/2000/svg";
  const C = { x: 400, y: 280 };
  const el = (tag, attrs = {}, parent = svg) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    parent.appendChild(n);
    return n;
  };
  svg.setAttribute("viewBox", "0 0 800 560");

  const linksLayer = el("g");
  const packetsLayer = el("g");
  const nodesLayer = el("g");

  // Main links: me -> each skill group
  for (const g of Object.values(GROUPS)) {
    g.trunk = el("line", { x1: C.x, y1: C.y, x2: g.x, y2: g.y, class: "link trunk" }, linksLayer);
    g.trunk.style.stroke = g.color;
  }

  // Skills arranged in a fan around their group, pointing away from the centre
  for (const [name, g] of Object.entries(GROUPS)) {
    const items = SKILLS.filter((s) => s.group === name);
    const base = Math.atan2(g.y - C.y, g.x - C.x);
    const spread = items.length > 1 ? (110 * Math.PI) / 180 : 0;
    items.forEach((skill, i) => {
      const a = items.length > 1 ? base - spread / 2 + (spread * i) / (items.length - 1) : base;
      const x = Math.round(g.x + Math.cos(a) * 112);
      const y = Math.round(g.y + Math.sin(a) * 112);
      const link = el("line", { x1: g.x, y1: g.y, x2: x, y2: y, class: "link" }, linksLayer);

      const node = el("g", { class: "node", tabindex: "0", role: "button", "aria-label": `${skill.name}, ${name}. Used in: ${skill.used}` }, nodesLayer);
      const dot = el("circle", { cx: x, cy: y, r: 9 }, node);
      dot.style.stroke = g.color;
      const below = Math.sin(a) > -0.2;
      const label = el("text", { x, y: below ? y + 28 : y - 18, "text-anchor": "middle" }, node);
      label.textContent = skill.name;

      // A little packet travelling me -> group -> skill
      if (!reduceMotion) {
        const p = el("circle", { r: 4, class: "packet-dot" }, packetsLayer);
        p.style.fill = g.color;
        const dur = (3 + Math.random() * 2).toFixed(2);
        el("animateMotion", { dur: `${dur}s`, repeatCount: "indefinite", begin: `-${(Math.random() * dur).toFixed(2)}s`, path: `M${C.x} ${C.y} L${g.x} ${g.y} L${x} ${y}` }, p);
        skill.packet = p;
      }
      Object.assign(skill, { node, link, hub: g, groupName: name });

      const show = () => trace(skill);
      node.addEventListener("mouseenter", show);
      node.addEventListener("focus", show);
      node.addEventListener("click", (e) => { e.stopPropagation(); show(); });
      node.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(); } });
      node.addEventListener("mouseleave", reset);
      node.addEventListener("blur", reset);
    });
  }

  // Group labels
  for (const [name, g] of Object.entries(GROUPS)) {
    const hub = el("g", { class: "hub" }, nodesLayer);
    const w = name.length * 9 + 28;
    const r = el("rect", { x: g.x - w / 2, y: g.y - 16, width: w, height: 32, rx: 8 }, hub);
    r.style.fill = g.color;
    const t = el("text", { x: g.x, y: g.y + 5, "text-anchor": "middle" }, hub);
    t.textContent = name.toLowerCase();
    g.hub = hub;
  }

  // Me, in the centre
  const defs = el("defs");
  const clip = el("clipPath", { id: "meClip" }, defs);
  el("circle", { cx: C.x, cy: C.y, r: 40 }, clip);
  el("circle", { cx: C.x, cy: C.y, r: 50, class: "me-ring" }, nodesLayer);
  el("image", { href: "image/profile.jpg", x: C.x - 40, y: C.y - 40, width: 80, height: 80, preserveAspectRatio: "xMidYMid slice", "clip-path": "url(#meClip)" }, nodesLayer);
  const me = el("text", { x: C.x, y: C.y + 74, "text-anchor": "middle", class: "me-label" }, nodesLayer);
  me.textContent = "me";

  const defaultInfo = info.innerHTML;

  function trace(skill) {
    svg.classList.add("tracing");
    svg.querySelectorAll(".on").forEach((n) => n.classList.remove("on"));
    [skill.node, skill.link, skill.hub.trunk, skill.hub.hub, skill.packet].forEach((n) => n && n.classList.add("on"));
    info.innerHTML = `
      <span class="node-info-label">${esc(skill.groupName)}</span>
      <h3>${esc(skill.name)}</h3>
      <p><strong>Where I've used it:</strong> ${esc(skill.used)}</p>
      <p class="route">me → ${esc(skill.groupName.toLowerCase())} → ${esc(skill.name)}</p>`;
  }
  function reset() {
    svg.classList.remove("tracing");
    svg.querySelectorAll(".on").forEach((n) => n.classList.remove("on"));
    info.innerHTML = defaultInfo;
  }
  svg.addEventListener("click", reset);

  // Phones: tappable skill tags that fill the same info card
  const chipList = document.getElementById("skillChips");
  SKILLS.forEach((skill) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.style.setProperty("--c", GROUPS[skill.group].color);
    btn.textContent = skill.name;
    btn.addEventListener("click", () => {
      chipList.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === btn));
      trace(skill);
    });
    li.appendChild(btn);
    chipList.appendChild(li);
  });
})();

/* ---------- Scroll reveal + live stats ---------- */
document.querySelectorAll(".hop").forEach((h, i) => h.style.setProperty("--i", i));
// Postmarks land one after another along each row of stamps
document.querySelectorAll(".cert").forEach((c, i) => c.style.setProperty("--n", i % 4));

const STATS = {
  projects: document.querySelectorAll(".packet").length,
  skills: SKILLS.length,
};

function countUp(el, target) {
  if (reduceMotion) { el.textContent = target; return; }
  const start = performance.now();
  (function step(now) {
    const p = Math.min((now - start) / 1200, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  })(start);
}

const revealer = new IntersectionObserver((entries, obs) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("in");
    entry.target.querySelectorAll("[data-stat]").forEach((s) => countUp(s, STATS[s.dataset.stat]));
    obs.unobserve(entry.target);
  });
}, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".reveal").forEach((el) => revealer.observe(el));

/* ---------- Project filter ---------- */
const filters = document.querySelectorAll(".filter");
const packets = document.querySelectorAll(".packet");

filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    filters.forEach((b) => b.classList.toggle("active", b === btn));
    const f = btn.dataset.filter;
    packets.forEach((p) => {
      const show = f === "all" || p.dataset.type === f;
      p.classList.toggle("hidden", !show);
      if (show) {
        p.classList.add("in");
        p.classList.remove("pop");
        void p.offsetWidth;
        p.classList.add("pop");
      }
    });
  });
});

/* ---------- Contact postcard ---------- */
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");

const validators = {
  name: (v) => (v.trim().length >= 2 ? "" : "Please write your name."),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Please enter a valid email address."),
  message: (v) => (v.trim().length >= 10 ? "" : "Your message should be at least 10 characters."),
};

function validate(input) {
  const msg = validators[input.name](input.value);
  const field = input.closest(".field");
  field.classList.remove("invalid");
  if (msg) { void field.offsetWidth; field.classList.add("invalid"); }
  field.querySelector(".error").textContent = msg;
  return !msg;
}

Object.keys(validators).forEach((n) => {
  const input = form.elements[n];
  input.addEventListener("blur", () => { if (input.value) validate(input); });
  input.addEventListener("input", () => { if (input.closest(".field").classList.contains("invalid")) validate(input); });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  statusEl.className = "form-status";
  statusEl.textContent = "";
  const inputs = Object.keys(validators).map((n) => form.elements[n]);
  const ok = inputs.map(validate);
  if (!ok.every(Boolean)) { inputs[ok.indexOf(false)].focus(); return; }

  const { name, email, message } = form.elements;
  const subject = encodeURIComponent(`Portfolio message from ${name.value.trim()}`);
  const body = encodeURIComponent(`${message.value.trim()}\n\n— ${name.value.trim()} (${email.value.trim()})`);

  // The postcard flies off, then a fresh one slides back in
  form.classList.remove("flying");
  void form.offsetWidth;
  form.classList.add("flying");
  form.addEventListener("animationend", () => form.classList.remove("flying"), { once: true });

  setTimeout(() => {
    // A static site has no server, so the message is handed to the visitor's email app.
    window.location.href = `mailto:${form.dataset.email}?subject=${subject}&body=${body}`;
    statusEl.textContent = "✓ Your postcard is on its way. Your email app should open, so just press send!";
    statusEl.classList.add("ok");
    form.reset();
  }, reduceMotion ? 0 : 900);
});

/* ---------- Footer year + hero entrance ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
onScroll();
requestAnimationFrame(() => document.body.classList.add("ready"));
