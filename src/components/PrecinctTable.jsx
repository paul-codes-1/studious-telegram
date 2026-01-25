import { useState, useMemo } from 'react';
import { getMarginColor, formatPct, formatNumber } from '../utils/colorScale';

function PrecinctTable({ data, selectedPrecinct, onPrecinctSelect }) {
  const [sortConfig, setSortConfig] = useState({ key: 'code', direction: 'asc' });

  // Helper to compute council undervote percentage
  const getCouncilUndervote = (p) => {
    if (!p.councilResults || p.councilResults.length === 0 || !p.ballotsCast) return null;
    const totalVotes = p.councilResults.reduce((sum, c) => sum + c.votes, 0);
    return (1 - totalVotes / p.ballotsCast) * 100;
  };

  // Sort data based on current sort configuration
  const sortedData = useMemo(() => {
    const sorted = [...data.features].sort((a, b) => {
      let aVal, bVal;

      if (sortConfig.key === 'councilUndervote') {
        aVal = getCouncilUndervote(a.properties) ?? -1;
        bVal = getCouncilUndervote(b.properties) ?? -1;
      } else {
        aVal = a.properties[sortConfig.key];
        bVal = b.properties[sortConfig.key];
      }

      if (typeof aVal === 'string') {
        const compare = aVal.localeCompare(bVal);
        return sortConfig.direction === 'asc' ? compare : -compare;
      }

      const compare = aVal - bVal;
      return sortConfig.direction === 'asc' ? compare : -compare;
    });

    return sorted;
  }, [data.features, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortHeader = ({ label, sortKey }) => {
    const isActive = sortConfig.key === sortKey;
    return (
      <th
        onClick={() => handleSort(sortKey)}
        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      >
        <div className="flex items-center gap-1">
          {label}
          {isActive && (
            <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="bg-white">
      <table style={{ minWidth: '900px', width: '100%' }} className="divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <SortHeader label="Code" sortKey="code" />
            <SortHeader label="Precinct" sortKey="name" />
            <SortHeader label="Trump %" sortKey="trumpPct" />
            <SortHeader label="Harris %" sortKey="harrisPct" />
            <SortHeader label="Margin" sortKey="margin" />
            <SortHeader label="Ballots" sortKey="ballotsCast" />
            <SortHeader label="Population" sortKey="population" />
            <SortHeader label="Turnout %" sortKey="turnoutPct" />
            <SortHeader label="Council" sortKey="councilDistrict" />
            <SortHeader label="Council Undervote" sortKey="councilUndervote" />
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((feature) => {
            const p = feature.properties;
            const isSelected = selectedPrecinct?.properties.code === p.code;

            return (
              <tr
                key={p.code}
                onClick={() => onPrecinctSelect(feature)}
                className={`cursor-pointer hover:bg-gray-50 ${
                  isSelected ? 'bg-blue-50 ring-2 ring-inset ring-blue-500' : ''
                }`}
              >
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {p.code}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {p.name}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {formatPct(p.trumpPct)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {formatPct(p.harrisPct)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getMarginColor(p.margin) }}
                    />
                    <span className={p.margin < 0 ? 'text-blue-600' : 'text-red-600'}>
                      {p.margin > 0 ? '+' : ''}{p.margin}%
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {formatNumber(p.ballotsCast)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {formatNumber(p.population)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {formatPct(p.turnoutPct)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {p.councilDistrict}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {getCouncilUndervote(p) !== null ? `${getCouncilUndervote(p).toFixed(1)}%` : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {sortedData.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No precincts match the current filters
        </div>
      )}
    </div>
  );
}

export default PrecinctTable;
