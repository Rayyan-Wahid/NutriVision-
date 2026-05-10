import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Flame, TrendingUp, Utensils, Zap, Camera, Clock } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [history, setHistory] = useState([])
  const [profile, setProfile] = useState({ goal: 'balanced', daily_goal: 2000 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [hRes, pRes] = await Promise.all([
          fetch('http://127.0.0.1:5000/api/history', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://127.0.0.1:5000/api/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])
        const hData = await hRes.json()
        const pData = await pRes.json()
        setHistory(hData)
        setProfile(pData)
      } catch (err) {
        console.error("Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [token])

  // Calculate Today's Stats
  const today = new Date().toLocaleDateString('en-CA') // Reliable YYYY-MM-DD in local time
  const todayMeals = history.filter(m => m.date.startsWith(today))
  const todayCal = todayMeals.reduce((acc, m) => acc + m.calories, 0)
  const pct = Math.min(100, Math.round((todayCal / profile.daily_goal) * 100))

  const stats = [
    { icon: <Flame size={22} />, label: "Today's Calories", value: Math.round(todayCal), unit: `/ ${profile.daily_goal} kcal`, color: '#FF5E3A' },
    { icon: <TrendingUp size={22} />, label: 'Meals Logged', value: history.length, unit: 'total scans', color: '#3B82F6' },
    { icon: <Utensils size={22} />, label: 'Daily Goal', value: profile.daily_goal, unit: 'kcal target', color: '#10B981' },
    { icon: <Zap size={22} />, label: 'Goal Type', value: profile.goal.replace('_', ' ').toUpperCase(), unit: 'active plan', color: '#F59E0B' },
  ]

  if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading your dashboard...</div>

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p style={{ color: 'var(--text-2)' }}>Good afternoon 👋 — here's your nutrition overview.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/scan')}>
          <Camera size={18} /> + Scan Meal
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {stats.map(s => (
          <div key={s.label} className="card">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', background: `${s.color}18`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              {s.icon}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 500, marginBottom: '0.25rem' }}>{s.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', marginTop: '0.25rem' }}>{s.unit}</div>
          </div>
        ))}
      </div>

      {/* Today progress */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 600 }}>Today's Calorie Progress</span>
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{pct}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-3)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
          <span>{Math.round(todayCal)} kcal consumed</span><span>{Math.max(0, profile.daily_goal - Math.round(todayCal))} kcal remaining</span>
        </div>
      </div>

      {/* Meal history */}
      <div className="card">
        <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} /> Meal History
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>No meals logged yet. Start by scanning your first meal!</div>
          ) : (
            history.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', borderRadius: 'var(--r-md)', background: 'var(--bg-elevated)' }}>
                <div style={{ fontSize: '1.75rem' }}>🍽️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.food_name}</div>
                  <div style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>{m.date}</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--accent)', minWidth: 70, textAlign: 'right', fontSize: '0.9rem' }}>{Math.round(m.calories)} kcal</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
