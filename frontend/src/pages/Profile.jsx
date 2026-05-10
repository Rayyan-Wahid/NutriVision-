import { useState } from 'react'
import { User, Target, ShieldCheck, Save, Edit2 } from 'lucide-react'

const restrictions = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Nut-Free', 'Low-Sodium', 'Halal']

export default function Profile() {
  const [name, setName]         = useState('Alex Johnson')
  const [goal, setGoal]         = useState('lose')
  const [calTarget, setCalTarget] = useState(2000)
  const [protein, setProtein]   = useState(150)
  const [carbs, setCarbs]       = useState(200)
  const [fat, setFat]           = useState(65)
  const [selected, setSelected] = useState(['Halal'])
  const [editing, setEditing]   = useState(false)
  const [saved, setSaved]       = useState(false)

  function toggleRestriction(r) {
    setSelected(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])
  }

  function handleSave() {
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 2500)
  }

  const goalOptions = [
    { value: 'lose',     label: 'Lose Weight',   emoji: '📉' },
    { value: 'maintain', label: 'Maintain',       emoji: '⚖️' },
    { value: 'gain',     label: 'Gain Muscle',    emoji: '💪' },
  ]

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: 760 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="section-title">Profile &amp; Goals</h1>
          <p style={{ color: 'var(--text-2)' }}>Set your personal targets to unlock personalised insights.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!editing
            ? <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}><Edit2 size={15} /> Edit</button>
            : <button className="btn btn-primary btn-sm" onClick={handleSave}><Save size={15} /> Save Changes</button>
          }
        </div>
      </div>

      {saved && (
        <div style={{ background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.3)', borderRadius: 'var(--r-md)', padding: '0.875rem 1.25rem', marginBottom: '1.5rem', color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem' }}>
          ✅ Profile saved successfully!
        </div>
      )}

      {/* Avatar & Name */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF5E3A, #FF2A00)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', flexShrink: 0,
          boxShadow: 'var(--shadow-glow)',
        }}>
          <User size={36} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Display Name</div>
          {editing ? (
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--accent)', borderRadius: 'var(--r-sm)', padding: '0.5rem 0.75rem', color: 'var(--text-1)', fontFamily: 'var(--font)', fontSize: '1.25rem', fontWeight: 700, outline: 'none', width: '100%' }}
            />
          ) : (
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{name}</div>
          )}
          <div style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Member since May 2026 · 14 meals logged</div>
        </div>
      </div>

      {/* Goal Type */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={18} color="var(--accent)" /> Goal Type
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {goalOptions.map(o => (
            <button
              key={o.value}
              onClick={() => editing && setGoal(o.value)}
              style={{
                padding: '1rem', borderRadius: 'var(--r-md)',
                background: goal === o.value ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                border: `2px solid ${goal === o.value ? 'var(--accent)' : 'var(--border)'}`,
                color: goal === o.value ? 'var(--accent)' : 'var(--text-2)',
                cursor: editing ? 'pointer' : 'default',
                transition: 'all 0.25s',
                textAlign: 'center',
                fontFamily: 'var(--font)',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{o.emoji}</div>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calorie & Macro targets */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={18} color="var(--accent)" /> Daily Targets
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {[
            { label: '🔥 Daily Calorie Target', value: calTarget, setter: setCalTarget, unit: 'kcal', min: 1000, max: 4000 },
            { label: '🥩 Protein Target',        value: protein,   setter: setProtein,   unit: 'g',    min: 50,   max: 300 },
            { label: '🍞 Carbohydrates Target',  value: carbs,     setter: setCarbs,     unit: 'g',    min: 50,   max: 500 },
            { label: '🫒 Fat Target',             value: fat,       setter: setFat,       unit: 'g',    min: 20,   max: 200 },
          ].map(({ label, value, setter, unit, min, max }) => (
            <div key={label}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: '0.4rem', fontWeight: 500 }}>{label}</div>
              {editing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number" min={min} max={max}
                    value={value}
                    onChange={e => setter(Number(e.target.value))}
                    style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--accent)', borderRadius: 'var(--r-sm)', padding: '0.5rem 0.75rem', color: 'var(--text-1)', fontFamily: 'var(--font)', fontSize: '1rem', fontWeight: 700, outline: 'none' }}
                  />
                  <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>{unit}</span>
                </div>
              ) : (
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
                  {value} <span style={{ fontSize: '0.9rem', color: 'var(--text-3)', fontWeight: 400 }}>{unit}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div className="card">
        <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="var(--accent)" /> Dietary Restrictions
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
          {restrictions.map(r => {
            const on = selected.includes(r)
            return (
              <button
                key={r}
                onClick={() => editing && toggleRestriction(r)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: 'var(--r-full)',
                  background: on ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                  border: `1.5px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                  color: on ? 'var(--accent)' : 'var(--text-2)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: editing ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font)',
                }}
              >
                {r}
              </button>
            )
          })}
        </div>
        {!editing && (
          <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', marginTop: '0.875rem' }}>
            Click <strong style={{ color: 'var(--text-2)' }}>Edit</strong> above to update your dietary restrictions.
          </p>
        )}
      </div>
    </div>
  )
}
