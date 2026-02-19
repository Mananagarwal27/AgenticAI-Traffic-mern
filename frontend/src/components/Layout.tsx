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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <nav className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              Delhi Traffic AI
            </h1>
            <div className="flex gap-2">
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => `px-4 py-2 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/map" 
                className={({ isActive }) => `px-4 py-2 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                Map
              </NavLink>
              <NavLink 
                to="/analytics" 
                className={({ isActive }) => `px-4 py-2 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                Analytics
              </NavLink>
              {user?.role === 'admin' && (
                <NavLink 
                  to="/admin" 
                  className={({ isActive }) => `px-4 py-2 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30' 
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  Admin
                </NavLink>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-slate-700/50 rounded-lg border border-slate-600">
              <span className="text-slate-300 text-sm">{user?.name}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg text-white font-medium transition-all shadow-lg hover:shadow-red-500/30"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
