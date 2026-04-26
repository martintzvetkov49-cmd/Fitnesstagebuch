import { useState, useEffect } from 'react';
import { Icon } from '../lib/icons.jsx';
import { S, Label } from '../lib/styles.jsx';
import { RestTimer } from '../components/RestTimer.jsx';

export function WorkoutView({ plan, logs, onUpdateLogs, onFinish }) {
  const today = new Date().toISOString().split('T')[0];
  const logKey = `${plan.id}_${today}`;

  const [sessionData, setSessionData] = useState(() => {
    const existing = logs[logKey];
    if (existing) return existing;
    return plan.exercises.map(ex => ({
      exerciseId: ex.id,
      sets: Array.from({ length: Number(ex.sets) || 3 }, () => ({
        weight: ex.weight || '',
        reps: ex.reps || '',
        done: false,
      })),
    }));
  });
  const [currentEx, setCurrentEx] = useState(0);

  useEffect(() => {
    onUpdateLogs(prev => ({ ...prev, [logKey]: sessionData }));
  }, [sessionData]);

  const exercise = plan.exercises[currentEx];
  const exData = sessionData[currentEx];
  if (!exercise || !exData) return null;

  const updateSet = (si, field, value) => {
    setSessionData(prev => prev.map((ex, i) =>
      i !== currentEx ? ex : {
        ...ex,
        sets: ex.sets.map((s, j) => j !== si ? s : { ...s, [field]: value }),
      }
    ));
  };

  const toggleDone = (si) => updateSet(si, 'done', !exData.sets[si].done);

  const totalSets = sessionData.reduce((a, e) => a + e.sets.length, 0);
  const doneSets = sessionData.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0);
  const pct = totalSets > 0 ? (doneSets / totalSets) * 100 : 0;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <Label>Fortschritt</Label>
          <span style={{
            fontSize: 12, fontFamily: 'var(--font-mono)',
            color: 'var(--accent-secondary)', fontWeight: 700,
          }}>{doneSets}/{totalSets}</span>
        </div>
        <div style={{ height: 5, background: 'var(--bg-input)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 3, transition: 'width 0.4s ease',
            width: `${pct}%`,
            background: 'linear-gradient(90deg, var(--accent), var(--accent-secondary))',
          }} />
        </div>
      </div>

      <div className="hide-scrollbar" style={{
        display: 'flex', gap: 5, overflowX: 'auto', marginBottom: 14, paddingBottom: 2,
      }}>
        {plan.exercises.map((ex, i) => {
          const allDone = sessionData[i]?.sets.every(s => s.done);
          return (
            <button key={ex.id} onClick={() => setCurrentEx(i)} style={{
              padding: '6px 12px', borderRadius: 16, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
              background: i === currentEx ? 'var(--accent)' : allDone ? 'rgba(6,214,160,0.12)' : 'var(--bg-card)',
              color: i === currentEx ? '#fff' : allDone ? 'var(--accent-secondary)' : 'var(--text-dim)',
              transition: 'all 0.2s',
            }}>
              {ex.name || `#${i + 1}`}
              {allDone && i !== currentEx && ' ✓'}
            </button>
          );
        })}
      </div>

      <RestTimer defaultSeconds={90} />

      <div style={{ ...S.card, marginBottom: 14 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{exercise.name || 'Übung'}</h2>
        {exercise.notes && (
          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14 }}>{exercise.notes}</p>
        )}
        <div style={{
          display: 'grid', gridTemplateColumns: '36px 1fr 1fr 42px',
          gap: '6px 8px', alignItems: 'center', marginTop: 14,
        }}>
          <Label>Satz</Label><Label>kg</Label><Label>Wdh.</Label><span />
          {exData.sets.map((set, si) => (
            <div key={si} style={{ display: 'contents' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, textAlign: 'center',
                color: set.done ? 'var(--accent-secondary)' : 'var(--text-dim)',
              }}>{si + 1}</span>
              <input
                value={set.weight}
                onChange={e => updateSet(si, 'weight', e.target.value)}
                placeholder="—"
                style={{
                  ...S.input, padding: '8px 6px', textAlign: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 14, opacity: set.done ? 0.5 : 1,
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <input
                value={set.reps}
                onChange={e => updateSet(si, 'reps', e.target.value)}
                placeholder="—"
                style={{
                  ...S.input, padding: '8px 6px', textAlign: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 14, opacity: set.done ? 0.5 : 1,
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button onClick={() => toggleDone(si)} style={{
                width: 34, height: 34, borderRadius: 8, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: set.done ? 'var(--accent-secondary)' : 'var(--bg-input)',
                transition: 'all 0.2s',
              }}>
                <Icon name="check" size={16} color={set.done ? '#fff' : 'var(--text-muted)'} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {currentEx > 0 && (
          <button
            onClick={() => setCurrentEx(currentEx - 1)}
            style={{ ...S.ghost, flex: 1, justifyContent: 'center' }}
          >← Vorherige</button>
        )}
        {currentEx < plan.exercises.length - 1 ? (
          <button
            onClick={() => setCurrentEx(currentEx + 1)}
            style={{ ...S.btn(), flex: 1, justifyContent: 'center' }}
          >Nächste →</button>
        ) : (
          <button onClick={onFinish} style={{
            ...S.btn(), flex: 1, justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent))',
          }}>
            <Icon name="check" size={16} color="#fff" /> Fertig
          </button>
        )}
      </div>
    </div>
  );
}
