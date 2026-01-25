import { useState, useMemo } from 'react';
import PrecinctMap from './components/PrecinctMap';
import PrecinctTable from './components/PrecinctTable';
import PrecinctDetail from './components/PrecinctDetail';
import Legend from './components/Legend';
import FilterPanel from './components/FilterPanel';
import precinctData from './data/precincts.json';

function App() {
  const [selectedPrecinct, setSelectedPrecinct] = useState(null);
  const [view, setView] = useState('map'); // 'map' or 'table'
  const [filters, setFilters] = useState({
    search: '',
    marginMin: -100,
    marginMax: 100,
    minTurnout: 0,
    councilDistricts: [] // empty = all districts
  });

  // Filter precincts based on current filters
  const filteredData = useMemo(() => {
    return {
      ...precinctData,
      features: precinctData.features.filter(feature => {
        const p = feature.properties;

        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          if (!p.name.toLowerCase().includes(searchLower) &&
              !p.code.toLowerCase().includes(searchLower)) {
            return false;
          }
        }

        // Margin filter
        if (p.margin < filters.marginMin || p.margin > filters.marginMax) {
          return false;
        }

        // Turnout filter
        if (p.turnoutPct < filters.minTurnout) {
          return false;
        }

        // Council district filter
        if (filters.councilDistricts.length > 0 &&
            !filters.councilDistricts.includes(p.councilDistrict)) {
          return false;
        }

        return true;
      })
    };
  }, [filters]);

  const handlePrecinctSelect = (precinct) => {
    setSelectedPrecinct(precinct);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Lexington Precinct Data Map</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-300 text-sm">
            {filteredData.features.length} of {precinctData.features.length} precincts
          </span>
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setView('map')}
              className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                view === 'map'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                view === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - filters */}
        <div className="w-64 bg-gray-100 border-r border-gray-300 overflow-y-auto sidebar">
          <FilterPanel filters={filters} onFiltersChange={setFilters} />
          <Legend />
        </div>

        {/* Main view area */}
        <div className="flex-1 relative">
          {view === 'map' ? (
            <PrecinctMap
              data={filteredData}
              selectedPrecinct={selectedPrecinct}
              onPrecinctSelect={handlePrecinctSelect}
            />
          ) : (
            <PrecinctTable
              data={filteredData}
              selectedPrecinct={selectedPrecinct}
              onPrecinctSelect={handlePrecinctSelect}
            />
          )}
        </div>

        {/* Right sidebar - detail panel */}
        {selectedPrecinct && (
          <div className="w-80 bg-white border-l border-gray-300 overflow-y-auto sidebar">
            <PrecinctDetail
              precinct={selectedPrecinct}
              onClose={() => setSelectedPrecinct(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
