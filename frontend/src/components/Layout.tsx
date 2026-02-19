import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold text-amber-400">Delhi Traffic AI</h1>
            <div className="flex gap-4">
              <NavLink to="/dashboard" className={({ isActive }) => `px-3 py-1 rounded ${isActive ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-slate-700'}`}>Dashboard</NavLink>
              <NavLink to="/map" className={({ isActive }) => `px-3 py-1 rounded ${isActive ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-slate-700'}`}>Map</NavLink>
              <NavLink to="/analytics" className={({ isActive }) => `px-3 py-1 rounded ${isActive ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-slate-700'}`}>Analytics</NavLink>
              {user?.role === 'admin' && (
                <NavLink to="/admin" className={({ isActive }) => `px-3 py-1 rounded ${isActive ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-slate-700'}`}>Admin</NavLink>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">{user?.name}</span>
            <button onClick={handleLogout} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded">Logout</button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
