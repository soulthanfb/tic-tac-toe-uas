import { createUI } from "./ui.js";
import {
  createGame,
  setBoardConfig,
  resetRound,
  canPlay,
  placeMark,
  getResult,
  runCountdown,
  botTurnIfNeeded
} from "./game.js";
import { loadData, saveData } from "./storage.js";
import { sleep, winningLine } from "./utils.js";
import { createDifficultySlider } from "./difficulty_slider.js";
import { createSizeCarousel } from "./size_carousel.js";
import { createSound } from "./sound.js";

const ui = createUI();
const sfx = createSound();
const state = createGame();
let data = loadData();

// ---------- Helpers (anti error) ----------
const $ = (id) => document.getElementById(id);
const on = (el, evt, fn, opt) => el && el.addEventListener(evt, fn, opt);

// ---------- Top init ----------
ui.renderStats?.(data);
ui.setModeText?.("Pilih lawan");
ui.setTheme?.("normal");

// ===== Apply size =====
function applySize(size) {
  setBoardConfig(state, size);
  ui.buildBoard?.(size);
  ui.setSizeHint?.(size, state.winLen);
}
applySize(3);

// ===== Carousel size =====
createSizeCarousel(ui, (size) => {
  applySize(size);
});

// ===== Difficulty slider =====
let selectedDiff = "normal";
const slider = createDifficultySlider(ui, (diff) => {
  selectedDiff = diff;
  state.difficulty = diff;
});

// ===== NAV DRAWER open/close (fallback kalau ui.el tidak lengkap) =====
const navOverlay = ui.el?.navOverlay || $("navOverlay");
const navDrawer  = ui.el?.navDrawer  || $("navDrawer");
const btnNav      = ui.el?.btnNav     || $("btnNav");
const btnNavClose = ui.el?.btnNavClose|| $("btnNavClose");

function openNav() {
  navOverlay?.classList.remove("hidden");
  navDrawer?.classList.remove("hidden");
  navDrawer?.setAttribute("aria-hidden", "false");
}
function closeNav() {
  navOverlay?.classList.add("hidden");
  navDrawer?.classList.add("hidden");
  navDrawer?.setAttribute("aria-hidden", "true");
}

on(btnNav, "click", () => { sfx.play?.("ui"); openNav(); });
on(btnNavClose, "click", () => { sfx.play?.("ui"); closeNav(); });
on(navOverlay, "click", () => closeNav());

// ===== NAV TABS (Statistik / Leaderboard / Info) =====
const navLinks = document.querySelectorAll(".navLink");
const tabPanels = document.querySelectorAll(".tabPanel"); // FIX: ambil semuanya termasuk infoTab

function showTab(id){
  tabPanels.forEach(p => p.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) target.classList.add("active");

  navLinks.forEach(b => b.classList.remove("active"));
  navLinks.forEach(b => {
    if (b.dataset.nav === id) b.classList.add("active");
  });
}

navLinks.forEach(btn => {
  on(btn, "click", () => {
    sfx.play?.("ui");
    showTab(btn.dataset.nav);
    closeNav();
  });
});

// Default tab
showTab("statsTab");

// ===== Audio UI (Mute + Volume) =====
const btnMute = ui.el?.btnMute || $("btnMute");
const volSlider = ui.el?.volSlider || $("volSlider");

function updateMuteIcon() {
  if (!btnMute) return;
  const muted = sfx.isMuted?.() ?? false;
  btnMute.textContent = muted ? "🔇" : "🔊";
}

on(btnMute, "click", () => {
  sfx.play?.("ui");
  sfx.toggleMute?.();
  updateMuteIcon();
});

on(volSlider, "input", () => {
  const v = Number(volSlider.value || 0) / 100;
  sfx.setVolume?.(v);
});

// init audio UI
updateMuteIcon();
if (volSlider) {
  const current = Math.round((sfx.getVolume?.() ?? 0.8) * 100);
  volSlider.value = String(current);
}

// Unlock audio on first interaction (important di browser)
window.addEventListener("pointerdown", () => sfx.unlock?.(), { once: true });

// ===== Skin + BestOf =====
const skinSelect = ui.el?.skinSelect || $("skinSelect");
const bestOfSelect = ui.el?.bestOfSelect || $("bestOfSelect");

on(skinSelect, "change", () => {
  const skin = skinSelect.value;
  document.body.dataset.skin = skin;
  sfx.play?.("ui");
});

on(bestOfSelect, "change", () => {
  const n = Number(bestOfSelect.value || 1);
  state.bestOf = n;
  ui.setSeriesText?.(state.series, state.bestOf);
  sfx.play?.("ui");
});

// ===== Electron extras (optional) =====
const btnFullscreen = $("btnFullscreen");
const btnCheckUpdate = $("btnCheckUpdate");
const updateStatus = $("updateStatus");

on(btnFullscreen, "click", async () => {
  sfx.play?.("ui");

  if (!window.electronAPI?.toggleFullscreen) {
    if (updateStatus) updateStatus.textContent = "Fullscreen hanya tersedia di aplikasi.";
    return;
  }

  // kalau electron-main.js return boolean, ini bisa ON/OFF
  const isFs = await window.electronAPI.toggleFullscreen();
  if (updateStatus) updateStatus.textContent = isFs ? "Fullscreen: ON ✅" : "Fullscreen: OFF";
});

on(btnCheckUpdate, "click", () => {
  sfx.play?.("ui");
  if (updateStatus) updateStatus.textContent = "Checking update...";
  window.electronAPI?.checkUpdates?.();
});

