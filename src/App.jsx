import { useState, useEffect, useRef } from 'react';
import PrecinctMap from './components/PrecinctMap';
import LayerPanel from './components/LayerPanel';
import redliningData from './data/redlining.json';
import greenwayData from './data/greenway.json';
import urbanServiceArea1958 from './data/urban-service-area-1958.json';
import urbanServiceArea1962 from './data/urban-service-area-1962.json';
import urbanServiceArea1964 from './data/urban-service-area-1964.json';
import urbanServiceArea1967 from './data/urban-service-area-1967.json';
import urbanServiceArea1980 from './data/urban-service-area-1980.json';
import urbanServiceArea1996 from './data/urban-service-area-1996.json';
import urbanServiceArea1998 from './data/urban-service-area-1998.json';
import urbanServiceArea2000 from './data/urban-service-area-2000.json';
import urbanServiceArea2001 from './data/urban-service-area-2001.json';
import urbanServiceArea2025 from './data/urban-service-area-2025.json';

const urbanServiceAreaYears = [
  { year: 1958, data: urbanServiceArea1958 },
  { year: 1962, data: urbanServiceArea1962 },
  { year: 1964, data: urbanServiceArea1964 },
  { year: 1967, data: urbanServiceArea1967 },
  { year: 1980, data: urbanServiceArea1980 },
  { year: 1996, data: urbanServiceArea1996 },
  { year: 1998, data: urbanServiceArea1998 },
  { year: 2000, data: urbanServiceArea2000 },
  { year: 2001, data: urbanServiceArea2001 },
  { year: 2025, data: urbanServiceArea2025 },
];
import waterNetworkData from './data/water-network.json';
import waterbodiesData from './data/waterbodies.json';
import waterwaysData from './data/waterways.json';
import streamData from './data/stream.json';
import basinData from './data/basin.json';
import bicycleNetworkData from './data/bicycle-network.json';
import censusOccupancyData from './data/census-occupancy.json';
import censusRaceData from './data/census-race.json';
import councilDistrictsData from './data/council-districts.json';
import pdrPropertyData from './data/pdr-property.json';
import parksData from './data/parks.json';
import railroadData from './data/railroad.json';
import schoolDistrictsData from './data/school-districts.json';
import shortTermRentalsData from './data/short-term-rentals.json';
import zoningData from './data/zoning.json';
import neighborhoodAssociationsData from './data/neighborhood-associations.json';

// Preset layer configurations
const presets = {
  zoning: {
    label: 'Zoning',
    layers: {
      redlining: false, urbanServiceArea: false, councilDistricts: false,
      schoolDistricts: false, censusRace: false, censusOccupancy: false,
      parks: false, greenway: false, bicycleNetwork: false, railroad: false,
      basin: false, waterbodies: false, waterways: false, waterNetwork: false,
      stream: false, pdrProperty: false, shortTermRentals: false, treeCanopy: false,
      zoning: true, neighborhoodAssociations: false
    }
  },
  environment: {
    label: 'Environment & Recreation',
    layers: {
      redlining: false, urbanServiceArea: false, councilDistricts: false,
      schoolDistricts: false, censusRace: false, censusOccupancy: false,
      parks: true, greenway: true, bicycleNetwork: true, railroad: false,
      basin: true, waterbodies: true, waterways: true, waterNetwork: true,
      stream: true, pdrProperty: true, shortTermRentals: false, treeCanopy: true,
      zoning: false, neighborhoodAssociations: false
    }
  }
};

// Color scale for urban service area years
const getUSAColor = (year) => {
  const colors = {
    1958: '#fef3c7', 1962: '#fde68a', 1964: '#fcd34d', 1967: '#fbbf24',
    1980: '#f59e0b', 1996: '#d97706', 1998: '#b45309', 2000: '#92400e',
    2001: '#78350f', 2025: '#451a03'
  };
  return colors[year] || '#6366f1';
};

