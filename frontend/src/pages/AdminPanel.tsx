import { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminPanel() {
  const [signals, setSignals] = useState<{ junctionName: string; greenTime: number; redTime: number }[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    axios.get('/api/signals').then(res => setSignals(res.data.data || []))
  }, [])

  const handleOptimize = async () => {
    setLoading(true)
    setMessage('')
    try {
      await axios.post('/api/signals/optimize')
      setMessage('AI optimization applied successfully')
      const res = await axios.get('/api/signals')
      setSignals(res.data.data || [])
    } catch (err: unknown) {
      setMessage((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Optimization failed')
    } finally {
      setLoading(false)
    }
  }

  const handleManualUpdate = async (junctionName: string, greenTime: number, redTime: number) => {
    try {
      await axios.put(`/api/signals/${junctionName}`, { greenTime, redTime })
      const res = await axios.get('/api/signals')
      setSignals(res.data.data || [])
      setMessage(`Updated ${junctionName}`)
    } catch (err: unknown) {
      setMessage((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Update failed')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-amber-400">Admin Control Panel</h1>
      {message && <p className={`p-3 rounded ${message.includes('failed') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>{message}</p>}
      <div className="flex gap-4">
        <button
          onClick={handleOptimize}
          disabled={loading}
          className="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-semibold rounded"
        >
          {loading ? 'Optimizing...' : 'Run AI Optimization'}
        </button>
      </div>
      <p className="text-slate-400 text-sm">
        AI Optimization uses: Monitoring Agent → Prediction Agent → Optimization Agent. High congestion increases green time, Low reduces it.
      </p>
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <h2 className="text-lg font-semibold mb-4">Signal Timing Control</h2>
        <div className="space-y-4">
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
  signal: { junctionName: string; greenTime: number; redTime: number }
  onUpdate: (jn: string, g: number, r: number) => void
}) {
  const [green, setGreen] = useState(signal.greenTime)
  const [red, setRed] = useState(signal.redTime)

  useEffect(() => {
    setGreen(signal.greenTime)
    setRed(signal.redTime)
  }, [signal])

  return (
    <div className="flex items-center gap-4 py-2 border-b border-slate-700 last:border-0">
      <span className="w-40 font-medium">{signal.junctionName}</span>
      <input
        type="number"
        value={green}
        onChange={e => setGreen(parseInt(e.target.value) || 60)}
        min={20}
        max={120}
        className="w-20 px-2 py-1 bg-slate-700 rounded text-sm"
      />
      <span className="text-slate-400 text-sm">Green (s)</span>
      <input
        type="number"
        value={red}
        onChange={e => setRed(parseInt(e.target.value) || 60)}
        min={20}
        max={120}
        className="w-20 px-2 py-1 bg-slate-700 rounded text-sm"
      />
      <span className="text-slate-400 text-sm">Red (s)</span>
      <button
        onClick={() => onUpdate(signal.junctionName, green, red)}
        className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm"
      >
        Update
      </button>
    </div>
  )
}
