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
  urbanServiceArea: (feature, layer, { selectedYear } = {}) => {
    const colors = {
      1958: '#fef3c7', 1962: '#fde68a', 1964: '#fcd34d', 1967: '#fbbf24',
      1980: '#f59e0b', 1996: '#d97706', 1998: '#b45309', 2000: '#92400e',
      2001: '#78350f', 2025: '#451a03'
    };
    const fillColor = colors[selectedYear] || '#f59e0b';
    return {
      fillColor,
      weight: 2,
      opacity: 1,
      color: '#b45309',
      fillOpacity: 0.4,
      dashArray: '5, 5'
    };
  },
  urbanServiceAreaPrev: (feature, layer, { selectedYear } = {}) => {
    const colors = {
      1958: '#fef3c7', 1962: '#fde68a', 1964: '#fcd34d', 1967: '#fbbf24',
      1980: '#f59e0b', 1996: '#d97706', 1998: '#b45309', 2000: '#92400e',
      2001: '#78350f', 2025: '#451a03'
    };
    const fillColor = colors[selectedYear] || '#f59e0b';
    return {
      fillColor,
      weight: 3,
      opacity: 0.8,
      color: '#333',
      fillOpacity: 0.5,
      dashArray: '10, 5'
    };
  },
  councilDistricts: (feature) => {
    const district = feature.properties.DISTRICT || feature.properties.district || 1;
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308',
      '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
      '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6'
    ];
    const fillColor = colors[(district - 1) % colors.length];
    return {
      fillColor,
      weight: 2,
      opacity: 1,
      color: '#333',
      fillOpacity: 0.4
    };
  },
  schoolDistricts: (feature) => {
    const district = feature.properties.SCHOOL || 1;
    const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'];
    const fillColor = colors[(district - 1) % colors.length];
    return {
      fillColor,
      weight: 2,
      opacity: 1,
      color: '#333',
      fillOpacity: 0.4
    };
  },
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
    let fillColor;
    if (pct < 0.7) {
      // Outlier: below 70% - dark purple
      fillColor = '#7c3aed';
    } else {
      // Scale 70-100% to 0-1 for color gradient
      const scaled = (pct - 0.7) / 0.3;
      // red (80%) -> green (100%)
      const r = Math.round((1 - scaled) * 239);
      const g = Math.round(scaled * 167);
      fillColor = `rgb(${r}, ${g}, 50)`;
    }
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
  zoning: (feature) => {
    const zone = feature.properties.ZONING || '';
    const zoningColors = {
      'A-B': '#15803d', 'A-N': '#16a34a', 'A-R': '#22c55e', 'A-U': '#4ade80',
      'R-1A': '#fef08a', 'R-1B': '#fde047', 'R-1C': '#facc15', 'R-1D': '#eab308',
      'R-1E': '#ca8a04', 'R-1T': '#a16207', 'R-2': '#f59e0b', 'R-3': '#d97706',
      'R-4': '#b45309', 'R-5': '#92400e',
      'B-1': '#bfdbfe', 'B-2': '#93c5fd', 'B-2A': '#60a5fa', 'B-2B': '#3b82f6',
      'B-3': '#2563eb', 'B-4': '#1d4ed8', 'B-5P': '#1e40af', 'B-6P': '#1e3a8a',
      'I-1': '#a78bfa', 'I-2': '#8b5cf6',
      'M-1P': '#c084fc',
      'MU-1': '#f9a8d4', 'MU-2': '#f472b6', 'MU-3': '#ec4899',
      'P-1': '#5eead4', 'P-2': '#2dd4bf',
      'PUD-1': '#fdba74', 'PUD-2': '#fb923c', 'PUD-3': '#f97316',
      'EAR-1': '#67e8f9', 'EAR-2': '#22d3ee', 'EAR-3': '#06b6d4',
      'ED': '#0891b2', 'EX-1': '#0e7490',
      'CC': '#94a3b8', 'CD': '#64748b'
    };
    const fillColor = zoningColors[zone] || '#6b7280';
    return {
      fillColor,
      weight: 1,
      opacity: 1,
      color: '#333',
      fillOpacity: 0.6
    };
  },
  shortTermRentals: () => ({
    // Point layer - handled separately
  }),
  treeCanopy: () => ({
    fillColor: '#166534',
    weight: 0.5,
    opacity: 0.8,
    color: '#14532d',
    fillOpacity: 0.6
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
  urbanServiceArea: (feature, layer, { selectedYear } = {}) => {
    layer.bindTooltip(
      `<div class="font-sans text-sm"><strong>Urban Service Area ${selectedYear || 2025}</strong></div>`,
      { sticky: true }
    );
  },
  urbanServiceAreaPrev: (feature, layer, { selectedYear } = {}) => {
    layer.bindTooltip(
      `<div class="font-sans text-sm"><strong>Urban Service Area ${selectedYear || ''} (Previous)</strong></div>`,
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
    const district = p.SCHOOL || 'Unknown';
    const rep = p.SCHREP || '';
    layer.bindTooltip(
      `<div class="font-sans text-sm">
        <strong>School District ${district}</strong>
        ${rep ? `<br/><span class="text-gray-600">${rep}</span>` : ''}
      </div>`,
      { sticky: true }
    );
  },
  censusRace: (feature, layer) => {
    const p = feature.properties;
    const total = p.P0010001 || 0;
    const races = [
      { name: 'White', count: p.P0010003 || 0 },
      { name: 'Black', count: p.P0010004 || 0 },
      { name: 'American Indian', count: p.P0010005 || 0 },
      { name: 'Asian', count: p.P0010006 || 0 },
      { name: 'Pacific Islander', count: p.P0010007 || 0 },
      { name: 'Other', count: p.P0010008 || 0 },
      { name: 'Two or More', count: p.P0010009 || 0 }
    ];
    const top3 = races
      .map(r => ({ ...r, pct: total > 0 ? Math.round(r.count / total * 100) : 0 }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 3);
    const raceLines = top3.map(r => `${r.name}: ${r.pct}%`).join('<br/>');
    layer.bindTooltip(
      `<div class="font-sans text-sm">
        <strong>${p.NAME || p.CODE}</strong><br/>
        Population: ${total.toLocaleString()}<br/>
        ${raceLines}
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
      `<div class="font-sans text-sm">
        <strong>PDR Property</strong><br/>
        <span class="text-gray-600">${p.ADDRESS || ''}</span><br/>
        <span class="text-gray-500">${p.Status || ''} ${p.APPNUM || ''} ${p.FUNDING || ''}</span>
      </div>`,
      { sticky: true }
    );
  },
  zoning: (feature, layer) => {
    const p = feature.properties;
    const zone = p.ZONING || 'Unknown';
    const zoneDescriptions = {
      'A-B': 'Agricultural Buffer', 'A-N': 'Agricultural Natural Area',
      'A-R': 'Agricultural Rural', 'A-U': 'Agricultural Urban',
      'R-1A': 'Residential Low Density', 'R-1B': 'Residential Low Density',
      'R-1C': 'Residential Low Density', 'R-1D': 'Residential Low Density',
      'R-1E': 'Residential Low Density', 'R-1T': 'Residential Townhouse',
      'R-2': 'Residential Medium Density', 'R-3': 'Residential High Density',
      'R-4': 'Residential High Rise', 'R-5': 'Residential High Rise',
      'B-1': 'Neighborhood Business', 'B-2': 'Community Business',
      'B-2A': 'Community Business', 'B-2B': 'Community Business',
      'B-3': 'Highway Business', 'B-4': 'Wholesale Business',
      'B-5P': 'Business Park', 'B-6P': 'Business Park',
      'I-1': 'Light Industrial', 'I-2': 'Heavy Industrial',
      'M-1P': 'Manufacturing Park',
      'MU-1': 'Mixed Use Low', 'MU-2': 'Mixed Use Medium', 'MU-3': 'Mixed Use High',
      'P-1': 'Professional Office', 'P-2': 'Professional Office',
      'PUD-1': 'Planned Unit Dev', 'PUD-2': 'Planned Unit Dev', 'PUD-3': 'Planned Unit Dev',
      'EAR-1': 'Expansion Area', 'EAR-2': 'Expansion Area', 'EAR-3': 'Expansion Area',
      'ED': 'Economic Development', 'EX-1': 'Extractive Industry',
      'CC': 'Conservation Corridor', 'CD': 'Conservation Development'
    };
    const desc = zoneDescriptions[zone] || '';
    const link = p.LINK || '';
    layer.bindTooltip(
      `<div class="font-sans text-sm">
        <strong>${zone}</strong>${desc ? ` - ${desc}` : ''}
      </div>`,
      { sticky: true }
    );
    if (link) {
      layer.bindPopup(
        `<div class="font-sans">
          <div class="font-bold mb-2">${zone}${desc ? ` - ${desc}` : ''}</div>
          <iframe src="${link}" style="width:400px;height:300px;border:1px solid #ccc;border-radius:4px;opacity:0;transition:opacity 0.3s;" onload="this.style.opacity=1"></iframe>
        </div>`,
        { maxWidth: 450 }
      );
    }
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
  },
  treeCanopy: (feature, layer) => {
    const p = feature.properties;
    const type = p.TYPE || 'Tree Canopy';
    layer.bindTooltip(
      `<div class="font-sans text-sm"><strong>${type}</strong></div>`,
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
    return geoLayers.map(l => {
      // Include selectedYear for layers with year selector (like Urban Service Area)
      const yearKey = l.selectedYear ? `-${l.selectedYear}` : '';
      const prevKey = l.isPreviousYear ? '-prev' : '';
      return `${l.id}-${l.data.features.length}${yearKey}${prevKey}`;
    });
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

      {geoLayers.map((layer, idx) => {
        const styleOpts = { selectedYear: layer.selectedYear };
        const styleFn = layerStyles[layer.id];
        const tooltipFn = layerTooltips[layer.id];
        return (
          <GeoJSON
            key={layerKeys[idx]}
            data={layer.data}
            style={styleFn ? (feature) => styleFn(feature, null, styleOpts) : undefined}
            onEachFeature={tooltipFn ? (feature, lyr) => tooltipFn(feature, lyr, styleOpts) : undefined}
          />
        );
      })}

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
