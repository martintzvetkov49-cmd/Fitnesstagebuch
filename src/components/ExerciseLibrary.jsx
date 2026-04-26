import { useState, useEffect, useRef } from 'react';

const EXERCISE_LIBRARY = {
  'Brust': [
    { name: 'Bankdrücken', defaultSets: 4, defaultReps: '8' },
    { name: 'Schrägbankdrücken', defaultSets: 3, defaultReps: '10' },
    { name: 'Fliegende (Kurzhantel)', defaultSets: 3, defaultReps: '12' },
    { name: 'Cable Crossover', defaultSets: 3, defaultReps: '12' },
    { name: 'Dips (Brust)', defaultSets: 3, defaultReps: '10' },
    { name: 'Butterfly Maschine', defaultSets: 3, defaultReps: '12' },
  ],
  'Rücken': [
    { name: 'Klimmzüge', defaultSets: 4, defaultReps: '8' },
    { name: 'Langhantelrudern', defaultSets: 4, defaultReps: '8' },
    { name: 'Latzug', defaultSets: 3, defaultReps: '10' },
    { name: 'Kurzhantelrudern', defaultSets: 3, defaultReps: '10' },
    { name: 'Kreuzheben', defaultSets: 4, defaultReps: '5' },
    { name: 'Face Pulls', defaultSets: 3, defaultReps: '15' },
    { name: 'T-Bar Rudern', defaultSets: 3, defaultReps: '10' },
  ],
  'Schultern': [
    { name: 'Schulterdrücken (Langhantel)', defaultSets: 4, defaultReps: '8' },
    { name: 'Seitheben', defaultSets: 3, defaultReps: '15' },
    { name: 'Frontheben', defaultSets: 3, defaultReps: '12' },
    { name: 'Arnold Press', defaultSets: 3, defaultReps: '10' },
    { name: 'Reverse Flys', defaultSets: 3, defaultReps: '15' },
    { name: 'Aufrechtes Rudern', defaultSets: 3, defaultReps: '12' },
  ],
  'Beine': [
    { name: 'Kniebeugen', defaultSets: 4, defaultReps: '8' },
    { name: 'Beinpresse', defaultSets: 4, defaultReps: '10' },
    { name: 'Rumänisches Kreuzheben', defaultSets: 3, defaultReps: '10' },
    { name: 'Ausfallschritte', defaultSets: 3, defaultReps: '12' },
    { name: 'Beinstrecker', defaultSets: 3, defaultReps: '12' },
    { name: 'Beinbeuger', defaultSets: 3, defaultReps: '12' },
    { name: 'Wadenheben', defaultSets: 4, defaultReps: '15' },
    { name: 'Bulgarian Split Squats', defaultSets: 3, defaultReps: '10' },
  ],
  'Arme': [
    { name: 'Bizeps Curls (Langhantel)', defaultSets: 3, defaultReps: '10' },
    { name: 'Hammercurls', defaultSets: 3, defaultReps: '10' },
    { name: 'Trizeps Dips', defaultSets: 3, defaultReps: '12' },
    { name: 'Trizepsdrücken (Kabel)', defaultSets: 3, defaultReps: '12' },
    { name: 'Konzentrationscurls', defaultSets: 3, defaultReps: '12' },
    { name: 'Skull Crushers', defaultSets: 3, defaultReps: '10' },
    { name: 'Preacher Curls', defaultSets: 3, defaultReps: '10' },
  ],
  'Core': [
    { name: 'Plank', defaultSets: 3, defaultReps: '60s' },
    { name: 'Crunches', defaultSets: 3, defaultReps: '20' },
    { name: 'Russian Twist', defaultSets: 3, defaultReps: '20' },
    { name: 'Hanging Leg Raises', defaultSets: 3, defaultReps: '12' },
    { name: 'Ab Wheel Rollout', defaultSets: 3, defaultReps: '10' },
    { name: 'Cable Woodchops', defaultSets: 3, defaultReps: '12' },
  ],
};

const GROUP_COLORS = {
  'Brust': '#ef4444',
  'Rücken': '#3b82f6',
  'Schultern': '#f59e0b',
  'Beine': '#06d6a0',
  'Arme': '#a855f7',
  'Core': '#ec4899',
};

