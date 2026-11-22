import React from 'react'
import { Html } from '@react-three/drei'
import useFarmStore from '../../store/farmStore'

const YARD = [
  { id: 'ventilation', label: 'Ventilation' },
  { id: 'lighting', label: 'Yard light' },
  { id: 'machinery', label: 'Workshop' },
]

function loadColor(load) {
  if (!load) return '#64748b'
  if (load.running && load.served) return '#22c55e'
  if (load.running && !load.served) return '#ef4444'
  if (load.standby && load.served) return '#f59e0b'
  return '#475569'
}

export default function FarmEquipment() {
  const power = useFarmStore(s => s.power)
  const battery = useFarmStore(s => s.battery)
  const gridAvailable = useFarmStore(s => s.gridAvailable)
  const selectedObject = useFarmStore(s => s.selectedObject)
  const setSelectedObject = useFarmStore(s => s.setSelectedObject)
  const loads = power?.loads ?? []
  const byId = Object.fromEntries(loads.map(load => [load.id, load]))
  const open = selectedObject === 'equipment'
  const charge = Math.max(0, Math.min(100, battery.chargePct)) / 100
  const fillH = 0.25 + charge * 1.15
  const gridColor = gridAvailable ? '#22c55e' : '#ef4444'

  return (
    <group
      position={[-22, 0, 4]}
      onClick={(e) => { e.stopPropagation(); setSelectedObject(open ? null : 'equipment') }}
    >
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[6.2, 0.12, 2.4]} />
        <meshLambertMaterial color="#334155" />
      </mesh>

      <group position={[-2.1, 0, 0]}>
        <mesh position={[0, 0.85, 0]} castShadow>
          <boxGeometry args={[1.15, 1.7, 0.7]} />
          <meshLambertMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, fillH / 2, 0.28]}>
          <boxGeometry args={[0.72, fillH, 0.12]} />
          <meshStandardMaterial
            color={charge > 0.3 ? '#22c55e' : '#f97316'}
            emissive={charge > 0.3 ? '#22c55e' : '#f97316'}
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>

      <group position={[-0.4, 0, 0]}>
        <mesh position={[0, 1.3, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 2.6, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 2.55, 0]}>
          <sphereGeometry args={[0.16, 10, 10]} />
          <meshStandardMaterial color={gridColor} emissive={gridColor} emissiveIntensity={1.2} />
        </mesh>
        <pointLight position={[0, 2.4, 0.2]} color={gridColor} intensity={0.4} distance={4} />
      </group>

      {YARD.map((item, index) => {
        const load = byId[item.id]
        const color = loadColor(load)
        const on = Boolean(load?.running && load?.served)
        return (
          <group key={item.id} position={[1.1 + index * 0.85, 0, 0]}>
            <mesh position={[0, 0.35, 0]} castShadow>
              <boxGeometry args={[0.62, 0.7, 0.62]} />
              <meshLambertMaterial color="#0f172a" />
            </mesh>
            <mesh position={[0, 0.78, 0]}>
              <boxGeometry args={[0.28, 0.16, 0.28]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={on ? 1.4 : 0.35} />
            </mesh>
          </group>
        )
      })}

      {open && (
        <Html position={[0, 3.2, 0]} distanceFactor={12} occlude={false} style={{ pointerEvents: 'auto' }}>
          <div className="info-panel-3d" onClick={e => e.stopPropagation()}>
            <h4>
              Equipment
              <button className="close-btn" onClick={() => setSelectedObject(null)}>✕</button>
            </h4>
            <div className="info-panel-row">
              <span className="ip-label">Battery</span>
              <span className="ip-value">{battery.chargePct.toFixed(0)}%</span>
            </div>
            <div className="info-panel-row">
              <span className="ip-label">Grid</span>
              <span className="ip-value" style={{ color: gridColor }}>{gridAvailable ? 'On' : 'Outage'}</span>
            </div>
            {loads.map(load => (
              <div className="info-panel-row" key={load.id}>
                <span className="ip-label">{load.name}</span>
                <span className="ip-value" style={{ color: loadColor(load) }}>
                  {load.served ? `${load.servedKw.toFixed(2)} kW` : 'No power'}
                </span>
              </div>
            ))}
          </div>
        </Html>
      )}
    </group>
  )
}
