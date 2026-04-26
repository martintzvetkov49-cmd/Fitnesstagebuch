import { useState, useEffect } from 'react';
import { Icon } from '../lib/icons.jsx';
import { S, Label } from '../lib/styles.jsx';
import { uid } from '../lib/storage.js';
import { ExerciseLibraryModal } from '../components/ExerciseLibrary.jsx';

export function PlanEditor({ plan, onUpdate, onStart }) {
  const [name, setName] = useState(plan.name);
  const [exercises, setExercises] = useState(plan.exercises);
  const [expandedId, setExpandedId] = useState(null);
  const [showLibrary, setShowLibrary] = useState(false);

  useEffect(() => {
    onUpdate({ ...plan, name, exercises });
  }, [name, exercises]);

  const addExercise = () => {
    const id = uid();
    setExercises(p => [...p, { id, name: '', sets: 3, reps: '10', weight: '', notes: '' }]);
    setExpandedId(id);
  };

  const addFromLibrary = (lib) => {
    const id = uid();
    setExercises(p => [...p, { id, name: lib.name, sets: lib.defaultSets, reps: lib.defaultReps, weight: '', notes: '' }]);
    setExpandedId(id);
  };

  const updateEx = (id, field, value) =>
    setExercises(p => p.map(e => e.id === id ? { ...e, [field]: value } : e));

  const removeEx = (id) => setExercises(p => p.filter(e => e.id !== id));

  const moveEx = (i, dir) => {
    const n = [...exercises];
    const j = i + dir;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]];
    setExercises(n);
  };

  return (
    <div>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Planname..."
        style={{
          ...S.input, fontSize: 18, fontWeight: 700, marginBottom: 20,
          padding: '12px 0', background: 'transparent', border: 'none',
          borderBottom: '2px solid var(--border)', borderRadius: 0,
        }}
        onFocus={e => e.target.style.borderBottomColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderBottomColor = 'var(--border)'}
      />

      {exercises.map((ex, i) => {
        const isOpen = expandedId === ex.id;
        const sum = [ex.sets && `${ex.sets}×${ex.reps || '?'}`, ex.weight && `${ex.weight}kg`].filter(Boolean).join(' · ');

        return (
          <div key={ex.id} style={{
            ...S.card, marginBottom: 8, padding: isOpen ? 16 : '12px 16px',
            borderColor: isOpen ? 'var(--accent)' : undefined,
            boxShadow: isOpen ? '0 0 24px var(--accent-glow)' : undefined,
          }}>
            <div
              onClick={() => setExpandedId(isOpen ? null : ex.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}
            >
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)',
                background: 'var(--accent-glow)', padding: '2px 7px', borderRadius: 4, fontWeight: 700,
              }}>#{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 600,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {ex.name || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Neue Übung</span>}
                </div>
                {!isOpen && sum && (
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 1, fontFamily: 'var(--font-mono)' }}>{sum}</div>
                )}
              </div>
              <span style={{
                fontSize: 16, color: 'var(--text-muted)',
                transition: 'transform 0.25s',
                transform: isOpen ? 'rotate(180deg)' : 'none',
              }}>▾</span>
            </div>

            <div style={{
              maxHeight: isOpen ? 400 : 0,
              overflow: 'hidden',
              transition: 'max-height 0.3s ease, opacity 0.2s ease, margin-top 0.2s ease',
              opacity: isOpen ? 1 : 0,
              marginTop: isOpen ? 12 : 0,
            }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
                <button
                  onClick={() => moveEx(i, -1)}
                  disabled={i === 0}
                  style={{ ...S.ghost, padding: '3px 6px', border: 'none', opacity: i === 0 ? 0.3 : 1, fontSize: 13 }}
                >▲</button>
                <button
                  onClick={() => moveEx(i, 1)}
                  disabled={i === exercises.length - 1}
                  style={{ ...S.ghost, padding: '3px 6px', border: 'none', opacity: i === exercises.length - 1 ? 0.3 : 1, fontSize: 13 }}
                >▼</button>
                <div style={{ flex: 1 }} />
                <button
                  onClick={() => { removeEx(ex.id); setExpandedId(null); }}
                  style={{ ...S.ghost, padding: '3px 6px', border: 'none', color: 'var(--danger)' }}
                >
                  <Icon name="trash" size={15} />
                </button>
              </div>

              <input
                value={ex.name}
                onChange={e => updateEx(ex.id, 'name', e.target.value)}
                placeholder="Übungsname"
                style={{ ...S.input, marginBottom: 10, fontWeight: 600, fontSize: 14 }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 8 }}>
                {[
                  { l: 'Sätze', f: 'sets', t: 'number' },
                  { l: 'Wdh.', f: 'reps', p: '10' },
                  { l: 'Gewicht', f: 'weight', p: 'kg' },
                ].map(fld => (
                  <div key={fld.f}>
                    <Label>{fld.l}</Label>
                    <input
                      type={fld.t || 'text'}
                      value={ex[fld.f]}
                      onChange={e => updateEx(ex.id, fld.f, e.target.value)}
                      placeholder={fld.p}
                      style={{
                        ...S.input, textAlign: 'center',
                        fontFamily: 'var(--font-mono)', marginTop: 4, padding: '8px 6px',
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>
                ))}
              </div>

              <input
                value={ex.notes}
                onChange={e => updateEx(ex.id, 'notes', e.target.value)}
                placeholder="Notizen (optional)"
                style={{ ...S.input, fontSize: 12, color: 'var(--text-dim)' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>
        );
      })}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, marginTop: 4 }}>
        <button onClick={addExercise} style={{ ...S.ghost, flex: 1, justifyContent: 'center', padding: 12 }}>
          <Icon name="plus" size={16} /> Manuell
        </button>
        <button onClick={() => setShowLibrary(true)} style={{ ...S.ghost, flex: 1, justifyContent: 'center', padding: 12 }}>
          <Icon name="book" size={16} /> Bibliothek
        </button>
      </div>

      {exercises.length > 0 && (
        <button onClick={onStart} style={{
          ...S.btn(), width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: 15,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
          boxShadow: '0 4px 20px var(--accent-glow)',
        }}>
          <Icon name="play" size={18} color="#fff" /> Training starten
        </button>
      )}

      <ExerciseLibraryModal
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        onSelect={addFromLibrary}
      />
    </div>
  );
}
