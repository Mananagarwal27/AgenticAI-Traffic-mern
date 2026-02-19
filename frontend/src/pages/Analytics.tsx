import { useEffect, useState } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function Analytics() {
  const [stats, setStats] = useState<{
    congestionByJunction?: Record<string, { Low: number; Medium: number; High: number }>
    hourlyTrend?: { _id: number; avgCongestion: number }[]
  }>({})
  const [traffic, setTraffic] = useState<{ junctionName: string; congestionLevel: string; vehicleCount: number }[]>([])

  useEffect(() => {
    axios.get('/api/dashboard/stats').then(res => setStats(res.data.data || {}))
    axios.get('/api/traffic', { params: { limit: 200 } }).then(res => {
      setTraffic(res.data.data || [])
    })
  }, [])

  const junctionData = stats.congestionByJunction
    ? Object.entries(stats.congestionByJunction).map(([name, v]) => ({
        name,
        Low: v.Low || 0,
        Medium: v.Medium || 0,
        High: v.High || 0
      }))
    : []

  const trendData = (stats.hourlyTrend || []).map(t => ({
    hour: `${t._id}:00`,
    level: t.avgCongestion?.toFixed(2) || 0
  }))

  const levelCounts = traffic.reduce((acc, r) => {
    acc[r.congestionLevel] = (acc[r.congestionLevel] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const pieData = Object.entries(levelCounts).map(([name, value]) => ({ name, value }))
  const COLORS = ['#22c55e', '#eab308', '#ef4444']

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-amber-400">Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <h2 className="text-lg font-semibold mb-4">Congestion by Junction</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={junctionData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                <Bar dataKey="Low" stackId="a" fill="#22c55e" />
                <Bar dataKey="Medium" stackId="a" fill="#eab308" />
                <Bar dataKey="High" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <h2 className="text-lg font-semibold mb-4">Congestion Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % 3]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <h2 className="text-lg font-semibold mb-4">Hourly Congestion Trend</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="hour" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              <Bar dataKey="level" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
