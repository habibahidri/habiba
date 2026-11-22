import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import useFarmStore from '../../store/farmStore'

export default function HydroStation({ position = [0, 0, 0] }) {
  const wheelRef = useRef()
  const flowRef1 = useRef()
  const flowRef2 = useRef()
  const [hovered, setHovered] = useState(false)
  const selectedObject = useFarmStore(s => s.selectedObject)
  const setSelectedObject = useFarmStore(s => s.setSelectedObject)
  const forecast = useFarmStore(s => s.forecast)
  const conditions = useFarmStore(s => s.conditions.hydro)
  const todayKwh = forecast[0]?.kwh ?? 0
  const isOpen = selectedObject === 'hydro'

  useFrame(({ clock }) => {
    if (wheelRef.current) {
      wheelRef.current.rotation.z -= 0.03 * Math.min(2, conditions.flowRate / 0.04)
    }
    if (flowRef1.current) {
      flowRef1.current.position.z = -4 + ((clock.elapsedTime * 2.5) % 8)
    }
    if (flowRef2.current) {
      flowRef2.current.position.z = -4 + ((clock.elapsedTime * 2.5 + 4) % 8)
    }
  })

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); setSelectedObject(isOpen ? null : 'hydro') }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
    >
      {/* River channel walls */}
      <mesh position={[0, 0.4, 0]} receiveShadow>
        <boxGeometry args={[1.8, 0.8, 10]} />
        <meshLambertMaterial color="#546e7a" />
      </mesh>
      {/* Water */}
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[1.2, 0.3, 10]} />
        <meshStandardMaterial color="#29b6f6" transparent opacity={0.75} metalness={0.1} roughness={0.2} />
      </mesh>

      {/* Animated flow particles */}
      <mesh ref={flowRef1} position={[0, 0.75, -4]}>
        <sphereGeometry args={[0.18, 6, 6]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#0288d1" emissiveIntensity={1.0} transparent opacity={0.9} />
      </mesh>
      <mesh ref={flowRef2} position={[0, 0.75, 0]}>
        <sphereGeometry args={[0.14, 6, 6]} />
        <meshStandardMaterial color="#4fc3f7" emissive="#0288d1" emissiveIntensity={1.0} transparent opacity={0.9} />
      </mesh>

      {/* Turbine house */}
      <mesh position={[0, 1.3, 1]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 2.6, 4]} />
        <meshLambertMaterial color="#607080" />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 2.7, 0.8]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[3.6, 0.15, 4.5]} />
        <meshLambertMaterial color="#455a64" />
      </mesh>

      {/* Turbine wheel */}
      <group ref={wheelRef} position={[0, 0.9, 1]}>
        <mesh>
          <torusGeometry args={[0.6, 0.1, 8, 14]} />
          <meshStandardMaterial color="#78909c" metalness={0.8} roughness={0.2} />
        </mesh>
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <mesh key={i} position={[
            Math.sin(i * Math.PI / 4) * 0.6,
            Math.cos(i * Math.PI / 4) * 0.6,
            0
          ]}>
            <boxGeometry args={[0.08, 0.3, 0.14]} />
            <meshStandardMaterial color="#90a4ae" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        <mesh>
          <cylinderGeometry args={[0.14, 0.14, 0.2, 10]} />
          <meshStandardMaterial color="#b0bec5" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Penstock */}
      <mesh position={[0, 0.9, -3]}>
        <cylinderGeometry args={[0.35, 0.35, 2.5, 10]} />
        <meshStandardMaterial color="#546e7a" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Generator */}
      <mesh position={[1.2, 1.1, 1]} castShadow>
        <cylinderGeometry args={[0.45, 0.45, 1.5, 10]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1a237e" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Electrical conduit */}
      <mesh position={[2.2, 0.3, 1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 2.5, 6]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Info Panel */}
      {isOpen && (
        <Html position={[3.5, 3, 0]} distanceFactor={10} occlude={false} style={{ pointerEvents: 'auto' }}>
          <div className="info-panel-3d" onClick={e => e.stopPropagation()}>
            <h4>
              Hydro Station
              <button className="close-btn" onClick={() => useFarmStore.getState().setSelectedObject(null)}>✕</button>
            </h4>
            <div className="info-panel-row"><span className="ip-label">Today output</span><span className="ip-value" style={{ color: '#38bdf8' }}>{todayKwh.toFixed(1)} kWh</span></div>
            <div className="info-panel-row"><span className="ip-label">Flow rate</span><span className="ip-value">{conditions.flowRate.toFixed(3)} m³/s</span></div>
            <div className="info-panel-row"><span className="ip-label">Head height</span><span className="ip-value">{conditions.headHeight} m</span></div>
            <div className="info-panel-row"><span className="ip-label">Efficiency</span><span className="ip-value">85%</span></div>
            <div className="info-panel-row"><span className="ip-label">Type</span><span className="ip-value">Run-of-river</span></div>
          </div>
        </Html>
      )}
    </group>
  )
}
