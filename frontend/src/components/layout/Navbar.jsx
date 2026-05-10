import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Zap, LayoutDashboard, Camera, User, BarChart2, LogOut, LogIn } from 'lucide-react'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
  { to: '/scan', label: 'Scan Meal', icon: <Camera size={15} /> },
  { to: '/profile', label: 'Profile', icon: <User size={15} /> },
]

export default function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()

  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
        <div className="nav-logo-icon">
          <Zap size={18} fill="white" />
        </div>
        <span>Nutri</span>
        <span style={{ color: 'var(--accent)' }}>Vision</span>
      </NavLink>

      <ul className="nav-links">
        {isAuthenticated && links.map(l => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {l.icon}
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>

      {isAuthenticated ? (
        <button className="nav-cta" onClick={() => { logout(); navigate('/') }} style={{ background: 'var(--bg-elevated)', color: 'var(--text-1)', border: '1px solid var(--border)' }}>
          <LogOut size={16} /> Logout
        </button>
      ) : (
        <button className="nav-cta" onClick={() => navigate('/auth')}>
          <LogIn size={16} /> Login
        </button>
      )}
    </nav>
  )
}
