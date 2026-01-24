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

// Format percentage
export function formatPct(value, decimals = 1) {
  return `${value.toFixed(decimals)}%`;
}

// Format number with commas
export function formatNumber(num) {
  return num.toLocaleString();
}
