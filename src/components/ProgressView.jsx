import { useState } from 'react';

export function ProgressView({ plans, logs }) {
  const [selectedExercise, setSelectedExercise] = useState(null);

  const exerciseNames = [...new Set(plans.flatMap(p => p.exercises.map(e => e.name)).filter(Boolean))];

  const getExerciseData = (name) => {
    const entries = [];
    Object.entries(logs).forEach(([key, sessionData]) => {
      const parts = key.split('_');
      const date = parts[parts.length - 1];
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
      const planId = key.replace(`_${date}`, '');
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      plan.exercises.forEach((ex, ei) => {
        if (ex.name !== name) return;
        const exLog = sessionData[ei];
        if (!exLog) return;
        const doneSets = exLog.sets.filter(s => s.done && s.weight);
        if (doneSets.length === 0) return;
        const maxWeight = Math.max(...doneSets.map(s => parseFloat(s.weight) || 0));
        const totalVolume = doneSets.reduce(
          (a, s) => a + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0
        );
        if (maxWeight > 0) entries.push({ date, maxWeight, totalVolume, sets: doneSets.length });
      });
    });
    return entries.sort((a, b) => a.date.localeCompare(b.date));
  };

  const active = selectedExercise || exerciseNames[0];
  const chartData = active ? getExerciseData(active) : [];

  const chartW = 460, chartH = 180, padL = 45, padR = 15, padT = 10, padB = 30;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const maxVal = chartData.length > 0 ? Math.max(...chartData.map(d => d.maxWeight)) : 0;
  const minVal = chartData.length > 0 ? Math.min(...chartData.map(d => d.maxWeight)) : 0;
  const range = maxVal - minVal || 1;

  const getX = (i) => padL + (chartData.length > 1 ? (i / (chartData.length - 1)) * plotW : plotW / 2);
  const getY = (val) => padT + plotH - ((val - minVal) / range) * plotH;

  const linePath = chartData.map((d, i) => `${i === 0 ? 'M' : 'L'}${getX(i)},${getY(d.maxWeight)}`).join(' ');
  const areaPath = chartData.length > 1
    ? linePath + ` L${getX(chartData.length - 1)},${padT + plotH} L${getX(0)},${padT + plotH} Z`
    : '';

  const firstWeight = chartData.length > 0 ? chartData[0].maxWeight : 0;
  const lastWeight = chartData.length > 0 ? chartData[chartData.length - 1].maxWeight : 0;
  const improvement = firstWeight > 0 ? ((lastWeight - firstWeight) / firstWeight * 100).toFixed(1) : 0;

  if (exerciseNames.length === 0) {
    return (
      <div style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius)',
        border: '1px solid var(--border)', padding: 40, textAlign: 'center',
      }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Noch keine Daten</div>
        <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>Starte ein Training um Fortschritte zu sehen</div>
      </div>
    );
  }

  return (
    <div>
      <div className="hide-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
        {exerciseNames.map(name => (
          <button key={name} onClick={() => setSelectedExercise(name)} style={{
            padding: '8px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
            background: active === name ? 'var(--accent)' : 'var(--bg-card)',
            color: active === name ? '#fff' : 'var(--text-dim)',
            transition: 'all 0.2s',
          }}>{name}</button>
        ))}
      </div>

      <div style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius)',
        border: '1px solid var(--border)', padding: 16, marginBottom: 16,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'baseline', marginBottom: 12,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Max. Gewicht (kg)</span>
          {chartData.length >= 2 && (
            <span style={{
              fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700,
              color: improvement >= 0 ? 'var(--accent-secondary)' : 'var(--danger)',
            }}>{improvement >= 0 ? '+' : ''}{improvement}%</span>
          )}
        </div>

        {chartData.length < 2 ? (
          <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
            Mindestens 2 Trainings nötig für Chart
          </div>
        ) : (
          <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} style={{ display: 'block' }}>
            {[0, 0.25, 0.5, 0.75, 1].map(frac => {
              const val = minVal + range * frac;
              const y = getY(val);
              return (
                <g key={frac}>
                  <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
                  <text x={padL - 8} y={y + 4} textAnchor="end" fill="var(--text-muted)" fontSize="11" fontFamily="var(--font-mono)">{Math.round(val)}</text>
                </g>
              );
            })}
            <path d={areaPath} fill="url(#chartGrad)" opacity="0.3" />
            <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {chartData.map((d, i) => (
              <circle key={i} cx={getX(i)} cy={getY(d.maxWeight)} r="4" fill="var(--accent)" stroke="var(--bg-card)" strokeWidth="2" />
            ))}
            <text x={getX(0)} y={chartH - 4} textAnchor="start" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)">
              {chartData[0].date.slice(5)}
            </text>
            <text x={getX(chartData.length - 1)} y={chartH - 4} textAnchor="end" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)">
              {chartData[chartData.length - 1].date.slice(5)}
            </text>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>

      {chartData.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Bestes Gewicht', value: `${maxVal} kg`, color: 'var(--accent)' },
            { label: 'Trainings', value: chartData.length, color: 'var(--accent-secondary)' },
            { label: 'Letztes Gewicht', value: `${lastWeight} kg`, color: 'var(--text)' },
            {
              label: 'Volumen (letztes)',
              value: chartData.length > 0 ? `${chartData[chartData.length - 1].totalVolume} kg` : '–',
              color: 'var(--accent-warm)',
            },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', padding: 14,
            }}>
              <div style={{
                fontSize: 20, fontWeight: 700,
                fontFamily: 'var(--font-mono)', color: stat.color,
              }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 500, marginTop: 2 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
