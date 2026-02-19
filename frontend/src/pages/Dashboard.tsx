import { useEffect, useState } from 'react'
import axios from 'axios'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useSocket } from '../context/SocketContext'

const JUNCTIONS = [
  { name: 'AIIMS', lat: 28.567, lng: 77.209 },
  { name: 'ITO', lat: 28.6328, lng: 77.2197 },
  { name: 'Connaught Place', lat: 28.6315, lng: 77.2167 },
  { name: 'Karol Bagh', lat: 28.6519, lng: 77.1909 },
  { name: 'Lajpat Nagar', lat: 28.5678, lng: 77.2431 }
]

function AgentCard({ name, status, description, icon }: { name: string; status: 'active' | 'idle'; description: string; icon: string }) {
  return (
    <div className={`bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl border ${status === 'active' ? 'border-amber-500/50 shadow-lg shadow-amber-500/20' : 'border-slate-700'} transition-all`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`text-2xl ${status === 'active' ? 'animate-pulse' : ''}`}>{icon}</div>
          <div>
            <h3 className="font-semibold text-white">{name}</h3>
            <p className="text-xs text-slate-400">{description}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
          {status === 'active' ? '● Active' : '○ Idle'}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color, trend }: { title: string; value: string | number; icon: string; color: string; trend?: string }) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 hover:border-amber-500/50 transition-all shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {trend && <p className="text-xs text-slate-500 mt-1">{trend}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<{
    totalRecords?: number
    congestionByJunction?: Record<string, { Low: number; Medium: number; High: number }>
    hourlyTrend?: { _id: number; avgCongestion: number }[]
    signals?: { junctionName: string; greenTime: number; redTime: number; updatedBy?: string }[]
  }>({})
  const [recentPredictions, setRecentPredictions] = useState<any[]>([])
  const [agentActivity, setAgentActivity] = useState({ monitoring: 'active', prediction: 'active', optimization: 'idle' })
  const { signals } = useSocket()

  useEffect(() => {
    const fetchData = async () => {
      const [statsRes, signalsRes] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/signals')
      ])
      setStats({ ...statsRes.data.data, signals: signalsRes.data.data })
    }
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    axios.get('/api/traffic/prediction', { params: { vehicleCount: 70, averageSpeed: 20, weatherCondition: 'Clear', junctionName: 'AIIMS' } })
      .then(res => setRecentPredictions([res.data]))
  }, [])

  const signalMap = new Map((signals || []).map(s => [s.junctionName, s]))
  const baseSignals = stats.signals?.length ? stats.signals : JUNCTIONS.map(j => ({
    junctionName: j.name,
    greenTime: 60,
    redTime: 60
  }))
  const displaySignals = baseSignals.map(s => signalMap.get(s.junctionName) || s)

  const trendData = (stats.hourlyTrend || []).map(t => ({ hour: `${t._id}:00`, level: t.avgCongestion?.toFixed(2) || 0 }))
  
  const congestionData = stats.congestionByJunction ? Object.entries(stats.congestionByJunction).map(([name, data]) => ({
    name,
    Low: data.Low || 0,
    Medium: data.Medium || 0,
    High: data.High || 0
  })) : []

  const aiOptimizedCount = displaySignals.filter(s => s.updatedBy === 'ai_optimization').length

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Delhi Traffic AI Dashboard
          </h1>
          <p className="text-slate-400 mt-1">Real-time monitoring powered by Agentic AI</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-green-400 text-sm font-medium">Live</span>
        </div>
      </div>

      {/* Agentic AI System Status */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🤖</span>
          <div>
            <h2 className="text-xl font-bold text-white">Agentic AI System</h2>
            <p className="text-slate-400 text-sm">Three intelligent agents working together</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AgentCard 
            name="Monitoring Agent" 
            status={agentActivity.monitoring as any}
            description="Collects traffic data from sensors"
            icon="📊"
          />
          <AgentCard 
            name="Prediction Agent" 
            status={agentActivity.prediction as any}
            description="ML model predicts congestion levels"
            icon="🔮"
          />
          <AgentCard 
            name="Optimization Agent" 
            status={agentActivity.optimization as any}
            description="Adjusts signal timing intelligently"
            icon="⚙️"
          />
        </div>
        <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-amber-400">🔄</span>
            <span className="text-slate-300">Agent Flow: </span>
            <span className="text-green-400">Monitoring</span>
            <span className="text-slate-500">→</span>
            <span className="text-blue-400">Prediction</span>
            <span className="text-slate-500">→</span>
            <span className="text-purple-400">Optimization</span>
            <span className="text-slate-500">→</span>
            <span className="text-orange-400">Signal Update</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Records" value={stats.totalRecords?.toLocaleString() || 0} icon="📈" color="text-blue-400" />
        <StatCard title="Junctions" value="5" icon="📍" color="text-purple-400" />
        <StatCard title="AI Optimized" value={aiOptimizedCount} icon="🤖" color="text-amber-400" trend="signals optimized by AI" />
        <StatCard title="System Status" value="Active" icon="✅" color="text-green-400" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🗺️</span> Delhi Traffic Map
            </h2>
            <div className="flex gap-2 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Low</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Medium</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> High</span>
            </div>
          </div>
          <div className="h-96 rounded-lg overflow-hidden border border-slate-700">
            <MapContainer center={[28.6139, 77.2090]} zoom={11} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {JUNCTIONS.map(j => {
                const latest = stats.congestionByJunction?.[j.name]
                const level = latest?.High ? 'High' : latest?.Medium ? 'Medium' : 'Low'
                const color = level === 'High' ? '#ef4444' : level === 'Medium' ? '#eab308' : '#22c55e'
                const size = level === 'High' ? 18 : level === 'Medium' ? 14 : 12
                return (
                  <CircleMarker 
                    key={j.name} 
                    center={[j.lat, j.lng]} 
                    radius={size} 
                    fillColor={color} 
                    fillOpacity={0.85} 
                    stroke={true}
                    color="#1e293b"
                    weight={2}
                  >
                    <Popup className="font-semibold">
                      <div className="text-center">
                        <strong className="text-lg">{j.name}</strong>
                        <p className={`mt-1 ${level === 'High' ? 'text-red-500' : level === 'Medium' ? 'text-amber-500' : 'text-green-500'}`}>
                          {level} Congestion
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                )
              })}
            </MapContainer>
          </div>
        </div>

        {/* Signal Timing */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🚦</span> Signal Timing
            <span className="ml-auto text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Live
            </span>
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {displaySignals.map(s => {
              const isAIOptimized = s.updatedBy === 'ai_optimization'
              return (
                <div 
                  key={s.junctionName} 
                  className={`p-3 rounded-lg border transition-all ${isAIOptimized ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-700/50 border-slate-600'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">{s.junctionName}</span>
                    {isAIOptimized && <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded">AI</span>}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      <span className="text-slate-300">Green: <strong className="text-green-400">{s.greenTime}s</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <span className="text-slate-300">Red: <strong className="text-red-400">{s.redTime}s</strong></span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Congestion Trend */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📊</span> Congestion Trend (24h)
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="level" 
                  stroke="#f59e0b" 
                  strokeWidth={3} 
                  dot={{ fill: '#f59e0b', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Congestion by Junction */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📈</span> Congestion by Junction
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={congestionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="Low" stackId="a" fill="#22c55e" />
                <Bar dataKey="Medium" stackId="a" fill="#eab308" />
                <Bar dataKey="High" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent AI Activity */}
      {recentPredictions.length > 0 && (
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🤖</span> Recent AI Prediction
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentPredictions.map((pred, idx) => (
              <div key={idx} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <p className="text-slate-400 text-sm mb-2">Predicted Congestion</p>
                <p className={`text-2xl font-bold ${
                  pred.predictedCongestion === 'High' ? 'text-red-400' : 
                  pred.predictedCongestion === 'Medium' ? 'text-amber-400' : 'text-green-400'
                }`}>
                  {pred.predictedCongestion}
                </p>
                <p className="text-xs text-slate-500 mt-1">Confidence: {(pred.confidence * 100).toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
