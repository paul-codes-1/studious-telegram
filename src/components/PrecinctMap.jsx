import { useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker } from 'react-leaflet';

// Layer style configurations
const layerStyles = {
  redlining: (feature) => ({
    fillColor: feature.properties.fill || '#888',
    weight: 1,
    opacity: 1,
    color: '#333',
    fillOpacity: 0.6
  }),
  urbanServiceArea: () => ({
    fillColor: '#6366f1',
    weight: 2,
    opacity: 1,
    color: '#4338ca',
    fillOpacity: 0.15,
    dashArray: '5, 5'
  }),
  councilDistricts: () => ({
    fillColor: '#f97316',
    weight: 2,
    opacity: 1,
    color: '#c2410c',
    fillOpacity: 0.2
  }),
  schoolDistricts: () => ({
    fillColor: '#a855f7',
    weight: 2,
    opacity: 1,
    color: '#7e22ce',
    fillOpacity: 0.2
  }),
  censusRace: (feature) => {
    const p = feature.properties;
    const total = p.P0010001 || 0;
    const white = p.P0010003 || 0;
    const pct = total > 0 ? white / total : 0;
    // 0% white = black, 100% white = white
    const gray = Math.round(pct * 255);
    const fillColor = `rgb(${gray}, ${gray}, ${gray})`;
    return {
      fillColor,
      weight: 1,
      opacity: 1,
      color: '#666',
      fillOpacity: 0.7
    };
  },
  censusOccupancy: (feature) => {
    const p = feature.properties;
    const total = p.H0010001 || 0;
    const occupied = p.H0010002 || 0;
    const pct = total > 0 ? occupied / total : 0;
    // 0% occupied = red, 100% occupied = green
    const r = Math.round((1 - pct) * 239);
    const g = Math.round(pct * 167);
    const fillColor = `rgb(${r}, ${g}, 50)`;
    return {
      fillColor,
      weight: 1,
      opacity: 1,
      color: '#666',
      fillOpacity: 0.7
    };
  },
  parks: () => ({
    fillColor: '#16a34a',
    weight: 1,
    opacity: 1,
    color: '#15803d',
    fillOpacity: 0.6
  }),
  greenway: () => ({
    fillColor: '#22c55e',
    weight: 1,
    opacity: 1,
    color: '#15803d',
    fillOpacity: 0.5
  }),
  bicycleNetwork: () => ({
    weight: 3,
    opacity: 0.8,
    color: '#f59e0b'
  }),
  railroad: () => ({
    weight: 3,
    opacity: 0.9,
    color: '#78716c',
    dashArray: '8, 4'
  }),
  basin: () => ({
    fillColor: '#38bdf8',
    weight: 1,
    opacity: 0.8,
    color: '#0284c7',
    fillOpacity: 0.2
  }),
  waterbodies: () => ({
    fillColor: '#0ea5e9',
    weight: 1,
    opacity: 1,
    color: '#0369a1',
    fillOpacity: 0.6
  }),
  waterways: () => ({
    weight: 2,
    opacity: 0.8,
    color: '#0284c7'
  }),
  waterNetwork: () => ({
    weight: 2,
    opacity: 0.8,
    color: '#1d4ed8'
  }),
  stream: () => ({
    weight: 2,
    opacity: 0.8,
    color: '#06b6d4'
  }),
  pdrProperty: () => ({
    fillColor: '#84cc16',
    weight: 1,
    opacity: 1,
    color: '#65a30d',
    fillOpacity: 0.5
  }),
  shortTermRentals: () => ({
    // Point layer - handled separately
  })
};

