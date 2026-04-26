import { useState } from 'react';

const MONTH_NAMES = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const DAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function HistoryView({ plans, logs }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const today = new Date();
  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

  const logDates = new Set();
  Object.keys(logs).forEach(key => {
    const parts = key.split('_');
    const date = parts[parts.length - 1];
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      logDates.add(date);
    }
  });

  const getDateStr = (day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const selectedLogs = selectedDate
    ? Object.entries(logs)
        .filter(([key]) => key.endsWith(selectedDate))
        .map(([key, sessionData]) => {
          const planId = key.replace(`_${selectedDate}`, '');
          const plan = plans.find(p => p.id === planId);
          return { plan, sessionData, key };
        })
        .filter(l => l.plan)
    : [];

  return (
    <div>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 'var(--radius)',
        border: '1px solid var(--border)', padding: 20, marginBottom: 16,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 16,
        }}>
          <button onClick={() => setMonthOffset(m => m - 1)} style={{
            background: 'none', border: 'none', color: 'var(--text-dim)',
            cursor: 'pointer', fontSize: 18, padding: '4px 8px', fontFamily: 'var(--font)',
          }}>←</button>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{MONTH_NAMES[month]} {year}</span>
          <button onClick={() => setMonthOffset(m => m + 1)} style={{
            background: 'none', border: 'none', color: 'var(--text-dim)',
            cursor: 'pointer', fontSize: 18, padding: '4px 8px', fontFamily: 'var(--font)',
          }}>→</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {DAY_NAMES.map(d => (
            <div key={d} style={{
              textAlign: 'center', fontSize: 11, fontWeight: 600,
              color: 'var(--text-muted)', padding: '4px 0', textTransform: 'uppercase',
            }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = getDateStr(day);
            const hasLog = logDates.has(dateStr);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                style={{
                  aspectRatio: '1', borderRadius: 8, border: 'none',
                  cursor: hasLog ? 'pointer' : 'default',
                  background: isSelected ? 'var(--accent)' : hasLog ? 'rgba(59,130,246,0.15)' : 'transparent',
                  color: isSelected ? '#fff' : isToday ? 'var(--accent)' : hasLog ? 'var(--text)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)', fontSize: 13,
                  fontWeight: isToday || hasLog ? 700 : 400,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 2,
                  position: 'relative', transition: 'all 0.15s',
                }}
              >
                {day}
                {hasLog && !isSelected && (
                  <div style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: 'var(--accent-secondary)', position: 'absolute', bottom: 4,
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[
          {
            label: 'Trainings\ndiesen Monat',
            value: Array.from(logDates).filter(d => d.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length,
          },
          { label: 'Trainings\ngesamt', value: logDates.size },
          { label: 'Aktive\nPläne', value: plans.length },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', padding: 14, textAlign: 'center',
          }}>
            <div style={{
              fontSize: 24, fontWeight: 700,
              fontFamily: 'var(--font-mono)', color: 'var(--accent)',
            }}>{stat.value}</div>
            <div style={{
              fontSize: 11, color: 'var(--text-dim)', fontWeight: 500,
              marginTop: 4, whiteSpace: 'pre-line', lineHeight: 1.3,
            }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {selectedDate && (
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--text-dim)' }}>
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('de-DE', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
          </h3>
          {selectedLogs.length === 0 ? (
            <div style={{
              background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', padding: 20,
              textAlign: 'center', color: 'var(--text-dim)', fontSize: 14,
            }}>Kein Training an diesem Tag</div>
          ) : selectedLogs.map(({ plan, sessionData, key }) => (
            <div key={key} style={{
              background: 'var(--bg-card)', borderRadius: 'var(--radius)',
              border: '1px solid var(--border)', padding: 16, marginBottom: 10,
            }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{plan.name}</h4>
              {plan.exercises.map((ex, ei) => {
                const exLog = sessionData[ei];
                if (!exLog) return null;
                const doneSets = exLog.sets.filter(s => s.done);
                if (doneSets.length === 0) return null;
                return (
                  <div key={ei} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{ex.name}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {doneSets.map((s, si) => (
                        <span key={si} style={{
                          padding: '3px 8px', borderRadius: 4, fontSize: 12,
                          fontFamily: 'var(--font-mono)', background: 'var(--bg-input)',
                          color: 'var(--text-dim)',
                        }}>{s.weight || '–'} kg × {s.reps}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
