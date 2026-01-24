import { getMarginColor, formatPct, formatNumber, getMarginLabel } from '../utils/colorScale';

function PrecinctDetail({ precinct, onClose }) {
  const p = precinct.properties;

  const Section = ({ title, children }) => (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {title}
      </h3>
      {children}
    </div>
  );

  const StatRow = ({ label, value, subValue }) => (
    <div className="flex justify-between py-1">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">
        {value}
        {subValue && <span className="text-gray-400 text-sm ml-1">({subValue})</span>}
      </span>
    </div>
  );

  // Reusable race results component
  const RaceResults = ({ results, emptyMessage = "No results available" }) => {
    if (!results || results.length === 0) {
      return <p className="text-gray-400 text-sm">{emptyMessage}</p>;
    }
    return (
      <div className="space-y-1">
        {results.map((candidate, idx) => (
          <div key={idx} className="flex justify-between p-2 bg-gray-50 rounded">
            <span className="truncate">
              {candidate.name}
              {candidate.party && (
                <span className={`ml-1 text-xs ${
                  candidate.party === 'DEM' ? 'text-blue-600' :
                  candidate.party === 'REP' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  ({candidate.party})
                </span>
              )}
            </span>
            <span className="font-medium ml-2 whitespace-nowrap">
              {formatNumber(candidate.votes)} ({formatPct(candidate.pct)})
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Calculate margin bar width
  const marginBarWidth = Math.abs(p.margin);
  const marginIsD = p.margin < 0;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{p.name}</h2>
          <span className="text-sm text-gray-500">Precinct {p.code}</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
        >
          &times;
        </button>
      </div>

      {/* Margin indicator */}
      <div
        className="p-3 rounded-lg mb-4"
        style={{ backgroundColor: getMarginColor(p.margin) + '30' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{getMarginLabel(p.margin)}</span>
          <span
            className="text-lg font-bold"
            style={{ color: getMarginColor(p.margin * 1.5) }}
          >
            {p.margin > 0 ? 'R+' : 'D+'}{Math.abs(p.margin)}%
          </span>
        </div>
        {/* Margin bar */}
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden flex">
          <div className="w-1/2 flex justify-end">
            {marginIsD && (
              <div
                className="h-full rounded-l-full"
                style={{
                  width: `${Math.min(marginBarWidth * 2, 100)}%`,
                  backgroundColor: '#0571b0'
                }}
              />
            )}
          </div>
          <div className="w-1/2 flex">
            {!marginIsD && (
              <div
                className="h-full rounded-r-full"
                style={{
                  width: `${Math.min(marginBarWidth * 2, 100)}%`,
                  backgroundColor: '#ca0020'
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Presidential Results */}
      <Section title="Presidential Results">
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-red-50 rounded">
            <span>Trump</span>
            <span className="font-medium">{formatNumber(p.trump)} ({formatPct(p.trumpPct)})</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
            <span>Harris</span>
            <span className="font-medium">{formatNumber(p.harris)} ({formatPct(p.harrisPct)})</span>
          </div>
        </div>
      </Section>

      {/* Turnout */}
      <Section title="Turnout">
        <StatRow label="Total Ballots" value={formatNumber(p.ballotsCast)} />
        <StatRow label="Turnout Rate" value={formatPct(p.turnoutPct)} />
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-1">Voting Method</div>
          <StatRow label="Election Day" value={formatNumber(p.electionDay)} />
          <StatRow label="Early Voting" value={formatNumber(p.earlyVoting)} />
          <StatRow label="Absentee" value={formatNumber(p.absentee)} />
        </div>
      </Section>

      {/* Council Race - moved above parks tax */}
      <Section title={`Council District ${p.councilDistrict}`}>
        <RaceResults results={p.councilResults} />
      </Section>

      {/* Parks Tax (Local) */}
      <Section title="Parks Tax (Local)">
        <div className="flex gap-2">
          <div className="flex-1 p-2 bg-green-50 rounded text-center">
            <div className="text-xs text-gray-500">FOR</div>
            <div className="font-bold text-green-700">{formatPct(p.parksTaxForPct)}</div>
            <div className="text-sm text-gray-500">{formatNumber(p.parksTaxFor)}</div>
          </div>
          <div className="flex-1 p-2 bg-gray-50 rounded text-center">
            <div className="text-xs text-gray-500">AGAINST</div>
            <div className="font-bold text-gray-700">{formatPct(100 - p.parksTaxForPct)}</div>
            <div className="text-sm text-gray-500">{formatNumber(p.parksTaxAgainst)}</div>
          </div>
        </div>
      </Section>

      {/* US Representative */}
      <Section title="US Representative">
        <RaceResults results={p.usRepResults} />
      </Section>

      {/* State Senator - only show if results exist */}
      {p.stateSenatorResults && p.stateSenatorResults.length > 0 && (
        <Section title={`State Senator (District ${p.stateSenatorDistrict})`}>
          <RaceResults results={p.stateSenatorResults} />
        </Section>
      )}

      {/* State Representative */}
      <Section title={`State Representative (District ${p.stateRepDistrict})`}>
        <RaceResults results={p.stateRepResults} />
      </Section>

      {/* School Board - only show if results exist */}
      {p.schoolBoardResults && p.schoolBoardResults.length > 0 && (
        <Section title={`School Board (Division ${p.schoolBoardDivision})`}>
          <RaceResults results={p.schoolBoardResults} />
        </Section>
      )}

      {/* Constitutional Amendment 1 */}
      <Section title="Amendment 1">
        <div className="flex gap-2">
          <div className="flex-1 p-2 bg-green-50 rounded text-center">
            <div className="text-xs text-gray-500">YES</div>
            <div className="font-bold text-green-700">{formatPct(p.amendment1YesPct)}</div>
            <div className="text-sm text-gray-500">{formatNumber(p.amendment1Yes)}</div>
          </div>
          <div className="flex-1 p-2 bg-gray-50 rounded text-center">
            <div className="text-xs text-gray-500">NO</div>
            <div className="font-bold text-gray-700">{formatPct(100 - p.amendment1YesPct)}</div>
            <div className="text-sm text-gray-500">{formatNumber(p.amendment1No)}</div>
          </div>
        </div>
      </Section>

      {/* Constitutional Amendment 2 */}
      <Section title="Amendment 2">
        <div className="flex gap-2">
          <div className="flex-1 p-2 bg-green-50 rounded text-center">
            <div className="text-xs text-gray-500">YES</div>
            <div className="font-bold text-green-700">{formatPct(p.amendment2YesPct)}</div>
            <div className="text-sm text-gray-500">{formatNumber(p.amendment2Yes)}</div>
          </div>
          <div className="flex-1 p-2 bg-gray-50 rounded text-center">
            <div className="text-xs text-gray-500">NO</div>
            <div className="font-bold text-gray-700">{formatPct(100 - p.amendment2YesPct)}</div>
            <div className="text-sm text-gray-500">{formatNumber(p.amendment2No)}</div>
          </div>
        </div>
      </Section>

      {/* Demographics */}
      <Section title="Demographics (Census 2020)">
        <StatRow label="Population" value={formatNumber(p.population)} />
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-1">Race/Ethnicity</div>
          <StatRow label="White" value={formatPct(p.whitePct)} subValue={formatNumber(p.white)} />
          <StatRow label="Black" value={formatPct(p.blackPct)} subValue={formatNumber(p.black)} />
          <StatRow label="Asian" value={formatPct(p.asianPct)} subValue={formatNumber(p.asian)} />
          <StatRow label="Hispanic" value={formatPct(p.hispanicPct)} subValue={formatNumber(p.hispanic)} />
        </div>
      </Section>

      {/* Housing */}
      <Section title="Housing">
        <StatRow label="Total Units" value={formatNumber(p.totalUnits)} />
        <StatRow label="Occupied" value={formatNumber(p.occupied)} subValue={formatPct(p.occupancyRate)} />
        <StatRow label="Vacant" value={formatNumber(p.vacant)} />
      </Section>

      {/* District Info */}
      <Section title="Districts">
        <StatRow label="Legislative" value={`District ${p.legislative}`} />
        <StatRow label="Senatorial" value={`District ${p.senatorial}`} />
        <StatRow label="Council" value={`District ${p.councilDistrict}`} />
      </Section>
    </div>
  );
}

export default PrecinctDetail;
