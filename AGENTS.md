# Agent Instructions

Guidelines for AI agents working on this codebase.

## Overview

This is a React + Leaflet map application displaying toggleable GIS layers for Lexington, KY. The main files are:

- `src/App.jsx` - Layer state, configs, and layout
- `src/components/PrecinctMap.jsx` - Map rendering, styles, tooltips
- `src/components/LayerPanel.jsx` - Toggle UI component

## Adding New Layers

### Step 1: Copy Data

```bash
# Small files (<5MB) - bundle with app
cp data-repository/MyData.geojson src/data/my-data.json

# Large files (>5MB) - load dynamically
cp data-repository/MyData.geojson public/my-data.json
```

### Step 2: Update App.jsx

For static imports:
```jsx
import myData from './data/my-data.json';
```

For dynamic loading:
```jsx
const [myData, setMyData] = useState(null);

useEffect(() => {
  if (layers.myLayer && !myData) {
    fetch('/my-data.json')
      .then(res => res.json())
      .then(setMyData);
  }
}, [layers.myLayer, myData]);
```

Add to layers state:
```jsx
const [layers, setLayers] = useState({
  // ... existing
  myLayer: false  // or true for default on
});
```

Add to layerConfigs:
```jsx
{
  id: 'myLayer',
  name: 'My Layer Name',
  data: myData,  // or myData || { type: 'FeatureCollection', features: [] }
  description: 'Brief description',
  category: 'Category Name',
  legend: [
    { color: '#hexcolor', label: 'Legend Label' }
  ]
}
```

### Step 3: Update PrecinctMap.jsx

Add style in `layerStyles`:
```jsx
myLayer: () => ({
  fillColor: '#hexcolor',
  weight: 1,
  opacity: 1,
  color: '#bordercolor',
  fillOpacity: 0.6
})
```

Add tooltip in `layerTooltips`:
```jsx
myLayer: (feature, layer) => {
  const p = feature.properties;
  layer.bindTooltip(
    `<div class="font-sans text-sm"><strong>${p.NAME || 'Label'}</strong></div>`,
    { sticky: true }
  );
}
```

## Geometry Types

| Type | Style Properties | Example |
|------|------------------|---------|
| Polygon | fillColor, fillOpacity, weight, color | Parks, districts |
| LineString | color, weight, opacity, dashArray | Bike paths, streams |
| Point | Use CircleMarker component | STR locations |

## Dynamic Coloring

For data-driven colors (like census data):
```jsx
myLayer: (feature) => {
  const p = feature.properties;
  const value = p.SOME_VALUE || 0;
  const max = 100;
  const pct = value / max;
  const color = `rgb(${Math.round(pct * 255)}, 0, 0)`;
  return { fillColor: color, /* ... */ };
}
```

## Common Property Names

Check GeoJSON properties before assuming field names:
```bash
head -c 2000 data-repository/MyFile.geojson
```

Common patterns:
- Names: `NAME`, `name`, `Name`, `LABEL`
- Districts: `DISTRICT`, `SCHOOL`, `district`
- IDs: `OBJECTID`, `FID`, `id`

## Testing

```bash
npm run dev      # Test locally
npm run build    # Verify build succeeds
```

## File Size Guidelines

| Size | Location | Loading |
|------|----------|---------|
| <5MB | src/data/ | Static import |
| >5MB | public/ | Dynamic fetch |

Large static imports cause build memory errors.

## Current Layers

| Layer | File | Type | Default |
|-------|------|------|---------|
| Redlining | redlining.json | Polygon | Off |
| Urban Service Area | urban-service-area.json | Polygon | Off |
| Council Districts | council-districts.json | Polygon | Off |
| School Districts | school-districts.json | Polygon | Off |
| Census Race | census-race.json | Polygon | Off |
| Census Occupancy | census-occupancy.json | Polygon | Off |
| Parks | parks.json | Polygon | On |
| Greenways | greenway.json | Polygon | On |
| Bicycle Network | bicycle-network.json | LineString | On |
| Railroads | railroad.json | LineString | Off |
| Detention Basins | basin.json | Polygon | On |
| Water Bodies | waterbodies.json | Polygon | On |
| Waterways | waterways.json | LineString | On |
| Water Network | water-network.json | LineString | On |
| Streams | stream.json | LineString | On |
| PDR Properties | pdr-property.json | Polygon | On |
| Short-Term Rentals | short-term-rentals.json | Point | Off |
| Tree Canopy | public/tree-canopy.json | Polygon | On (dynamic) |
