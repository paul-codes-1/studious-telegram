# Agent Guidelines for Precincts Project

## Overview

This document provides guidance for AI agents working on the Lexington Precinct Data Map.

## Quick Start for Agents

```bash
# Ensure dependencies are installed
npm install

# If data files changed, regenerate precinct data
npm run parse-data

# Start dev server to test changes
npm run dev

# Verify build before committing
npm run build
```

## Data Processing Tasks

### Updating the Data Parser

The parser script at `scripts/parse-results.js` handles:
- Parsing `results.txt` (election results in a specific text format)
- Merging with GeoJSON boundary files
- Merging with Census demographic data
- Calculating derived fields (percentages, margins)
- Outputting to `src/data/precincts.json`

**Important patterns in results.txt:**
- Precinct headers: `A101-ALEXANDRIA` followed by `361 ballots cast`
- Candidate lines: `Donald J. TRUMP` followed by vote counts
- Section markers: `Cast Votes:`, `Undervotes:`, `Overvotes:`
- Numbers and percentages alternate on separate lines

**When modifying the parser:**
1. Test with `npm run parse-data`
2. Verify output: `node -e "console.log(require('./src/data/precincts.json').features[0].properties)"`
3. Check counts match expected (286 precincts, 281 with results)

### Adding New Data Fields

1. Add field extraction in `parseResults()` function
2. Add to precinct object initialization
3. Add to output properties in the feature builder
4. Update `PrecinctDetail.jsx` if field should be displayed

## React Component Tasks

### Component Hierarchy

```
App.jsx
├── FilterPanel.jsx (left sidebar)
├── Legend.jsx (left sidebar)
├── PrecinctMap.jsx (main view - map mode)
├── PrecinctTable.jsx (main view - table mode)
└── PrecinctDetail.jsx (right sidebar - when precinct selected)
```

### Adding a New Filter

1. **App.jsx**: Add to `filters` state object with default value
2. **App.jsx**: Add filtering logic in `filteredData` useMemo
3. **FilterPanel.jsx**: Add UI control and change handler
4. **FilterPanel.jsx**: Update `resetFilters()` to include new filter

Example filter addition:
```jsx
// In App.jsx state
const [filters, setFilters] = useState({
  // ... existing filters
  newFilter: defaultValue
});

// In filteredData useMemo
if (filters.newFilter && !matchesCondition(p, filters.newFilter)) {
  return false;
}
```

### Modifying the Map

`PrecinctMap.jsx` uses react-leaflet with GeoJSON overlay:
- `getStyle()` - controls fill color and border styling
- `onEachFeature()` - sets up tooltips and click handlers
- Color comes from `getMarginColor()` in `utils/colorScale.js`

### Modifying the Table

`PrecinctTable.jsx` features:
- Sortable columns via `sortConfig` state
- Click-to-select rows
- Uses same color scale for margin indicator

To add a column:
1. Add `<SortHeader>` in thead
2. Add `<td>` in the row mapping
3. Ensure property exists in precinct data

### Modifying the Detail Panel

`PrecinctDetail.jsx` uses `<Section>` and `<StatRow>` helper components:
- `<Section title="...">` creates a labeled group
- `<StatRow label="..." value="..." subValue="...">` creates a data row

## Styling Guidelines

- Use Tailwind CSS classes exclusively
- Color palette: gray for neutral, blue for Democrat/selected, red for Republican
- Consistent spacing: `mb-4` between sections, `p-4` for panel padding
- Text sizes: `text-sm` for labels, `text-xs` for hints

## Testing Checklist

Before committing changes:

- [ ] `npm run build` succeeds without errors
- [ ] Map renders and colors precincts correctly
- [ ] Clicking precinct opens detail panel with correct data
- [ ] Table view sorts correctly on all columns
- [ ] Filters work independently and in combination
- [ ] Reset filters returns to default state
- [ ] No console errors in browser dev tools

## File Locations Reference

| Task | File(s) |
|------|---------|
| Parse election data | `scripts/parse-results.js` |
| Color scale logic | `src/utils/colorScale.js` |
| Main app layout | `src/App.jsx` |
| Map rendering | `src/components/PrecinctMap.jsx` |
| Table rendering | `src/components/PrecinctTable.jsx` |
| Precinct details | `src/components/PrecinctDetail.jsx` |
| Filter controls | `src/components/FilterPanel.jsx` |
| Global styles | `src/index.css` |
| Generated data | `src/data/precincts.json` |

## Common Issues

### "Cannot find module './data/precincts.json'"
Run `npm run parse-data` to generate the data file.

### Map not showing colors
Check that `margin` field exists and is a number in precinct properties.

### Filters not working
Ensure filter state is initialized in App.jsx and included in resetFilters().

### Build warnings about chunk size
This is expected due to Leaflet library size. Can be ignored for this project.
