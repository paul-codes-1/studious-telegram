import { useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';

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
  greenway: () => ({
    fillColor: '#22c55e',
    weight: 1,
    opacity: 1,
    color: '#15803d',
    fillOpacity: 0.5
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
  }
};

function PrecinctMap({ layers }) {
  // Lexington, KY center coordinates
  const center = [38.0406, -84.5037];

  // Generate unique keys for each layer to ensure proper rendering
  const layerKeys = useMemo(() => {
    return layers.map(l => `${l.id}-${l.data.features.length}`);
  }, [layers]);

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

      {layers.map((layer, idx) => (
        <GeoJSON
          key={layerKeys[idx]}
          data={layer.data}
          style={layerStyles[layer.id]}
          onEachFeature={layerTooltips[layer.id]}
        />
      ))}
    </MapContainer>
  );
}

export default PrecinctMap;
