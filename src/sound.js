const KEY = "ttt_sound_settings_v2";

function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { muted: false, volume: 0.8 };
    const obj = JSON.parse(raw);
    return {
      muted: !!obj.muted,
      volume: typeof obj.volume === "number" ? obj.volume : 0.8
    };
  } catch {
    return { muted: false, volume: 0.8 };
  }
}

function saveSettings(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export function createSound() {
  const files = {
    clickX: "./assets/sfx/clickX.mp3",
    clickO: "./assets/sfx/clickO.mp3",
    ui: "./assets/sfx/click.mp3",
    win: "./assets/sfx/win.mp3",
    draw: "./assets/sfx/draw.mp3",
    count: "./assets/sfx/count.mp3",
    start: "./assets/sfx/start.mp3",
    error: "./assets/sfx/error.mp3",
  };

  const audio = {};
  for (const k of Object.keys(files)) {
    audio[k] = new Audio(files[k]);
    audio[k].preload = "auto";
  }

  const settings = loadSettings();
  let muted = settings.muted;
  let volume = settings.volume;

  function applyVolume() {
    for (const k of Object.keys(audio)) audio[k].volume = volume;
  }
  applyVolume();

  function setMuted(v) {
    muted = !!v;
    saveSettings({ muted, volume });
  }

  function toggleMute() {
    setMuted(!muted);
    return muted;
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    applyVolume();
    saveSettings({ muted, volume });
  }

  function getVolume() { return volume; }
  function isMuted() { return muted; }

  async function unlock() {
    try {
      const a = audio.ui || audio.clickX;
      a.volume = 0;
      await a.play();
      a.pause();
      a.currentTime = 0;
      a.volume = volume;
    } catch {}
  }

  function play(name) {
    if (muted) return;
    const a = audio[name];
    if (!a) return;

    const b = a.cloneNode(true);
    b.volume = volume;
    b.play().catch(() => {});
  }

  return { play, unlock, setMuted, toggleMute, setVolume, getVolume, isMuted };
}
