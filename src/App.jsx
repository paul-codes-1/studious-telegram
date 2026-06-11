import { useState, useEffect, useMemo, useRef } from 'react';
import PrecinctMap from './components/PrecinctMap';
import PrecinctTable from './components/PrecinctTable';
import PrecinctDetail from './components/PrecinctDetail';
import Legend from './components/Legend';
import FilterPanel from './components/FilterPanel';
import ContestPicker from './components/ContestPicker';
import precinctData from './data/precincts.json';
import { computeContestStats } from './utils/contestStats';
import {
  contestMarginScale,
  getCandidateColor,
  getShareColor,
  makeTurnoutScale,
  getSwingColor,
  shortName,
  formatPct,
  formatNumber,
  NO_DATA_COLOR,
} from './utils/colorScale';

const ELECTIONS = [
  { id: 'g2022', label: '2022 General' },
  { id: 'g2024', label: '2024 General' },
  { id: 'p2026', label: '2026 Primary' },
  { id: 'swing', label: 'Special: Gorton swing 22→26' },
];

const MODES = [
  { id: 'margin', label: 'Margin' },
  { id: 'share', label: 'Leader share' },
  { id: 'turnout', label: 'Turnout' },
];

const DEFAULT_FILTERS = {
  search: '',
  marginMin: -100,
  marginMax: 100,
  minVotes: 0,
  councilDistricts: [] // empty = all districts
};

// Restore view state from the URL query string (shareable deep links).
// Invalid or missing params fall back to the defaults.
function parseInitialState() {
  const params = new URLSearchParams(window.location.search);
  const election = ELECTIONS.some(e => e.id === params.get('election'))
    ? params.get('election')
    : 'p2026';
  const mode = MODES.some(m => m.id === params.get('mode'))
    ? params.get('mode')
    : 'margin';
  // Contest keys are validated against the election's ballot once its data loads
  const contest = params.get('contest') || null;
  const precinct = precinctData.features.find(
    f => f.properties.code === params.get('precinct')
  ) || null;
  return { election, mode, contest, precinct };
}

const INITIAL_STATE = parseInitialState();

