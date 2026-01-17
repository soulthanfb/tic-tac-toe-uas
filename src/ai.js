import { winningLine } from "./utils.js";

function availableMoves(board) {
  const moves = [];
  for (let i = 0; i < board.length; i++) if (!board[i]) moves.push(i);
  return moves;
}

function randomMove(board) {
  const moves = availableMoves(board);
  return moves.length ? moves[Math.floor(Math.random() * moves.length)] : null;
}

function nearCenterMove(board, size) {
  const moves = availableMoves(board);
  if (!moves.length) return null;

  const center = (size - 1) / 2;
  let best = moves[0];
  let bestD = Infinity;

  for (const m of moves) {
    const r = Math.floor(m / size);
    const c = m % size;
    const d = Math.abs(r - center) + Math.abs(c - center);
    if (d < bestD) { bestD = d; best = m; }
  }
  return best;
}

function tryImmediate(board, size, winLen, mark) {
  const moves = availableMoves(board);
  for (const m of moves) {
    board[m] = mark;
    const line = winningLine(board, size, winLen);
    board[m] = null;
    if (line) return m;
  }
  return null;
}

// heuristic: nilai move berdasarkan potensi membuat garis (tanpa block)
function scoreMove(board, size, winLen, move, me, opp) {
  const r0 = Math.floor(move / size);
  const c0 = move % size;

  const dirs = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
  ];

  function inBounds(r, c) {
    return r >= 0 && r < size && c >= 0 && c < size;
  }

  // hitung score untuk "window" sepanjang winLen yang mengandung cell (r0,c0)
  let score = 0;

  for (const { dr, dc } of dirs) {
    // geser start window dari -(winLen-1) .. 0
    for (let shift = -(winLen - 1); shift <= 0; shift++) {
      const sr = r0 + dr * shift;
      const sc = c0 + dc * shift;
      const er = sr + dr * (winLen - 1);
      const ec = sc + dc * (winLen - 1);
      if (!inBounds(sr, sc) || !inBounds(er, ec)) continue;

      let meCount = 0;
      let oppCount = 0;

      for (let k = 0; k < winLen; k++) {
        const rr = sr + dr * k;
        const cc = sc + dc * k;
        const idx = rr * size + cc;
        const v = (idx === move) ? me : board[idx];
        if (v === me) meCount++;
        else if (v === opp) oppCount++;
      }

      // kalau window sudah terkontaminasi lawan, skip
      if (oppCount > 0 && meCount > 0) continue;

      // prefer semakin banyak meCount, semakin tinggi
      if (oppCount === 0) {
        // bobot eksponensial biar 4-in-row lebih penting
        score += Math.pow(10, meCount);
      } else if (meCount === 0) {
        // juga pertimbangkan blocking (lebih kecil dari menyerang)
        score += Math.pow(8, oppCount);
      }
    }
  }

  // bonus: dekat center
  const center = (size - 1) / 2;
  score += 50 - (Math.abs(r0 - center) + Math.abs(c0 - center)) * 2;

  return score;
}

/* Minimax khusus 3x3 (tetap) */
function bestMoveHard3(board, me, other) {
  function winner3(b) {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6],
    ];
    for (const [a,b1,c] of lines) {
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
    }
    return null;
  }

  function score(b, turn) {
    const w = winner3(b);
    if (w === me) return 10;
    if (w === other) return -10;
    if (b.every(v => v !== null)) return 0;

    const moves = [];
    for (let i = 0; i < 9; i++) if (!b[i]) moves.push(i);

    let best = (turn === me) ? -Infinity : Infinity;
    for (const m of moves) {
      b[m] = turn;
      const s = score(b, turn === me ? other : me);
      b[m] = null;
      best = (turn === me) ? Math.max(best, s) : Math.min(best, s);
    }
    return best;
  }

  const moves = [];
  for (let i = 0; i < 9; i++) if (!board[i]) moves.push(i);

  let bestS = -Infinity;
  let bestM = moves[0];

  for (const m of moves) {
    board[m] = me;
    const s = score(board, other);
    board[m] = null;
    if (s > bestS) { bestS = s; bestM = m; }
  }
  return bestM;
}

export function botPickMove(board, size, winLen, difficulty, botMark="O", playerMark="X") {
  // 3x3 hard: minimax
  if (size === 3 && difficulty === "hard") {
    return bestMoveHard3(board, botMark, playerMark);
  }

  if (difficulty === "easy") return randomMove(board);

  // normal/hard: win -> block -> heuristic
  const winNow = tryImmediate(board, size, winLen, botMark);
  if (winNow !== null) return winNow;

  const block = tryImmediate(board, size, winLen, playerMark);
  if (block !== null) return block;

  const moves = availableMoves(board);
  if (!moves.length) return null;

  // normal sedikit random, hard full best
  if (difficulty === "normal" && Math.random() < 0.25) {
    const c = nearCenterMove(board, size);
    return c ?? randomMove(board);
  }

  let best = moves[0];
  let bestScore = -Infinity;

  for (const m of moves) {
    const sc = scoreMove(board, size, winLen, m, botMark, playerMark);
    if (sc > bestScore) { bestScore = sc; best = m; }
  }

  return best;
}
