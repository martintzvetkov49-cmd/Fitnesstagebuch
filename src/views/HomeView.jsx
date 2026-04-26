import { Icon } from '../lib/icons.jsx';
import { S, Label, SectionHeader } from '../lib/styles.jsx';
import { WEEKDAYS } from '../components/WeeklySchedule.jsx';

export function HomeView({ data, onCreate, onEdit, onDelete, onDuplicate, onStart }) {
  const { plans, weeklySchedule, logs } = data;
  const todayIdx = (new Date().getDay() + 6) % 7;
  const todayPlanId = weeklySchedule?.[todayIdx];
  const todayPlan = todayPlanId ? plans.find(p => p.id === todayPlanId) : null;
  const logCount = Object.keys(logs || {}).length;

  return (
    <div>
      {todayPlan && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.10) 0%, rgba(6,214,160,0.06) 100%)',
          borderRadius: 'var(--radius)', border: '1px solid rgba(59,130,246,0.2)',
          padding: 18, marginBottom: 20,
          animation: 'fadeUp 0.4s both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px',
              color: 'var(--accent)', background: 'rgba(59,130,246,0.12)', padding: '3px 8px', borderRadius: 4,
            }}>Heute</div>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{WEEKDAYS[todayIdx]}</span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 3 }}>{todayPlan.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14 }}>
            {todayPlan.exercises.map(e => e.name).filter(Boolean).join(' · ') || `${todayPlan.exercises.length} Übungen`}
          </div>
          <button onClick={() => onStart(todayPlan.id)} style={{
            ...S.btn(), padding: '9px 20px', fontSize: 13,
            background: 'var(--accent)', boxShadow: '0 2px 16px var(--accent-glow)',
          }}>
            <Icon name="play" size={16} color="#fff" /> Jetzt starten
          </button>
        </div>
      )}

      {(plans.length > 0 || logCount > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
          {[
            { v: plans.length, l: 'Pläne', c: 'var(--accent)' },
            { v: plans.reduce((a, p) => a + p.exercises.length, 0), l: 'Übungen', c: 'var(--accent-secondary)' },
            { v: logCount, l: 'Trainings', c: 'var(--accent-warm)' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', padding: '12px 10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-mono)', color: s.c }}>{s.v}</div>
              <div style={{
                fontSize: 10, color: 'var(--text-dim)', fontWeight: 600,
                marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.4px',
              }}>{s.l}</div>
            </div>
          ))}
        </div>
      )}

      <SectionHeader>Trainingspläne</SectionHeader>
      {plans.map((plan, i) => (
        <div key={plan.id} style={{
          ...S.card, marginBottom: 8,
          animation: `fadeUp 0.35s ${i * 0.05}s both`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="dumbbell" size={20} color="#fff" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 1 }}>{plan.name}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                {plan.exercises.length} Übung{plan.exercises.length !== 1 ? 'en' : ''}
                {plan.exercises.length > 0 && plan.exercises[0].name && (
                  <span style={{ color: 'var(--text-muted)' }}>
                    {' · '}{plan.exercises.map(e => e.name).filter(Boolean).slice(0, 2).join(', ')}
                    {plan.exercises.length > 2 ? ' …' : ''}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); onStart(plan.id); }}
              style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'var(--accent)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Icon name="play" size={15} color="#fff" />
            </button>
          </div>
          <div style={{
            display: 'flex', gap: 4, marginTop: 12,
            paddingTop: 10, borderTop: '1px solid var(--border)',
          }}>
            <button
              onClick={e => { e.stopPropagation(); onEdit(plan.id); }}
              style={{ ...S.ghost, fontSize: 11, padding: '5px 10px', border: 'none', background: 'var(--bg-input)', borderRadius: 6 }}
            >
              <Icon name="edit" size={13} /> Bearbeiten
            </button>
            <button
              onClick={e => { e.stopPropagation(); onDuplicate(plan); }}
              style={{ ...S.ghost, fontSize: 11, padding: '5px 10px', border: 'none', background: 'var(--bg-input)', borderRadius: 6 }}
            >
              <Icon name="copy" size={13} /> Kopie
            </button>
            <div style={{ flex: 1 }} />
            <button
              onClick={e => {
                e.stopPropagation();
                if (confirm('Plan löschen?')) onDelete(plan.id);
              }}
              style={{ ...S.ghost, fontSize: 11, padding: '5px 8px', border: 'none', color: 'var(--danger)' }}
            >
              <Icon name="trash" size={14} />
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={onCreate}
        style={{
          width: '100%', padding: 20, borderRadius: 'var(--radius)',
          border: '1.5px dashed var(--border)', background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          color: 'var(--text-muted)', fontSize: 14, fontWeight: 600,
          fontFamily: 'var(--font)', cursor: 'pointer', transition: 'all 0.25s',
          marginTop: 4,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.color = 'var(--accent)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--text-muted)';
        }}
      >
        <Icon name="plus" size={18} /> Neuer Trainingsplan
      </button>
    </div>
  );
}