export function ExerciseLibraryModal({ isOpen, onClose, onSelect }) {
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState(null);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const closingRef = useRef(false);

  // Handle browser back button — close modal instead of navigating
  useEffect(() => {
    if (!isOpen) return;
    closingRef.current = false;
    history.pushState({ modal: 'exerciseLibrary' }, '');

    const handlePop = () => {
      if (!closingRef.current) onClose();
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [isOpen]);

  const handleClose = () => {
    closingRef.current = true;
    // Go back in history if we pushed a state
    if (history.state?.modal === 'exerciseLibrary') {
      history.back();
    }
    setDragY(0);
    onClose();
  };

  // Touch handlers for swipe-to-dismiss
  const onTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
    setDragging(true);
  };

  const onTouchMove = (e) => {
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setDragY(delta);
  };

  const onTouchEnd = () => {
    setDragging(false);
    if (dragY > 90) {
      handleClose();
    } else {
      setDragY(0);
    }
  };

  if (!isOpen) return null;

  const groups = Object.keys(EXERCISE_LIBRARY);
  const filtered = activeGroup
    ? { [activeGroup]: EXERCISE_LIBRARY[activeGroup].filter(e => e.name.toLowerCase().includes(search.toLowerCase())) }
    : Object.fromEntries(
        groups
          .map(g => [g, EXERCISE_LIBRARY[g].filter(e => e.name.toLowerCase().includes(search.toLowerCase()))])
          .filter(([, exs]) => exs.length > 0)
      );

  // Backdrop opacity fades as you drag down
  const backdropOpacity = Math.max(0.3, 0.7 - (dragY / 300));

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: `rgba(0,0,0,${backdropOpacity})`,
        backdropFilter: dragY > 0 ? 'none' : 'blur(4px)',
        zIndex: 100,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        transition: dragging ? 'none' : 'background 0.3s',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: '20px 20px 0 0',
          width: '100%', maxWidth: 520, maxHeight: '80vh',
          display: 'flex', flexDirection: 'column',
          border: '1px solid var(--border)', borderBottom: 'none',
          transform: `translateY(${dragY}px)`,
          transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
          willChange: 'transform',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle — touch target for swipe-to-dismiss */}
        <div
          style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px', cursor: 'grab' }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div style={{
            width: 40, height: 4, borderRadius: 2,
            background: dragging ? 'var(--accent)' : 'var(--border)',
            transition: 'background 0.2s',
          }} />
        </div>

        <div style={{ padding: '0 20px 12px' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Übungsbibliothek</h3>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Suchen..."
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-input)', color: 'var(--text)',
              border: '1px solid var(--border)', fontFamily: 'var(--font)',
              fontSize: 14, outline: 'none',
            }}
          />
        </div>

        <div className="hide-scrollbar" style={{
          display: 'flex', gap: 6, padding: '0 20px 12px', overflowX: 'auto', flexShrink: 0,
        }}>
          <button
            onClick={() => setActiveGroup(null)}
            style={{
              padding: '6px 12px', borderRadius: 16, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600,
              background: !activeGroup ? 'var(--accent)' : 'var(--bg-input)',
              color: !activeGroup ? '#fff' : 'var(--text-dim)',
            }}
          >Alle</button>
          {groups.map(g => (
            <button
              key={g}
              onClick={() => setActiveGroup(activeGroup === g ? null : g)}
              style={{
                padding: '6px 12px', borderRadius: 16, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                background: activeGroup === g ? GROUP_COLORS[g] + '30' : 'var(--bg-input)',
                color: activeGroup === g ? GROUP_COLORS[g] : 'var(--text-dim)',
              }}
            >{g}</button>
          ))}
        </div>

        <div style={{ overflowY: 'auto', padding: '0 20px 20px', flex: 1 }}>
          {Object.entries(filtered).map(([group, exercises]) => (
            <div key={group} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.5px', color: GROUP_COLORS[group] || 'var(--text-dim)',
                marginBottom: 8, padding: '0 2px',
              }}>{group}</div>
              {exercises.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => { onSelect(ex); handleClose(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '10px 12px',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font)',
                    fontSize: 14, color: 'var(--text)', textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: GROUP_COLORS[group] || 'var(--accent)',
                  }} />
                  <span style={{ flex: 1 }}>{ex.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {ex.defaultSets}×{ex.defaultReps}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { EXERCISE_LIBRARY };
