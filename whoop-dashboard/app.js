/* WHOOP Data Visualizer — all charts built from window.WHOOP (see data.js). */
(function () {
  'use strict';
  const D = window.WHOOP;
  const root = document.documentElement;
  const charts = [];

  // ---------- helpers ----------
  const css = n => getComputedStyle(root).getPropertyValue(n).trim();
  const fmtDate = iso => { const [y, m, d] = iso.split('-'); return `${d}.${m}`; };
  const avg = a => { const v = a.filter(x => x != null); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
  const round = (x, d = 0) => x == null ? '—' : (Math.round(x * 10 ** d) / 10 ** d);
  const alpha = (hex, a) => {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };

  function palette() {
    return {
      surface: css('--surface-1'), text: css('--text-primary'), sub: css('--text-secondary'),
      muted: css('--muted'), grid: css('--grid'), axis: css('--axis'),
      s: [css('--s1'), css('--s2'), css('--s3'), css('--s4'), css('--s5'), css('--s6'), css('--s7'), css('--s8')],
      good: css('--good'), warning: css('--warning'), critical: css('--critical'), serious: css('--serious'),
    };
  }

  function applyDefaults() {
    const p = palette();
    const C = window.Chart;
    C.defaults.font.family = 'system-ui, -apple-system, "Segoe UI", sans-serif';
    C.defaults.font.size = 11.5;
    C.defaults.color = p.sub;
    C.defaults.borderColor = p.grid;
    C.defaults.maintainAspectRatio = false;
    C.defaults.responsive = true;
    C.defaults.plugins.legend.labels.color = p.sub;
    C.defaults.plugins.legend.labels.boxWidth = 12;
    C.defaults.plugins.legend.labels.boxHeight = 12;
    C.defaults.plugins.legend.labels.usePointStyle = true;
    C.defaults.plugins.tooltip.backgroundColor = p.surface;
    C.defaults.plugins.tooltip.titleColor = p.text;
    C.defaults.plugins.tooltip.bodyColor = p.sub;
    C.defaults.plugins.tooltip.borderColor = p.axis;
    C.defaults.plugins.tooltip.borderWidth = 1;
    C.defaults.plugins.tooltip.padding = 10;
    C.defaults.plugins.tooltip.cornerRadius = 8;
    C.defaults.plugins.tooltip.boxPadding = 5;
    C.defaults.plugins.tooltip.usePointStyle = true;
  }

  function baseScales(opts = {}) {
    const p = palette();
    return {
      x: {
        grid: { display: false, drawTicks: false },
        border: { color: p.axis },
        ticks: { color: p.muted, maxRotation: 0, autoSkip: true, maxTicksLimit: opts.xTicks || 8 },
        stacked: !!opts.stacked,
      },
      y: {
        grid: { color: p.grid, drawTicks: false },
        border: { display: false },
        ticks: { color: p.muted, padding: 6, ...(opts.yTicks || {}) },
        beginAtZero: opts.zero !== false,
        stacked: !!opts.stacked,
        title: opts.yTitle ? { display: true, text: opts.yTitle, color: p.muted, font: { size: 11 } } : { display: false },
        ...(opts.max != null ? { max: opts.max } : {}),
        ...(opts.min != null ? { min: opts.min } : {}),
      },
    };
  }

  const recoveryColor = (v, p) => v == null ? p.muted : (v >= 67 ? p.good : v >= 34 ? p.warning : p.critical);

  function mk(id, cfg) {
    const el = document.getElementById(id);
    if (!el) return;
    charts.push(new window.Chart(el.getContext('2d'), cfg));
  }

  // ---------- data views ----------
  const cyc = D.cycles;
  const labels = cyc.map(c => fmtDate(c.date));
  const mainSleeps = D.sleeps.filter(s => !s.nap);
  const sleepLabels = mainSleeps.map(s => fmtDate(s.date));

  // ---------- KPIs ----------
  function buildKpis() {
    const p = palette();
    const totalWorkouts = D.workouts.length;
    const totalKcal = D.cycles.reduce((s, c) => s + (c.energy || 0), 0);
    const items = [
      { label: 'Восстановление', v: round(avg(cyc.map(c => c.recovery))), unit: '%', dot: p.good, foot: 'среднее Recovery' },
      { label: 'HRV', v: round(avg(cyc.map(c => c.hrv))), unit: 'мс', dot: p.s[0], foot: 'вариабельность пульса' },
      { label: 'Пульс покоя', v: round(avg(cyc.map(c => c.rhr))), unit: 'уд/мин', dot: p.s[7], foot: 'RHR' },
      { label: 'Дневная нагрузка', v: round(avg(cyc.map(c => c.dayStrain)), 1), unit: '', dot: p.s[0], foot: 'средний Day Strain' },
      { label: 'Сон', v: round(avg(mainSleeps.map(s => s.asleep)) / 60, 1), unit: 'ч', dot: p.s[4], foot: 'средняя длительность' },
      { label: 'Качество сна', v: round(avg(mainSleeps.map(s => s.perf))), unit: '%', dot: p.s[2], foot: 'Sleep performance' },
      { label: 'Частота дыхания', v: round(avg(cyc.map(c => c.respRate)), 1), unit: 'вд/мин', dot: p.s[6], foot: 'во сне' },
      { label: 'Тренировки', v: totalWorkouts, unit: '', dot: p.s[5], foot: `${round(totalKcal / 1000, 1)}k ккал сожжено` },
    ];
    document.getElementById('kpis').innerHTML = items.map(i => `
      <div class="kpi">
        <div class="label"><span class="dot" style="background:${i.dot}"></span>${i.label}</div>
        <div class="value">${i.v}<span class="unit">${i.unit}</span></div>
        <div class="foot">${i.foot}</div>
      </div>`).join('');
  }

  // ---------- chart builders ----------
  function lineDS(label, data, color, opts = {}) {
    return Object.assign({
      label, data, borderColor: color, backgroundColor: opts.fill ? alpha(color, 0.14) : color,
      borderWidth: 2, tension: 0.3, pointRadius: opts.pointRadius ?? 0, pointHoverRadius: 5,
      pointBackgroundColor: color, fill: !!opts.fill, spanGaps: true,
    }, opts.extra || {});
  }

  function buildAll() {
    const p = palette();
    applyDefaults();

    // ===== OVERVIEW =====
    mk('ovRecovery', {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Recovery %', data: cyc.map(c => c.recovery),
        backgroundColor: cyc.map(c => recoveryColor(c.recovery, p)), borderRadius: 4, maxBarThickness: 22 }] },
      options: { plugins: { legend: { display: false } }, scales: baseScales({ max: 100, yTitle: '%' }) },
    });
    mk('ovStrain', {
      type: 'line',
      data: { labels, datasets: [lineDS('Day Strain', cyc.map(c => c.dayStrain), p.s[0], { fill: true })] },
      options: { plugins: { legend: { display: false } }, scales: baseScales({ max: 21, yTitle: '0–21' }) },
    });
    const stageColors = [p.s[0], p.s[1], p.s[2], p.s[3]];
    mk('ovSleepStages', {
      type: 'bar',
      data: { labels: sleepLabels, datasets: [
        { label: 'Лёгкий', data: mainSleeps.map(s => round(s.light / 60, 2)), backgroundColor: stageColors[0] },
        { label: 'Глубокий', data: mainSleeps.map(s => round(s.deep / 60, 2)), backgroundColor: stageColors[1] },
        { label: 'REM', data: mainSleeps.map(s => round(s.rem / 60, 2)), backgroundColor: stageColors[2] },
        { label: 'Бодрствование', data: mainSleeps.map(s => round(s.awake / 60, 2)), backgroundColor: stageColors[3] },
      ].map(d => Object.assign(d, { borderRadius: 3, borderWidth: 1, borderColor: p.surface, maxBarThickness: 24 })) },
      options: { plugins: { legend: { position: 'bottom' } }, scales: baseScales({ stacked: true, yTitle: 'часы' }) },
    });
    mk('ovHrvRhr', {
      type: 'line',
      data: { labels, datasets: [
        lineDS('HRV (мс)', cyc.map(c => c.hrv), p.s[0]),
        lineDS('Пульс покоя (уд/мин)', cyc.map(c => c.rhr), p.s[7]),
      ] },
      options: { plugins: { legend: { position: 'bottom' } }, scales: baseScales({ yTitle: 'мс / уд·мин' }) },
    });

    // ===== RECOVERY =====
    mk('recScore', {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Recovery %', data: cyc.map(c => c.recovery),
        backgroundColor: cyc.map(c => recoveryColor(c.recovery, p)), borderRadius: 4, maxBarThickness: 20 }] },
      options: { plugins: { legend: { display: false },
        tooltip: { callbacks: { afterLabel: ctx => { const v = ctx.raw; return v == null ? '' : (v >= 67 ? 'Зелёная зона' : v >= 34 ? 'Жёлтая зона' : 'Красная зона'); } } } },
        scales: baseScales({ max: 100, yTitle: '%' }) },
    });
    const zones = { green: 0, yellow: 0, red: 0 };
    cyc.forEach(c => { if (c.recovery == null) return; if (c.recovery >= 67) zones.green++; else if (c.recovery >= 34) zones.yellow++; else zones.red++; });
    mk('recZones', {
      type: 'doughnut',
      data: { labels: ['Зелёная (≥67%)', 'Жёлтая (34–66%)', 'Красная (<34%)'],
        datasets: [{ data: [zones.green, zones.yellow, zones.red], backgroundColor: [p.good, p.warning, p.critical],
          borderColor: p.surface, borderWidth: 3 }] },
      options: { cutout: '58%', plugins: { legend: { position: 'bottom' } } },
    });
    mk('recHrv', { type: 'line', data: { labels, datasets: [lineDS('HRV', cyc.map(c => c.hrv), p.s[0], { fill: true })] },
      options: { plugins: { legend: { display: false } }, scales: baseScales({ zero: false, yTitle: 'мс' }) } });
    mk('recRhr', { type: 'line', data: { labels, datasets: [lineDS('RHR', cyc.map(c => c.rhr), p.s[7], { fill: true })] },
      options: { plugins: { legend: { display: false } }, scales: baseScales({ zero: false, yTitle: 'уд/мин' }) } });
    mk('recSkin', { type: 'line', data: { labels, datasets: [lineDS('Темп. кожи', cyc.map(c => c.skinTemp), p.s[5])] },
      options: { plugins: { legend: { display: false } }, scales: baseScales({ zero: false, yTitle: '°C' }) } });
    mk('recO2', { type: 'line', data: { labels, datasets: [lineDS('SpO₂', cyc.map(c => c.bloodO2), p.s[4])] },
      options: { plugins: { legend: { display: false } }, scales: baseScales({ zero: false, yTitle: '%' }) } });
    mk('recResp', { type: 'line', data: { labels, datasets: [lineDS('Дыхание', cyc.map(c => c.respRate), p.s[6])] },
      options: { plugins: { legend: { display: false } }, scales: baseScales({ zero: false, yTitle: 'вд/мин' }) } });

    // recovery vs previous-day strain (scatter)
    const rvs = [];
    for (let i = 1; i < cyc.length; i++) {
      const prev = cyc[i - 1].dayStrain, rec = cyc[i].recovery;
      if (prev != null && rec != null) rvs.push({ x: prev, y: rec });
    }
    mk('recVsStrain', {
      type: 'scatter',
      data: { datasets: [{ label: 'День', data: rvs, backgroundColor: alpha(p.s[0], 0.75), pointRadius: 5, pointHoverRadius: 7 }] },
      options: { plugins: { legend: { display: false },
        tooltip: { callbacks: { label: c => `Нагрузка ${round(c.raw.x, 1)} → Recovery ${c.raw.y}%` } } },
        scales: { x: Object.assign(baseScales({ max: 21 }).x, { title: { display: true, text: 'Day Strain (пред. день)', color: p.muted }, grid: { color: p.grid } }),
          y: Object.assign(baseScales({ max: 100 }).y, { title: { display: true, text: 'Recovery %', color: p.muted } }) } },
    });
    const hrvScatter = cyc.filter(c => c.hrv != null && c.recovery != null).map(c => ({ x: c.hrv, y: c.recovery }));
    mk('recHrvScatter', {
      type: 'scatter',
      data: { datasets: [{ label: 'День', data: hrvScatter, backgroundColor: alpha(p.good, 0.7), pointRadius: 5, pointHoverRadius: 7 }] },
      options: { plugins: { legend: { display: false },
        tooltip: { callbacks: { label: c => `HRV ${c.raw.x} мс → ${c.raw.y}%` } } },
        scales: { x: Object.assign(baseScales({ zero: false }).x, { title: { display: true, text: 'HRV (мс)', color: p.muted }, grid: { color: p.grid } }),
          y: Object.assign(baseScales({ max: 100 }).y, { title: { display: true, text: 'Recovery %', color: p.muted } }) } },
    });

    // ===== SLEEP =====
    mk('slStages', {
      type: 'bar',
      data: { labels: sleepLabels, datasets: [
        { label: 'Лёгкий', data: mainSleeps.map(s => round(s.light / 60, 2)), backgroundColor: stageColors[0] },
        { label: 'Глубокий (SWS)', data: mainSleeps.map(s => round(s.deep / 60, 2)), backgroundColor: stageColors[1] },
        { label: 'REM', data: mainSleeps.map(s => round(s.rem / 60, 2)), backgroundColor: stageColors[2] },
        { label: 'Бодрствование', data: mainSleeps.map(s => round(s.awake / 60, 2)), backgroundColor: stageColors[3] },
      ].map(d => Object.assign(d, { borderRadius: 3, borderWidth: 1, borderColor: p.surface, maxBarThickness: 26 })) },
      options: { plugins: { legend: { position: 'bottom' },
        tooltip: { callbacks: { label: c => `${c.dataset.label}: ${c.raw} ч` } } }, scales: baseScales({ stacked: true, yTitle: 'часы', xTicks: 12 }) },
    });
    mk('slQuality', {
      type: 'line',
      data: { labels: sleepLabels, datasets: [
        lineDS('Performance', mainSleeps.map(s => s.perf), p.s[0]),
        lineDS('Efficiency', mainSleeps.map(s => s.eff), p.s[4]),
        lineDS('Consistency', mainSleeps.map(s => s.consistency), p.s[3]),
      ] },
      options: { plugins: { legend: { position: 'bottom' } }, scales: baseScales({ max: 100, yTitle: '%', xTicks: 12 }) },
    });
    mk('slNeed', {
      type: 'bar',
      data: { labels: sleepLabels, datasets: [
        { type: 'bar', label: 'Фактический сон', data: mainSleeps.map(s => round(s.asleep / 60, 2)), backgroundColor: p.s[4], borderRadius: 3, maxBarThickness: 22 },
        { type: 'line', label: 'Потребность', data: mainSleeps.map(s => round(s.need / 60, 2)), borderColor: p.s[3], borderWidth: 2, pointRadius: 0, tension: 0.3 },
        { type: 'line', label: 'Долг сна', data: mainSleeps.map(s => round(s.debt / 60, 2)), borderColor: p.s[7], borderWidth: 2, borderDash: [4, 4], pointRadius: 0, tension: 0.3 },
      ] },
      options: { plugins: { legend: { position: 'bottom' } }, scales: baseScales({ yTitle: 'часы', xTicks: 12 }) },
    });
    const stageTot = ['light', 'deep', 'rem', 'awake'].map(k => mainSleeps.reduce((s, x) => s + (x[k] || 0), 0));
    mk('slDonut', {
      type: 'doughnut',
      data: { labels: ['Лёгкий', 'Глубокий', 'REM', 'Бодрствование'],
        datasets: [{ data: stageTot, backgroundColor: stageColors, borderColor: p.surface, borderWidth: 3 }] },
      options: { cutout: '58%', plugins: { legend: { position: 'bottom' },
        tooltip: { callbacks: { label: c => `${c.label}: ${round(c.raw / 60, 1)} ч` } } } },
    });
    mk('slResp', { type: 'line', data: { labels: sleepLabels, datasets: [lineDS('Дыхание', mainSleeps.map(s => s.respRate), p.s[6])] },
      options: { plugins: { legend: { display: false } }, scales: baseScales({ zero: false, yTitle: 'вд/мин', xTicks: 12 }) } });
    const onsetHour = mainSleeps.map(s => { const t = (s.onset || '').slice(11, 16); if (!t) return null; let [h, m] = t.split(':').map(Number); let val = h + m / 60; if (val < 12) val += 24; return round(val, 2); });
    mk('slOnset', {
      type: 'line',
      data: { labels: sleepLabels, datasets: [lineDS('Отход ко сну', onsetHour, p.s[0], { pointRadius: 3 })] },
      options: { plugins: { legend: { display: false },
        tooltip: { callbacks: { label: c => { let v = c.raw; if (v == null) return '—'; if (v >= 24) v -= 24; const h = Math.floor(v); const m = Math.round((v - h) * 60); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; } } } },
        scales: baseScales({ zero: false, xTicks: 12, yTicks: { callback: v => { let x = v; if (x >= 24) x -= 24; return `${String(Math.floor(x)).padStart(2, '0')}:00`; } } }) },
    });

    // ===== STRAIN & WORKOUTS =====
    mk('stStrain', { type: 'bar', data: { labels, datasets: [{ label: 'Day Strain', data: cyc.map(c => c.dayStrain), backgroundColor: alpha(p.s[0], 0.85), borderRadius: 4, maxBarThickness: 20 }] },
      options: { plugins: { legend: { display: false } }, scales: baseScales({ max: 21, yTitle: '0–21' }) } });
    mk('stEnergy', { type: 'bar', data: { labels, datasets: [{ label: 'Калории', data: cyc.map(c => c.energy), backgroundColor: alpha(p.s[5], 0.85), borderRadius: 4, maxBarThickness: 20 }] },
      options: { plugins: { legend: { display: false } }, scales: baseScales({ yTitle: 'ккал' }) } });

    // activity aggregation
    const actMap = {};
    D.workouts.forEach(w => { const a = w.activity || '—'; (actMap[a] = actMap[a] || { n: 0, strain: 0, energy: 0 }); actMap[a].n++; actMap[a].strain += w.strain || 0; actMap[a].energy += w.energy || 0; });
    const actNames = Object.keys(actMap).sort((a, b) => actMap[b].n - actMap[a].n);
    const actColor = (i) => p.s[i % 8];
    mk('stActivityCount', {
      type: 'bar',
      data: { labels: actNames, datasets: [{ label: 'Тренировок', data: actNames.map(a => actMap[a].n), backgroundColor: actNames.map((a, i) => actColor(i)), borderRadius: 4 }] },
      options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: baseScales({ yTitle: '' }) },
    });
    mk('stActivityStrain', {
      type: 'bar',
      data: { labels: actNames, datasets: [{ label: 'Суммарный Strain', data: actNames.map(a => round(actMap[a].strain, 1)), backgroundColor: actNames.map((a, i) => actColor(i)), borderRadius: 4 }] },
      options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: baseScales({ yTitle: '' }) },
    });

    // workout bubble: duration vs strain, size = energy
    const actIndex = {}; actNames.forEach((a, i) => actIndex[a] = i);
    const bubbleByAct = actNames.map((a, i) => ({
      label: a,
      data: D.workouts.filter(w => (w.activity || '—') === a).map(w => ({ x: w.duration, y: w.strain, r: Math.max(4, Math.sqrt(w.energy || 0) / 2.2), _e: w.energy, _d: w.date })),
      backgroundColor: alpha(actColor(i), 0.6), borderColor: actColor(i), borderWidth: 1,
    }));
    mk('stWorkoutBubble', {
      type: 'bubble',
      data: { datasets: bubbleByAct },
      options: { plugins: { legend: { position: 'bottom' },
        tooltip: { callbacks: { label: c => `${c.dataset.label} (${c.raw._d}): ${c.raw.x} мин, strain ${c.raw.y}, ${round(c.raw._e)} ккал` } } },
        scales: { x: Object.assign(baseScales().x, { title: { display: true, text: 'Длительность (мин)', color: p.muted }, grid: { color: p.grid }, beginAtZero: true }),
          y: Object.assign(baseScales().y, { title: { display: true, text: 'Activity Strain', color: p.muted } }) } },
    });

    // HR zones aggregate (avg %)
    const zoneAvg = ['z1', 'z2', 'z3', 'z4', 'z5'].map(k => avg(D.workouts.map(w => w[k])));
    const zoneColors = [p.s[0], p.s[4], p.s[3], p.s[5], p.s[7]];
    mk('stHrZones', {
      type: 'bar',
      data: { labels: ['Зона 1', 'Зона 2', 'Зона 3', 'Зона 4', 'Зона 5'],
        datasets: [{ label: 'Среднее время в зоне', data: zoneAvg.map(v => round(v, 1)), backgroundColor: zoneColors, borderRadius: 4, maxBarThickness: 46 }] },
      options: { plugins: { legend: { display: false },
        tooltip: { callbacks: { label: c => `${c.raw}% времени` } } }, scales: baseScales({ yTitle: '% времени' }) },
    });
    const wlabels = D.workouts.map(w => fmtDate(w.date));
    mk('stHr', {
      type: 'line',
      data: { labels: wlabels, datasets: [
        lineDS('Средний пульс', D.workouts.map(w => w.avgHR), p.s[0], { pointRadius: 2 }),
        lineDS('Макс. пульс', D.workouts.map(w => w.maxHR), p.s[7], { pointRadius: 2 }),
      ] },
      options: { plugins: { legend: { position: 'bottom' } }, scales: baseScales({ zero: false, yTitle: 'уд/мин', xTicks: 10 }) },
    });

    // ===== BEHAVIORS =====
    const qMap = {};
    D.journal.forEach(j => { (qMap[j.question] = qMap[j.question] || { yes: 0, total: 0 }); qMap[j.question].total++; if (j.yes) qMap[j.question].yes++; });
    const qNames = Object.keys(qMap).sort((a, b) => qMap[b].total - qMap[a].total);
    const yesRate = qNames.map(q => round(100 * qMap[q].yes / qMap[q].total));
    mk('bhYesRate', {
      type: 'bar',
      data: { labels: qNames, datasets: [{ label: '% ответов «Да»', data: yesRate,
        backgroundColor: yesRate.map(v => alpha(p.s[0], 0.55 + 0.45 * v / 100)), borderRadius: 4 }] },
      options: { indexAxis: 'y', plugins: { legend: { display: false },
        tooltip: { callbacks: { label: c => `${c.raw}% «Да» (${qMap[qNames[c.dataIndex]].yes}/${qMap[qNames[c.dataIndex]].total})` } } },
        scales: baseScales({ max: 100, yTitle: '' }) },
    });

    // behavior impact on recovery
    const recByDate = {}; cyc.forEach(c => { if (c.recovery != null) recByDate[c.date] = c.recovery; });
    const freqQ = qNames.filter(q => qMap[q].total >= 20);
    const impact = freqQ.map(q => {
      const yesR = [], noR = [];
      D.journal.filter(j => j.question === q).forEach(j => { const r = recByDate[j.date]; if (r == null) return; (j.yes ? yesR : noR).push(r); });
      return { q, yes: avg(yesR), no: avg(noR) };
    });
    mk('bhImpact', {
      type: 'bar',
      data: { labels: impact.map(i => i.q), datasets: [
        { label: 'В дни «Да»', data: impact.map(i => round(i.yes)), backgroundColor: p.s[0], borderRadius: 4 },
        { label: 'В дни «Нет»', data: impact.map(i => round(i.no)), backgroundColor: p.s[5], borderRadius: 4 },
      ] },
      options: { indexAxis: 'y', plugins: { legend: { position: 'bottom' },
        tooltip: { callbacks: { label: c => `${c.dataset.label}: ${c.raw}% восстановления` } } },
        scales: baseScales({ max: 100, yTitle: '' }) },
    });
  }

  function destroyAll() { while (charts.length) charts.pop().destroy(); }
  function rebuild() { destroyAll(); buildKpis(); buildAll(); }

  // ---------- tabs ----------
  document.getElementById('tabs').addEventListener('click', e => {
    const btn = e.target.closest('.tab'); if (!btn) return;
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === btn));
    const id = btn.dataset.tab;
    document.querySelectorAll('.panel').forEach(pnl => pnl.classList.toggle('active', pnl.id === id));
    charts.forEach(c => c.resize());
  });

  // ---------- theme ----------
  const themeBtn = document.getElementById('themeBtn');
  themeBtn.addEventListener('click', () => {
    const dark = root.getAttribute('data-theme') !== 'light';
    root.setAttribute('data-theme', dark ? 'light' : 'dark');
    themeBtn.textContent = dark ? '☀️ Светлая' : '🌙 Тёмная';
    rebuild();
  });

  // ---------- date range ----------
  const first = cyc[0].date, last = cyc[cyc.length - 1].date;
  const rng = `${fmtDate(first)}.${first.slice(0,4)} — ${fmtDate(last)}.${last.slice(0,4)}  ·  ${cyc.length} дней`;
  document.getElementById('dateRange').textContent = rng;
  document.getElementById('footRange').textContent = `${first} → ${last}`;

  // ---------- go ----------
  buildKpis();
  buildAll();
})();
