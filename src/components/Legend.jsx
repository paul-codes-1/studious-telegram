import {
  contestMarginScale,
  swingColorScale,
  makeTurnoutScale,
  getCandidateColor,
  shortName,
  formatNumber,
  NO_DATA_COLOR,
} from '../utils/colorScale';

function GradientBar({ scale, stops }) {
  return (
    <div
      className="h-4 rounded"
      style={{
        background: `linear-gradient(to right, ${stops.map(s => scale(s)).join(', ')})`
      }}
    />
  );
}

function Legend({ electionId, mode, stats, contest, compact = false }) {
  const isSwing = electionId === 'swing';

  let body = null;

  if (isSwing) {
    const stops = [-40, -30, -20, -10, 0, 10, 20, 30, 40];
    body = (
      <div>
        <label className="block text-sm text-gray-600 mb-2">Gorton swing, 2022 general → 2026 primary</label>
        <GradientBar scale={swingColorScale} stops={stops} />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>−40 (lost ground)</span>
          <span>0</span>
          <span>+40 (gained)</span>
        </div>
      </div>
    );
  } else if (stats && mode === 'margin') {
    const stops = [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50];
    const c1 = stats.cand1 ? shortName(stats.cand1) : '—';
    const c2 = stats.cand2 ? shortName(stats.cand2) : '—';
    body = (
      <div>
        <label className="block text-sm text-gray-600 mb-2">
          Margin: {c1} vs {c2}
        </label>
        <GradientBar scale={contestMarginScale} stops={stops} />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{c2} +50</span>
          <span>Even</span>
          <span>{c1} +50</span>
        </div>
      </div>
    );
  } else if (stats && mode === 'share') {
    const top = stats.ranked.slice(0, 8);
    body = (
      <div>
        <label className="block text-sm text-gray-600 mb-2">Precinct leader (darker = larger share)</label>
        <div className="space-y-1">
          {top.map(([name], idx) => (
            <div key={name} className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded flex-shrink-0" style={{ backgroundColor: getCandidateColor(idx) }}></div>
              <span className="text-gray-600 truncate">{shortName(name)}</span>
            </div>
          ))}
          {stats.ranked.length > 8 && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded flex-shrink-0 bg-gray-500"></div>
              <span className="text-gray-600">Other</span>
            </div>
          )}
        </div>
      </div>
    );
  } else if (stats && mode === 'turnout') {
    const scale = makeTurnoutScale(stats.maxVotes);
    const stops = [0, 0.25, 0.5, 0.75, 1].map(f => f * stats.maxVotes);
    body = (
      <div>
        <label className="block text-sm text-gray-600 mb-2">Votes cast in contest</label>
        <GradientBar scale={scale} stops={stops} />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>{formatNumber(stats.maxVotes)}</span>
        </div>
      </div>
    );
  }

  if (!body) return null;

  if (compact) {
    return (
      <div className="bg-white bg-opacity-95 rounded-lg shadow-lg p-3 w-56">
        {body}
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
          <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: NO_DATA_COLOR }}></div>
          <span>No votes / not on ballot</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-gray-200">
      <h2 className="font-bold text-gray-700 mb-3">Legend</h2>
      <div className="mb-4">{body}</div>
      <div className="flex items-center gap-2 text-sm">
        <div className="w-4 h-4 rounded flex-shrink-0" style={{ backgroundColor: NO_DATA_COLOR }}></div>
        <span className="text-gray-600">No votes / not on ballot</span>
      </div>
      <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-500">
        {isSwing ? (
          <p><strong>Swing</strong> = Gorton's % of the 2026 primary mayor field − her % in the 2022 general</p>
        ) : (
          <p><strong>Margin</strong> = gap between the contest's two citywide leaders, as a share of precinct votes</p>
        )}
        <p className="mt-1">Click a precinct for details</p>
      </div>
    </div>
  );
}

export default Legend;
