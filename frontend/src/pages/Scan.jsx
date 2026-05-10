import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UploadCloud, Camera, X, Image, Clock, CheckCircle, Loader } from 'lucide-react'

const recentMeals = [
  { name: 'Grilled Chicken Bowl', cal: 540, time: '2h ago', emoji: '🍗' },
  { name: 'Avocado Toast', cal: 320, time: '8h ago', emoji: '🥑' },
  { name: 'Protein Smoothie', cal: 280, time: 'Yesterday', emoji: '🥤' },
  { name: 'Pasta Primavera', cal: 620, time: 'Yesterday', emoji: '🍝' },
]

const LOADING_STEPS = [
  { label: 'Uploading image…', icon: <UploadCloud size={20} /> },
  { label: 'Detecting foods with AI…', icon: <Camera size={20} /> },
  { label: 'Calculating nutrition…', icon: <CheckCircle size={20} /> },
]

export default function Scan() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const fileInputRef = useRef()
  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState(null)
  const [loadingStep, setLoadingStep] = useState(null)   // null = idle, 0/1/2 = step index, 'done'
  const [file, setFile] = useState(null)
  const [mealLabel, setMealLabel] = useState('')

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    setFile(file)
    const url = URL.createObjectURL(file)
    setPreview(url)
    setLoadingStep(null)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  async function startAnalysis() {
    if (!file) return
    setLoadingStep(0)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('goal', 'balanced')

      // Step 1: Uploading
      setTimeout(() => setLoadingStep(1), 800)

      const response = await fetch('http://127.0.0.1:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) throw new Error('Analysis failed')

      const result = await response.json()

      // Step 2: Calculation
      setLoadingStep(2)

      setTimeout(() => {
        setLoadingStep('done')
        setTimeout(() => navigate('/results', { state: { data: result } }), 600)
      }, 1000)

    } catch (err) {
      alert("Error connecting to server. Make sure server.py is running.")
      setLoadingStep(null)
    }
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: 800 }}>
      <h1 className="section-title">Scan Your Meal</h1>
      <p className="section-subtitle" style={{ marginBottom: '2rem' }}>
        Upload a photo or use your camera — our AI will detect every ingredient.
      </p>

      {/* Upload Zone */}
      {!preview && (
        <div
          className={`upload-zone${dragging ? ' glow-border' : ''}`}
          style={{
            border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border-2)'}`,
            borderRadius: 'var(--r-xl)',
            padding: '4rem 2rem',
            textAlign: 'center',
            background: dragging ? 'var(--accent-subtle)' : 'var(--bg-surface)',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <UploadCloud
            size={52}
            strokeWidth={1.5}
            style={{ color: dragging ? 'var(--accent)' : 'var(--text-3)', marginBottom: '1rem', transition: 'color 0.3s' }}
          />
          <h3 style={{ marginBottom: '0.5rem' }}>Drag & drop your meal photo</h3>
          <p style={{ color: 'var(--text-3)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            PNG, JPG, WEBP up to 10MB
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={e => { e.stopPropagation(); fileInputRef.current.click() }}>
              <Image size={18} /> Browse Files
            </button>
            <button className="btn btn-secondary" onClick={e => e.stopPropagation()}>
              <Camera size={18} /> Use Camera
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])}
          />
        </div>
      )}

      {/* Preview + Controls */}
      {preview && loadingStep === null && (
        <div className="card" style={{ position: 'relative' }}>
          <button
            onClick={() => setPreview(null)}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
          <img
            src={preview}
            alt="Meal preview"
            style={{ width: '100%', maxHeight: 380, objectFit: 'cover', borderRadius: 'var(--r-md)', marginBottom: '1.25rem' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={startAnalysis}>
              Analyze Meal
            </button>
            <button className="btn btn-secondary" onClick={() => { setFile(null); setPreview(null); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {preview && loadingStep !== null && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--accent-subtle)', color: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem',
            animation: loadingStep !== 'done' ? 'pulse-glow 1.5s infinite' : 'none',
          }}>
            {loadingStep === 'done' ? <CheckCircle size={32} color="var(--success)" /> : <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />}
          </div>
          <h2 style={{ marginBottom: '2rem' }}>
            {loadingStep === 'done' ? 'Analysis complete!' : 'Analysing your meal…'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 340, margin: '0 auto' }}>
            {LOADING_STEPS.map((step, i) => {
              const done = loadingStep === 'done' || (typeof loadingStep === 'number' && i < loadingStep)
              const active = typeof loadingStep === 'number' && i === loadingStep
              return (
                <div
                  key={step.label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                    padding: '0.75rem 1rem', borderRadius: 'var(--r-md)',
                    background: done ? 'rgba(16,185,129,.1)' : active ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                    border: `1px solid ${done ? 'rgba(16,185,129,.25)' : active ? 'var(--accent)' : 'var(--border)'}`,
                    color: done ? 'var(--success)' : active ? 'var(--accent)' : 'var(--text-3)',
                    transition: 'all 0.4s',
                    fontSize: '0.9rem',
                  }}
                >
                  {step.icon}
                  <span>{step.label}</span>
                  {done && <CheckCircle size={16} style={{ marginLeft: 'auto' }} />}
                  {active && <Loader size={16} style={{ marginLeft: 'auto', animation: 'spin 1s linear infinite' }} />}
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
