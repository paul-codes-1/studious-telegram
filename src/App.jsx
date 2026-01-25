import { useState } from 'react';
import PrecinctMap from './components/PrecinctMap';
import LayerPanel from './components/LayerPanel';
import redliningData from './data/redlining.json';

function App() {
  const [layers, setLayers] = useState({
    redlining: true
  });
  const [panelOpen, setPanelOpen] = useState(false);

  const toggleLayer = (layerId) => {
    setLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId]
    }));
  };

  const layerConfigs = [
    {
      id: 'redlining',
      name: 'Redlining (1930s)',
      data: redliningData,
      description: 'HOLC residential security grades',
      legend: [
        { color: '#76a865', label: 'A - Best' },
        { color: '#7cb5bd', label: 'B - Still Desirable' },
        { color: '#d9d639', label: 'C - Declining' },
        { color: '#d9838d', label: 'D - Hazardous' }
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
      <div className="hidden md:block absolute top-4 right-4 z-[1000]">
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
          className="absolute top-4 right-4 z-[1001] bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors"
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
          <div className="p-4">
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
