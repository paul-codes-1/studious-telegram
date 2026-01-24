import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Load raw data files
const resultsText = fs.readFileSync(path.join(rootDir, 'results.txt'), 'utf8');
const votingPrecincts = JSON.parse(fs.readFileSync(path.join(rootDir, 'Voting_Precinct_1444398891930194722 (1).geojson'), 'utf8'));
const raceData = JSON.parse(fs.readFileSync(path.join(rootDir, 'Census_2020_-_Race_by_Precinct (1).geojson'), 'utf8'));
const occupancyData = JSON.parse(fs.readFileSync(path.join(rootDir, 'Census_2020_-_Occupancy_Status_by_Precinct.geojson'), 'utf8'));

// Build lookup maps for census data
const raceByCode = {};
for (const feature of raceData.features) {
  raceByCode[feature.properties.CODE] = feature.properties;
}

const occupancyByCode = {};
for (const feature of occupancyData.features) {
  occupancyByCode[feature.properties.CODE] = feature.properties;
}

// Parse results.txt
function parseResults(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  const precincts = {};

  let currentPrecinct = null;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Match precinct header like "A101-ALEXANDRIA"
    const precinctMatch = line.match(/^([A-Z]\d{3})-(.+)$/);
    if (precinctMatch) {
      currentPrecinct = precinctMatch[1];
      const precinctName = precinctMatch[2];

      if (!precincts[currentPrecinct]) {
        precincts[currentPrecinct] = {
          code: currentPrecinct,
          name: precinctName,
          ballotsCast: 0,
          trump: 0,
          harris: 0,
          earlyVoting: 0,
          electionDay: 0,
          absentee: 0,
          amendment2For: 0,
          amendment2Against: 0,
          councilDistrict: null,
          councilResults: []
        };
      }

      // Next line should be "X ballots cast"
      i++;
      if (i < lines.length) {
        const ballotsMatch = lines[i].match(/^(\d+) ballots cast$/);
        if (ballotsMatch) {
          precincts[currentPrecinct].ballotsCast = parseInt(ballotsMatch[1]);
        }
      }
      i++;
      continue;
    }

    // Parse presidential race
    if (line.includes('Donald J. TRUMP') && currentPrecinct) {
      const p = precincts[currentPrecinct];
      // Scan forward for Trump's total vote count
      // Numbers appear as: absentee-mail, %, absentee-walk, %, early, %, election-day, %, total, %
      let j = i + 1;
      let numbers = [];
      while (j < lines.length && numbers.length < 5) {
        const num = lines[j].match(/^(\d+)$/);
        if (num) {
          numbers.push(parseInt(num[1]));
        }
        j++;
        if (lines[j] && (lines[j].includes('Kamala') || lines[j].includes('HARRIS'))) {
          break;
        }
      }
      if (numbers.length >= 5) {
        p.trump = numbers[4]; // Total is the 5th number
      }
      i = j;
      continue;
    }

    if (line.includes('Kamala D. HARRIS') && currentPrecinct) {
      const p = precincts[currentPrecinct];
      let j = i + 1;
      let numbers = [];
      while (j < lines.length && numbers.length < 5) {
        const num = lines[j].match(/^(\d+)$/);
        if (num) {
          numbers.push(parseInt(num[1]));
        }
        j++;
        if (lines[j] && (lines[j].includes('Jill STEIN') || lines[j].includes('Robert F. KENNEDY'))) {
          break;
        }
      }
      if (numbers.length >= 5) {
        p.harris = numbers[4];
      }
      i = j;
      continue;
    }

    // Parse Cast Votes for presidential section (comes after all candidates)
    // Look for the pattern: Cast Votes followed by Undervotes (indicates end of a race)
    if (line === 'Cast Votes:' && currentPrecinct && precincts[currentPrecinct].electionDay === 0) {
      const p = precincts[currentPrecinct];
      // Check if this is followed by numbers then Undervotes (complete section)
      let j = i + 1;
      let castNumbers = [];
      while (j < lines.length && castNumbers.length < 5) {
        const num = lines[j].match(/^(\d+)$/);
        if (num) {
          castNumbers.push(parseInt(num[1]));
        }
        j++;
      }
      // Skip past any remaining percentages to find Undervotes
      while (j < lines.length && lines[j].match(/^[\d.]+%$/)) {
        j++;
      }
      // Verify we got 5 numbers and next line is Undervotes
      if (castNumbers.length >= 5 && lines[j] === 'Undervotes:') {
        // Only set if this looks like presidential totals (check if numbers make sense)
        // Presidential cast votes should be close to ballotsCast
        const total = castNumbers[4];
        const diff = Math.abs(total - p.ballotsCast);
        if (total > 0 && diff < 50) {
          p.absentee = castNumbers[0] + castNumbers[1]; // mail-in + walk-in
          p.earlyVoting = castNumbers[2];
          p.electionDay = castNumbers[3];
        }
      }
      i = j;
      continue;
    }

    // Parse Amendment 2 (Parks Tax)
    if (line === 'AD VALOREM TAX FOR PUBLIC PARKS' && currentPrecinct) {
      const p = precincts[currentPrecinct];
      // Look for FOR and AGAINST
      let j = i + 1;
      while (j < lines.length) {
        if (lines[j] === 'FOR') {
          j++;
          let numbers = [];
          while (j < lines.length && numbers.length < 5) {
            const num = lines[j].match(/^(\d+)$/);
            if (num) {
              numbers.push(parseInt(num[1]));
            }
            j++;
            if (lines[j] === 'AGAINST') break;
          }
          if (numbers.length >= 5) {
            p.amendment2For = numbers[4];
          }
        }
        if (lines[j] === 'AGAINST') {
          j++;
          let numbers = [];
          while (j < lines.length && numbers.length < 5) {
            const num = lines[j].match(/^(\d+)$/);
            if (num) {
              numbers.push(parseInt(num[1]));
            }
            j++;
            if (lines[j] === 'Cast Votes:') break;
          }
          if (numbers.length >= 5) {
            p.amendment2Against = numbers[4];
          }
          break;
        }
        // Stop if we hit a new precinct or section
        if (lines[j] && lines[j].match(/^[A-Z]\d{3}-/)) break;
        j++;
      }
      i = j;
      continue;
    }

    // Parse Urban County Council
    const councilMatch = line.match(/^URBAN COUNTY COUNCIL District (\d+)/);
    if (councilMatch && currentPrecinct) {
      const p = precincts[currentPrecinct];
      const district = parseInt(councilMatch[1]);

      // Only set district if not already set (first occurrence for this precinct)
      if (p.councilDistrict === null) {
        p.councilDistrict = district;
      }

      // Find candidate names - they appear after "Party" and before "Absentee Mail-In" or numbers
      let j = i + 1;
      let foundParty = false;
      let candidates = [];

      while (j < lines.length) {
        const currentLine = lines[j];

        if (currentLine === 'Party') {
          foundParty = true;
          j++;
          continue;
        }

        // After seeing Party, look for candidate names
        if (foundParty) {
          // Stop at Cast Votes or new section
          if (currentLine === 'Cast Votes:' ||
              currentLine === 'Undervotes:' ||
              currentLine.match(/^[A-Z]\d{3}-/) ||
              currentLine.includes('FAYETTE COUNTY BOARD') ||
              currentLine.includes('Precinct Results Report')) {
            break;
          }

          // Skip header lines and numbers/percentages
          if (currentLine === 'Absentee Mail-In' ||
              currentLine === 'Absentee Walk-In' ||
              currentLine === 'Early Voting' ||
              currentLine === 'Election Day Voting' ||
              currentLine === 'Total' ||
              currentLine.match(/^(\d+)$/) ||
              currentLine.match(/^[\d.]+%$/)) {
            j++;
            continue;
          }

          // This should be a candidate name - look like "Name NAME" or "Name NAME (W)"
          if (currentLine.match(/[A-Z]{2,}/) && !currentLine.includes('URBAN') && !currentLine.includes('COUNCIL')) {
            // Found a candidate name - now get their vote total
            let k = j + 1;
            let numbers = [];
            while (k < lines.length && numbers.length < 5) {
              const num = lines[k].match(/^(\d+)$/);
              if (num) {
                numbers.push(parseInt(num[1]));
              }
              k++;
              // Stop if we hit another candidate, Cast Votes, or end of section
              if (lines[k] && (
                  lines[k] === 'Cast Votes:' ||
                  (lines[k].match(/[A-Z]{2,}/) && !lines[k].match(/^(\d+|[\d.]+%)$/)))) {
                break;
              }
            }
            if (numbers.length >= 5) {
              candidates.push({
                name: currentLine,
                votes: numbers[4] // Total
              });
            }
            j = k;
            continue;
          }
        }
        j++;
      }

      // Only add candidates if we found any and haven't added for this precinct yet
      if (candidates.length > 0 && p.councilResults.length === 0) {
        p.councilResults = candidates;
      }

      i = j;
      continue;
    }

    i++;
  }

  return precincts;
}

