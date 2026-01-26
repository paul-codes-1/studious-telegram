function LayerPanel({ layers, activeLayerIds, onToggle, onClearAll, mobile }) {
  // Render year selector for Urban Service Area
  const renderYearSelector = (layer) => {
    if (!layer.hasYearSelector || !activeLayerIds[layer.id]) return null;

    return (
      <div className={`${mobile ? 'mt-3' : 'ml-6 mt-2'}`}>
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              layer.onTimelapseToggle();
            }}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              layer.timelapse
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {layer.timelapse ? 'Stop' : 'Play'} Timelapse
          </button>
          <span className="text-xs text-gray-500">
            {layer.selectedYear}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {layer.years.map(year => (
            <button
              key={year}
              onClick={(e) => {
                e.preventDefault();
                layer.onYearChange(year);
              }}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                layer.selectedYear === year
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (mobile) {
    // Mobile: vertical list with legends
    return (
      <div className="space-y-4">
        <button
          onClick={onClearAll}
          className="w-full text-sm text-gray-500 hover:text-gray-700 py-1 px-2 rounded hover:bg-gray-100 transition-colors"
        >
          Clear All
        </button>
        {layers.map(layer => (
          <div key={layer.id} className="border-b border-gray-100 pb-4 last:border-0">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayerIds[layer.id] || false}
                onChange={() => onToggle(layer.id)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-800">{layer.name}</span>
                {layer.description && (
                  <p className="text-sm text-gray-500 mt-0.5">{layer.description}</p>
                )}
              </div>
            </label>
            {renderYearSelector(layer)}
            {layer.legend && activeLayerIds[layer.id] && !layer.hasYearSelector && (
              <div className="mt-2 ml-7 space-y-1">
                {layer.legend.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor: item.color,
                        opacity: 0.7,
                        border: item.border ? '1px solid #ccc' : 'none'
                      }}
                    />
                    <span className="text-gray-600">{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Desktop: compact card
  return (
    <div className="bg-white rounded-lg shadow-lg p-3 min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Layers</div>
        <button
          onClick={onClearAll}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Clear All
        </button>
      </div>
      <div className="space-y-2">
        {layers.map(layer => (
          <div key={layer.id}>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded p-1 -mx-1">
              <input
                type="checkbox"
                checked={activeLayerIds[layer.id] || false}
                onChange={() => onToggle(layer.id)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{layer.name}</span>
            </label>
            {renderYearSelector(layer)}
            {layer.legend && activeLayerIds[layer.id] && !layer.hasYearSelector && (
              <div className="ml-6 mt-1 space-y-0.5">
                {layer.legend.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span
                      className="w-3 h-3 rounded"
                      style={{
                        backgroundColor: item.color,
                        opacity: 0.7,
                        border: item.border ? '1px solid #ccc' : 'none'
                      }}
                    />
                    <span className="text-gray-500">{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LayerPanel;
