import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import useFarmStore from '../../store/farmStore'

export default function WaterTank({ position = [0, 0, 0] }) {
  const waterLevel = useFarmStore(s => s.waterLevel)
  const setSelectedObject = useFarmStore(s => s.setSelectedObject)
  const selectedObject = useFarmStore(s => s.selectedObject)
  const tankCapacity = useFarmStore(s => s.tankCapacity)
  const waterRef = useRef()
  const [hovered, setHovered] = useState(false)

  const fillHeight = Math.max(0.05, 3.6 * (waterLevel / 100))
  const waterColor = waterLevel > 60 ? '#29b6f6' : waterLevel > 30 ? '#ff9800' : '#f44336'
  const isOpen = selectedObject === 'tank'

  useFrame(({ clock }) => {
    if (waterRef.current) {
      waterRef.current.material.opacity = 0.72 + Math.sin(clock.elapsedTime * 1.5) * 0.08
    }
  })

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); setSelectedObject(isOpen ? null : 'tank') }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
    >
      {/* Hover ring */}
      {hovered && !isOpen && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.4, 1.65, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
        </mesh>
      )}

      {/* Outer tank body */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[1.3, 1.3, 4, 16]} />
        <meshStandardMaterial color="#78909c" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, 4.1, 0]} castShadow>
        <cylinderGeometry args={[1.35, 1.35, 0.2, 16]} />
        <meshStandardMaterial color="#546e7a" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.1, 16]} />
        <meshStandardMaterial color="#546e7a" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Water fill */}
      <mesh ref={waterRef} position={[0, 0.1 + fillHeight / 2, 0]}>
        <cylinderGeometry args={[1.22, 1.22, fillHeight, 16]} />
        <meshStandardMaterial color={waterColor} transparent opacity={0.8} metalness={0.1} roughness={0.2} />
      </mesh>

      {/* Sight glass */}
      <mesh position={[1.31, 2, 0]}>
        <boxGeometry args={[0.08, 3.6, 0.3]} />
        <meshStandardMaterial color="#b3e5fc" transparent opacity={0.6} />
      </mesh>
      <mesh position={[1.32, 0.1 + fillHeight / 2, 0]}>
        <boxGeometry args={[0.1, fillHeight, 0.28]} />
        <meshStandardMaterial color={waterColor} transparent opacity={0.9} />
      </mesh>

      {/* Support legs */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
        <mesh key={i} position={[Math.sin(angle) * 1.1, -0.5, Math.cos(angle) * 1.1]} castShadow>
          <boxGeometry args={[0.15, 1.2, 0.15]} />
          <meshStandardMaterial color="#455a64" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Outlet pipe */}
      <mesh position={[-1.4, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 0.3, 8]} />
        <meshStandardMaterial color="#455a64" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Info panel */}
      {isOpen && (
        <Html
          position={[2.4, 3.2, 0]}
          distanceFactor={10}
          occlude={false}
          style={{ pointerEvents: 'auto' }}
        >
          <div className="info-panel-3d" onClick={e => e.stopPropagation()}>
            <h4>
              Water Tank
              <button className="close-btn" onClick={(e) => { e.stopPropagation(); useFarmStore.getState().setSelectedObject(null) }}>✕</button>
            </h4>
            <div className="info-panel-row">
              <span className="ip-label">Level</span>
              <span className="ip-value" style={{ color: waterColor }}>{waterLevel.toFixed(1)}%</span>
            </div>
            <div className="info-panel-row">
              <span className="ip-label">Volume</span>
              <span className="ip-value">{((waterLevel / 100) * tankCapacity).toFixed(1)} m³</span>
            </div>
            <div className="info-panel-row">
              <span className="ip-label">Capacity</span>
              <span className="ip-value">{tankCapacity} m³</span>
            </div>
            <div className="info-panel-row">
              <span className="ip-label">Status</span>
              <span className="ip-value" style={{ color: '#22c55e' }}>Online</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}
