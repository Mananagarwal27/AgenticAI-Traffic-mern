import { useEffect, useState } from 'react'
import axios from 'axios'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useSocket } from '../context/SocketContext'

const JUNCTIONS = [
  { name: 'AIIMS', lat: 28.567, lng: 77.209 },
  { name: 'ITO', lat: 28.6328, lng: 77.2197 },
  { name: 'Connaught Place', lat: 28.6315, lng: 77.2167 },
  { name: 'Karol Bagh', lat: 28.6519, lng: 77.1909 },
  { name: 'Lajpat Nagar', lat: 28.5678, lng: 77.2431 }
]

export default function Dashboard() {
  const [stats, setStats] = useState<{
    totalRecords?: number
    congestionByJunction?: Record<string, { Low: number; Medium: number; High: number }>
    hourlyTrend?: { _id: number; avgCongestion: number }[]
    signals?: { junctionName: string; greenTime: number; redTime: number }[]
  }>({})
  const { signals } = useSocket()

  useEffect(() => {
    axios.get('/api/dashboard/stats').then(res => setStats(res.data.data || {}))
    axios.get('/api/signals').then(res => setStats(prev => ({ ...prev, signals: res.data.data })))
  }, [])

  const signalMap = new Map((signals || []).map(s => [s.junctionName, s]))
  const baseSignals = stats.signals?.length ? stats.signals : JUNCTIONS.map(j => ({
    junctionName: j.name,
    greenTime: 60,
    redTime: 60
  }))
  const displaySignals = baseSignals.map(s => signalMap.get(s.junctionName) || s)

  const trendData = (stats.hourlyTrend || []).map(t => ({ hour: `${t._id}:00`, level: t.avgCongestion?.toFixed(2) || 0 }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-amber-400">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-sm">Total Records</p>
          <p className="text-2xl font-bold">{stats.totalRecords ?? 0}</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-sm">Junctions Monitored</p>
          <p className="text-2xl font-bold">5</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-sm">Live Updates</p>
          <p className="text-2xl font-bold text-green-400">Active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 h-80">
          <h2 className="text-lg font-semibold mb-4">Delhi Map - Junction Markers</h2>
          <MapContainer center={[28.6139, 77.2090]} zoom={11} className="h-64 rounded">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {JUNCTIONS.map(j => {
              const latest = stats.congestionByJunction?.[j.name]
              const level = latest?.High ? 'High' : latest?.Medium ? 'Medium' : 'Low'
              const color = level === 'High' ? '#ef4444' : level === 'Medium' ? '#eab308' : '#22c55e'
              return (
                <CircleMarker key={j.name} center={[j.lat, j.lng]} radius={12} fillColor={color} fillOpacity={0.8} stroke={false}>
                  <Popup>{j.name} - {level}</Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <h2 className="text-lg font-semibold mb-4">Signal Timing (Real-time)</h2>
          <div className="space-y-2">
            {displaySignals.map(s => (
              <div key={s.junctionName} className="flex justify-between items-center py-2 border-b border-slate-700">
                <span>{s.junctionName}</span>
                <div className="flex gap-4">
                  <span className="text-green-400">G: {s.greenTime}s</span>
                  <span className="text-red-400">R: {s.redTime}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <h2 className="text-lg font-semibold mb-4">Congestion Trend (24h)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="hour" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              <Line type="monotone" dataKey="level" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