function App() {
  const [electionId, setElectionId] = useState(INITIAL_STATE.election);
  const [contestKey, setContestKey] = useState(INITIAL_STATE.contest);
  const [mode, setMode] = useState(INITIAL_STATE.mode);
  const [selectedPrecinct, setSelectedPrecinct] = useState(INITIAL_STATE.precinct);
  const [view, setView] = useState('map'); // 'map' or 'table'
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [electionCache, setElectionCache] = useState({}); // id -> fetched payload
  const [loadError, setLoadError] = useState(null);

  // Remember the last contest viewed per election
  const lastContestRef = useRef({});

  const election = electionCache[electionId];
  const isSwing = electionId === 'swing';
  const contests = election?.contests || [];
  const contest = useMemo(
    () => contests.find(c => c.key === contestKey) || null,
    [contests, contestKey]
  );

  // Fetch election data on demand (kept out of the JS bundle)
  useEffect(() => {
    if (electionCache[electionId]) return;
    let cancelled = false;
    setLoadError(null);
    fetch(`/data/elections/${electionId}.json`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!cancelled) {
          setElectionCache(prev => ({ ...prev, [electionId]: data }));
        }
      })
      .catch(err => {
        if (!cancelled) setLoadError(`Could not load election data (${err.message})`);
      });
    return () => { cancelled = true; };
  }, [electionId, electionCache]);

  // Pick a default contest when an election loads: the biggest race on the ballot
  useEffect(() => {
    if (isSwing || !election) return;
    if (contestKey && election.contests.some(c => c.key === contestKey)) return;
    const remembered = lastContestRef.current[electionId];
    if (remembered && election.contests.some(c => c.key === remembered)) {
      setContestKey(remembered);
      return;
    }
    const marquee = [/^PRESIDENT/, /^UNITED STATES SENATOR/, /^MAYOR$/]
      .map(re => election.contests.find(c => re.test(c.title)))
      .find(Boolean);
    const biggest = marquee || [...election.contests].sort((a, b) => {
      const sum = c => Object.values(c.totals).reduce((s, v) => s + v, 0);
      return sum(b) - sum(a);
    })[0];
    setContestKey(biggest?.key || null);
  }, [election, electionId, contestKey, isSwing]);

  const handleElectionChange = (id) => {
    if (contestKey) lastContestRef.current[electionId] = contestKey;
    setElectionId(id);
    setContestKey(null);
  };

  const handleContestChange = (key) => {
    setContestKey(key);
    lastContestRef.current[electionId] = key;
  };

  // Keep the URL in sync with the current view so any map state is shareable
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('election', electionId);
    if (!isSwing && contestKey) params.set('contest', contestKey);
    if (!isSwing) params.set('mode', mode);
    if (selectedPrecinct) params.set('precinct', selectedPrecinct.properties.code);
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  }, [electionId, contestKey, mode, selectedPrecinct, isSwing]);

  // Share button: copy the current deep link
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fall back to a hidden textarea
      const textarea = document.createElement('textarea');
      textarea.value = window.location.href;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  // Per-precinct stats for the selected contest
  const stats = useMemo(() => computeContestStats(contest), [contest]);
  const swingData = isSwing ? election?.precincts : null;
  const turnoutScale = useMemo(
    () => makeTurnoutScale(stats?.maxVotes || 1),
    [stats]
  );

  // Choropleth fill for the current election/contest/mode
  const getColor = (feature) => {
    const code = feature.properties.code;
    if (isSwing) {
      return getSwingColor(swingData?.[code]?.swing ?? null);
    }
    const st = stats?.byCode[code];
    if (!st || st.total === 0) return NO_DATA_COLOR;
    if (mode === 'margin') return contestMarginScale(st.margin);
    if (mode === 'share') return getShareColor(getCandidateColor(st.leaderIdx), st.leaderShare);
    return turnoutScale(st.total);
  };

  // Hover tooltip for the current election/contest/mode
  const getTooltipHtml = (feature) => {
    const p = feature.properties;
    const head = `<strong>${p.name}</strong> (${p.code})`;
    if (isSwing) {
      const s = swingData?.[p.code];
      if (!s || s.swing == null) return `<div class="font-sans">${head}<br/>No mayor votes in both elections</div>`;
      return `
        <div class="font-sans">
          ${head}<br/>
          Gorton '22 general: ${formatPct(s.g22Pct)} (${formatNumber(s.g22Gorton)}/${formatNumber(s.g22Total)})<br/>
          Gorton '26 primary: ${formatPct(s.g26Pct)} (${formatNumber(s.g26Gorton)}/${formatNumber(s.g26Total)})<br/>
          Swing: ${s.swing > 0 ? '+' : ''}${s.swing.toFixed(1)} pts
        </div>
      `;
    }
    const st = stats?.byCode[p.code];
    if (!st || st.total === 0) return `<div class="font-sans">${head}<br/>No votes recorded</div>`;
    const lines = st.entries.slice(0, 2).map(([name, votes]) =>
      `${shortName(name)}: ${formatNumber(votes)} (${formatPct((votes / st.total) * 100)})`
    );
    return `
      <div class="font-sans">
        ${head}<br/>
        ${lines.join('<br/>')}<br/>
        ${formatNumber(st.total)} votes cast
      </div>
    `;
  };

  // Filter precincts based on current filters
  const filteredData = useMemo(() => {
    const marginActive = filters.marginMin > -100 || filters.marginMax < 100;
    const votesActive = filters.minVotes > 0;

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

        // Council district filter
        if (filters.councilDistricts.length > 0 &&
            !filters.councilDistricts.includes(p.councilDistrict)) {
          return false;
        }

        // Margin / swing + min-votes filters against the current view's values
        const divergeValue = isSwing
          ? swingData?.[p.code]?.swing ?? null
          : stats?.byCode[p.code]?.margin ?? null;
        const votes = isSwing
          ? swingData?.[p.code]?.g26Total ?? 0
          : stats?.byCode[p.code]?.total ?? 0;

        if (marginActive) {
          if (divergeValue == null) return false;
          if (divergeValue < filters.marginMin || divergeValue > filters.marginMax) return false;
        }
        if (votesActive && votes < filters.minVotes) {
          return false;
        }

        return true;
      })
    };
  }, [filters, isSwing, stats, swingData]);

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

  // Force the GeoJSON layer to re-render when anything that affects styling changes
  const renderKey = `${electionId}|${contestKey}|${mode}|${filteredData.features.length}|${selectedPrecinct?.properties.code || 'none'}`;

  const electionLabel = ELECTIONS.find(e => e.id === electionId)?.label || '';
  const loading = !election && !loadError;

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
          <h1 className="text-lg sm:text-xl font-bold">Lexington Precinct Election Atlas</h1>
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

      {/* Election / contest / mode toolbar */}
      <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex flex-wrap items-center gap-2" style={{ zIndex: 1100, position: 'relative' }}>
        <select
          value={electionId}
          onChange={(e) => handleElectionChange(e.target.value)}
          className="px-2 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Election"
        >
          {ELECTIONS.map(e => (
            <option key={e.id} value={e.id}>{e.label}</option>
          ))}
        </select>

        {!isSwing && contests.length > 0 && (
          <ContestPicker
            contests={contests}
            value={contestKey}
            onChange={handleContestChange}
          />
        )}

        {!isSwing && (
          <div className="flex bg-gray-200 rounded-lg p-0.5">
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`px-2.5 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  mode === m.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={handleShare}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs sm:text-sm font-medium border transition-colors ${
            copied
              ? 'bg-green-100 text-green-700 border-green-300'
              : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-gray-900'
          }`}
          title="Copy a link to this view"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" />
          </svg>
          {copied ? 'Copied!' : 'Share'}
        </button>

        {loading && <span className="text-sm text-gray-500">Loading election data…</span>}
        {loadError && <span className="text-sm text-red-600">{loadError}</span>}
      </div>

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
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              electionId={electionId}
              stats={stats}
              maxVotes={stats?.maxVotes || 0}
            />
            <Legend electionId={electionId} mode={mode} stats={stats} contest={contest} />
          </div>
        )}

        {/* Main view area */}
        <div className={`flex-1 relative ${view === 'table' ? 'overflow-auto' : 'overflow-hidden'}`}>
          {view === 'map' ? (
            <>
              <PrecinctMap
                data={filteredData}
                selectedPrecinct={selectedPrecinct}
                onPrecinctSelect={handlePrecinctSelect}
                getColor={getColor}
                getTooltipHtml={getTooltipHtml}
                renderKey={renderKey}
              />
              {/* Floating legend over the map */}
              <div className="absolute bottom-6 right-2 hidden sm:block" style={{ zIndex: 900 }}>
                <Legend electionId={electionId} mode={mode} stats={stats} contest={contest} compact />
              </div>
            </>
          ) : (
            <PrecinctTable
              data={filteredData}
              selectedPrecinct={selectedPrecinct}
              onPrecinctSelect={handlePrecinctSelect}
              electionId={electionId}
              stats={stats}
              swingData={swingData}
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
              electionId={electionId}
              electionLabel={electionLabel}
              contest={contest}
              stats={stats}
              contests={contests}
              swingData={swingData}
              onContestSelect={handleContestChange}
            />
          </div>
        )}
      </div>

      {/* Footer / about */}
      <footer className="bg-gray-800 text-gray-400 px-4 py-1.5 text-xs text-center">
        Data: Fayette County Clerk precinct reports + KY Secretary of State live results —{' '}
        <a href="https://github.com/paul-codes-1/studious-telegram/tree/main/data-repository/elections" className="underline hover:text-white">browse the raw archive</a>{' '}
        (canvasses, recovered 2002–2022 results, plow GPS) ·{' '}
        <a href="https://github.com/paul-codes-1/studious-telegram/tree/main/public/data/elections" className="underline hover:text-white">parsed JSON</a>{' '}
        · Demographics: US Census 2020 ·{' '}
        <a href="https://lexingtonky.news" className="underline hover:text-white">The Lexington Times</a>
      </footer>
    </div>
  );
}

export default App;
