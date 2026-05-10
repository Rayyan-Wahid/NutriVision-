import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  AlertTriangle, Edit2, Check, X, BookOpen, Plus, TrendingUp, Heart, Loader, Utensils
} from 'lucide-react'

const mockFoods = [
  { id: 1, name: 'Grilled Chicken Breast', grams: 180, cal: 297, protein: 56, carbs: 0,  fat: 6,  confidence: 97 },
]

const MACRO_COLORS = { protein: '#FF5E3A', carbs: '#3B82F6', fat: '#F59E0B' }

export default function Results() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = useAuth()
  const apiData = location.state?.data
  const [logging, setLogging] = useState(false)

  // Map API data or fallback to mock
  const [foods, setFoods] = useState(apiData ? [{
    id: 1,
    name: apiData.prediction?.food || 'Unknown',
    grams: 100, 
    cal: apiData.nutrition?.calories || 0,
    protein: apiData.nutrition?.protein || 0,
    carbs: apiData.nutrition?.carbs || 0,
    fat: apiData.nutrition?.fat || 0,
    confidence: apiData.prediction?.confidence || 0
  }] : mockFoods)

  const [editId, setEditId]   = useState(null)
  const [editName, setEditName] = useState('')

  const healthData = apiData?.health_score || { score: 70, rating: 'Good', reasons: ['Balanced meal'] }
  const advice = apiData?.advice || "No advice available."

  const totals = foods.reduce(
    (acc, f) => ({ 
      cal: acc.cal + (f.cal || 0), 
      protein: acc.protein + (f.protein || 0), 
      carbs: acc.carbs + (f.carbs || 0), 
      fat: acc.fat + (f.fat || 0) 
    }),
    { cal: 0, protein: 0, carbs: 0, fat: 0 }
  )

  const macroData = [
    { name: 'Protein', value: totals.protein, color: MACRO_COLORS.protein },
    { name: 'Carbs',   value: totals.carbs,   color: MACRO_COLORS.carbs },
    { name: 'Fat',     value: totals.fat,      color: MACRO_COLORS.fat },
  ]

  const dailyGoal = 2000
  const pct = Math.min(100, Math.round((totals.cal / dailyGoal) * 100))

  async function logMeal() {
    if (!apiData) return
    setLogging(true)
    try {
      const res = await fetch('http://127.0.0.1:5000/api/meals', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      })
      if (res.ok) navigate('/dashboard')
    } catch (err) {
      alert("Failed to log meal")
    } finally {
      setLogging(false)
    }
  }

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
          <button className="btn btn-primary btn-sm" onClick={logMeal} disabled={logging}>
            {logging ? <Loader size={15} className="spin" /> : <Check size={15} />}
            {logging ? 'Logging...' : 'Log This Meal'}
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>

        {/* ── Left column ───────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Top AI Match */}
          <div className="card" style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent)' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--accent)" /> Top AI Match
            </h3>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '1.25rem', borderRadius: 'var(--r-md)',
              background: 'var(--bg-elevated)',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)' }}>{foods[0]?.name}</div>
                <div style={{ color: 'var(--text-3)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                  Approx. 100g serving
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '0.25rem', fontWeight: 600 }}>CONFIDENCE</div>
                <div className={`badge ${foods[0]?.confidence >= 90 ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '1rem', padding: '0.4rem 0.8rem' }}>
                  {foods[0]?.confidence}%
                </div>
              </div>
            </div>
          </div>

          {/* Health Score & Reasons */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart size={18} color="#FF5E3A" /> Health Score: {healthData.score}/100
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <span className={`badge ${healthData.score >= 70 ? 'badge-success' : healthData.score >= 50 ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                Rating: {healthData.rating}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {healthData.reasons.map(reason => (
                <div key={reason} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.875rem', borderRadius: 'var(--r-md)',
                  background: 'var(--bg-elevated)',
                  border: `1px solid var(--border)`,
                }}>
                  <Check size={16} color="var(--success)" />
                  <span style={{ color: 'var(--text-2)', fontSize: '0.875rem' }}>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Nutritionist Advice */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} color="var(--accent)" /> AI Nutritionist Advice
            </h3>
            <div style={{ 
              whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--text-2)', fontSize: '0.95rem',
              background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)'
            }}>
              {advice.toLowerCase().includes('part 2') 
                ? advice.split(/PART 2:|Part 2:|part 2:/i)[0].replace(/PART 1: NUTRITION ADVICE|PART 1:/i, '').trim()
                : advice}
            </div>
          </div>

          {/* AI Recipe Suggestion */}
          {advice.toLowerCase().includes('part 2') && (
            <div className="card" style={{ border: '1px solid var(--success-subtle)', background: 'linear-gradient(to bottom right, var(--bg-surface), rgba(16,185,129,0.03))' }}>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Utensils size={18} color="var(--success)" /> Healthy Recipe Idea
              </h3>
              <div style={{ 
                whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--text-2)', fontSize: '0.95rem',
                background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)'
              }}>
                {advice.split(/PART 2:|Part 2:|part 2:/i)[1]?.replace(/HEALTHY RECIPE|RECIPE/i, '').trim()}
              </div>
            </div>
          )}
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
