import { useState, useEffect, useRef } from 'react';
import { loadData, saveData, uid } from './lib/storage.js';
import { Icon } from './lib/icons.jsx';
import { HomeView } from './views/HomeView.jsx';
import { PlanEditor } from './views/PlanEditor.jsx';
import { WorkoutView } from './views/WorkoutView.jsx';
import { WeeklyScheduleView } from './components/WeeklySchedule.jsx';
import { HistoryView } from './components/HistoryView.jsx';
import { ProgressView } from './components/ProgressView.jsx';

const TAB_NAV = [
  { id: 'home', icon: 'dumbbell', label: 'Pläne' },
  { id: 'week', icon: 'week', label: 'Woche' },
  { id: 'history', icon: 'calendar', label: 'Historie' },
  { id: 'progress', icon: 'chart', label: 'Stats' },
];

const TAB_TITLES = { history: 'Historie', progress: 'Fortschritt', week: 'Wochenplan' };
const VIEW_TITLES = { editPlan: 'Plan bearbeiten', workout: 'Training' };
const TAB_ORDER = ['home', 'week', 'history', 'progress'];

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('ft_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ft_theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return [theme, toggle];
}

function usePWAInstall() {
  const deferredPrompt = useRef(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === 'accepted') {
      deferredPrompt.current = null;
      setCanInstall(false);
    }
  };

  return [canInstall, install];
}

export default function App() {
  const [data, setData] = useState(loadData);
  const [view, setView] = useState('home');
  const [tab, setTab] = useState('home');
  const [activePlanId, setActivePlanId] = useState(null);
  const [theme, toggleTheme] = useTheme();
  const [canInstall, install] = usePWAInstall();
  const prevTab = useRef('home');
  const prevView = useRef('home');

  useEffect(() => { saveData(data); }, [data]);

  const activePlan = data.plans.find(p => p.id === activePlanId);

  const updatePlans = (fn) => setData(prev => ({ ...prev, plans: fn(prev.plans) }));
  const updateLogs = (fn) => setData(prev => ({ ...prev, logs: fn(prev.logs) }));
  const updateWeekly = (ws) => setData(prev => ({ ...prev, weeklySchedule: ws }));

  const createPlan = () => {
    const id = uid();
    updatePlans(ps => [...ps, { id, name: 'Neuer Plan', exercises: [] }]);
    setActivePlanId(id);
    prevView.current = view;
    setView('editPlan');
  };

  const deletePlan = (id) => {
    updatePlans(ps => ps.filter(p => p.id !== id));
    if (activePlanId === id) { setView('home'); setActivePlanId(null); }
  };

  const duplicatePlan = (plan) => {
    updatePlans(ps => [...ps, { ...JSON.parse(JSON.stringify(plan)), id: uid(), name: plan.name + ' (Kopie)' }]);
  };

  const updatePlan = (updated) => updatePlans(ps => ps.map(p => p.id === updated.id ? updated : p));

  const startWorkout = (planId) => {
    prevView.current = view;
    setActivePlanId(planId);
    setView('workout');
  };

  const goHome = () => {
    prevView.current = view;
    setView('home');
    setActivePlanId(null);
  };

  const handleTabChange = (newTab) => {
    prevTab.current = tab;
    setTab(newTab);
  };

  // Determine animation class for view transitions
  const getViewClass = () => {
    if (view !== 'home') return 'view-enter';
    if (prevView.current !== 'home') return 'view-enter-back';
    const prev = TAB_ORDER.indexOf(prevTab.current);
    const curr = TAB_ORDER.indexOf(tab);
    if (prev === curr) return '';
    return 'tab-enter';
  };

  const showNav = view === 'home';

  const headerTitle = () => {
    if (view !== 'home') return VIEW_TITLES[view] || '';
    return TAB_TITLES[tab] || '';
  };
  const isMainTitle = view === 'home' && !TAB_TITLES[tab];

  const viewKey = view === 'home' ? `tab-${tab}` : `view-${view}-${activePlanId}`;

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px 16px 96px', minHeight: '100dvh' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        {view !== 'home' && (
          <button onClick={goHome} style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '6px 8px', borderRadius: 'var(--radius-sm)',
            background: 'transparent', color: 'var(--text-dim)',
            border: 'none', cursor: 'pointer', transition: 'all 0.2s',
          }}>
            <Icon name="back" size={22} />
          </button>
        )}
        <div style={{ flex: 1 }}>
          {isMainTitle ? (
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px' }}>Fitness Tagebuch</h1>
          ) : (
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>{headerTitle()}</h1>
          )}
        </div>

        {/* PWA install button */}
        {canInstall && (
          <button onClick={install} title="App installieren" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 'var(--radius-sm)',
            background: 'var(--accent)', color: '#fff',
            border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600,
            transition: 'all 0.2s',
          }}>
            + Installieren
          </button>
        )}

        {/* Theme toggle */}
        <button onClick={toggleTheme} title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'} style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          cursor: 'pointer', color: 'var(--text-dim)', transition: 'all 0.2s',
        }}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>
      </header>

      <div key={viewKey} className={getViewClass()}>
        {view === 'home' && tab === 'home' && (
          <HomeView
            data={data}
            onCreate={createPlan}
            onEdit={(id) => { prevView.current = view; setActivePlanId(id); setView('editPlan'); }}
            onDelete={deletePlan}
            onDuplicate={duplicatePlan}
            onStart={startWorkout}
          />
        )}
        {view === 'home' && tab === 'week' && (
          <WeeklyScheduleView
            plans={data.plans}
            weeklySchedule={data.weeklySchedule}
            onUpdateSchedule={updateWeekly}
            onStartWorkout={startWorkout}
          />
        )}
        {view === 'home' && tab === 'history' && (
          <HistoryView plans={data.plans} logs={data.logs} />
        )}
        {view === 'home' && tab === 'progress' && (
          <ProgressView plans={data.plans} logs={data.logs} />
        )}
        {view === 'editPlan' && activePlan && (
          <PlanEditor
            plan={activePlan}
            onUpdate={updatePlan}
            onStart={() => startWorkout(activePlan.id)}
          />
        )}
        {view === 'workout' && activePlan && (
          <WorkoutView
            plan={activePlan}
            logs={data.logs}
            onUpdateLogs={updateLogs}
            onFinish={goHome}
          />
        )}
      </div>

      {showNav && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: theme === 'dark' ? 'rgba(8,12,22,0.94)' : 'rgba(240,244,248,0.94)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--border)', zIndex: 50,
          transition: 'background 0.3s ease',
        }}>
          <div style={{ display: 'flex', maxWidth: 520, margin: '0 auto' }}>
            {TAB_NAV.map(t => (
              <button key={t.id} onClick={() => handleTabChange(t.id)} style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                padding: '8px 0 10px', background: 'none', border: 'none', cursor: 'pointer',
                color: tab === t.id ? 'var(--accent)' : 'var(--text-muted)',
                fontFamily: 'var(--font)', fontSize: 10, fontWeight: 600,
                transition: 'color 0.2s', position: 'relative',
              }}>
                {tab === t.id && (
                  <div style={{
                    position: 'absolute', top: -1, left: '25%', right: '25%', height: 2,
                    background: 'var(--accent)', borderRadius: '0 0 2px 2px',
                  }} />
                )}
                <Icon name={t.icon} size={20} color={tab === t.id ? 'var(--accent)' : 'var(--text-muted)'} />
                {t.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