function App() {
  const [layers, setLayers] = useState(presets.zoning.layers);
  const [activePreset, setActivePreset] = useState('zoning');
  const [panelOpen, setPanelOpen] = useState(true);
  const [treeCanopyData, setTreeCanopyData] = useState(null);
  const [usaExpanded, setUsaExpanded] = useState(false);
  const [usaYear, setUsaYear] = useState(2025);
  const [usaPrevYear, setUsaPrevYear] = useState(null);
  const [usaTimelapse, setUsaTimelapse] = useState(false);
  const [usaTransition, setUsaTransition] = useState(false);
  const timelapseRef = useRef(null);

  const applyPreset = (presetKey) => {
    setLayers(presets[presetKey].layers);
    setActivePreset(presetKey);
  };

  const startTimelapse = () => {
    setUsaTimelapse(true);
    setPanelOpen(false);
    // Clear all layers except Urban Service Area
    setLayers(prev => {
      const cleared = {};
      Object.keys(prev).forEach(key => {
        cleared[key] = key === 'urbanServiceArea';
      });
      return cleared;
    });
  };

  const stopTimelapse = () => {
    setUsaTimelapse(false);
    setUsaPrevYear(null);
    setUsaTransition(false);
  };

  // Urban Service Area timelapse effect
  useEffect(() => {
    if (usaTimelapse && layers.urbanServiceArea) {
      const years = urbanServiceAreaYears.map(y => y.year);
      timelapseRef.current = setInterval(() => {
        setUsaYear(prev => {
          const currentIdx = years.indexOf(prev);
          const nextIdx = (currentIdx + 1) % years.length;
          // Show both layers during transition
          setUsaPrevYear(prev);
          setUsaTransition(true);
          // Clear previous layer after 500ms
          setTimeout(() => {
            setUsaPrevYear(null);
            setUsaTransition(false);
          }, 500);
          return years[nextIdx];
        });
      }, 2000);
    } else {
      if (timelapseRef.current) {
        clearInterval(timelapseRef.current);
        timelapseRef.current = null;
      }
    }
    return () => {
      if (timelapseRef.current) {
        clearInterval(timelapseRef.current);
      }
    };
  }, [usaTimelapse, layers.urbanServiceArea]);

  // Load tree canopy data dynamically when enabled
  useEffect(() => {
    if (layers.treeCanopy && !treeCanopyData) {
      fetch('/tree-canopy.json')
        .then(res => res.json())
        .then(data => setTreeCanopyData(data))
        .catch(err => console.error('Failed to load tree canopy data:', err));
    }
  }, [layers.treeCanopy, treeCanopyData]);

  const toggleLayer = (layerId) => {
    setLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  const clearAllLayers = () => {
    setLayers(prev => {
      const cleared = {};
      Object.keys(prev).forEach(key => {
        cleared[key] = false;
      });
      return cleared;
    });
  };

  const layerConfigs = [
    // Historical
    {
      id: 'redlining',
      name: 'Redlining (1930s)',
      data: redliningData,
      description: 'HOLC residential security grades',
      category: 'Historical',
      legend: [
        { color: '#76a865', label: 'A - Best' },
        { color: '#7cb5bd', label: 'B - Still Desirable' },
        { color: '#d9d639', label: 'C - Declining' },
        { color: '#d9838d', label: 'D - Hazardous' }
      ]
    },
    // Boundaries
    {
      id: 'urbanServiceArea',
      name: `Urban Service Area (${usaYear})`,
      data: urbanServiceAreaYears.find(y => y.year === usaYear)?.data || urbanServiceArea2025,
      description: 'City service boundary over time',
      category: 'Boundaries',
      hasYearSelector: true,
      years: urbanServiceAreaYears.map(y => y.year),
      selectedYear: usaYear,
      onYearChange: setUsaYear,
      expanded: usaExpanded,
      onExpandToggle: () => setUsaExpanded(!usaExpanded),
      timelapse: usaTimelapse,
      onTimelapseToggle: usaTimelapse ? stopTimelapse : startTimelapse,
      legend: urbanServiceAreaYears.map(y => ({
        color: getUSAColor(y.year),
        label: String(y.year)
      }))
    },
    {
      id: 'councilDistricts',
      name: 'Council Districts',
      data: councilDistrictsData,
      description: 'City council district boundaries',
      category: 'Boundaries',
      legend: [
        { color: '#ef4444', label: '1' },
        { color: '#f97316', label: '2' },
        { color: '#f59e0b', label: '3' },
        { color: '#eab308', label: '4' },
        { color: '#84cc16', label: '5' },
        { color: '#22c55e', label: '6' },
        { color: '#14b8a6', label: '7' },
        { color: '#06b6d4', label: '8' },
        { color: '#0ea5e9', label: '9' },
        { color: '#3b82f6', label: '10' },
        { color: '#6366f1', label: '11' },
        { color: '#8b5cf6', label: '12' }
      ]
    },
    {
      id: 'schoolDistricts',
      name: 'School Board Districts',
      data: schoolDistrictsData,
      description: 'School board district boundaries',
      category: 'Boundaries',
      legend: [
        { color: '#ef4444', label: '1' },
        { color: '#f59e0b', label: '2' },
        { color: '#22c55e', label: '3' },
        { color: '#3b82f6', label: '4' },
        { color: '#8b5cf6', label: '5' }
      ]
    },
    {
      id: 'neighborhoodAssociations',
      name: 'Neighborhood Associations',
      data: neighborhoodAssociationsData,
      description: 'Registered neighborhood associations',
      category: 'Boundaries',
      legend: [
        { color: '#ec4899', label: 'Association' }
      ]
    },
    // Demographics
    {
      id: 'censusRace',
      name: 'Census - Race',
      data: censusRaceData,
      description: 'Population by race (2020)',
      category: 'Demographics',
      legend: [
        { color: '#000000', label: '0% White' },
        { color: '#888888', label: '50% White' },
        { color: '#ffffff', label: '100% White', border: true }
      ]
    },
    {
      id: 'censusOccupancy',
      name: 'Census - Occupancy',
      data: censusOccupancyData,
      description: 'Housing occupancy status (2020)',
      category: 'Demographics',
      legend: [
        { color: '#7c3aed', label: '<70% (Outlier)' },
        { color: '#ef4444', label: '70% Occupied' },
        { color: '#22c55e', label: '100% Occupied' }
      ]
    },
    // Parks & Recreation
    {
      id: 'parks',
      name: 'Parks',
      data: parksData,
      description: 'City parks',
      category: 'Recreation',
      legend: [
        { color: '#16a34a', label: 'Park' }
      ]
    },
    {
      id: 'greenway',
      name: 'Greenways',
      data: greenwayData,
      description: 'Trails & conservation areas',
      category: 'Recreation',
      legend: [
        { color: '#22c55e', label: 'Greenway' }
      ]
    },
    // Transportation
    {
      id: 'bicycleNetwork',
      name: 'Bicycle Network',
      data: bicycleNetworkData,
      description: 'Bike lanes and paths',
      category: 'Transportation',
      legend: [
        { color: '#f59e0b', label: 'Bike Route' }
      ]
    },
    {
      id: 'railroad',
      name: 'Railroads',
      data: railroadData,
      description: 'Railroad lines',
      category: 'Transportation',
      legend: [
        { color: '#78716c', label: 'Railroad' }
      ]
    },
    // Water
    {
      id: 'basin',
      name: 'Detention Basins',
      data: basinData,
      description: 'Stormwater detention basins',
      category: 'Water',
      legend: [
        { color: '#38bdf8', label: 'Basin' }
      ]
    },
    {
      id: 'waterbodies',
      name: 'Water Bodies',
      data: waterbodiesData,
      description: 'Lakes, ponds & reservoirs',
      category: 'Water',
      legend: [
        { color: '#0ea5e9', label: 'Water Body' }
      ]
    },
    {
      id: 'waterways',
      name: 'Waterways',
      data: waterwaysData,
      description: 'Streams & creeks',
      category: 'Water',
      legend: [
        { color: '#0284c7', label: 'Stream' }
      ]
    },
    {
      id: 'waterNetwork',
      name: 'Water Network',
      data: waterNetworkData,
      description: 'Named streams',
      category: 'Water',
      legend: [
        { color: '#1d4ed8', label: 'Named Stream' }
      ]
    },
    {
      id: 'stream',
      name: 'Streams (NHD)',
      data: streamData,
      description: 'NHD stream flowlines',
      category: 'Water',
      legend: [
        { color: '#06b6d4', label: 'Stream' }
      ]
    },
    // Land Use
    {
      id: 'pdrProperty',
      name: 'PDR Properties',
      data: pdrPropertyData,
      description: 'Purchase of Development Rights',
      category: 'Land Use',
      legend: [
        { color: '#84cc16', label: 'PDR Property' }
      ]
    },
    {
      id: 'zoning',
      name: 'Zoning',
      data: zoningData,
      description: 'Land use zoning districts',
      category: 'Land Use',
      legend: [
        { color: '#22c55e', label: 'Agricultural' },
        { color: '#eab308', label: 'Residential' },
        { color: '#3b82f6', label: 'Business' },
        { color: '#8b5cf6', label: 'Industrial' },
        { color: '#ec4899', label: 'Mixed Use' },
        { color: '#2dd4bf', label: 'Professional' },
        { color: '#f97316', label: 'Planned Dev' },
        { color: '#06b6d4', label: 'Expansion' },
        { color: '#64748b', label: 'Conservation' }
      ]
    },
    {
      id: 'shortTermRentals',
      name: 'Short-Term Rentals',
      data: shortTermRentalsData,
      description: 'Licensed STR locations',
      category: 'Land Use',
      legend: [
        { color: '#ef4444', label: 'STR' }
      ]
    },
    // Environment
    {
      id: 'treeCanopy',
      name: 'Tree Canopy (1998)',
      data: treeCanopyData || { type: 'FeatureCollection', features: [] },
      description: 'Historic tree coverage',
      category: 'Environment',
      loading: layers.treeCanopy && !treeCanopyData,
      legend: [
        { color: '#166534', label: 'Tree Canopy' }
      ]
    }
  ];

  // Build active layers with transition layer if needed
  const activeLayers = () => {
    let result = layerConfigs.filter(l => layers[l.id]);

    // Add previous year layer during transition
    if (usaPrevYear && layers.urbanServiceArea) {
      const prevData = urbanServiceAreaYears.find(y => y.year === usaPrevYear)?.data;
      if (prevData) {
        result = [
          {
            id: 'urbanServiceAreaPrev',
            name: `Urban Service Area (${usaPrevYear})`,
            data: prevData,
            selectedYear: usaPrevYear,
            isPreviousYear: true
          },
          ...result
        ];
      }
    }
    return result;
  };

  return (
    <div className="h-screen w-screen relative">
      {/* Full-screen map */}
      <PrecinctMap
        layers={activeLayers()}
      />

      {/* Year overlay during timelapse */}
      {usaTimelapse && layers.urbanServiceArea && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-black/80 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="text-2xl font-bold tracking-wider">
            URBAN SERVICE AREA: {usaYear}
          </div>
        </div>
      )}

      {/* Desktop: Small overlay panel on right */}
      <div className="hidden md:block absolute top-4 right-4 z-[1000] max-h-[calc(100vh-2rem)] overflow-y-auto">
        {/* Preset toggle */}
        <div className="bg-white rounded-lg shadow-lg p-2 mb-2 flex gap-1">
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activePreset === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <LayerPanel
          layers={layerConfigs}
          activeLayerIds={layers}
          onToggle={toggleLayer}
          onClearAll={clearAllLayers}
        />
      </div>

      {/* Mobile: Floating button + expandable panel */}
      <div className="md:hidden">
        {/* Toggle button */}
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="absolute right-4 z-[1001] bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors"
          style={{ top: '85px' }}
          aria-label={panelOpen ? 'Close layers' : 'Open layers'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </button>

        {/* Backdrop */}
        {panelOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-[1000]"
            onClick={() => setPanelOpen(false)}
          />
        )}

        {/* Slide-in panel */}
        <div
          className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-[1002] transform transition-transform duration-300 ${
            panelOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-gray-800">Map Layers</h2>
            <button
              onClick={() => setPanelOpen(false)}
              className="p-1 rounded hover:bg-gray-100"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100% - 65px)' }}>
            {/* Preset toggle */}
            <div className="flex gap-2 mb-4">
              {Object.entries(presets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activePreset === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <LayerPanel
              layers={layerConfigs}
              activeLayerIds={layers}
              onToggle={toggleLayer}
              onClearAll={clearAllLayers}
              mobile
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
