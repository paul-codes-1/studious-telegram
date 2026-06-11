import {
  getCandidateColor,
  getSwingColor,
  shortName,
  formatPct,
  formatNumber,
} from '../utils/colorScale';

function PrecinctDetail({
  precinct,
  onClose,
  electionId,
  electionLabel,
  contest,
  stats,
  contests,
  swingData,
  onContestSelect,
}) {
  const p = precinct.properties;
  const code = p.code;
  const isSwing = electionId === 'swing';

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

  // Full results for the selected contest in this precinct
  const precinctResult = stats?.byCode[code];

  // Every other contest on this precinct's ballot for the selected election
  const otherContests = (contests || []).filter(
    (c) => c.key !== contest?.key && c.precincts[code]
  );

  const swingRow = isSwing ? swingData?.[code] : null;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{p.name}</h2>
          <span className="text-sm text-gray-500">Precinct {code} · {electionLabel}</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
        >
          &times;
        </button>
      </div>

      {/* Gorton swing view */}
      {isSwing && (
        <Section title="Gorton Swing 22→26">
          {swingRow && swingRow.swing != null ? (
            <div>
              <div
                className="p-3 rounded-lg mb-2"
                style={{ backgroundColor: getSwingColor(swingRow.swing) + '30' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {swingRow.swing >= 0 ? 'Gorton gained' : 'Gorton lost ground'}
                  </span>
                  <span className="text-lg font-bold">
                    {swingRow.swing > 0 ? '+' : ''}{swingRow.swing.toFixed(1)} pts
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>2022 general</span>
                  <span className="font-medium">
                    {formatPct(swingRow.g22Pct)}
                    <span className="text-gray-400 text-sm ml-1">
                      ({formatNumber(swingRow.g22Gorton)} of {formatNumber(swingRow.g22Total)})
                    </span>
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>2026 primary</span>
                  <span className="font-medium">
                    {formatPct(swingRow.g26Pct)}
                    <span className="text-gray-400 text-sm ml-1">
                      ({formatNumber(swingRow.g26Gorton)} of {formatNumber(swingRow.g26Total)})
                    </span>
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Gorton's share of the mayor field in each election.
              </p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No mayor votes recorded in both elections</p>
          )}
        </Section>
      )}

      {/* Selected contest — full precinct results */}
      {!isSwing && contest && (
        <Section title={contest.title}>
          {precinctResult && precinctResult.total > 0 ? (
            <div>
              <div className="space-y-1">
                {precinctResult.entries.map(([name, votes]) => {
                  const pct = (votes / precinctResult.total) * 100;
                  const idx = stats.candIndex.get(name) ?? 99;
                  return (
                    <div key={name} className="p-2 bg-gray-50 rounded">
                      <div className="flex justify-between items-center gap-2">
                        <span className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getCandidateColor(idx) }}
                          />
                          <span className="truncate text-sm">{name}</span>
                        </span>
                        <span className="font-medium text-sm whitespace-nowrap">
                          {formatNumber(votes)} ({formatPct(pct)})
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: getCandidateColor(idx) }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {formatNumber(precinctResult.total)} votes cast in this contest
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No votes recorded in this precinct</p>
          )}
        </Section>
      )}

      {/* Other contests on this precinct's ballot */}
      {!isSwing && otherContests.length > 0 && (
        <Section title="Also on this ballot">
          <div className="divide-y divide-gray-100 border border-gray-100 rounded">
            {otherContests.map((c) => {
              const cands = c.precincts[code];
              const entries = Object.entries(cands).sort((a, b) => b[1] - a[1]);
              const total = entries.reduce((sum, [, v]) => sum + v, 0);
              const [leadName, leadVotes] = entries[0] || [];
              return (
                <button
                  key={c.key}
                  onClick={() => onContestSelect(c.key)}
                  className="w-full px-2 py-1.5 text-left hover:bg-blue-50 flex justify-between items-baseline gap-2"
                  title="View this contest on the map"
                >
                  <span className="text-xs text-gray-600 leading-snug min-w-0">{c.title}</span>
                  <span className="text-xs font-medium text-gray-800 whitespace-nowrap">
                    {total > 0 && leadName
                      ? `${shortName(leadName)} ${formatPct((leadVotes / total) * 100, 0)}`
                      : '—'}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Precinct leader shown · click a contest to map it
          </p>
        </Section>
      )}

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

      {/* 2024 turnout (from registered-voter data) */}
      <Section title="Turnout (2024 General)">
        <StatRow label="Total Ballots" value={formatNumber(p.ballotsCast)} />
        <StatRow label="Turnout Rate" value={formatPct(p.turnoutPct)} />
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-1">Voting Method</div>
          <StatRow label="Election Day" value={formatNumber(p.electionDay)} />
          <StatRow label="Early Voting" value={formatNumber(p.earlyVoting)} />
          <StatRow label="Absentee" value={formatNumber(p.absentee)} />
        </div>
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
