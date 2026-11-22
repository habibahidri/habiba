import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import useFarmStore from '../../store/farmStore'

export default function WaterPump({ position = [0, 0, 0] }) {
  const pumpActive = useFarmStore(s => s.pumpActive)
  const setPumpActive = useFarmStore(s => s.setPumpActive)
  const selectedObject = useFarmStore(s => s.selectedObject)
  const setSelectedObject = useFarmStore(s => s.setSelectedObject)
  const [hovered, setHovered] = useState(false)
  const glowRef = useRef()
  const impellerRef = useRef()
  const isOpen = selectedObject === 'pump'

  useFrame(({ clock }) => {
    if (glowRef.current) {
      glowRef.current.intensity = pumpActive
        ? 0.6 + Math.sin(clock.elapsedTime * 8) * 0.3
        : 0.1
    }
    if (impellerRef.current && pumpActive) {
      impellerRef.current.rotation.y += 0.15
    }
  })

  const statusColor = pumpActive ? '#22c55e' : '#ef4444'

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); setSelectedObject(isOpen ? null : 'pump') }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
    >
      {hovered && !isOpen && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1.0, 20]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.4} />
        </mesh>
      )}

      {/* Pump base */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.3, 0.9]} />
        <meshStandardMaterial color="#37474f" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Pump body */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.42, 0.65, 10]} />
        <meshStandardMaterial color="#546e7a" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Motor housing */}
      <mesh position={[0.55, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.6, 10]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1565c0" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Impeller */}
      <mesh ref={impellerRef} position={[0, 0.65, 0]}>
        <torusGeometry args={[0.25, 0.04, 6, 12]} />
        <meshStandardMaterial color="#90caf9" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Inlet pipe */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.4, 8]} />
        <meshStandardMaterial color="#455a64" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Outlet pipe */}
      <mesh position={[-0.65, 0.65, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.6, 8]} />
        <meshStandardMaterial color="#455a64" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Status light */}
      <mesh position={[0, 1.15, 0.3]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={pumpActive ? 1.5 : 0.3} />
      </mesh>
      <pointLight ref={glowRef} position={[0, 1.3, 0.3]} color={statusColor} intensity={0.5} distance={3} />

      {isOpen && (
        <Html position={[2.0, 1.8, 0]} distanceFactor={10} occlude={false} style={{ pointerEvents: 'auto' }}>
          <div className="info-panel-3d" onClick={e => e.stopPropagation()}>
            <h4>
              Water Pump
              <button className="close-btn" onClick={() => useFarmStore.getState().setSelectedObject(null)}>✕</button>
            </h4>
            <div className="info-panel-row">
              <span className="ip-label">Status</span>
              <span className="ip-value" style={{ color: statusColor }}>{pumpActive ? 'RUNNING' : 'STOPPED'}</span>
            </div>
            <div className="info-panel-row">
              <span className="ip-label">Flow rate</span>
              <span className="ip-value">{pumpActive ? '8.0 m³/h' : '0.0 m³/h'}</span>
            </div>
            <div className="info-panel-row">
              <span className="ip-label">Power draw</span>
              <span className="ip-value">{pumpActive ? '2.2 kW' : '0 kW'}</span>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '6px' }}>
              <button
                onClick={(e) => { e.stopPropagation(); setPumpActive(true) }}
                style={{ flex: 1, padding: '5px', background: 'rgba(34,197,94,0.2)', border: '1px solid #22c55e', borderRadius: '5px', color: '#22c55e', fontSize: '0.72rem', cursor: 'pointer' }}
              >Start</button>
              <button
                onClick={(e) => { e.stopPropagation(); setPumpActive(false) }}
                style={{ flex: 1, padding: '5px', background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', borderRadius: '5px', color: '#ef4444', fontSize: '0.72rem', cursor: 'pointer' }}
              >Stop</button>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}
