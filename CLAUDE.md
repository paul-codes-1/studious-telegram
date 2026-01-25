# Lexington Map Layers

Interactive map of Lexington/Fayette County, KY with toggleable GIS layers.

## Tech Stack

- **Vite** - Build tool
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Leaflet + react-leaflet** - Map rendering

## Project Structure

```
/precincts
├── data-repository/          # Raw GeoJSON source files (not in build)
├── public/
│   └── tree-canopy.json      # Large files loaded dynamically
├── src/
│   ├── components/
│   │   ├── App.jsx           # Main app with layer state
│   │   ├── PrecinctMap.jsx   # Leaflet map with layer rendering
│   │   └── LayerPanel.jsx    # Layer toggle UI
│   ├── data/                 # Static GeoJSON (bundled)
│   └── main.jsx
├── index.html
└── package.json
```

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
```

## Adding a New Layer

1. Copy GeoJSON to `src/data/` (or `public/` if >5MB)
2. In `App.jsx`:
   - Import the data (or fetch dynamically for large files)
   - Add to `layers` state with default value
   - Add config to `layerConfigs` array
3. In `PrecinctMap.jsx`:
   - Add style function in `layerStyles`
   - Add tooltip function in `layerTooltips`

## Layer Types

- **Polygon**: Areas (parks, districts, basins)
- **LineString**: Routes (bike paths, railroads, streams)
- **Point**: Markers (short-term rentals) - rendered as CircleMarkers

## Dynamic Loading

Large files (>5MB) should be loaded dynamically to avoid build memory issues:

```jsx
const [data, setData] = useState(null);

useEffect(() => {
  if (layers.myLayer && !data) {
    fetch('/my-large-file.json')
      .then(res => res.json())
      .then(setData);
  }
}, [layers.myLayer, data]);
```

## Domain

Production: https://maps.lexingtonky.news/
