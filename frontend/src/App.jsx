import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Landing from './pages/Landing'
import Scan from './pages/Scan'
import Results from './pages/Results'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="page-content">
          <Routes>
            <Route path="/"          element={<Landing />} />
            <Route path="/scan"      element={<Scan />} />
            <Route path="/results"   element={<Results />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile"   element={<Profile />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
