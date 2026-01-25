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
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
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
    // Auto-collapse left sidebar on mobile when opening detail panel
    if (precinct) {
      setLeftSidebarOpen(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedPrecinct(null);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Left sidebar toggle */}
          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            className="p-1.5 rounded-md hover:bg-gray-700 transition-colors"
            aria-label={leftSidebarOpen ? 'Close filters' : 'Open filters'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg sm:text-xl font-bold">Lexington Precinct Data Map</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-gray-300 text-xs sm:text-sm hidden sm:inline">
            {filteredData.features.length} of {precinctData.features.length} precincts
          </span>
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setView('map')}
              className={`px-3 sm:px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                view === 'map'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-3 sm:px-4 py-1 rounded-md text-sm font-medium transition-colors ${
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
      <div className="flex-1 flex relative" style={{ overflow: view === 'table' ? 'auto' : 'hidden' }}>
        {/* Left sidebar overlay */}
        {leftSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            style={{ zIndex: 1000 }}
            onClick={() => setLeftSidebarOpen(false)}
          />
        )}

        {/* Left sidebar - filters */}
        {leftSidebarOpen && (
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-gray-100 border-r border-gray-300 overflow-y-auto pt-14" style={{ zIndex: 1001 }}>
            <button
              onClick={() => setLeftSidebarOpen(false)}
              className="absolute top-2 right-2 p-1 rounded-md hover:bg-gray-200"
              aria-label="Close filters"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <FilterPanel filters={filters} onFiltersChange={setFilters} />
            <Legend />
          </div>
        )}

        {/* Main view area */}
        <div className={`flex-1 relative ${view === 'table' ? 'overflow-auto' : 'overflow-hidden'}`}>
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

        {/* Right sidebar overlay */}
        {selectedPrecinct && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            style={{ zIndex: 1000 }}
            onClick={handleCloseDetail}
          />
        )}

        {/* Right sidebar - detail panel */}
        {selectedPrecinct && (
          <div className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-300 overflow-y-auto pt-14" style={{ zIndex: 1001 }}>
            <PrecinctDetail
              precinct={selectedPrecinct}
              onClose={handleCloseDetail}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
