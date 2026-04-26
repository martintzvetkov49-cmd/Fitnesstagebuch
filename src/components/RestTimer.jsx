import { useState, useEffect, useRef } from 'react';

export function RestTimer({ defaultSeconds = 90 }) {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(defaultSeconds);
  const [totalTime, setTotalTime] = useState(defaultSeconds);
  const [showPicker, setShowPicker] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setIsRunning(false);
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = (t) => {
    const dur = t || totalTime;
    setTimeLeft(dur);
    setTotalTime(dur);
    setIsRunning(false);
  };
  const startWith = (secs) => {
    setTotalTime(secs);
    setTimeLeft(secs);
    setIsRunning(true);
    setShowPicker(false);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  const isFinished = timeLeft === 0 && !isRunning;
  const presets = [30, 60, 90, 120, 180];

  return (
    <div style={{
      background: isFinished ? 'rgba(6,214,160,0.1)' : 'var(--bg-card)',
      borderRadius: 'var(--radius)', border: '1px solid',
      borderColor: isFinished ? 'var(--accent-secondary)' : isRunning ? 'var(--accent)' : 'var(--border)',
      padding: 16, marginBottom: 16, transition: 'all 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
          <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="26" cy="26" r="22" fill="none" stroke="var(--bg-input)" strokeWidth="4" />
            <circle
              cx="26" cy="26" r="22" fill="none"
              stroke={isFinished ? 'var(--accent-secondary)' : 'var(--accent)'}
              strokeWidth="4" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 22}`}
              strokeDashoffset={`${2 * Math.PI * 22 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
            color: isFinished ? 'var(--accent-secondary)' : 'var(--text)',
          }}>
            {mins}:{secs.toString().padStart(2, '0')}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 13, fontWeight: 600, marginBottom: 6,
            color: isFinished ? 'var(--accent-secondary)' : 'var(--text)',
          }}>
            {isFinished ? 'Pause vorbei!' : isRunning ? 'Pause läuft...' : 'Satzpause'}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {!isRunning && timeLeft === totalTime && !isFinished && (
              <button onClick={start} style={{
                padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: 'var(--accent)', color: '#fff',
                fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600,
              }}>Start</button>
            )}
            {isRunning && (
              <button onClick={pause} style={{
                padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: 'var(--accent-warm)', color: '#fff',
                fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600,
              }}>Pause</button>
            )}
            {!isRunning && timeLeft < totalTime && (
              <button onClick={start} style={{
                padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: 'var(--accent)', color: '#fff',
                fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600,
              }}>Weiter</button>
            )}
            {(isRunning || timeLeft < totalTime) && (
              <button onClick={() => reset()} style={{
                padding: '5px 12px', borderRadius: 6,
                border: '1px solid var(--border)', cursor: 'pointer',
                background: 'transparent', color: 'var(--text-dim)',
                fontFamily: 'var(--font)', fontSize: 12, fontWeight: 500,
              }}>Reset</button>
            )}
            <button
              onClick={() => setShowPicker(!showPicker)}
              style={{
                padding: '5px 10px', borderRadius: 6,
                border: '1px solid var(--border)', cursor: 'pointer',
                background: 'transparent', color: 'var(--text-dim)',
                fontFamily: 'var(--font-mono)', fontSize: 12, marginLeft: 'auto',
              }}
            >{totalTime}s ▾</button>
          </div>
        </div>
      </div>

      {showPicker && (
        <div style={{
          display: 'flex', gap: 6, marginTop: 10,
          paddingTop: 10, borderTop: '1px solid var(--border)',
        }}>
          {presets.map(p => (
            <button key={p} onClick={() => startWith(p)} style={{
              flex: 1, padding: '8px 0', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: totalTime === p ? 'var(--accent)' : 'var(--bg-input)',
              color: totalTime === p ? '#fff' : 'var(--text-dim)',
              fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
            }}>{p >= 60 ? `${p / 60}m` : `${p}s`}</button>
          ))}
        </div>
      )}
    </div>
  );
}
