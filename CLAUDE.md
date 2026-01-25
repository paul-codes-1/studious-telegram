# Lexington Precinct Data Map

A React application for visualizing Lexington/Fayette County, KY precinct data with election results, demographics, and local race information.

## Project Overview

This tool displays a color-coded map of 286 voting precincts based on 2024 presidential election results, with detailed demographics, turnout data, and local race information.

## Tech Stack

- **Vite** - Build tool and dev server
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Leaflet + react-leaflet** - Interactive map rendering
- **d3-scale** - Color interpolation for margin visualization

## Project Structure

```
/precincts
├── data-repository/          # Raw source data (gitignored from main repo)
│   ├── results.txt           # 2024 election results by precinct
│   ├── Voting_Precinct_*.geojson    # Precinct boundaries
│   ├── Census_2020_-_Race_*.geojson # Demographics
│   └── Census_2020_-_Occupancy_*.geojson # Housing data
├── scripts/
│   └── parse-results.js      # Data processing script
├── src/
│   ├── components/
│   │   ├── App.jsx           # Main layout
│   │   ├── PrecinctMap.jsx   # Leaflet choropleth map
│   │   ├── PrecinctTable.jsx # Sortable data table
│   │   ├── PrecinctDetail.jsx # Selected precinct sidebar
│   │   ├── FilterPanel.jsx   # Search and filter controls
│   │   └── Legend.jsx        # Color scale legend
│   ├── data/
│   │   └── precincts.json    # Generated merged dataset
│   ├── utils/
│   │   └── colorScale.js     # D3 color scale utilities
│   ├── main.jsx              # React entry point
│   └── index.css             # Tailwind + Leaflet styles
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Key Commands

```bash
# Install dependencies
npm install

# Process raw data into precincts.json
npm run parse-data

# Start development server
npm run dev

# Build for production
npm run build
```

## Data Pipeline

1. Raw data lives in `data-repository/` (election results + GeoJSON files)
2. `scripts/parse-results.js` parses and merges all data sources
3. Output goes to `src/data/precincts.json` with 286 precinct features
4. React app loads this static JSON at build time

## Precinct Data Schema

Each precinct in `precincts.json` contains:

- **Identifiers**: `code`, `name`
- **Presidential 2024**: `trump`, `harris`, `trumpPct`, `harrisPct`, `margin`
- **Voting Methods**: `earlyVoting`, `electionDay`, `absentee`
- **Amendment 2 (Parks Tax)**: `amendment2For`, `amendment2Against`, `amendment2ForPct`
- **Council**: `councilDistrict`, `councilResults[]`
- **Demographics**: `population`, `white`, `black`, `asian`, `hispanic` (counts and percentages)
- **Housing**: `totalUnits`, `occupied`, `vacant`, `occupancyRate`
- **Districts**: `legislative`, `senatorial`
- **Derived**: `turnoutPct`, `ballotsCast`

## Color Scale

Presidential margin uses a diverging blue-white-red scale:
- **Blue** (negative margin): Democrat lean
- **White** (zero): Even/swing
- **Red** (positive margin): Republican lean

Range: -50% to +50%, clamped

## Filters

- **Search**: Filter by precinct name or code
- **Margin Range**: Slider for D+100 to R+100
- **Quick Filters**: Safe D, Swing, Safe R presets
- **Min Turnout**: Filter by turnout percentage
- **Council District**: Multi-select by district (1-12)

## Common Tasks

### Regenerating precinct data
If source data changes, re-run the parser:
```bash
npm run parse-data
```

### Adding new filters
1. Add filter state to `App.jsx`
2. Add filtering logic in the `filteredData` useMemo
3. Add UI controls in `FilterPanel.jsx`

### Modifying precinct detail view
Edit `src/components/PrecinctDetail.jsx` to add/remove data sections.

### Changing color scale
Edit `src/utils/colorScale.js` to adjust domain or color range.
