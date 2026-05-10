import { useState, useEffect } from 'react'
import { User, Target, Save, Edit2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { token } = useAuth()
  const [name, setName]         = useState('User')
  const [goal, setGoal]         = useState('balanced')
  const [calTarget, setCalTarget] = useState(2000)
  const [editing, setEditing]   = useState(false)
  const [saved, setSaved]       = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        setName(data.name)
        setGoal(data.goal)
        setCalTarget(data.daily_goal)
      } catch (err) { console.error(err) }
    }
    fetchProfile()
  }, [token])

  async function handleSave() {
    try {
      await fetch('http://127.0.0.1:5000/api/profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ goal, daily_goal: calTarget })
      })
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) { alert("Failed to save") }
  }

  const goalOptions = [
    { value: 'weight_loss',  label: 'Lose Weight',   emoji: '📉' },
    { value: 'balanced',     label: 'Maintain',       emoji: '⚖️' },
    { value: 'muscle_gain',  label: 'Gain Muscle',    emoji: '💪' },
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
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{name}</div>
          <div style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Member since May 2026</div>
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

      {/* Calorie targets */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={18} color="var(--accent)" /> Daily Target
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginBottom: '0.4rem', fontWeight: 500 }}>🔥 Daily Calorie Target</div>
            {editing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number" min="1000" max="4000"
                  value={calTarget}
                  onChange={e => setCalTarget(Number(e.target.value))}
                  style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--accent)', borderRadius: 'var(--r-sm)', padding: '0.5rem 0.75rem', color: 'var(--text-1)', fontFamily: 'var(--font)', fontSize: '1rem', fontWeight: 700, outline: 'none' }}
                />
                <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>kcal</span>
              </div>
            ) : (
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
                {calTarget} <span style={{ fontSize: '0.9rem', color: 'var(--text-3)', fontWeight: 400 }}>kcal</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