console.log('Parsing election results...');
const electionResults = parseResults(resultsText);
console.log(`Parsed ${Object.keys(electionResults).length} precincts from results`);

// Build final GeoJSON with all merged data
const outputFeatures = [];

for (const feature of votingPrecincts.features) {
  const code = feature.properties.CODE;
  const election = electionResults[code] || {};
  const race = raceByCode[code] || {};
  const occupancy = occupancyByCode[code] || {};

  // Calculate derived values
  const totalVotes = (election.trump || 0) + (election.harris || 0);
  const trumpPct = totalVotes > 0 ? ((election.trump || 0) / totalVotes * 100) : 0;
  const harrisPct = totalVotes > 0 ? ((election.harris || 0) / totalVotes * 100) : 0;
  const margin = trumpPct - harrisPct; // positive = R, negative = D

  const amendment2Total = (election.amendment2For || 0) + (election.amendment2Against || 0);
  const amendment2ForPct = amendment2Total > 0 ? ((election.amendment2For || 0) / amendment2Total * 100) : 0;

  const population = race.P0010001 || 0;
  const turnoutPct = population > 0 ? ((election.ballotsCast || 0) / population * 100) : 0;

  // Calculate council percentages
  const councilTotal = (election.councilResults || []).reduce((sum, c) => sum + c.votes, 0);
  const councilResults = (election.councilResults || []).map(c => ({
    name: c.name,
    votes: c.votes,
    pct: councilTotal > 0 ? Math.round((c.votes / councilTotal * 100) * 10) / 10 : 0
  }));

  // Housing calculations
  const totalUnits = occupancy.H0010001 || 0;
  const occupied = occupancy.H0010002 || 0;
  const vacant = occupancy.H0010003 || 0;
  const occupancyRate = totalUnits > 0 ? (occupied / totalUnits * 100) : 0;

  // Race percentages
  const whitePct = population > 0 ? ((race.P0010003 || 0) / population * 100) : 0;
  const blackPct = population > 0 ? ((race.P0010004 || 0) / population * 100) : 0;
  const asianPct = population > 0 ? ((race.P0010006 || 0) / population * 100) : 0;
  const hispanicPct = population > 0 ? ((race.P0010009 || 0) / population * 100) : 0;

  outputFeatures.push({
    type: 'Feature',
    geometry: feature.geometry,
    properties: {
      code: code,
      name: feature.properties.NAME,
      // Election 2024 - Presidential
      ballotsCast: election.ballotsCast || 0,
      trump: election.trump || 0,
      harris: election.harris || 0,
      trumpPct: Math.round(trumpPct * 10) / 10,
      harrisPct: Math.round(harrisPct * 10) / 10,
      margin: Math.round(margin * 10) / 10,
      // Turnout by method
      earlyVoting: election.earlyVoting || 0,
      electionDay: election.electionDay || 0,
      absentee: election.absentee || 0,
      // Amendment 2 (Parks Tax)
      amendment2For: election.amendment2For || 0,
      amendment2Against: election.amendment2Against || 0,
      amendment2ForPct: Math.round(amendment2ForPct * 10) / 10,
      // Urban County Council
      councilDistrict: election.councilDistrict || feature.properties.COUNCIL,
      councilResults: councilResults,
      // Demographics (Census 2020)
      population: population,
      white: race.P0010003 || 0,
      black: race.P0010004 || 0,
      asian: race.P0010006 || 0,
      hispanic: race.P0010009 || 0,
      whitePct: Math.round(whitePct * 10) / 10,
      blackPct: Math.round(blackPct * 10) / 10,
      asianPct: Math.round(asianPct * 10) / 10,
      hispanicPct: Math.round(hispanicPct * 10) / 10,
      // Housing
      totalUnits: totalUnits,
      occupied: occupied,
      vacant: vacant,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      // Districts
      legislative: feature.properties.LEGISLATIVE,
      senatorial: feature.properties.SENATORIAL,
      // Derived
      turnoutPct: Math.round(turnoutPct * 10) / 10
    }
  });
}

const output = {
  type: 'FeatureCollection',
  features: outputFeatures
};

// Write output
const outputPath = path.join(rootDir, 'src', 'data', 'precincts.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`Wrote ${outputFeatures.length} features to ${outputPath}`);

// Verify data
const withResults = outputFeatures.filter(f => f.properties.ballotsCast > 0);
console.log(`${withResults.length} precincts have election results`);

// Check council results
const withCouncil = outputFeatures.filter(f => f.properties.councilResults.length > 0);
console.log(`${withCouncil.length} precincts have council results`);
