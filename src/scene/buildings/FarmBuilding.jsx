import React from 'react'
import useFarmStore from '../../store/farmStore'

export default function FarmBuilding({ position = [0, 0, 0] }) {
  const setSelectedObject = useFarmStore(s => s.setSelectedObject)

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); setSelectedObject('building') }}>
      {/* Foundation */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[7, 0.2, 5]} />
        <meshLambertMaterial color="#c8b59a" />
      </mesh>

      {/* Main walls */}
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[7, 2.4, 5]} />
        <meshLambertMaterial color="#f0e0c8" />
      </mesh>

      {/* Roof (triangular prism approximated with scaled box) */}
      <mesh position={[0, 2.9, 0]} castShadow>
        <boxGeometry args={[7.4, 0.15, 5.4]} />
        <meshLambertMaterial color="#c0714f" />
      </mesh>

      {/* Roof ridge (two angled boxes) */}
      <mesh position={[0, 3.55, -1.1]} rotation={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[7.5, 0.15, 2.9]} />
        <meshLambertMaterial color="#b5623e" />
      </mesh>
      <mesh position={[0, 3.55, 1.1]} rotation={[-0.5, 0, 0]} castShadow>
        <boxGeometry args={[7.5, 0.15, 2.9]} />
        <meshLambertMaterial color="#b5623e" />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.75, 2.52]} castShadow>
        <boxGeometry args={[1.1, 1.8, 0.1]} />
        <meshLambertMaterial color="#6b4226" />
      </mesh>
      {/* Door frame */}
      <mesh position={[0, 0.75, 2.56]}>
        <boxGeometry args={[1.3, 2.0, 0.08]} />
        <meshLambertMaterial color="#8b5e34" />
      </mesh>

      {/* Windows front */}
      {[-2.2, 2.2].map((x, i) => (
        <group key={i} position={[x, 1.4, 2.52]}>
          <mesh>
            <boxGeometry args={[1.2, 1.0, 0.08]} />
            <meshLambertMaterial color="#7a9db5" />
          </mesh>
          <mesh>
            <boxGeometry args={[1.35, 1.15, 0.05]} />
            <meshLambertMaterial color="#f0e0c8" />
          </mesh>
          {/* Cross pane */}
          <mesh position={[0, 0, 0.06]}>
            <boxGeometry args={[0.07, 1.0, 0.04]} />
            <meshLambertMaterial color="#f0e0c8" />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <boxGeometry args={[1.2, 0.07, 0.04]} />
            <meshLambertMaterial color="#f0e0c8" />
          </mesh>
        </group>
      ))}

      {/* Windows side */}
      <group position={[3.52, 1.4, 0]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1.2, 1.0, 0.08]} />
          <meshLambertMaterial color="#7a9db5" />
        </mesh>
      </group>

      {/* Chimney */}
      <mesh position={[2, 3.5, 0]} castShadow>
        <boxGeometry args={[0.6, 1.4, 0.6]} />
        <meshLambertMaterial color="#c0714f" />
      </mesh>

      {/* Sign board */}
      <mesh position={[0, 2.65, 2.57]}>
        <boxGeometry args={[2.5, 0.5, 0.06]} />
        <meshLambertMaterial color="#2d6a4f" />
      </mesh>
    </group>
  )
}
