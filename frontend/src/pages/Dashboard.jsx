import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from 'recharts'
import { Flame, TrendingUp, Utensils, Zap, Camera } from 'lucide-react'

const weeklyCalories = [
  { day: 'Mon', cal: 1820 },
  { day: 'Tue', cal: 2100 },
  { day: 'Wed', cal: 1650 },
  { day: 'Thu', cal: 1990 },
  { day: 'Fri', cal: 2240 },
  { day: 'Sat', cal: 1750 },
  { day: 'Sun', cal: 581  },
]

const weeklyMacros = [
  { day: 'Mon', Protein: 145, Carbs: 210, Fat: 65 },
  { day: 'Tue', Protein: 162, Carbs: 240, Fat: 78 },
  { day: 'Wed', Protein: 130, Carbs: 190, Fat: 55 },
  { day: 'Thu', Protein: 158, Carbs: 225, Fat: 70 },
  { day: 'Fri', Protein: 175, Carbs: 260, Fat: 82 },
  { day: 'Sat', Protein: 140, Carbs: 200, Fat: 60 },
  { day: 'Sun', Protein: 45,  Carbs: 62,  Fat: 20 },
]

const mealHistory = [
  { name: 'Grilled Chicken Bowl', time: 'Today 1:00 PM',     cal: 581, emoji: '🍗', tag: 'High Protein' },
  { name: 'Avocado Toast',        time: 'Today 8:30 AM',     cal: 320, emoji: '🥑', tag: 'Balanced' },
  { name: 'Protein Smoothie',     time: 'Yesterday 7:00 PM', cal: 280, emoji: '🥤', tag: 'Low Fat' },
  { name: 'Pasta Primavera',      time: 'Yesterday 1:00 PM', cal: 620, emoji: '🍝', tag: 'High Carbs' },
  { name: 'Greek Salad',          time: 'May 7, 6:30 PM',    cal: 210, emoji: '🥗', tag: 'Low Cal' },
]

const stats = [
  { icon: <Flame size={22} />,     label: "Today's Calories", value: '581',   unit: '/ 2000 kcal', color: '#FF5E3A' },
  { icon: <TrendingUp size={22} />,label: 'Weekly Average',   value: '1,876', unit: 'kcal/day',    color: '#3B82F6' },
  { icon: <Utensils size={22} />,  label: 'Meals Logged',     value: '14',    unit: 'this week',   color: '#10B981' },
  { icon: <Zap size={22} />,       label: 'Current Streak',   value: '6',     unit: 'days 🔥',    color: '#F59E0B' },
]

const tip = { contentStyle: { background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-1)' } }

export default function Dashboard() {
  const navigate = useNavigate()

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
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>29%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '29%' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-3)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
          <span>581 kcal consumed</span><span>1,419 kcal remaining</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>7-Day Calorie Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyCalories}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip {...tip} formatter={v => [`${v} kcal`]} />
              <Line type="monotone" dataKey="cal" stroke="var(--accent)" strokeWidth={2.5} dot={{ fill: 'var(--accent)', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Weekly Macros (g)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyMacros} barSize={7}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip {...tip} formatter={v => [`${v}g`]} />
              <Legend formatter={v => <span style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>{v}</span>} />
              <Bar dataKey="Protein" fill="#FF5E3A" radius={[4,4,0,0]} />
              <Bar dataKey="Carbs"   fill="#3B82F6" radius={[4,4,0,0]} />
              <Bar dataKey="Fat"     fill="#F59E0B" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Meal history */}
      <div className="card">
        <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>Meal History</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {mealHistory.map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', borderRadius: 'var(--r-md)', background: 'var(--bg-elevated)' }}>
              <div style={{ fontSize: '1.75rem' }}>{m.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.name}</div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>{m.time}</div>
              </div>
              <span className="badge badge-accent">{m.tag}</span>
              <div style={{ fontWeight: 700, color: 'var(--accent)', minWidth: 70, textAlign: 'right', fontSize: '0.9rem' }}>{m.cal} kcal</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
