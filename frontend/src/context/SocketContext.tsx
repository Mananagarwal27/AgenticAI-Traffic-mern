import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

interface TrafficSignal {
  junctionName: string
  greenTime: number
  redTime: number
  yellowTime: number
  lastUpdated: string
  updatedBy: string
}

interface SocketContextType {
  socket: Socket | null
  signals: TrafficSignal[]
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [signals, setSignals] = useState<TrafficSignal[]>([])

  useEffect(() => {
    if (!token) return
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin
    const s = io(socketUrl, { transports: ['websocket', 'polling'] })
    setSocket(s)
    s.on('signalUpdate', (data: TrafficSignal) => {
      setSignals(prev => {
        const idx = prev.findIndex(x => x.junctionName === data.junctionName)
        const next = [...prev]
        if (idx >= 0) next[idx] = data
        else next.push(data)
        return next
      })
    })
    return () => { s.disconnect() }
  }, [token])

  return (
    <SocketContext.Provider value={{ socket, signals }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used within SocketProvider')
  return ctx
}
