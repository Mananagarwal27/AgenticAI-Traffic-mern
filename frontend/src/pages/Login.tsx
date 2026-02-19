import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-xl shadow-xl w-full max-w-md border border-slate-700">
        <h1 className="text-2xl font-bold text-amber-400 mb-6">Delhi Traffic AI</h1>
        <h2 className="text-lg text-slate-300 mb-6">Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-slate-100 placeholder-slate-400"
            required
          />
          <button type="submit" className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded">
            Login
          </button>
        </form>
        <p className="mt-4 text-slate-400 text-sm">
          Don't have an account? <Link to="/register" className="text-amber-400 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  )
}
