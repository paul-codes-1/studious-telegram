function LayerPanel({ layers, activeLayerIds, onToggle, mobile }) {
  if (mobile) {
    // Mobile: vertical list with legends
    return (
      <div className="space-y-4">
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
                {layer.legend && activeLayerIds[layer.id] && (
                  <div className="mt-2 space-y-1">
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
            </label>
          </div>
        ))}
      </div>
    );
  }

  // Desktop: compact card
  return (
    <div className="bg-white rounded-lg shadow-lg p-3 min-w-[200px]">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Layers</div>
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
            {layer.legend && activeLayerIds[layer.id] && (
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
