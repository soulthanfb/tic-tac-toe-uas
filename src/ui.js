export function createUI() {
  const el = {
    screenMenu: document.querySelector("#screenMenu"),
    screenDifficulty: document.querySelector("#screenDifficulty"),
    screenGame: document.querySelector("#screenGame"),

    btnVsBot: document.querySelector("#btnVsBot"),
    btnVsHuman: document.querySelector("#btnVsHuman"),

    board: document.querySelector("#board"),
    turnText: document.querySelector("#turnText"),
    modeText: document.querySelector("#modeText"),

    emeraldValue: document.querySelector("#emeraldValue"),

    // score old
    scoreWins: document.querySelector("#scoreWins"),
    scoreLosses: document.querySelector("#scoreLosses"),
    scoreDraws: document.querySelector("#scoreDraws"),

    btnPause: document.querySelector("#btnPause"),
    btnRestart: document.querySelector("#btnRestart"),

    pauseOverlay: document.querySelector("#pauseOverlay"),
    btnResume: document.querySelector("#btnResume"),
    btnMenu: document.querySelector("#btnMenu"),
    btnRestart2: document.querySelector("#btnRestart2"),

    countdownOverlay: document.querySelector("#countdownOverlay"),
    countNumber: document.querySelector("#countNumber"),

    // difficulty slider
    diffSlider: document.querySelector("#diffSlider"),
    diffThumb: document.querySelector("#diffThumb"),
    diffFill: document.querySelector("#diffFill"),
    diffName: document.querySelector("#diffName"),
    diffAvatar: document.querySelector("#diffAvatar"),
    btnPlayDiff: document.querySelector("#btnPlayDiff"),

    // carousel
    carViewport: document.querySelector("#carViewport"),
    carPrev: document.querySelector("#carPrev"),
    carNext: document.querySelector("#carNext"),
    carDots: document.querySelector("#carDots"),
    sizeHint: document.querySelector("#sizeHint"),

    // win banner
    winBanner: document.querySelector("#winBanner"),
    winText: document.querySelector("#winText"),

    // sound UI
    btnMute: document.querySelector("#btnMute"),
    volSlider: document.querySelector("#volSlider"),

    // new menu widgets (added by HTML below)
    rankName: document.querySelector("#rankName"),
    rankBar: document.querySelector("#rankBar"),
    rankNext: document.querySelector("#rankNext"),
    leaderboardList: document.querySelector("#leaderboardList"),

    skinSelect: document.querySelector("#skinSelect"),
    bestOfSelect: document.querySelector("#bestOfSelect"),

    statMatches: document.querySelector("#statMatches"),
    statStreak: document.querySelector("#statStreak"),
    statBestStreak: document.querySelector("#statBestStreak"),
    statWinRate: document.querySelector("#statWinRate"),
    statChampX: document.querySelector("#statChampX"),
    statChampO: document.querySelector("#statChampO"),

    seriesText: document.querySelector("#seriesText"),
  };

  // win line overlay
  const winLine = document.createElement("div");
  winLine.className = "winLine";
  el.board.appendChild(winLine);
  el.winLine = winLine;

  let cells = [];
  let lastBoard = [];

  function buildBoard(size) {
    el.board.style.setProperty("--n", String(size));
    el.board.innerHTML = "";
    el.board.appendChild(el.winLine);

    cells = [];
    for (let i = 0; i < size * size; i++) {
      const c = document.createElement("button");
      c.className = "cell";
      c.dataset.idx = String(i);
      c.type = "button";
      el.board.appendChild(c);
      cells.push(c);
    }
    lastBoard = Array(size * size).fill(null);
  }

  function showScreen(which) {
    el.screenMenu.classList.remove("active");
    el.screenDifficulty.classList.remove("active");
    el.screenGame.classList.remove("active");
    el[which].classList.add("active");
  }

  function renderBoard(board, locked) {
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const mark = board[i] ?? "";
      const prev = lastBoard[i];

      cell.textContent = mark;

      if (mark === "X" || mark === "O") cell.dataset.mark = mark;
      else cell.removeAttribute("data-mark");

      // animasi hanya ketika baru diisi
      if (!prev && (mark === "X" || mark === "O")) {
        cell.classList.remove("popX", "popO");
        // trigger reflow
        void cell.offsetWidth;
        cell.classList.add(mark === "X" ? "popX" : "popO");
      }

      cell.classList.toggle("disabled", locked || board[i] !== null);
      lastBoard[i] = board[i];
    }
  }

  function setTurnText(text) { el.turnText.textContent = text; }
  function setModeText(text) { el.modeText.textContent = text; }

  function showPause(show) { el.pauseOverlay.classList.toggle("hidden", !show); }
  function showCountdown(show) { el.countdownOverlay.classList.toggle("hidden", !show); }
  function setCountdownNumber(n) { el.countNumber.textContent = String(n); }

  function hideWinLine() { el.winLine.classList.remove("show"); }

  function showWinLine(indices) {
    if (!indices || indices.length < 2) return;

    const startIdx = indices[0];
    const endIdx = indices[indices.length - 1];

    const startCell = cells[startIdx];
    const endCell = cells[endIdx];
    if (!startCell || !endCell) return;

    const boardRect = el.board.getBoundingClientRect();
    const a = startCell.getBoundingClientRect();
    const b = endCell.getBoundingClientRect();

    const ax = (a.left + a.right) / 2 - boardRect.left;
    const ay = (a.top + a.bottom) / 2 - boardRect.top;
    const bx = (b.left + b.right) / 2 - boardRect.left;
    const by = (b.top + b.bottom) / 2 - boardRect.top;

    const dx = bx - ax;
    const dy = by - ay;
    const length = Math.sqrt(dx*dx + dy*dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;

    el.winLine.style.left = `${ax}px`;
    el.winLine.style.top = `${ay}px`;
    el.winLine.style.width = `${length}px`;
    el.winLine.style.transform = `translateY(-50%) rotate(${angle}deg)`;
    el.winLine.classList.add("show");
  }

  function setTheme(theme) {
    document.body.setAttribute("data-theme", theme);
  }

  function setSkin(skin) {
    document.body.setAttribute("data-skin", skin);
  }

  function setSizeHint(size, winLen) {
    el.sizeHint.textContent = `Win: ${winLen} beruntun • Size: ${size}×${size}`;
  }

  function showWinBanner(winner, textOverride) {
    el.winBanner.classList.remove("hidden");

    el.winText.classList.remove("blue", "red");
    void el.winText.offsetWidth;

    if (winner === "X") {
      el.winText.textContent = textOverride || "BLUE WIN";
      el.winText.classList.add("blue");
    } else {
      el.winText.textContent = textOverride || "RED WIN";
      el.winText.classList.add("red");
    }
  }

  function hideWinBanner() {
    el.winBanner.classList.add("hidden");
  }

  // invalid move shake
  function shakeCell(idx) {
    const cell = cells[idx];
    if (!cell) return;
    cell.classList.remove("shake");
    void cell.offsetWidth;
    cell.classList.add("shake");
  }

  // rank
  const RANKS = [
    { name: "BRONZE", min: 0, next: 100 },
    { name: "SILVER", min: 100, next: 250 },
    { name: "GOLD", min: 250, next: 500 },
    { name: "DIAMOND", min: 500, next: 1000 },
    { name: "LEGEND", min: 1000, next: null },
  ];

  function rankFromEmerald(emerald) {
    let r = RANKS[0];
    for (const x of RANKS) if (emerald >= x.min) r = x;
    return r;
  }

  function renderLeaderboard(list) {
    if (!el.leaderboardList) return;
    el.leaderboardList.innerHTML = "";
    if (!list || !list.length) {
      el.leaderboardList.innerHTML = `<div class="lbEmpty">Belum ada leaderboard.</div>`;
      return;
    }

    list.forEach((it, i) => {
      const row = document.createElement("div");
      row.className = "lbRow";
      row.innerHTML = `
        <div class="lbRank">#${i + 1}</div>
        <div class="lbMain">
          <div class="lbScore">💎 ${it.emerald}</div>
          <div class="lbMeta">${it.date} • wins ${it.wins}</div>
        </div>
      `;
      el.leaderboardList.appendChild(row);
    });
  }

  function renderStats(data) {
    el.emeraldValue.textContent = data.emerald;
    el.scoreWins.textContent = data.wins;
    el.scoreLosses.textContent = data.losses;
    el.scoreDraws.textContent = data.draws;

    if (el.statMatches) el.statMatches.textContent = data.matches;
    if (el.statStreak) el.statStreak.textContent = data.streak;
    if (el.statBestStreak) el.statBestStreak.textContent = data.bestStreak;

    const played = data.wins + data.losses + data.draws;
    const winRate = played > 0 ? Math.round((data.wins / played) * 100) : 0;
    if (el.statWinRate) el.statWinRate.textContent = `${winRate}%`;

    if (el.statChampX) el.statChampX.textContent = data.championsX;
    if (el.statChampO) el.statChampO.textContent = data.championsO;

    // rank UI
    if (el.rankName && el.rankBar && el.rankNext) {
      const r = rankFromEmerald(data.emerald);
      el.rankName.textContent = r.name;

      if (r.next === null) {
        el.rankBar.style.width = "100%";
        el.rankNext.textContent = "MAX";
      } else {
        const span = r.next - r.min;
        const cur = data.emerald - r.min;
        const pct = span > 0 ? Math.max(0, Math.min(1, cur / span)) : 0;
        el.rankBar.style.width = `${Math.round(pct * 100)}%`;
        el.rankNext.textContent = `${r.next - data.emerald} 💎 lagi ke ${RANKS[RANKS.findIndex(x=>x.name===r.name)+1]?.name || "NEXT"}`;
      }
    }

    // leaderboard UI
    renderLeaderboard(data.leaderboard);
  }

  function setSeriesText(text) {
    if (!el.seriesText) return;
    el.seriesText.textContent = text || "";
  }

  // init
  buildBoard(3);
  hideWinLine();
  hideWinBanner();

  return {
    el,
    showScreen,
    buildBoard,
    renderBoard,
    setTurnText,
    setModeText,
    showPause,
    showCountdown,
    setCountdownNumber,
    renderStats,
    showWinLine,
    hideWinLine,
    setTheme,
    setSkin,
    setSizeHint,
    showWinBanner,
    hideWinBanner,
    shakeCell,
    setSeriesText,
  };
}
