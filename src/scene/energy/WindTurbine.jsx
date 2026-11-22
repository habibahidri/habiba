import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import useFarmStore from '../../store/farmStore'
import { ROTOR_DIAMETER_M } from '../../modules/energy/WindPredictor'

function Blade({ angle }) {
  return (
    <mesh position={[0, 1.4, 0]} rotation={[0, 0, angle]}>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.18, 3.0, 0.08]} />
        <meshStandardMaterial color="#eceff1" metalness={0.4} roughness={0.5} />
      </mesh>
    </mesh>
  )
}

export default function WindTurbine({ position = [0, 0, 0] }) {
  const rotorRef = useRef()
  const [hovered, setHovered] = useState(false)
  const selectedObject = useFarmStore(s => s.selectedObject)
  const setSelectedObject = useFarmStore(s => s.setSelectedObject)
  const forecast = useFarmStore(s => s.forecast)
  const conditions = useFarmStore(s => s.conditions.wind)
  const todayKwh = forecast[0]?.kwh ?? 0
  const windSpeed = conditions.windSpeed
  const isOpen = selectedObject === 'wind'

  const rotSpeed = windSpeed < 3 ? 0 : Math.min((windSpeed - 3) / 9, 1) * 0.08

  useFrame(() => {
    if (rotorRef.current) {
      rotorRef.current.rotation.z += rotSpeed
    }
  })

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); setSelectedObject(isOpen ? null : 'wind') }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
    >
      {/* Tower */}
      <mesh position={[0, 5, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.4, 10, 12]} />
        <meshStandardMaterial color="#cfd8dc" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Nacelle */}
      <mesh position={[0, 10.3, 0]} castShadow>
        <boxGeometry args={[1.2, 0.8, 0.9]} />
        <meshStandardMaterial color="#b0bec5" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Hub */}
      <mesh position={[0.65, 10.3, 0]} castShadow>
        <sphereGeometry args={[0.3, 10, 10]} />
        <meshStandardMaterial color="#90a4ae" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Rotor */}
      <group ref={rotorRef} position={[0.65, 10.3, 0]}>
        <Blade angle={0} />
        <Blade angle={(2 * Math.PI) / 3} />
        <Blade angle={(4 * Math.PI) / 3} />
      </group>
      {/* Base */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.0, 1.1, 0.3, 12]} />
        <meshStandardMaterial color="#78909c" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Cable conduit */}
      <mesh position={[-1.5, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 3.5, 6]} />
        <meshStandardMaterial color="#06b6d4" metalness={0.2} roughness={0.8} />
      </mesh>

      {isOpen && (
        <Html position={[3, 8, 0]} distanceFactor={12} occlude={false} style={{ pointerEvents: 'auto' }}>
          <div className="info-panel-3d" onClick={e => e.stopPropagation()}>
            <h4>
              Wind Turbine
              <button className="close-btn" onClick={() => useFarmStore.getState().setSelectedObject(null)}>✕</button>
            </h4>
            <div className="info-panel-row"><span className="ip-label">Today output</span><span className="ip-value" style={{ color: '#06b6d4' }}>{todayKwh.toFixed(1)} kWh</span></div>
            <div className="info-panel-row"><span className="ip-label">Wind speed</span><span className="ip-value">{windSpeed.toFixed(1)} m/s</span></div>
            <div className="info-panel-row"><span className="ip-label">Rotor diam.</span><span className="ip-value">{ROTOR_DIAMETER_M} m</span></div>
            <div className="info-panel-row"><span className="ip-label">Status</span><span className="ip-value" style={{ color: windSpeed >= 3 ? '#22c55e' : '#ef4444' }}>{windSpeed >= 3 ? 'Generating' : 'Calm — idle'}</span></div>
          </div>
        </Html>
      )}
    </group>
  )
}
