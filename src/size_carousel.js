export function createSizeCarousel(ui, onChange) {
  const viewport = ui.el.carViewport;
  const prev = ui.el.carPrev;
  const next = ui.el.carNext;
  const dotsWrap = ui.el.carDots;

  const sizes = [3, 6, 9, 11];
  let index = 0;

  // bungkus slides jadi track supaya bisa geser
  const slides = [...viewport.children];
  viewport.innerHTML = "";
  const track = document.createElement("div");
  track.className = "carTrack";
  slides.forEach(s => track.appendChild(s));
  viewport.appendChild(track);

  // dots
  dotsWrap.innerHTML = "";
  const dots = sizes.map((_, i) => {
    const d = document.createElement("div");
    d.className = "dot" + (i === index ? " active" : "");
    d.addEventListener("click", () => setIndex(i, true));
    dotsWrap.appendChild(d);
    return d;
  });

  function setIndex(i, trigger = true) {
    index = (i + sizes.length) % sizes.length;
    track.style.transform = `translateX(${-index * 100}%)`;
    dots.forEach((d, k) => d.classList.toggle("active", k === index));
    if (trigger) onChange(sizes[index]);
  }

  prev.addEventListener("click", () => setIndex(index - 1, true));
  next.addEventListener("click", () => setIndex(index + 1, true));

  // swipe
  let startX = 0;
  let dragging = false;

  viewport.addEventListener("touchstart", (e) => {
    dragging = true;
    startX = e.touches[0].clientX;
  }, { passive: true });

  viewport.addEventListener("touchend", (e) => {
    if (!dragging) return;
    dragging = false;
    const endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : startX;
    const dx = endX - startX;
    if (Math.abs(dx) < 35) return;
    if (dx < 0) setIndex(index + 1, true);
    else setIndex(index - 1, true);
  }, { passive: true });

  // mouse drag (desktop)
  viewport.addEventListener("mousedown", (e) => {
    dragging = true;
    startX = e.clientX;
  });
  window.addEventListener("mouseup", (e) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - startX;
    if (Math.abs(dx) < 35) return;
    if (dx < 0) setIndex(index + 1, true);
    else setIndex(index - 1, true);
  });

  // init
  setIndex(0, true);

  return {
    getSize: () => sizes[index],
    setSize: (size) => {
      const i = sizes.indexOf(size);
      setIndex(i === -1 ? 0 : i, true);
    }
  };
}
