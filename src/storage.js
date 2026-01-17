const KEY = "ttt_save_v3";

const defaultData = {
  emerald: 0,
  wins: 0,
  losses: 0,
  draws: 0,

  matches: 0,
  streak: 0,
  bestStreak: 0,

  // champion (best-of)
  championsX: 0,
  championsO: 0,

  // settings
  skin: "neon",     // neon | retro | candy | classic
  bestOf: 1,        // 1 = normal, 3, 5

  // leaderboard local (top emerald)
  leaderboard: []   // [{ emerald, wins, date }]
};

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaultData };
    const d = JSON.parse(raw);

    // merge supaya aman kalau ada field baru
    return {
      ...defaultData,
      ...d,
      leaderboard: Array.isArray(d.leaderboard) ? d.leaderboard : []
    };
  } catch {
    return { ...defaultData };
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}

export function updateLeaderboard(data) {
  const entry = {
    emerald: data.emerald,
    wins: data.wins,
    date: new Date().toISOString().slice(0, 10)
  };

  const list = Array.isArray(data.leaderboard) ? data.leaderboard.slice() : [];
  list.push(entry);

  // sort by emerald desc
  list.sort((a, b) => (b.emerald - a.emerald) || (b.wins - a.wins));
  data.leaderboard = list.slice(0, 5);
}
