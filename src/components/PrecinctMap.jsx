import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';

// Component to handle map updates when data changes
function MapUpdater({ data }) {
  const map = useMap();

  useEffect(() => {
    if (data.features.length > 0) {
      // Calculate bounds from all features
      const bounds = [];
      data.features.forEach(feature => {
        if (feature.geometry.type === 'Polygon') {
          feature.geometry.coordinates[0].forEach(coord => {
            bounds.push([coord[1], coord[0]]);
          });
        }
      });
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, []);

  return null;
}

function PrecinctMap({ data, selectedPrecinct, onPrecinctSelect, getColor, getTooltipHtml, renderKey }) {
  const geoJsonRef = useRef(null);
  // Tooltips are bound once per layer mount; binding a static string bakes in
  // whatever data had loaded at mount time (e.g. "No votes" before the async
  // swing JSON arrives). Bind a content *function* that reads the latest
  // getTooltipHtml through a ref so every hover renders fresh state.
  const tooltipFnRef = useRef(getTooltipHtml);
  tooltipFnRef.current = getTooltipHtml;

  // Lexington, KY center coordinates
  const center = [38.0406, -84.5037];

  // Style function for each precinct
  const getStyle = (feature) => {
    const isSelected = selectedPrecinct?.properties.code === feature.properties.code;

    return {
      fillColor: getColor(feature),
      weight: isSelected ? 3 : 1,
      opacity: 1,
      color: isSelected ? '#000' : '#666',
      fillOpacity: 0.7
    };
  };

  // Event handlers for each feature
  const onEachFeature = (feature, layer) => {
    layer.bindTooltip(() => tooltipFnRef.current(feature), {
      sticky: true,
      className: 'bg-white shadow-lg rounded px-2 py-1'
    });

    // Click handler
    layer.on('click', () => {
      onPrecinctSelect(feature);
    });

    // Hover effects
    layer.on('mouseover', (e) => {
      const layer = e.target;
      layer.setStyle({
        weight: 2,
        color: '#333'
      });
      layer.bringToFront();
    });

    layer.on('mouseout', (e) => {
      const layer = e.target;
      if (selectedPrecinct?.properties.code !== feature.properties.code) {
        layer.setStyle({
          weight: 1,
          color: '#666'
        });
      }
    });
  };

  return (
    <MapContainer
      center={center}
      zoom={11}
      className="h-full w-full"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON
        key={renderKey}
        ref={geoJsonRef}
        data={data}
        style={getStyle}
        onEachFeature={onEachFeature}
      />
      <MapUpdater data={data} />
    </MapContainer>
  );
}

export default PrecinctMap;
