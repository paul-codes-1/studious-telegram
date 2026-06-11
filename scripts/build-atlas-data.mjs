// Build runtime election-atlas data from data-repository/elections/atlas/
//
// Inputs:
//   g2022.json / g2024.json  {precinctCode: {contestTitle: {candidateName: votes}}}
//   p2026.json               {contestId: {title, party, totals, byPrecinct}}
//
// Outputs (fetched at runtime, kept out of the JS bundle):
//   public/data/elections/g2022.json
//   public/data/elections/g2024.json
//   public/data/elections/p2026.json   all with the uniform shape:
//     {label, contests: [{key, title, party?, precincts: {code: {cand: votes}}, totals, coverage}]}
//   public/data/elections/swing.json   prebuilt Gorton 22->26 swing view:
//     {label, precincts: {code: {g22Gorton, g22Total, g22Pct, g26Gorton, g26Total, g26Pct, swing}}}
//
// Quirk handled here: 2022 precinct C115 was renamed to B115 — remapped on load.
//
// Run: node scripts/build-atlas-data.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const atlasDir = path.join(root, 'data-repository', 'elections', 'atlas');
const outDir = path.join(root, 'public', 'data', 'elections');

const PRECINCT_RENAMES_2022 = { C115: 'B115' };

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(atlasDir, file), 'utf8'));
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// Ensure contest keys are unique within an election
function assignKeys(contests) {
  const seen = new Map();
  for (const contest of contests) {
    let key = slugify(contest.title);
    if (seen.has(key)) {
      const n = seen.get(key) + 1;
      seen.set(key, n);
      key = `${key}-${n}`;
    } else {
      seen.set(key, 1);
    }
    contest.key = key;
  }
  return contests;
}

function finalizeContest(contest) {
  if (!contest.totals) {
    const totals = {};
    for (const cands of Object.values(contest.precincts)) {
      for (const [cand, votes] of Object.entries(cands)) {
        totals[cand] = (totals[cand] || 0) + votes;
      }
    }
    contest.totals = totals;
  }
  contest.coverage = Object.keys(contest.precincts).length;
  return contest;
}

// {precinct: {contest: {cand: votes}}} -> contests[], preserving first-seen contest order
function buildFromPrecinctMajor(raw, renames = {}) {
  const byTitle = new Map();
  for (const [rawCode, contestsObj] of Object.entries(raw)) {
    const code = renames[rawCode] || rawCode;
    for (const [title, cands] of Object.entries(contestsObj)) {
      if (!byTitle.has(title)) byTitle.set(title, { key: '', title, precincts: {} });
      const contest = byTitle.get(title);
      const existing = contest.precincts[code];
      if (existing) {
        // merge (only happens if a rename collides with a live code)
        for (const [cand, votes] of Object.entries(cands)) {
          existing[cand] = (existing[cand] || 0) + votes;
        }
      } else {
        contest.precincts[code] = { ...cands };
      }
    }
  }
  return assignKeys([...byTitle.values()].map(finalizeContest));
}

// {id: {title, party, totals, byPrecinct}} -> same uniform contests[] shape
function buildFromContestMajor(raw) {
  const contests = Object.entries(raw)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, c]) =>
      finalizeContest({
        key: '',
        title: c.title,
        ...(c.party && c.party !== 'NP' ? { party: c.party } : {}),
        precincts: c.byPrecinct || {},
        totals: c.totals,
      })
    );
  return assignKeys(contests);
}

function sumVotes(cands) {
  return Object.values(cands || {}).reduce((s, v) => s + v, 0);
}

function buildGortonSwing(g2022Contests, p2026Contests) {
  const mayor22 = g2022Contests.find((c) => c.title === 'MAYOR');
  const mayor26 = p2026Contests.find((c) => c.title === 'MAYOR');
  if (!mayor22 || !mayor26) throw new Error('MAYOR contest missing from 2022 or 2026 data');

  const gortonKey22 = Object.keys(mayor22.totals).find((c) => /GORTON/i.test(c));
  const gortonKey26 = Object.keys(mayor26.totals).find((c) => /GORTON/i.test(c));
  if (!gortonKey22 || !gortonKey26) throw new Error('Gorton not found in MAYOR candidates');

  const precincts = {};
  const codes = new Set([...Object.keys(mayor22.precincts), ...Object.keys(mayor26.precincts)]);
  for (const code of codes) {
    const c22 = mayor22.precincts[code];
    const c26 = mayor26.precincts[code];
    const g22Total = sumVotes(c22);
    const g26Total = sumVotes(c26);
    const g22Gorton = c22?.[gortonKey22] || 0;
    const g26Gorton = c26?.[gortonKey26] || 0;
    const g22Pct = g22Total > 0 ? (g22Gorton / g22Total) * 100 : null;
    const g26Pct = g26Total > 0 ? (g26Gorton / g26Total) * 100 : null;
    precincts[code] = {
      g22Gorton,
      g22Total,
      g22Pct,
      g26Gorton,
      g26Total,
      g26Pct,
      swing: g22Pct != null && g26Pct != null ? g26Pct - g22Pct : null,
    };
  }
  return { label: 'Special: Gorton swing 22→26', precincts };
}

function writeJson(file, data) {
  const dest = path.join(outDir, file);
  fs.writeFileSync(dest, JSON.stringify(data));
  const kb = (fs.statSync(dest).size / 1024).toFixed(0);
  console.log(`wrote ${path.relative(root, dest)} (${kb} KB)`);
}

fs.mkdirSync(outDir, { recursive: true });

const g2022 = {
  label: '2022 General',
  contests: buildFromPrecinctMajor(readJson('g2022.json'), PRECINCT_RENAMES_2022),
};
const g2024 = {
  label: '2024 General',
  contests: buildFromPrecinctMajor(readJson('g2024.json')),
};
const p2026 = {
  label: '2026 Primary',
  contests: buildFromContestMajor(readJson('p2026.json')),
};
const swing = buildGortonSwing(g2022.contests, p2026.contests);

writeJson('g2022.json', g2022);
writeJson('g2024.json', g2024);
writeJson('p2026.json', p2026);
writeJson('swing.json', swing);

// ---- sanity checks ----
for (const [name, election] of [['g2022', g2022], ['g2024', g2024], ['p2026', p2026]]) {
  const codes = new Set();
  for (const c of election.contests) Object.keys(c.precincts).forEach((p) => codes.add(p));
  console.log(`${name}: ${election.contests.length} contests, ${codes.size} precincts`);
  if (codes.has('C115')) console.warn(`WARNING: ${name} still contains C115`);
}

const mayor26 = p2026.contests.find((c) => c.title === 'MAYOR');
console.log('p2026 MAYOR A101:', JSON.stringify(mayor26.precincts.A101));
console.log(
  'p2026 MAYOR citywide Gorton/Carter:',
  mayor26.totals['Linda GORTON'],
  '/',
  mayor26.totals['Raquel E. CARTER']
);
const mayor22 = g2022.contests.find((c) => c.title === 'MAYOR');
console.log(
  '2022 MAYOR citywide Gorton/Kloiber:',
  mayor22.totals['Linda GORTON'],
  '/',
  mayor22.totals['David KLOIBER']
);
console.log('swing A101:', JSON.stringify(swing.precincts.A101));
