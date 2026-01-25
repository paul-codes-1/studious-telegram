import { useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';

function PrecinctMap({ layers }) {
  // Lexington, KY center coordinates
  const center = [38.0406, -84.5037];

  // Style function for redlining layer
  const getRedliningStyle = (feature) => {
    const fill = feature.properties.fill || '#888';
    return {
      fillColor: fill,
      weight: 1,
      opacity: 1,
      color: '#333',
      fillOpacity: 0.6
    };
  };

  // Tooltip for redlining features
  const onEachRedliningFeature = (feature, layer) => {
    const p = feature.properties;
    const gradeLabels = {
      'A': 'Best',
      'B': 'Still Desirable',
      'C': 'Declining',
      'D': 'Hazardous'
    };

    const tooltipContent = `
      <div class="font-sans text-sm">
        <strong>Grade ${p.grade}</strong> - ${gradeLabels[p.grade] || p.category}<br/>
        <span class="text-gray-600">${p.label}</span>
      </div>
    `;

    layer.bindTooltip(tooltipContent, {
      sticky: true,
      className: 'bg-white shadow-lg rounded px-2 py-1'
    });
  };

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
          style={layer.id === 'redlining' ? getRedliningStyle : undefined}
          onEachFeature={layer.id === 'redlining' ? onEachRedliningFeature : undefined}
        />
      ))}
    </MapContainer>
  );
}

export default PrecinctMap;
