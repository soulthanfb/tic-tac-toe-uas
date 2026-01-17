import { emptyBoard, winnerOf, isDraw, sleep } from "./utils.js";
import { botPickMove } from "./ai.js";

export function createGame() {
  return {
    mode: "bot",
    difficulty: "normal",
    size: 3,
    winLen: 3,

    board: emptyBoard(3),
    turn: "X",
    locked: true,
    finished: false,

    // series
    bestOf: 1, // 1 / 3 / 5
    seriesX: 0,
    seriesO: 0,
  };
}

export function setBoardConfig(state, size) {
  state.size = size;
  if (size === 3) state.winLen = 3;
  else if (size === 6) state.winLen = 4;
  else state.winLen = 5;
}

export function setBestOf(state, bestOf) {
  state.bestOf = bestOf;
  state.seriesX = 0;
  state.seriesO = 0;
}

export function resetRound(state) {
  state.board = emptyBoard(state.size);
  state.turn = "X";
  state.locked = true;
  state.finished = false;
}

export function canPlay(state, idx) {
  return !state.locked && !state.finished && state.board[idx] === null;
}

export function placeMark(state, idx, mark) {
  state.board[idx] = mark;
  state.turn = (mark === "X") ? "O" : "X";
}

export function getResult(state) {
  const w = winnerOf(state.board, state.size, state.winLen);
  if (w) return { type: "win", winner: w };
  if (isDraw(state.board, state.size, state.winLen)) return { type: "draw" };
  return null;
}

export async function runCountdown(ui, state, sfx) {
  state.locked = true;
  ui.showCountdown(true);

  for (let n = 3; n >= 1; n--) {
    ui.setCountdownNumber(n);
    if (sfx) sfx.play("count");
    await sleep(650);
  }

  ui.showCountdown(false);
  if (sfx) sfx.play("start");
  state.locked = false;
}

export async function botTurnIfNeeded(ui, state) {
  if (state.mode !== "bot") return;
  if (state.turn !== "O") return;
  if (state.finished) return;

  state.locked = true;
  ui.setTurnText("Bot thinking...");

  await sleep(250);

  const move = botPickMove(
    state.board.slice(),
    state.size,
    state.winLen,
    state.difficulty,
    "O",
    "X"
  );

  if (move !== null && state.board[move] === null) {
    placeMark(state, move, "O");
  }

  state.locked = false;
  ui.setTurnText("Your turn");
}
