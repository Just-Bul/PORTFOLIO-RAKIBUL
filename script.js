document.getElementById("yr").textContent = new Date().getFullYear();
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
  const cv = document.getElementById("cv"), cx = cv.getContext("2d");
  const W = cv.width, H = cv.height, BW = 96, BH = 12;
  const sc = document.getElementById("sc"), lv = document.getElementById("lv"), btn = document.getElementById("play");
  let bx, items, score, lives, run = false, last = 0, spawn = 0;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const speed = reduced ? 0.6 : 1;

  function reset() { bx = W / 2 - BW / 2; items = []; score = 0; lives = 3; spawn = 0; hud(); }
  function hud() { sc.textContent = score; lv.textContent = lives; }
  function move(clientX) { const r = cv.getBoundingClientRect(); bx = Math.max(0, Math.min(W - BW, (clientX - r.left) * (W / r.width) - BW / 2)); }
  function draw(msg) {
    cx.fillStyle = "#14110f"; cx.fillRect(0, 0, W, H);
    cx.strokeStyle = "#ffffff10";
    for (let x = 0; x < W; x += 40) { cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, H); cx.stroke(); }
    items.forEach((i) => { cx.fillStyle = i.bad ? "#e5484d" : "#f5a524"; cx.beginPath(); cx.arc(i.x, i.y, 9, 0, 7); cx.fill(); });
    cx.fillStyle = "#f4efe7"; cx.fillRect(bx, H - 28, BW, BH);
    if (msg) { cx.fillStyle = "#f4efe7"; cx.font = "700 24px system-ui"; cx.textAlign = "center"; cx.fillText(msg, W / 2, H / 2); }
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
    if (lives <= 0) { run = false; btn.textContent = "Play again"; draw("Game over: " + score); return; }
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
