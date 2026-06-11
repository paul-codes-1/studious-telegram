// Per-precinct derived stats for a selected contest.
// "Margin" is the signed gap between the two citywide-leading candidates,
// as a percentage of votes cast in that precinct's contest
// (positive = citywide leader ahead in the precinct).
export function computeContestStats(contest) {
  if (!contest) return null;

  const ranked = Object.entries(contest.totals)
    .filter(([, votes]) => votes > 0)
    .sort((a, b) => b[1] - a[1]);
  const candIndex = new Map(ranked.map(([name], i) => [name, i]));
  const cand1 = ranked[0]?.[0] ?? null;
  const cand2 = ranked[1]?.[0] ?? null;

  const byCode = {};
  let maxVotes = 0;
  for (const [code, cands] of Object.entries(contest.precincts)) {
    const entries = Object.entries(cands).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((sum, [, votes]) => sum + votes, 0);
    if (total === 0) {
      byCode[code] = { total: 0, entries, margin: null, leaderName: null, leaderShare: null, leaderIdx: null };
      continue;
    }
    const v1 = (cand1 && cands[cand1]) || 0;
    const v2 = (cand2 && cands[cand2]) || 0;
    const [leaderName, leaderVotes] = entries[0];
    byCode[code] = {
      total,
      entries,
      margin: ((v1 - v2) / total) * 100,
      leaderName,
      leaderShare: (leaderVotes / total) * 100,
      leaderIdx: candIndex.get(leaderName) ?? 99,
    };
    if (total > maxVotes) maxVotes = total;
  }

  return { ranked, candIndex, byCode, maxVotes, cand1, cand2 };
}
