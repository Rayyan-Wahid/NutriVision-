import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  AlertTriangle, Edit2, Check, X, BookOpen, Plus, TrendingUp
} from 'lucide-react'

const mockFoods = [
  { id: 1, name: 'Grilled Chicken Breast', grams: 180, cal: 297, protein: 56, carbs: 0,  fat: 6,  confidence: 97 },
  { id: 2, name: 'Steamed Brown Rice',     grams: 150, cal: 165, protein: 4,  carbs: 34, fat: 1,  confidence: 91 },
  { id: 3, name: 'Broccoli Florets',       grams: 90,  cal: 31,  protein: 3,  carbs: 6,  fat: 0,  confidence: 88 },
  { id: 4, name: 'Olive Oil Drizzle',      grams: 10,  cal: 88,  protein: 0,  carbs: 0,  fat: 10, confidence: 72 },
]

const warnings = [
  { label: 'Low Fiber',   type: 'warning', msg: 'Only 4g — aim for 25g+/day.' },
  { label: 'High Sodium', type: 'danger',  msg: 'Estimated ~820mg — watch your salt intake.' },
]

const recipes = [
  {
    title: 'Chicken & Rice Burrito Bowl',
    tags: ['High Protein', 'Low Fat'],
    time: '20 min',
    cal: 480,
    emoji: '🌯',
  },
  {
    title: 'Asian Chicken Stir-Fry',
    tags: ['Balanced', 'Quick'],
    time: '15 min',
    cal: 390,
    emoji: '🥢',
  },
]

const MACRO_COLORS = { protein: '#FF5E3A', carbs: '#3B82F6', fat: '#F59E0B' }

export default function Results() {
  const navigate = useNavigate()
  const [foods, setFoods]     = useState(mockFoods)
  const [editId, setEditId]   = useState(null)
  const [editName, setEditName] = useState('')

  const totals = foods.reduce(
    (acc, f) => ({ cal: acc.cal + f.cal, protein: acc.protein + f.protein, carbs: acc.carbs + f.carbs, fat: acc.fat + f.fat }),
    { cal: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const macroData = [
    { name: 'Protein', value: totals.protein, color: MACRO_COLORS.protein },
    { name: 'Carbs',   value: totals.carbs,   color: MACRO_COLORS.carbs },
    { name: 'Fat',     value: totals.fat,      color: MACRO_COLORS.fat },
  ]

  const dailyGoal = 2000
  const pct = Math.min(100, Math.round((totals.cal / dailyGoal) * 100))

  function startEdit(f) { setEditId(f.id); setEditName(f.name) }
  function saveEdit()   { setFoods(fs => fs.map(f => f.id === editId ? { ...f, name: editName } : f)); setEditId(null) }
  function removeFood(id) { setFoods(fs => fs.filter(f => f.id !== id)) }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="section-title">Meal Results</h1>
          <p style={{ color: 'var(--text-2)' }}>AI analysis complete — review and confirm your meal.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/scan')}>
            <X size={15} /> Retake
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')}>
            <Check size={15} /> Log This Meal
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>

        {/* ── Left column ───────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Detected foods */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--accent)" /> Detected Foods
            </h3>
            {foods.map(f => (
              <div key={f.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.875rem', borderRadius: 'var(--r-md)',
                background: 'var(--bg-elevated)', marginBottom: '0.5rem',
              }}>
                {editId === f.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      style={{
                        flex: 1, background: 'var(--bg-base)', border: '1px solid var(--accent)',
                        borderRadius: 'var(--r-sm)', padding: '0.35rem 0.6rem',
                        color: 'var(--text-1)', fontFamily: 'var(--font)', outline: 'none',
                      }}
                    />
                    <button className="btn btn-primary btn-sm" onClick={saveEdit}><Check size={14} /></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}><X size={14} /></button>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.15rem' }}>{f.name}</div>
                      <div style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>
                        {f.grams}g · {f.cal} kcal · P: {f.protein}g · C: {f.carbs}g · F: {f.fat}g
                      </div>
                    </div>
                    <div className={`badge ${f.confidence >= 90 ? 'badge-success' : f.confidence >= 75 ? 'badge-warning' : 'badge-danger'}`}>
                      {f.confidence}%
                    </div>
                    <button onClick={() => startEdit(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => removeFood(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
                      <X size={15} />
                    </button>
                  </>
                )}
              </div>
            ))}
            <button className="btn btn-ghost btn-sm" style={{ marginTop: '0.5rem', gap: '0.4rem' }}>
              <Plus size={15} /> Add Item Manually
            </button>
          </div>

          {/* Warnings */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="var(--warning)" /> Health Warnings
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {warnings.map(w => (
                <div key={w.label} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  padding: '0.875rem', borderRadius: 'var(--r-md)',
                  background: w.type === 'danger' ? 'rgba(239,68,68,.08)' : 'rgba(245,158,11,.08)',
                  border: `1px solid ${w.type === 'danger' ? 'rgba(239,68,68,.2)' : 'rgba(245,158,11,.2)'}`,
                }}>
                  <span className={`badge badge-${w.type}`}>{w.label}</span>
                  <span style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>{w.msg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recipes */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} color="var(--accent)" /> AI Recipe Suggestions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {recipes.map(r => (
                <div key={r.title} className="card card-hover" style={{ padding: '1.25rem', background: 'var(--bg-elevated)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{r.emoji}</div>
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.925rem' }}>{r.title}</div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {r.tags.map(t => <span key={t} className="badge badge-accent">{t}</span>)}
                  </div>
                  <div style={{ color: 'var(--text-3)', fontSize: '0.8rem' }}>⏱ {r.time} · 🔥 {r.cal} kcal</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column ──────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Macro Doughnut */}
          <div className="card" style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem' }}>Macro Split</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={macroData} cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  paddingAngle={3} dataKey="value"
                >
                  {macroData.map(entry => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-1)' }}
                  formatter={v => [`${v}g`]}
                />
                <Legend
                  iconType="circle"
                  formatter={v => <span style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', marginTop: '0.75rem' }}>
              {macroData.map(m => (
                <div key={m.name} style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, color: m.color }}>{m.value}g</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{m.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Goal Progress */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
              <h3 style={{ fontSize: '0.95rem' }}>Daily Calorie Goal</h3>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{pct}%</span>
            </div>
            <div className="progress-bar" style={{ marginBottom: '0.625rem' }}>
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-3)', fontSize: '0.8rem' }}>
              <span>🔥 {totals.cal} kcal</span>
              <span>Goal: {dailyGoal} kcal</span>
            </div>
          </div>

          {/* Summary totals */}
          <div className="card" style={{ background: 'var(--bg-elevated)' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>Meal Summary</h3>
            {[
              ['Calories', `${totals.cal} kcal`, 'var(--accent)'],
              ['Protein',  `${totals.protein}g`,  '#FF5E3A'],
              ['Carbs',    `${totals.carbs}g`,     '#3B82F6'],
              ['Fat',      `${totals.fat}g`,        '#F59E0B'],
            ].map(([label, val, color]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>{label}</span>
                <span style={{ fontWeight: 700, color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
