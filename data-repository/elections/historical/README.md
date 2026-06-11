# Fayette County election results, 2002–2022 (recovered)

All 37 county-level election-results pages the old Fayette County Clerk website
(fayettecountyclerk.com) published between 2002 and 2022, recovered from Wayback
Machine captures on 2026-06-11 after the clerk's site migration to fayettekyclerk.gov
dropped the archive (the old domain now 403s). `manifest.txt` records the source
capture per file; several required alternate snapshots (rate limits, truncated
captures, one 504-poisoned response discarded and re-fetched).

`historical_county_results.json` = parsed county-level results:
`{date: {totalVoting?, registered?, races: {race: [{name, votes, pct}]}}}` —
691 races total. Spot-validated against known outcomes (2002 Isaac 51/Crosbie 49;
2010 primary Newberry/Gray/Isaac; 2014 Gray 65/Beatty 35; 2018 Gorton 63/Bastin 37).
Caveats: 2011-05-17 parsed 0 races (odd capture — raw HTML only); some pre-2008
candidate names carry line-wrap artifacts ("Teresa / Isaac"). The raw .htm files are
authoritative.
