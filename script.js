document.getElementById("yr").textContent = new Date().getFullYear();
// mark the dock link for the section in view
const links = [...document.querySelectorAll(".dock a")];
const io = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.toggleAttribute("aria-current", a.hash === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
links.forEach((a) => { const s = document.querySelector(a.hash); if (s) io.observe(s); });
