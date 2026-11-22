import React from 'react'
import useFarmStore from '../../store/farmStore'

export default function Greenhouse({ position = [0, 0, 0] }) {
  const setSelectedObject = useFarmStore(s => s.setSelectedObject)

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); setSelectedObject('greenhouse') }}>
      {/* Floor */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[8, 0.1, 5]} />
        <meshLambertMaterial color="#b8d4a0" />
      </mesh>

      {/* Glass walls */}
      {/* Front */}
      <mesh position={[0, 1.3, 2.5]}>
        <boxGeometry args={[8, 2.6, 0.08]} />
        <meshLambertMaterial color="#a8d8ea" transparent opacity={0.4} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 1.3, -2.5]}>
        <boxGeometry args={[8, 2.6, 0.08]} />
        <meshLambertMaterial color="#a8d8ea" transparent opacity={0.4} />
      </mesh>
      {/* Left */}
      <mesh position={[-4, 1.3, 0]}>
        <boxGeometry args={[0.08, 2.6, 5]} />
        <meshLambertMaterial color="#a8d8ea" transparent opacity={0.4} />
      </mesh>
      {/* Right */}
      <mesh position={[4, 1.3, 0]}>
        <boxGeometry args={[0.08, 2.6, 5]} />
        <meshLambertMaterial color="#a8d8ea" transparent opacity={0.4} />
      </mesh>

      {/* Glass roof panels */}
      <mesh position={[0, 2.65, -1.1]} rotation={[-0.45, 0, 0]}>
        <boxGeometry args={[8, 0.07, 2.9]} />
        <meshLambertMaterial color="#c8ecf5" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, 2.65, 1.1]} rotation={[0.45, 0, 0]}>
        <boxGeometry args={[8, 0.07, 2.9]} />
        <meshLambertMaterial color="#c8ecf5" transparent opacity={0.5} />
      </mesh>

      {/* Metal frame pillars */}
      {[-3.8, -1.3, 1.3, 3.8].map((x, i) => (
        <mesh key={i} position={[x, 1.3, 2.52]} castShadow>
          <boxGeometry args={[0.1, 2.6, 0.1]} />
          <meshLambertMaterial color="#607080" />
        </mesh>
      ))}
      {[-3.8, -1.3, 1.3, 3.8].map((x, i) => (
        <mesh key={i + 10} position={[x, 1.3, -2.52]} castShadow>
          <boxGeometry args={[0.1, 2.6, 0.1]} />
          <meshLambertMaterial color="#607080" />
        </mesh>
      ))}

      {/* Ridge beam */}
      <mesh position={[0, 3.1, 0]} castShadow>
        <boxGeometry args={[8.1, 0.12, 0.12]} />
        <meshLambertMaterial color="#607080" />
      </mesh>

      {/* Interior plants (visible through glass) */}
      {[-2.5, -0.8, 0.9, 2.6].map((x, i) => (
        <mesh key={i} position={[x, 0.4, 0]} castShadow>
          <sphereGeometry args={[0.3 + (i % 2) * 0.1, 7, 6]} />
          <meshLambertMaterial color={i % 2 ? '#2ecc71' : '#27ae60'} />
        </mesh>
      ))}

      {/* Door */}
      <mesh position={[0, 0.9, 2.52]}>
        <boxGeometry args={[1.0, 1.8, 0.07]} />
        <meshLambertMaterial color="#607080" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}
