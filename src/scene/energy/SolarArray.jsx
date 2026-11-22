import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import useFarmStore from '../../store/farmStore'
import { SOLAR_PANEL_COUNT, SOLAR_PANEL_WATTS, SOLAR_NAMEPLATE_KW } from '../../modules/energy/SolarPredictor'

function SolarPanel({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[1.65, 0.07, 1.0]} />
        <meshStandardMaterial color="#b0bec5" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[1.55, 0.04, 0.9]} />
        <meshStandardMaterial color="#1a237e" metalness={0.3} roughness={0.5} emissive="#1565c0" emissiveIntensity={0.15} />
      </mesh>
      {[-0.5, 0, 0.5].map((x, i) => (
        <mesh key={`v${i}`} position={[x, 0.07, 0]}>
          <boxGeometry args={[0.03, 0.05, 0.9]} />
          <meshStandardMaterial color="#90a4ae" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      {[-0.3, 0, 0.3].map((z, i) => (
        <mesh key={`h${i}`} position={[0, 0.07, z]}>
          <boxGeometry args={[1.55, 0.05, 0.03]} />
          <meshStandardMaterial color="#90a4ae" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
    </group>
  )
}

function PanelRow({ x, z, count = 4, tiltAngle = 0.4 }) {
  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <group key={i}>
          <mesh position={[x + i * 1.9, 0.6, z]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 1.2, 6]} />
            <meshStandardMaterial color="#78909c" metalness={0.8} roughness={0.3} />
          </mesh>
          <SolarPanel position={[x + i * 1.9, 1.2, z]} rotation={[tiltAngle, 0, 0]} />
        </group>
      ))}
    </group>
  )
}

export default function SolarArray({ position = [0, 0, 0] }) {
  const [hovered, setHovered] = useState(false)
  const selectedObject = useFarmStore(s => s.selectedObject)
  const setSelectedObject = useFarmStore(s => s.setSelectedObject)
  const forecast = useFarmStore(s => s.forecast)
  const todayKwh = forecast[0]?.kwh ?? 0
  const conditions = useFarmStore(s => s.conditions.solar)
  const glowRef = useRef()
  const isOpen = selectedObject === 'solar'

  useFrame(({ clock }) => {
    if (glowRef.current) {
      glowRef.current.intensity = 0.3 + Math.sin(clock.elapsedTime * 0.5) * 0.15
    }
  })

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); setSelectedObject(isOpen ? null : 'solar') }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
    >
      <PanelRow x={-5} z={0}   count={6} tiltAngle={0.38} />
      <PanelRow x={-5} z={1.5} count={6} tiltAngle={0.38} />

      {/* Wiring conduit */}
      <mesh position={[2.5, 0.2, 2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 6, 6]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Inverter box */}
      <mesh position={[5.5, 0.4, 0.5]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.4]} />
        <meshStandardMaterial color="#37474f" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[5.5, 0.82, 0.5]}>
        <boxGeometry args={[0.6, 0.06, 0.3]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.8} />
      </mesh>

      <pointLight ref={glowRef} position={[0, 3, 0]} color="#f59e0b" intensity={0.3} distance={12} />

      {isOpen && (
        <Html position={[3.5, 2.8, 0]} distanceFactor={10} occlude={false} style={{ pointerEvents: 'auto' }}>
          <div className="info-panel-3d" onClick={e => e.stopPropagation()}>
            <h4>
              Solar Array
              <button className="close-btn" onClick={() => useFarmStore.getState().setSelectedObject(null)}>✕</button>
            </h4>
            <div className="info-panel-row"><span className="ip-label">Today output</span><span className="ip-value" style={{ color: '#f59e0b' }}>{todayKwh.toFixed(1)} kWh</span></div>
            <div className="info-panel-row"><span className="ip-label">Cloud cover</span><span className="ip-value">{conditions.cloudCover}%</span></div>
            <div className="info-panel-row"><span className="ip-label">Solar hours</span><span className="ip-value">{conditions.solarHours}h</span></div>
            <div className="info-panel-row"><span className="ip-label">Panels</span><span className="ip-value">{SOLAR_PANEL_COUNT} × {SOLAR_PANEL_WATTS} W</span></div>
            <div className="info-panel-row"><span className="ip-label">Nameplate</span><span className="ip-value">{SOLAR_NAMEPLATE_KW.toFixed(2)} kW</span></div>
          </div>
        </Html>
      )}
    </group>
  )
}
