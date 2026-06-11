# Election data archive — sources & provenance (collected 2026-06-11)

Archived so the underlying records survive even if the sources go away.

| File | What | Source |
|---|---|---|
| `G22-precinct.pdf` / `.txt` | 2022 General, full precinct results report (286 precincts, 64 contests) | Wayback Machine capture 2023-10-19 of fayettecountyclerk.com `FayetteGeneral2022PrecinctResults.pdf` (first capture is 1MB-truncated; use later ones) |
| `results2024.txt` | 2024 General precinct results (pdftotext of clerk's ES&S report) | originally in this repo's git history (`main:data-repository/results.txt`) |
| `P26-cumulative.pdf` | 2026 Primary official cumulative report | fayettekyclerk.gov uploads CDN |
| `sos_p26_raw/contest_*.html` | 2026 Primary, per-precinct results for ALL 16 Fayette contests | KY SOS: `POST https://vrsws.sos.ky.gov/liveresults/GetPrecinctsForContestAndCounty` body `contest=<id>&county=36` (contest ids in build_atlas.py; fetched 2026-06-11 while the live-results window was still up) |
| `atlas/g2022.json` `g2024.json` `p2026.json` | Parsed unified atlas: `{precinct: {contest: {candidate: votes}}}` (p2026 keyed by contest id with title/party/totals) | built by `~/lt/.report-data/elections/build_atlas.py` |
| `plow_gps.json` | 43 LFUCG snow-plow vehicles, 218,307 GPS pings, Jan 21–Feb 13 2026, `{vehicle: {date: [[lat,lon,secOffset]]}}`, epoch 1768953605 | plowmap.lexingtonky.news/data/gps_data.json |

Known quirks: precinct C115 (2022) was renamed B115 by 2024 — join by name for that one.
2022 totals validate against the county canvass (e.g. MAYOR: Gorton 67,083 / Kloiber 27,360);
2026 MAYOR parse validates against the official cumulative exactly (Gorton 25,298 / Carter 15,615).
