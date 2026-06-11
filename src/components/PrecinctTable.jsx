import { useState, useMemo } from 'react';
import {
  contestMarginScale,
  getSwingColor,
  shortName,
  formatPct,
  formatNumber,
} from '../utils/colorScale';

function PrecinctTable({ data, selectedPrecinct, onPrecinctSelect, electionId, stats, swingData }) {
  const [sortConfig, setSortConfig] = useState({ key: 'code', direction: 'asc' });
  const isSwing = electionId === 'swing';

  // Build one row per precinct with the computed fields for the current view
  const rows = useMemo(() => {
    return data.features.map((feature) => {
      const p = feature.properties;
      if (isSwing) {
        const s = swingData?.[p.code];
        return {
          feature,
          code: p.code,
          name: p.name,
          councilDistrict: p.councilDistrict,
          population: p.population,
          g22Pct: s?.g22Pct ?? null,
          g26Pct: s?.g26Pct ?? null,
          swing: s?.swing ?? null,
          total: s?.g26Total ?? null,
        };
      }
      const st = stats?.byCode[p.code];
      const total = st?.total || 0;
      const v1 = (stats?.cand1 && st && total > 0) ? (st.entries.find(([n]) => n === stats.cand1)?.[1] || 0) : null;
      const v2 = (stats?.cand2 && st && total > 0) ? (st.entries.find(([n]) => n === stats.cand2)?.[1] || 0) : null;
      return {
        feature,
        code: p.code,
        name: p.name,
        councilDistrict: p.councilDistrict,
        population: p.population,
        leaderName: st?.leaderName ?? null,
        cand1Pct: v1 != null ? (v1 / total) * 100 : null,
        cand2Pct: v2 != null ? (v2 / total) * 100 : null,
        margin: st?.margin ?? null,
        total: st ? st.total : null,
      };
    });
  }, [data.features, isSwing, stats, swingData]);

  // Sort rows based on current sort configuration
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const compare = aVal.localeCompare(bVal);
        return sortConfig.direction === 'asc' ? compare : -compare;
      }

      // Push null/no-data rows to the bottom regardless of direction
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      const compare = aVal - bVal;
      return sortConfig.direction === 'asc' ? compare : -compare;
    });
  }, [rows, sortConfig]);

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

  const pctCell = (value) => (
    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
      {value != null ? formatPct(value) : '—'}
    </td>
  );

  return (
    <div className="bg-white">
      <table style={{ minWidth: '900px', width: '100%' }} className="divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <SortHeader label="Code" sortKey="code" />
            <SortHeader label="Precinct" sortKey="name" />
            {isSwing ? (
              <>
                <SortHeader label="'22 Gorton %" sortKey="g22Pct" />
                <SortHeader label="'26 Gorton %" sortKey="g26Pct" />
                <SortHeader label="Swing" sortKey="swing" />
                <SortHeader label="'26 Mayor Votes" sortKey="total" />
              </>
            ) : (
              <>
                <SortHeader label={stats?.cand1 ? `${shortName(stats.cand1)} %` : 'Leader %'} sortKey="cand1Pct" />
                <SortHeader label={stats?.cand2 ? `${shortName(stats.cand2)} %` : 'Runner-up %'} sortKey="cand2Pct" />
                <SortHeader label="Margin" sortKey="margin" />
                <SortHeader label="Votes" sortKey="total" />
              </>
            )}
            <SortHeader label="Population" sortKey="population" />
            <SortHeader label="Council" sortKey="councilDistrict" />
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedRows.map((row) => {
            const isSelected = selectedPrecinct?.properties.code === row.code;
            const divergeValue = isSwing ? row.swing : row.margin;
            const divergeColor = isSwing ? getSwingColor(row.swing) : (row.margin != null ? contestMarginScale(row.margin) : '#d1d5db');

            return (
              <tr
                key={row.code}
                onClick={() => onPrecinctSelect(row.feature)}
                className={`cursor-pointer hover:bg-gray-50 ${
                  isSelected ? 'bg-blue-50 ring-2 ring-inset ring-blue-500' : ''
                }`}
              >
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.code}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {row.name}
                </td>
                {isSwing ? (
                  <>
                    {pctCell(row.g22Pct)}
                    {pctCell(row.g26Pct)}
                  </>
                ) : (
                  <>
                    {pctCell(row.cand1Pct)}
                    {pctCell(row.cand2Pct)}
                  </>
                )}
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {divergeValue != null ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full border border-gray-200"
                        style={{ backgroundColor: divergeColor }}
                      />
                      <span className={divergeValue < 0 ? 'text-red-700' : 'text-blue-700'}>
                        {divergeValue > 0 ? '+' : ''}{divergeValue.toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {row.total != null ? formatNumber(row.total) : '—'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {formatNumber(row.population)}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                  {row.councilDistrict}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {sortedRows.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No precincts match the current filters
        </div>
      )}
    </div>
  );
}

export default PrecinctTable;
