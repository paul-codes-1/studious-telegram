import { scaleLinear } from 'd3-scale';

// Create a diverging color scale for presidential margin
// Negative margin = Democrat (blue), Positive margin = Republican (red)
export const marginColorScale = scaleLinear()
  .domain([-50, 0, 50])
  .range(['#0571b0', '#ffffff', '#ca0020'])
  .clamp(true);

// Get color for a given margin
export function getMarginColor(margin) {
  return marginColorScale(margin);
}

// Get text description of margin
export function getMarginLabel(margin) {
  if (margin < -10) return 'Strong D';
  if (margin < -5) return 'Lean D';
  if (margin < 5) return 'Swing';
  if (margin < 10) return 'Lean R';
  return 'Strong R';
}

// ---- Atlas (multi-election) scales ----

// No-data fill for precincts outside a contest's coverage
export const NO_DATA_COLOR = '#d1d5db';

// Pole colors for the two citywide-leading candidates in a contest.
// Positive margin = citywide leader (candidate 1) ahead in the precinct.
export const CAND1_COLOR = '#2166ac';
export const CAND2_COLOR = '#b2182b';

export const contestMarginScale = scaleLinear()
  .domain([-50, 0, 50])
  .range([CAND2_COLOR, '#ffffff', CAND1_COLOR])
  .clamp(true);

// Categorical palette for candidates, indexed by citywide rank
const CANDIDATE_PALETTE = [
  '#2166ac', // blue
  '#b2182b', // red
  '#1b7837', // green
  '#762a83', // purple
  '#e08214', // orange
  '#0891b2', // cyan
  '#b8860b', // dark gold
  '#c51b7d', // magenta
];

export function getCandidateColor(rankIndex) {
  return CANDIDATE_PALETTE[rankIndex] ?? '#6b7280';
}

// Shade a candidate color by their share of the vote (leader-share mode)
export function getShareColor(color, sharePct) {
  return scaleLinear()
    .domain([20, 80])
    .range(['#ffffff', color])
    .clamp(true)(sharePct);
}

// Sequential scale for votes cast in contest (turnout mode)
export function makeTurnoutScale(maxVotes) {
  return scaleLinear()
    .domain([0, Math.max(maxVotes, 1)])
    .range(['#ffffff', '#0f766e'])
    .clamp(true);
}

// Diverging scale for the Gorton 22→26 swing view
// Negative = Gorton lost ground (red), positive = gained (blue)
export const swingColorScale = scaleLinear()
  .domain([-40, 0, 40])
  .range(['#b2182b', '#f7f7f7', '#2166ac'])
  .clamp(true);

export function getSwingColor(swing) {
  return swing == null ? NO_DATA_COLOR : swingColorScale(swing);
}

// Shorten "Linda GORTON" -> "Gorton" for compact labels
export function shortName(name) {
  const cleaned = name.replace(/\s*\(W\)\s*$/, '').split('/')[0].trim();
  const caps = cleaned.match(/[A-Z][A-Z'.-]+(?:\s+(?:JR|SR|II|III|IV)\.?)?$/);
  if (caps) {
    const word = caps[0].replace(/\s+(JR|SR|II|III|IV)\.?$/, '');
    return word.charAt(0) + word.slice(1).toLowerCase();
  }
  return cleaned.split(' ').pop();
}

// Format percentage
export function formatPct(value, decimals = 1) {
  return `${value.toFixed(decimals)}%`;
}

// Format number with commas
export function formatNumber(num) {
  return num.toLocaleString();
}
