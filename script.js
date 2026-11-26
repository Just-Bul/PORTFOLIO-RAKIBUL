const $ = (id) => document.getElementById(id);
$("yr").textContent = new Date().getFullYear();

// theme toggle (saved per browser)
const root = document.documentElement;
try { const t = localStorage.getItem("theme"); if (t) root.dataset.theme = t; } catch (e) {}
$("theme").addEventListener("click", () => {
  const dark = getComputedStyle(root).getPropertyValue("--bg").trim() === "#070707";
  root.dataset.theme = dark ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
});

// copy email
$("copy").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText("justbul.work@gmail.com"); $("copied").textContent = "Email copied"; }
  catch (e) { $("copied").textContent = "Copy failed"; }
});

// about tabs
const tabs = [...document.querySelectorAll('[role="tab"]')];
function pick(t) {
  tabs.forEach((b) => {
    const on = b === t;
    b.setAttribute("aria-selected", on);
    b.tabIndex = on ? 0 : -1;
    $(b.getAttribute("aria-controls")).hidden = !on;
  });
  t.focus();
}
tabs.forEach((t, i) => {
  t.addEventListener("click", () => pick(t));
  t.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") pick(tabs[(i + 1) % tabs.length]);
    if (e.key === "ArrowLeft") pick(tabs[(i + tabs.length - 1) % tabs.length]);
  });
});

// mark the dock link for the section in view
const links = [...document.querySelectorAll(".dock a")];
const io = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.toggleAttribute("aria-current", a.hash === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
links.forEach((a) => { const s = document.querySelector(a.hash); if (s) io.observe(s); });

// Circuit Catch: slide the board, catch amber signals, dodge red shorts
(() => {
  const cv = $("cv"), cx = cv.getContext("2d");
  const W = cv.width, H = cv.height, BW = 96, BH = 12;
  const sc = $("sc"), lv = $("lv"), btn = $("play");
  let bx, items, score, lives, run = false, last = 0, spawn = 0;
  const speed = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0.6 : 1;

  function reset() { bx = W / 2 - BW / 2; items = []; score = 0; lives = 3; spawn = 0; hud(); }
  function hud() { sc.textContent = score; lv.textContent = lives; }
  function move(clientX) { const r = cv.getBoundingClientRect(); bx = Math.max(0, Math.min(W - BW, (clientX - r.left) * (W / r.width) - BW / 2)); }
  function draw(msg) {
    cx.fillStyle = "#0c0b0a"; cx.fillRect(0, 0, W, H);
    cx.fillStyle = "#ffffff12";
    for (let x = 16; x < W; x += 24) for (let y = 16; y < H; y += 24) cx.fillRect(x, y, 2, 2);
    items.forEach((i) => { cx.fillStyle = i.bad ? "#e5484d" : "#ffb020"; cx.beginPath(); cx.arc(i.x, i.y, 9, 0, 7); cx.fill(); });
    cx.fillStyle = "#f6f1ea"; cx.fillRect(bx, H - 28, BW, BH);
    if (msg) { cx.fillStyle = "#f6f1ea"; cx.font = "600 26px system-ui"; cx.textAlign = "center"; cx.fillText(msg, W / 2, H / 2); }
  }
  function tick(t) {
    if (!run) return;
    const dt = Math.min(32, t - last) / 16; last = t;
    spawn -= dt;
    if (spawn <= 0) { items.push({ x: 12 + Math.random() * (W - 24), y: -10, bad: Math.random() < 0.3 }); spawn = 38 - Math.min(20, score); }
    items.forEach((i) => (i.y += (2.2 + score * 0.04) * speed * dt));
    items = items.filter((i) => {
      if (i.y > H - 28 && i.y < H - 12 && i.x > bx - 6 && i.x < bx + BW + 6) { if (i.bad) lives--; else score++; hud(); return false; }
      if (i.y > H + 10) { if (!i.bad) { lives--; hud(); } return false; }
      return true;
    });
    if (lives <= 0) { run = false; btn.textContent = "Play again"; draw("Game over"); return; }
    draw(); requestAnimationFrame(tick);
  }
  btn.addEventListener("click", () => { reset(); run = true; last = performance.now(); requestAnimationFrame(tick); btn.blur(); });
  cv.addEventListener("pointermove", (e) => move(e.clientX));
  addEventListener("keydown", (e) => {
    if (!run || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    e.preventDefault(); bx = Math.max(0, Math.min(W - BW, bx + (e.key === "ArrowLeft" ? -28 : 28)));
  });
  reset(); draw("Press Play");
})();
