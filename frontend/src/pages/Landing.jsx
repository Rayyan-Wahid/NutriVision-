import { useNavigate } from 'react-router-dom'
import { Camera, BarChart2, ShieldCheck, Zap, ArrowRight, Salad, TrendingUp, Target } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: <Camera size={28} />,
    title: 'Snap or Upload',
    desc: 'Take a photo of your meal or drag & drop an image. Our AI handles the rest instantly.',
  },
  {
    number: '02',
    icon: <Zap size={28} />,
    title: 'AI Analysis',
    desc: 'Our fine-tuned food detection model identifies every ingredient and estimates portions.',
  },
  {
    number: '03',
    icon: <BarChart2 size={28} />,
    title: 'Track & Improve',
    desc: 'Get full macro breakdowns, warnings, and smart recipe suggestions to hit your goals.',
  },
]

const features = [
  {
    icon: <Camera size={22} />,
    title: 'Smart Meal Scanning',
    desc: 'Real-time AI food detection with confidence scores — no manual logging needed.',
  },
  {
    icon: <BarChart2 size={22} />,
    title: 'Macro Doughnut Charts',
    desc: 'Visualize your protein, carbs, and fat split at a glance with beautiful charts.',
  },
  {
    icon: <ShieldCheck size={22} />,
    title: 'Health Warnings',
    desc: 'Instant sodium, sugar, and fiber alerts so you always stay informed.',
  },
  {
    icon: <Salad size={22} />,
    title: 'AI Recipe Suggestions',
    desc: 'Get two tailored recipe ideas based on your detected ingredients.',
  },
  {
    icon: <TrendingUp size={22} />,
    title: 'Weekly Analytics',
    desc: '7-day calorie & macro charts with streaks and progress toward your goals.',
  },
  {
    icon: <Target size={22} />,
    title: 'Personalised Goals',
    desc: 'Set targets for weight loss, maintenance, or gain — fully customisable.',
  },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────── */}
      <section
        style={{
          minHeight: 'calc(100vh - 4.5rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          padding: '4rem 1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow blobs */}
        <div style={{
          position: 'absolute',
          top: '20%', left: '50%',
          transform: 'translateX(-50%)',
          width: 700, height: 400,
          background: 'radial-gradient(ellipse at center, rgba(255,94,58,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="animate-fade-up">
          <div className="badge badge-accent" style={{ marginBottom: '1.5rem', fontSize: '0.8rem', padding: '0.3rem 0.9rem' }}>
            🍽️ AI-Powered Nutrition Tracking
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
            Know exactly what's<br />
            <span className="text-gradient">on your plate</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-2)', maxWidth: 560, margin: '0 auto 2.5rem' }}>
            Snap a photo of any meal — NutriVision's AI instantly identifies foods,
            calculates macros, and keeps your nutrition on track.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/scan')}>
              <Camera size={20} /> Start Scanning
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/dashboard')}>
              View Dashboard <ArrowRight size={18} />
            </button>
          </div>

          {/* Stat pills */}
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3.5rem', flexWrap: 'wrap' }}>
            {[['98%', 'Detection accuracy'], ['< 2s', 'Analysis time'], ['200+', 'Food categories']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)' }}>{val}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginTop: '0.1rem' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="badge badge-accent" style={{ marginBottom: '1rem' }}>How It Works</div>
            <h2 className="section-title">Three steps to better nutrition</h2>
            <p className="section-subtitle">No calorie counting, no manual logging. Just snap and go.</p>
          </div>
          <div className="grid-3">
            {steps.map((s) => (
              <div key={s.number} className="card card-hover" style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: '1.25rem', right: '1.25rem',
                  fontSize: '2.5rem', fontWeight: 900, color: 'var(--border-2)',
                  lineHeight: 1, userSelect: 'none',
                }}>
                  {s.number}
                </div>
                <div style={{
                  width: 52, height: 52, borderRadius: 'var(--r-md)',
                  background: 'var(--accent-subtle)',
                  color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}>
                  {s.icon}
                </div>
                <h3 style={{ marginBottom: '0.5rem' }}>{s.title}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="badge badge-accent" style={{ marginBottom: '1rem' }}>Features</div>
            <h2 className="section-title">Everything your nutrition needs</h2>
            <p className="section-subtitle">Packed with smart tools to keep you on track every day.</p>
          </div>
          <div className="grid-3">
            {features.map((f) => (
              <div key={f.title} className="card card-hover">
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--r-sm)',
                  background: 'var(--accent-subtle)', color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1rem',
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--bg-surface)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,94,58,0.15) 0%, rgba(255,163,58,0.1) 100%)',
            border: '1px solid rgba(255,94,58,0.25)',
            borderRadius: 'var(--r-xl)',
            padding: '4rem 2rem',
          }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', marginBottom: '1rem' }}>
              Ready to understand your food?
            </h2>
            <p style={{ color: 'var(--text-2)', marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
              Join thousands already tracking smarter with NutriVision.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/scan')}>
              <Camera size={20} /> Scan Your First Meal
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
