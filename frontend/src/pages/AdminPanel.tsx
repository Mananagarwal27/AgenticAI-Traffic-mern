import { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminPanel() {
  const [signals, setSignals] = useState<{ junctionName: string; greenTime: number; redTime: number; updatedBy?: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [optimizationHistory, setOptimizationHistory] = useState<any[]>([])

  useEffect(() => {
    axios.get('/api/signals').then(res => setSignals(res.data.data || []))
  }, [])

  const handleOptimize = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await axios.post('/api/signals/optimize')
      setMessage('✅ AI optimization applied successfully!')
      setOptimizationHistory(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        updates: res.data.updates?.length || 0
      }, ...prev].slice(0, 5))
      const signalsRes = await axios.get('/api/signals')
      setSignals(signalsRes.data.data || [])
    } catch (err: unknown) {
      setMessage('❌ ' + ((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Optimization failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleManualUpdate = async (junctionName: string, greenTime: number, redTime: number) => {
    try {
      await axios.put(`/api/signals/${junctionName}`, { greenTime, redTime })
      const res = await axios.get('/api/signals')
      setSignals(res.data.data || [])
      setMessage(`✅ Updated ${junctionName}`)
    } catch (err: unknown) {
      setMessage('❌ ' + ((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Update failed'))
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Admin Control Panel
          </h1>
          <p className="text-slate-400 mt-1">Manage traffic signals with AI-powered optimization</p>
        </div>
      </div>

      {/* AI Optimization Section */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🤖</span>
          <div>
            <h2 className="text-xl font-bold text-white">AI Optimization Engine</h2>
            <p className="text-slate-400 text-sm">Three-agent system: Monitoring → Prediction → Optimization</p>
          </div>
        </div>
        
        {message && (
          <div className={`mb-4 p-4 rounded-lg border ${
            message.includes('✅') 
              ? 'bg-green-500/20 border-green-500/50 text-green-400' 
              : 'bg-red-500/20 border-red-500/50 text-red-400'
          }`}>
            {message}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={handleOptimize}
            disabled={loading}
            className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg ${
              loading
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white hover:shadow-amber-500/50'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⚙️</span>
                Optimizing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>🚀</span>
                Run AI Optimization
              </span>
            )}
          </button>
          
          <div className="flex-1 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <p className="text-slate-300 text-sm mb-2">
              <strong className="text-amber-400">How it works:</strong>
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="px-2 py-1 bg-blue-500/20 rounded">📊 Monitoring</span>
              <span>→</span>
              <span className="px-2 py-1 bg-purple-500/20 rounded">🔮 Prediction</span>
              <span>→</span>
              <span className="px-2 py-1 bg-green-500/20 rounded">⚙️ Optimization</span>
              <span>→</span>
              <span className="px-2 py-1 bg-orange-500/20 rounded">🚦 Signals</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              High congestion → +20s green time | Low congestion → -15s green time
            </p>
          </div>
        </div>

        {optimizationHistory.length > 0 && (
          <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-slate-300 text-sm font-semibold mb-2">Recent Optimizations:</p>
            <div className="space-y-1">
              {optimizationHistory.map((item, idx) => (
                <div key={idx} className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="text-green-400">●</span>
                  <span>{item.timestamp}</span>
                  <span>-</span>
                  <span>{item.updates} signals updated</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Signal Control */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🚦</span> Signal Timing Control
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {signals.map(s => (
            <SignalRow key={s.junctionName} signal={s} onUpdate={handleManualUpdate} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SignalRow({
  signal,
  onUpdate
}: {
  signal: { junctionName: string; greenTime: number; redTime: number; updatedBy?: string }
  onUpdate: (jn: string, g: number, r: number) => void
}) {
  const [green, setGreen] = useState(signal.greenTime)
  const [red, setRed] = useState(signal.redTime)

  useEffect(() => {
    setGreen(signal.greenTime)
    setRed(signal.redTime)
  }, [signal])

  const isAIOptimized = signal.updatedBy === 'ai_optimization'

  return (
    <div className={`p-4 rounded-lg border transition-all ${
      isAIOptimized 
        ? 'bg-amber-500/10 border-amber-500/30' 
        : 'bg-slate-700/50 border-slate-600'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-white">{signal.junctionName}</span>
        {isAIOptimized && (
          <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded flex items-center gap-1">
            <span>🤖</span> AI Optimized
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Green Time (s)</label>
          <input
            type="number"
            value={green}
            onChange={e => setGreen(parseInt(e.target.value) || 60)}
            min={20}
            max={120}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Red Time (s)</label>
          <input
            type="number"
            value={red}
            onChange={e => setRed(parseInt(e.target.value) || 60)}
            min={20}
            max={120}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-red-500 focus:outline-none"
          />
        </div>
      </div>
      <button
        onClick={() => onUpdate(signal.junctionName, green, red)}
        className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-blue-500/30"
      >
        Update Signal
      </button>
    </div>
  )
}
