export const S = {
  btn: (bg) => ({
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '10px 20px', borderRadius: 'var(--radius-sm)',
    background: bg || 'var(--accent)', color: '#fff',
    border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
    fontSize: 14, fontWeight: 600, transition: 'all 0.2s',
  }),
  ghost: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 'var(--radius-sm)',
    background: 'transparent', color: 'var(--text-dim)',
    border: '1px solid var(--border)', cursor: 'pointer',
    fontFamily: 'var(--font)', fontSize: 13, fontWeight: 500,
    transition: 'all 0.2s',
  },
  input: {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-input)', color: 'var(--text)',
    border: '1px solid var(--border)', fontFamily: 'var(--font)',
    fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
  },
  card: {
    background: 'var(--bg-card)', borderRadius: 'var(--radius)',
    border: '1px solid var(--border)', padding: 18,
    transition: 'all 0.25s ease',
  },
};

export const Label = ({ children }) => (
  <span style={{
    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.6px', color: 'var(--text-muted)',
  }}>
    {children}
  </span>
);

export const SectionHeader = ({ children, right }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 12, padding: '0 2px',
  }}>
    <Label>{children}</Label>
    {right}
  </div>
);
