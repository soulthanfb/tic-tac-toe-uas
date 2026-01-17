// Slider positions: 0 = easy, 1 = normal, 2 = hard
const levels = ["easy", "normal", "hard"];
const names  = ["EASY", "NORMAL", "HARD"];
const avatars = ["🥺", "🙂", "😈"];

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export function createDifficultySlider(ui, onChange) {
  const slider = ui.el.diffSlider;
  const thumb  = ui.el.diffThumb;
  const fill   = ui.el.diffFill;
  const nameEl = ui.el.diffName;
  const avatarEl = ui.el.diffAvatar;

  let valueIndex = 1; // default normal
  let dragging = false;

  function setIndex(idx, trigger = true) {
    valueIndex = clamp(idx, 0, 2);

    const rect = slider.getBoundingClientRect();
    const stops = [0.16, 0.50, 0.84]; // posisi visual (biar cakep)
    const x = rect.width * stops[valueIndex];

    thumb.style.left = `${x}px`;
    fill.style.width = `${(x / rect.width) * 100}%`;

    nameEl.textContent = names[valueIndex];
    avatarEl.textContent = avatars[valueIndex];

    const diff = levels[valueIndex];
    ui.setTheme(diff);

    if (trigger) onChange(diff);
  }

  function indexFromClientX(clientX) {
    const rect = slider.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const ratio = x / rect.width;

    // pilih stop terdekat
    const stops = [0.16, 0.50, 0.84];
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < stops.length; i++) {
      const d = Math.abs(ratio - stops[i]);
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  function onDown(e) {
    dragging = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setIndex(indexFromClientX(clientX));
  }

  function onMove(e) {
    if (!dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setIndex(indexFromClientX(clientX));
  }

  function onUp() {
    dragging = false;
  }

  // drag thumb
  thumb.addEventListener("mousedown", onDown);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);

  // touch support
  thumb.addEventListener("touchstart", onDown, { passive: true });
  window.addEventListener("touchmove", onMove, { passive: true });
  window.addEventListener("touchend", onUp);

  // click track also works
  slider.addEventListener("click", (e) => {
    setIndex(indexFromClientX(e.clientX));
  });

  // initial
  // tunggu layout sedikit supaya width kebaca
  setTimeout(() => setIndex(1, true), 0);

  return {
    getDifficulty: () => levels[valueIndex],
    setDifficulty: (diff) => {
      const idx = levels.indexOf(diff);
      setIndex(idx === -1 ? 1 : idx, true);
    }
  };
}
