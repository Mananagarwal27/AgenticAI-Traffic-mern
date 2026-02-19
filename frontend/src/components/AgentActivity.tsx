import { useEffect, useState } from 'react'

interface AgentActivityProps {
  agentName: string
  status: 'active' | 'idle' | 'processing'
  lastActivity?: string
}

export function AgentActivity({ agentName, status, lastActivity }: AgentActivityProps) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (status === 'active' || status === 'processing') {
      const interval = setInterval(() => setPulse(p => !p), 1000)
      return () => clearInterval(interval)
    }
  }, [status])

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
      status === 'active' || status === 'processing'
        ? 'bg-green-500/10 border-green-500/30'
        : 'bg-slate-700/50 border-slate-600'
    }`}>
      <div className={`w-3 h-3 rounded-full ${
        status === 'active' || status === 'processing'
          ? 'bg-green-400 animate-pulse'
          : 'bg-slate-500'
      }`}></div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{agentName}</p>
        {lastActivity && (
          <p className="text-xs text-slate-400">{lastActivity}</p>
        )}
      </div>
      <span className={`text-xs px-2 py-1 rounded ${
        status === 'active' || status === 'processing'
          ? 'bg-green-500/20 text-green-400'
          : 'bg-slate-600 text-slate-400'
      }`}>
        {status === 'processing' ? 'Processing...' : status === 'active' ? 'Active' : 'Idle'}
      </span>
    </div>
  )
}
