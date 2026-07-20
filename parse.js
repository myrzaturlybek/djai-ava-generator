// Parses WHOOP CSV exports into a compact JSON payload for the dashboard.
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'whoop');

function parseCSV(text) {
  // Handles quoted fields and commas inside quotes.
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c === '\r') { /* skip */ }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.length > 1 || (r.length === 1 && r[0] !== ''));
}

function toObjects(file) {
  const raw = fs.readFileSync(path.join(DIR, file), 'utf8');
  const rows = parseCSV(raw);
  const header = rows[0];
  return rows.slice(1).map(r => {
    const o = {};
    header.forEach((h, i) => { o[h] = r[i] === undefined ? '' : r[i]; });
    return o;
  });
}

const num = v => (v === '' || v === undefined || v === null) ? null : (isNaN(+v) ? null : +v);
const dateOnly = s => (s || '').slice(0, 10);

// --- Physiological cycles (daily) ---
const cyclesRaw = toObjects('physiological_cycles.csv');
const cycles = cyclesRaw.map(r => ({
  date: dateOnly(r['Cycle start time']),
  recovery: num(r['Recovery score %']),
  rhr: num(r['Resting heart rate (bpm)']),
  hrv: num(r['Heart rate variability (ms)']),
  skinTemp: num(r['Skin temp (celsius)']),
  bloodO2: num(r['Blood oxygen %']),
  dayStrain: num(r['Day Strain']),
  energy: num(r['Energy burned (cal)']),
  maxHR: num(r['Max HR (bpm)']),
  avgHR: num(r['Average HR (bpm)']),
  sleepPerf: num(r['Sleep performance %']),
  respRate: num(r['Respiratory rate (rpm)']),
  asleep: num(r['Asleep duration (min)']),
  inBed: num(r['In bed duration (min)']),
  light: num(r['Light sleep duration (min)']),
  deep: num(r['Deep (SWS) duration (min)']),
  rem: num(r['REM duration (min)']),
  awake: num(r['Awake duration (min)']),
  sleepNeed: num(r['Sleep need (min)']),
  sleepDebt: num(r['Sleep debt (min)']),
  sleepEff: num(r['Sleep efficiency %']),
  sleepConsistency: num(r['Sleep consistency %']),
})).sort((a, b) => a.date.localeCompare(b.date));

// --- Sleeps ---
const sleepsRaw = toObjects('sleeps.csv');
const sleeps = sleepsRaw.map(r => ({
  date: dateOnly(r['Cycle start time']),
  onset: r['Sleep onset'],
  wake: r['Wake onset'],
  perf: num(r['Sleep performance %']),
  respRate: num(r['Respiratory rate (rpm)']),
  asleep: num(r['Asleep duration (min)']),
  inBed: num(r['In bed duration (min)']),
  light: num(r['Light sleep duration (min)']),
  deep: num(r['Deep (SWS) duration (min)']),
  rem: num(r['REM duration (min)']),
  awake: num(r['Awake duration (min)']),
  need: num(r['Sleep need (min)']),
  debt: num(r['Sleep debt (min)']),
  eff: num(r['Sleep efficiency %']),
  consistency: num(r['Sleep consistency %']),
  nap: (r['Nap'] || '').trim() === 'true',
})).sort((a, b) => a.date.localeCompare(b.date));

// --- Workouts ---
const workoutsRaw = toObjects('workouts.csv');
const workouts = workoutsRaw.map(r => ({
  date: dateOnly(r['Workout start time']),
  start: r['Workout start time'],
  end: r['Workout end time'],
  duration: num(r['Duration (min)']),
  activity: r['Activity name'],
  strain: num(r['Activity Strain']),
  energy: num(r['Energy burned (cal)']),
  maxHR: num(r['Max HR (bpm)']),
  avgHR: num(r['Average HR (bpm)']),
  z1: num(r['HR Zone 1 %']),
  z2: num(r['HR Zone 2 %']),
  z3: num(r['HR Zone 3 %']),
  z4: num(r['HR Zone 4 %']),
  z5: num(r['HR Zone 5 %']),
})).sort((a, b) => (a.start || '').localeCompare(b.start || ''));

// --- Journal ---
const journalRaw = toObjects('journal_entries.csv');
const journal = journalRaw.filter(r => r['Question text']).map(r => ({
  date: dateOnly(r['Cycle start time']),
  question: r['Question text'],
  yes: (r['Answered yes'] || '').trim() === 'true',
  notes: r['Notes'] || '',
}));

const payload = { cycles, sleeps, workouts, journal, generatedAt: new Date().toISOString() };
const out = 'window.WHOOP = ' + JSON.stringify(payload) + ';\n';
fs.writeFileSync(path.join(__dirname, 'whoop-dashboard', 'data.js'), out);
console.log('cycles', cycles.length, 'sleeps', sleeps.length, 'workouts', workouts.length, 'journal', journal.length);
console.log('date range', cycles[0].date, '->', cycles[cycles.length - 1].date);
