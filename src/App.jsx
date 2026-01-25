import { useState } from 'react';
import PrecinctMap from './components/PrecinctMap';
import LayerPanel from './components/LayerPanel';
import redliningData from './data/redlining.json';
import greenwayData from './data/greenway.json';
import urbanServiceAreaData from './data/urban-service-area.json';
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
import treeCanopyData from './data/tree-canopy.json';

function App() {
  const [layers, setLayers] = useState({
    redlining: false,
    urbanServiceArea: false,
    councilDistricts: false,
    schoolDistricts: false,
    censusRace: false,
    censusOccupancy: false,
    parks: true,
    greenway: true,
    bicycleNetwork: true,
    railroad: false,
    basin: true,
    waterbodies: true,
    waterways: true,
    waterNetwork: true,
    stream: true,
    pdrProperty: true,
    shortTermRentals: false,
    treeCanopy: true
  });
  const [panelOpen, setPanelOpen] = useState(true);

  const toggleLayer = (layerId) => {
    setLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
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
      name: 'Urban Service Area',
      data: urbanServiceAreaData,
      description: 'City service boundary (2025)',
      category: 'Boundaries',
      legend: [
        { color: '#6366f1', label: 'Service Area' }
      ]
    },
    {
      id: 'councilDistricts',
      name: 'Council Districts',
      data: councilDistrictsData,
      description: 'City council district boundaries',
      category: 'Boundaries',
      legend: [
        { color: '#f97316', label: 'District' }
      ]
    },
    {
      id: 'schoolDistricts',
      name: 'School Board Districts',
      data: schoolDistrictsData,
      description: 'School board district boundaries',
      category: 'Boundaries',
      legend: [
        { color: '#a855f7', label: 'District' }
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
        { color: '#ef4444', label: '0% Occupied' },
        { color: '#a7a732', label: '50% Occupied' },
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
      data: treeCanopyData,
      description: 'Historic tree coverage',
      category: 'Environment',
      legend: [
        { color: '#166534', label: 'Tree Canopy' }
      ]
    }
  ];

  return (
    <div className="h-screen w-screen relative">
      {/* Full-screen map */}
      <PrecinctMap
        layers={layerConfigs.filter(l => layers[l.id])}
      />

      {/* Desktop: Small overlay panel on right */}
      <div className="hidden md:block absolute top-4 right-4 z-[1000] max-h-[calc(100vh-2rem)] overflow-y-auto">
        <LayerPanel
          layers={layerConfigs}
          activeLayerIds={layers}
          onToggle={toggleLayer}
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
            <LayerPanel
              layers={layerConfigs}
              activeLayerIds={layers}
              onToggle={toggleLayer}
              mobile
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
