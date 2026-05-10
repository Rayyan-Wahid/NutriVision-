import { NavLink, useNavigate } from 'react-router-dom'
import { Zap, LayoutDashboard, Camera, User, BarChart2 } from 'lucide-react'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} /> },
  { to: '/scan',      label: 'Scan Meal',  icon: <Camera size={15} /> },
  { to: '/results',   label: 'Results',   icon: <BarChart2 size={15} /> },
  { to: '/profile',   label: 'Profile',   icon: <User size={15} /> },
]

export default function Navbar() {
  const navigate = useNavigate()

  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
        <div className="nav-logo-icon">
          <Zap size={18} fill="white" />
        </div>
        Nutri<span style={{ color: 'var(--accent)' }}>Vision</span>
      </NavLink>

      <ul className="nav-links">
        {links.map(l => (
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

      <button className="nav-cta" onClick={() => navigate('/scan')}>
        + Scan Meal
      </button>
    </nav>
  )
}
