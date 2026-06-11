import { useState, useRef, useEffect } from 'react';

function ContestPicker({ contests, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = contests.find((c) => c.key === value);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Focus search input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const filtered = query
    ? contests.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))
    : contests;

  const handleSelect = (key) => {
    onChange(key);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0 max-w-md" style={{ zIndex: 1200 }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-left hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="truncate font-medium text-gray-800">
          {selected ? selected.title : 'Select a contest…'}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${contests.length} contests…`}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <ul className="max-h-72 overflow-y-auto">
            {filtered.map((contest) => (
              <li key={contest.key}>
                <button
                  onClick={() => handleSelect(contest.key)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 ${
                    contest.key === value ? 'bg-blue-100 font-medium' : ''
                  }`}
                >
                  <span className="block text-gray-800 leading-snug">{contest.title}</span>
                  <span className="block text-xs text-gray-400 mt-0.5">
                    {contest.coverage} of 286 precincts
                    {contest.party ? ` · ${contest.party} primary` : ''}
                  </span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-sm text-gray-400">No contests match "{query}"</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ContestPicker;
