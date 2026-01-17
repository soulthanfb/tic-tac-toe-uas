export function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

export function emptyBoard(size) {
  return Array(size * size).fill(null);
}

function idxToRC(i, size) {
  return { r: Math.floor(i / size), c: i % size };
}
function rcToIdx(r, c, size) {
  return r * size + c;
}

// Cek ada winner? return 'X'/'O'/null
export function winnerOf(board, size, winLen) {
  const line = winningLine(board, size, winLen);
  if (!line) return null;
  return board[line[0]];
}

// Return array index yang menang (panjang winLen) atau null
export function winningLine(board, size, winLen) {
  const dirs = [
    { dr: 0, dc: 1 },  // →
    { dr: 1, dc: 0 },  // ↓
    { dr: 1, dc: 1 },  // ↘
    { dr: 1, dc: -1 }, // ↙
  ];

  for (let i = 0; i < board.length; i++) {
    const mark = board[i];
    if (!mark) continue;

    const { r, c } = idxToRC(i, size);

    for (const { dr, dc } of dirs) {
      const endR = r + dr * (winLen - 1);
      const endC = c + dc * (winLen - 1);
      if (endR < 0 || endR >= size || endC < 0 || endC >= size) continue;

      const line = [];
      let ok = true;
      for (let k = 0; k < winLen; k++) {
        const rr = r + dr * k;
        const cc = c + dc * k;
        const ii = rcToIdx(rr, cc, size);
        if (board[ii] !== mark) { ok = false; break; }
        line.push(ii);
      }
      if (ok) return line;
    }
  }

  return null;
}

export function isDraw(board, size, winLen) {
  return board.every(v => v !== null) && !winnerOf(board, size, winLen);
}