// Layer tooltip configurations
const layerTooltips = {
  redlining: (feature, layer) => {
    const p = feature.properties;
    const gradeLabels = {
      'A': 'Best',
      'B': 'Still Desirable',
      'C': 'Declining',
      'D': 'Hazardous'
    };
    layer.bindTooltip(
      `<div class="font-sans text-sm">
        <strong>Grade ${p.grade}</strong> - ${gradeLabels[p.grade] || p.category}<br/>
        <span class="text-gray-600">${p.label}</span>
      </div>`,
      { sticky: true }
    );
  },
  urbanServiceArea: (feature, layer) => {
    layer.bindTooltip(
      `<div class="font-sans text-sm"><strong>Urban Service Area 2025</strong></div>`,
      { sticky: true }
    );
  },
  councilDistricts: (feature, layer) => {
    const p = feature.properties;
    const district = p.DISTRICT || p.district || p.District || 'Unknown';
    layer.bindTooltip(
      `<div class="font-sans text-sm"><strong>Council District ${district}</strong></div>`,
      { sticky: true }
    );
  },
  schoolDistricts: (feature, layer) => {
    const p = feature.properties;
    const district = p.DISTRICT || p.district || p.District || p.NAME || 'Unknown';
    layer.bindTooltip(
      `<div class="font-sans text-sm"><strong>School District ${district}</strong></div>`,
      { sticky: true }
    );
  },
  censusRace: (feature, layer) => {
    const p = feature.properties;
    const total = p.P0010001 || 0;
    const white = p.P0010003 || 0;
    const black = p.P0010004 || 0;
    const asian = p.P0010006 || 0;
    layer.bindTooltip(
      `<div class="font-sans text-sm">
        <strong>${p.NAME || p.CODE}</strong><br/>
        Population: ${total.toLocaleString()}<br/>
        White: ${white.toLocaleString()} (${total ? Math.round(white/total*100) : 0}%)<br/>
        Black: ${black.toLocaleString()} (${total ? Math.round(black/total*100) : 0}%)<br/>
        Asian: ${asian.toLocaleString()} (${total ? Math.round(asian/total*100) : 0}%)
      </div>`,
      { sticky: true }
    );
  },
  censusOccupancy: (feature, layer) => {
    const p = feature.properties;
    const total = p.H0010001 || 0;
    const occupied = p.H0010002 || 0;
    const vacant = p.H0010003 || 0;
    layer.bindTooltip(
      `<div class="font-sans text-sm">
        <strong>${p.NAME || p.CODE}</strong><br/>
        Total Units: ${total.toLocaleString()}<br/>
        Occupied: ${occupied.toLocaleString()} (${total ? Math.round(occupied/total*100) : 0}%)<br/>
        Vacant: ${vacant.toLocaleString()} (${total ? Math.round(vacant/total*100) : 0}%)
      </div>`,
      { sticky: true }
    );
  },
  parks: (feature, layer) => {
    const p = feature.properties;
    const name = p.NAME || p.name || p.PARK_NAME || 'Park';
    layer.bindTooltip(
      `<div class="font-sans text-sm"><strong>${name}</strong></div>`,
      { sticky: true }
    );
  },
  greenway: (feature, layer) => {
    const p = feature.properties;
    const name = p.NAME?.trim() || p.LABEL || 'Greenway';
    const access = p.PUBLIC_ACCESS === 'Yes' ? 'Public Access' : 'No Public Access';
    layer.bindTooltip(
      `<div class="font-sans text-sm">
        <strong>${name}</strong><br/>
        <span class="text-gray-600">${p.STATUS || ''}</span><br/>
        <span class="text-gray-500">${access}</span>
      </div>`,
      { sticky: true }
    );
  },
  bicycleNetwork: (feature, layer) => {
    const p = feature.properties;
    const name = p.name_facility || p.NAME || 'Bike Route';
    const status = p.status || '';
    const type = p.type_facility || '';
    layer.bindTooltip(
      `<div class="font-sans text-sm">
        <strong>${name}</strong><br/>
        ${type ? `<span class="text-gray-600">${type}</span><br/>` : ''}
        ${status ? `<span class="text-gray-500">${status}</span>` : ''}
      </div>`,
      { sticky: true }
    );
  },
  railroad: (feature, layer) => {
    const p = feature.properties;
    const name = p.NAME || p.name || 'Railroad';
    layer.bindTooltip(
      `<div class="font-sans text-sm"><strong>${name}</strong></div>`,
      { sticky: true }
    );
  },
  basin: (feature, layer) => {
    const p = feature.properties;
    const name = p.NAME || p.name || p.BASIN || 'Watershed';
    layer.bindTooltip(
      `<div class="font-sans text-sm"><strong>${name}</strong></div>`,
      { sticky: true }
    );
  },
  waterbodies: (feature, layer) => {
    layer.bindTooltip(
      `<div class="font-sans text-sm"><strong>Water Body</strong></div>`,
      { sticky: true }
    );
  },
  waterways: (feature, layer) => {
    layer.bindTooltip(
      `<div class="font-sans text-sm"><strong>Stream</strong></div>`,
      { sticky: true }
    );
  },
  waterNetwork: (feature, layer) => {
    const p = feature.properties;
    const name = p.NAME || 'Unnamed Stream';
    layer.bindTooltip(
      `<div class="font-sans text-sm"><strong>${name}</strong></div>`,
      { sticky: true }
    );
  },
  stream: (feature, layer) => {
    const p = feature.properties;
    const name = p.GNIS_Name?.trim() || 'Stream';
    layer.bindTooltip(
      `<div class="font-sans text-sm"><strong>${name}</strong></div>`,
      { sticky: true }
    );
  },
  pdrProperty: (feature, layer) => {
    const p = feature.properties;
    layer.bindTooltip(
      `<div class="font-sans text-sm"><strong>PDR Property</strong></div>`,
      { sticky: true }
    );
  },
  shortTermRentals: (feature, layer) => {
    const p = feature.properties;
    const type = p.hosted__unhosted === 'H' ? 'Hosted' : 'Unhosted';
    layer.bindTooltip(
      `<div class="font-sans text-sm">
        <strong>Short-Term Rental</strong><br/>
        <span class="text-gray-600">${p.address || ''}</span><br/>
        <span class="text-gray-500">${type}</span>
      </div>`,
      { sticky: true }
    );
  }
};

