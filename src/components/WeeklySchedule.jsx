import { useState } from 'react';

const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
const WEEKDAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function WeeklyScheduleView({ plans, weeklySchedule, onUpdateSchedule, onStartWorkout }) {
  const [editingDay, setEditingDay] = useState(null);
  const todayIdx = (new Date().getDay() + 6) % 7;

  const schedule = weeklySchedule || {};

  const setDayPlan = (dayIdx, planId) => {
    const next = { ...schedule };
    if (planId) {
      next[dayIdx] = planId;
    } else {
      delete next[dayIdx];
    }
    onUpdateSchedule(next);
    setEditingDay(null);
  };

  const todayPlan = schedule[todayIdx] ? plans.find(p => p.id === schedule[todayIdx]) : null;

  return (
    <div>
      {todayPlan && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,214,160,0.08))',
          borderRadius: 'var(--radius)', border: '1px solid rgba(59,130,246,0.25)',
          padding: 20, marginBottom: 20,
        }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: 'var(--accent)',
            textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6,
          }}>
            Heute — {WEEKDAYS[todayIdx]}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{todayPlan.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 14 }}>
            {todayPlan.exercises.length} Übung{todayPlan.exercises.length !== 1 ? 'en' : ''}
            {todayPlan.exercises.length > 0 && ' · ' + todayPlan.exercises.map(e => e.name).filter(Boolean).slice(0, 3).join(', ')}
            {todayPlan.exercises.length > 3 && ' …'}
          </div>
          <button
            onClick={() => onStartWorkout(todayPlan.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', borderRadius: 'var(--radius-sm)',
              background: 'var(--accent)', color: '#fff',
              border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font)', fontSize: 14, fontWeight: 600,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <polygon points="6 3 20 12 6 21" stroke="#fff" strokeWidth="2" fill="none" strokeLinejoin="round" />
            </svg>
            Training starten
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {WEEKDAYS.map((day, idx) => {
          const planId = schedule[idx];
          const plan = planId ? plans.find(p => p.id === planId) : null;
          const isToday = idx === todayIdx;
          const isEditing = editingDay === idx;

          return (
            <div key={idx} style={{
              background: isToday ? 'var(--bg-card-hover)' : 'var(--bg-card)',
              borderRadius: 'var(--radius-sm)', border: '1px solid',
              borderColor: isToday ? 'var(--accent)' : 'var(--border)',
              padding: '12px 14px', transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: isToday ? 'var(--accent)' : plan ? 'rgba(59,130,246,0.12)' : 'var(--bg-input)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                  color: isToday ? '#fff' : plan ? 'var(--accent)' : 'var(--text-muted)',
                }}>
                  {WEEKDAYS_SHORT[idx]}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: isToday ? 700 : 500,
                    color: plan ? 'var(--text)' : 'var(--text-muted)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {plan ? plan.name : 'Ruhetag'}
                  </div>
                  {plan && (
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 1 }}>
                      {plan.exercises.length} Übung{plan.exercises.length !== 1 ? 'en' : ''}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setEditingDay(isEditing ? null : idx)}
                  style={{
                    padding: '5px 10px', borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: 'transparent', color: 'var(--text-dim)',
                    cursor: 'pointer', fontFamily: 'var(--font)',
                    fontSize: 11, fontWeight: 500,
                  }}
                >
                  {isEditing ? '✕' : plan ? 'Ändern' : '+ Plan'}
                </button>
              </div>

              {isEditing && (
                <div style={{
                  marginTop: 10, paddingTop: 10,
                  borderTop: '1px solid var(--border)',
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  {plan && (
                    <button onClick={() => setDayPlan(idx, null)} style={{
                      padding: '8px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                      background: 'rgba(239,68,68,0.1)', color: 'var(--danger)',
                      fontFamily: 'var(--font)', fontSize: 13, fontWeight: 500, textAlign: 'left',
                    }}>Ruhetag (Plan entfernen)</button>
                  )}
                  {plans.map(p => (
                    <button key={p.id} onClick={() => setDayPlan(idx, p.id)} style={{
                      padding: '8px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                      background: p.id === planId ? 'rgba(59,130,246,0.15)' : 'var(--bg-input)',
                      color: p.id === planId ? 'var(--accent)' : 'var(--text)',
                      fontFamily: 'var(--font)', fontSize: 13, fontWeight: 500, textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      {p.id === planId && <span style={{ color: 'var(--accent)' }}>✓</span>}
                      {p.name}
                      <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)' }}>
                        {p.exercises.length} Üb.
                      </span>
                    </button>
                  ))}
                  {plans.length === 0 && (
                    <div style={{
                      padding: 12, textAlign: 'center',
                      color: 'var(--text-dim)', fontSize: 13,
                    }}>
                      Erstelle zuerst einen Trainingsplan
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { WEEKDAYS };
