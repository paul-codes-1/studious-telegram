const COUNCIL_DISTRICTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function FilterPanel({ filters, onFiltersChange }) {
  const handleSearchChange = (e) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleMarginChange = (type, value) => {
    onFiltersChange({
      ...filters,
      [type]: parseInt(value)
    });
  };

  const handleTurnoutChange = (e) => {
    onFiltersChange({ ...filters, minTurnout: parseInt(e.target.value) });
  };

  const handleDistrictToggle = (district) => {
    const current = filters.councilDistricts || [];
    const updated = current.includes(district)
      ? current.filter(d => d !== district)
      : [...current, district].sort((a, b) => a - b);
    onFiltersChange({ ...filters, councilDistricts: updated });
  };

  const selectAllDistricts = () => {
    onFiltersChange({ ...filters, councilDistricts: [] });
  };

  const resetFilters = () => {
    onFiltersChange({
      search: '',
      marginMin: -100,
      marginMax: 100,
      minTurnout: 0,
      councilDistricts: []
    });
  };

  return (
    <div className="p-4">
      <h2 className="font-bold text-gray-700 mb-3">Filters</h2>

      {/* Search */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">Search Precinct</label>
        <input
          type="text"
          value={filters.search}
          onChange={handleSearchChange}
          placeholder="Name or code..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Margin filter */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">
          Margin Range: {filters.marginMin > 0 ? '+' : ''}{filters.marginMin} to {filters.marginMax > 0 ? '+' : ''}{filters.marginMax}
        </label>
        <div className="flex gap-2">
          <input
            type="range"
            min="-100"
            max="0"
            value={filters.marginMin}
            onChange={(e) => handleMarginChange('marginMin', e.target.value)}
            className="flex-1"
          />
          <input
            type="range"
            min="0"
            max="100"
            value={filters.marginMax}
            onChange={(e) => handleMarginChange('marginMax', e.target.value)}
            className="flex-1"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>D+100</span>
          <span>Even</span>
          <span>R+100</span>
        </div>
      </div>

      {/* Quick margin filters */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">Quick Filters</label>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => onFiltersChange({ ...filters, marginMin: -100, marginMax: -10 })}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Safe D
          </button>
          <button
            onClick={() => onFiltersChange({ ...filters, marginMin: -10, marginMax: 10 })}
            className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
          >
            Swing
          </button>
          <button
            onClick={() => onFiltersChange({ ...filters, marginMin: 10, marginMax: 100 })}
            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Safe R
          </button>
        </div>
      </div>

      {/* Turnout filter */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">
          Min Turnout: {filters.minTurnout}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={filters.minTurnout}
          onChange={handleTurnoutChange}
          className="w-full"
        />
      </div>

      {/* Council District filter */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <label className="text-sm text-gray-600">
            Council District
            {filters.councilDistricts?.length > 0 && (
              <span className="ml-1 text-blue-600">
                ({filters.councilDistricts.length})
              </span>
            )}
          </label>
          {filters.councilDistricts?.length > 0 && (
            <button
              onClick={selectAllDistricts}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-1">
          {COUNCIL_DISTRICTS.map(district => {
            const isSelected = filters.councilDistricts?.length === 0 ||
                              filters.councilDistricts?.includes(district);
            const isFiltered = filters.councilDistricts?.length > 0 &&
                              filters.councilDistricts?.includes(district);
            return (
              <button
                key={district}
                onClick={() => handleDistrictToggle(district)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  isFiltered
                    ? 'bg-blue-600 text-white border-blue-600'
                    : isSelected
                    ? 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    : 'bg-gray-100 text-gray-400 border-gray-200'
                }`}
              >
                {district}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-1">Click to filter by district</p>
      </div>

      {/* Reset button */}
      <button
        onClick={resetFilters}
        className="w-full px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
      >
        Reset Filters
      </button>
    </div>
  );
}

export default FilterPanel;