window.electronAPI?.onUpdateStatus?.((msg) => {
  if (updateStatus) updateStatus.textContent = msg;
});




// ===== Navigation screens =====
function goMenu() {
  ui.showScreen?.("screenMenu");
  ui.setModeText?.("Pilih lawan");
  ui.showPause?.(false);
  ui.setTheme?.("normal");
  ui.hideWinBanner?.();
}

function goDifficulty() {
  ui.showScreen?.("screenDifficulty");
  ui.setModeText?.("VS Bot • pilih difficulty");
  slider.setDifficulty?.(state.difficulty || "normal");
}

async function startGame() {
  ui.showScreen?.("screenGame");
  ui.showPause?.(false);
  ui.hideWinBanner?.();

  // label mode
  if (state.mode === "human") {
    ui.setModeText?.(`VS Human • ${state.size}×${state.size}`);
    ui.setTheme?.("normal");
  } else {
    ui.setModeText?.(`VS Bot • ${String(state.difficulty || "normal").toUpperCase()} • ${state.size}×${state.size}`);
    ui.setTheme?.(state.difficulty || "normal");
  }

  resetRound(state);
  ui.hideWinLine?.();
  ui.renderBoard?.(state.board, true);
  ui.setTurnText?.("Get ready...");

  await runCountdown(ui, state, sfx);

  ui.renderBoard?.(state.board, state.locked);
  ui.setTurnText?.(state.mode === "human" ? "X turn" : "Your turn");
  ui.setSeriesText?.(state.series, state.bestOf);
}

async function endRound(result) {
  state.finished = true;
  state.locked = true;

  // show win line
  const line = winningLine(state.board, state.size, state.winLen);
  if (line) ui.showWinLine?.(line);

  if (result.type === "draw") {
    sfx.play?.("draw");
    ui.setTurnText?.("Draw! Restarting...");
    data.draws += 1;
    saveData(data);
    ui.renderStats?.(data);

    await sleep(900);
    await startGame();
    return;
  }

  // WIN banner (BLUE= X, RED= O)
  sfx.play?.("win");
  ui.showWinBanner?.(result.winner);

  if (result.winner === "X") {
    data.wins += 1;
    data.emerald += 20;
    data.streak = (data.streak || 0) + 1;
    data.bestStreak = Math.max(data.bestStreak || 0, data.streak);
    data.champX = (data.champX || 0) + 1;
  } else {
    data.losses += 1;
    data.streak = 0;
    data.champO = (data.champO || 0) + 1;
  }

  saveData(data);
  ui.renderStats?.(data);

  await sleep(1200);
  await startGame();
}

// ===== EVENTS =====

// Menu: pilih lawan
on(ui.el?.btnVsBot || $("btnVsBot"), "click", () => {
  sfx.play?.("ui");
  state.mode = "bot";
  state.difficulty = selectedDiff || "normal";
  goDifficulty();
});

on(ui.el?.btnVsHuman || $("btnVsHuman"), "click", async () => {
  sfx.play?.("ui");
  state.mode = "human";
  await startGame();
});

on(ui.el?.btnPlayDiff || $("btnPlayDiff"), "click", async () => {
  sfx.play?.("ui");
  state.mode = "bot";
  state.difficulty = selectedDiff || "normal";
  await startGame();
});

// board click
const boardEl = ui.el?.board || $("board");
on(boardEl, "click", async (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;

  const idx = Number(cell.dataset.idx);

  // invalid move -> shake + error sfx
  if (!canPlay(state, idx)) {
    sfx.play?.("error");
    boardEl.classList.remove("shake");
    // reflow
    void boardEl.offsetWidth;
    boardEl.classList.add("shake");
    return;
  }

  // VS Human
  if (state.mode === "human") {
    // state.turn harus toggle di game.js; kita percaya placeMark mengubah turn
    const played = state.turn; // X atau O sebelum place
    placeMark(state, idx, played);
    sfx.play?.(played === "X" ? "clickX" : "clickO");

    ui.renderBoard?.(state.board, state.locked);

    let result = getResult(state);
    if (result) { await endRound(result); return; }

    ui.setTurnText?.(state.turn === "X" ? "X turn" : "O turn");
    return;
  }

  // VS Bot: player selalu X
  if (state.turn !== "X") return;

  placeMark(state, idx, "X");
  sfx.play?.("clickX");
  ui.renderBoard?.(state.board, state.locked);

  let result = getResult(state);
  if (result) { await endRound(result); return; }

  ui.setTurnText?.("Bot turn");

  await botTurnIfNeeded(ui, state, sfx);
  // botTurnIfNeeded bisa taruh O sendiri; kita render ulang
  ui.renderBoard?.(state.board, state.locked);

  result = getResult(state);
  if (result) { await endRound(result); return; }

  ui.setTurnText?.("Your turn");
});

// Pause / Resume / Restart / Menu
on(ui.el?.btnPause || $("btnPause"), "click", () => {
  sfx.play?.("ui");
  state.locked = true;
  ui.showPause?.(true);
});

on(ui.el?.btnResume || $("btnResume"), "click", () => {
  sfx.play?.("ui");
  ui.showPause?.(false);
  state.locked = false;
});

on(ui.el?.btnMenu || $("btnMenu"), "click", () => {
  sfx.play?.("ui");
  ui.showPause?.(false);
  goMenu();
});

on(ui.el?.btnRestart || $("btnRestart"), "click", () => {
  sfx.play?.("ui");
  startGame();
});

on(ui.el?.btnRestart2 || $("btnRestart2"), "click", () => {
  sfx.play?.("ui");
  ui.showPause?.(false);
  startGame();
});

// start
goMenu();
