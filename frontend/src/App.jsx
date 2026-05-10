import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Landing from './pages/Landing'
import Scan from './pages/Scan'
import Results from './pages/Results'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Auth from './pages/Auth'
import './index.css'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/auth" />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Navbar />
          <main className="page-content">
            <Routes>
              <Route path="/"          element={<Landing />} />
              <Route path="/auth"      element={<Auth />} />
              
              <Route path="/scan"      element={<ProtectedRoute><Scan /></ProtectedRoute>} />
              <Route path="/results"   element={<ProtectedRoute><Results /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