// Point to layer for point geometries (STRs)
const pointToLayer = {
  shortTermRentals: (feature, latlng) => {
    return null; // We'll handle this with CircleMarker in render
  }
};

function PrecinctMap({ layers }) {
  // Lexington, KY center coordinates
  const center = [38.0406, -84.5037];

  // Separate point layers from polygon/line layers
  const pointLayers = layers.filter(l => l.id === 'shortTermRentals');
  const geoLayers = layers.filter(l => l.id !== 'shortTermRentals');

  // Generate unique keys for each layer to ensure proper rendering
  const layerKeys = useMemo(() => {
    return geoLayers.map(l => `${l.id}-${l.data.features.length}`);
  }, [geoLayers]);

  return (
    <MapContainer
      center={center}
      zoom={12}
      className="h-full w-full"
      scrollWheelZoom={true}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {geoLayers.map((layer, idx) => (
        <GeoJSON
          key={layerKeys[idx]}
          data={layer.data}
          style={layerStyles[layer.id]}
          onEachFeature={layerTooltips[layer.id]}
        />
      ))}

      {/* Render point layers (STRs) as circle markers */}
      {pointLayers.map(layer =>
        layer.data.features.map((feature, idx) => {
          if (feature.geometry.type === 'Point') {
            const [lng, lat] = feature.geometry.coordinates;
            const p = feature.properties;
            const type = p.hosted__unhosted === 'H' ? 'Hosted' : 'Unhosted';
            return (
              <CircleMarker
                key={`${layer.id}-${idx}`}
                center={[lat, lng]}
                radius={5}
                pathOptions={{
                  fillColor: '#ef4444',
                  color: '#b91c1c',
                  weight: 1,
                  opacity: 1,
                  fillOpacity: 0.7
                }}
              >
              </CircleMarker>
            );
          }
          return null;
        })
      )}
    </MapContainer>
  );
}

export default PrecinctMap;
