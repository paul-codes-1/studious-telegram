import { marginColorScale } from '../utils/colorScale';

function Legend() {
  // Generate gradient stops
  const stops = [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50];

  return (
    <div className="p-4 border-t border-gray-200">
      <h2 className="font-bold text-gray-700 mb-3">Legend</h2>

      {/* Presidential margin scale */}
      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-2">Presidential Margin</label>
        <div
          className="h-4 rounded"
          style={{
            background: `linear-gradient(to right, ${stops.map(s => marginColorScale(s)).join(', ')})`
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>D+50</span>
          <span>Even</span>
          <span>R+50</span>
        </div>
      </div>

      {/* Legend items */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#0571b0' }}></div>
          <span className="text-gray-600">Strong Democrat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#92c5de' }}></div>
          <span className="text-gray-600">Lean Democrat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-200 border border-gray-300"></div>
          <span className="text-gray-600">Swing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f4a582' }}></div>
          <span className="text-gray-600">Lean Republican</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ca0020' }}></div>
          <span className="text-gray-600">Strong Republican</span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-500">
        <p><strong>Margin</strong> = Trump% - Harris%</p>
        <p className="mt-1">Click a precinct for details</p>
      </div>
    </div>
  );
}

export default Legend;
