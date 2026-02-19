import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import axios from 'axios'

const JUNCTIONS = [
  { name: 'AIIMS', lat: 28.567, lng: 77.209 },
  { name: 'ITO', lat: 28.6328, lng: 77.2197 },
  { name: 'Connaught Place', lat: 28.6315, lng: 77.2167 },
  { name: 'Karol Bagh', lat: 28.6519, lng: 77.1909 },
  { name: 'Lajpat Nagar', lat: 28.5678, lng: 77.2431 }
]

export default function TrafficMap() {
  const [trafficData, setTrafficData] = useState<Record<string, { level: string; vehicleCount: number; speed: number }>>({})

  useEffect(() => {
    axios.get('/api/traffic', { params: { limit: 100 } }).then(res => {
      const byJunction: Record<string, { level: string; vehicleCount: number; speed: number }> = {}
      for (const r of res.data.data || []) {
        if (!byJunction[r.junctionName] || new Date(r.timestamp) > new Date(byJunction[r.junctionName] ? '' : 0)) {
          byJunction[r.junctionName] = {
            level: r.congestionLevel,
            vehicleCount: r.vehicleCount,
            speed: r.averageSpeed
          }
        }
      }
      setTrafficData(byJunction)
    })
  }, [])

  const getColor = (level: string) => level === 'High' ? '#ef4444' : level === 'Medium' ? '#eab308' : '#22c55e'

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-amber-400">Traffic Map View</h1>
      <div className="bg-slate-800 rounded-lg border border-slate-700 h-[600px] overflow-hidden">
        <MapContainer center={[28.6139, 77.2090]} zoom={12} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {JUNCTIONS.map(j => {
            const data = trafficData[j.name] || { level: 'Medium', vehicleCount: 0, speed: 0 }
            const color = getColor(data.level)
            return (
              <CircleMarker
                key={j.name}
                center={[j.lat, j.lng]}
                radius={16}
                fillColor={color}
                fillOpacity={0.85}
                stroke={true}
                color="#1e293b"
                weight={2}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{j.name}</strong>
                    <p>Congestion: {data.level}</p>
                    <p>Vehicles: {data.vehicleCount}</p>
                    <p>Avg Speed: {data.speed} km/h</p>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>
      <div className="flex gap-6 text-sm">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500" /> Low</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500" /> Medium</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" /> High</span>
      </div>
    </div>
  )
}
