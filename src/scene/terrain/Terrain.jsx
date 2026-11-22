import React, { useMemo } from 'react'

// Dirt path segment
function PathSegment({ args, position, rotation }) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <boxGeometry args={args} />
      <meshLambertMaterial color="#c8a96e" />
    </mesh>
  )
}

// Crop row
function CropRow({ x, z, length = 10, color = '#2d6a4f' }) {
  return (
    <mesh position={[x, 0.05, z]} receiveShadow>
      <boxGeometry args={[0.5, 0.1, length]} />
      <meshLambertMaterial color={color} />
    </mesh>
  )
}

// Crop zone boundary
function ZoneBorder({ position, size, color = '#8fbc6a' }) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={[size[0], 0.08, size[1]]} />
      <meshLambertMaterial color={color} />
    </mesh>
  )
}

export default function Terrain() {
  return (
    <group>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshLambertMaterial color="#4a7c3f" />
      </mesh>

      {/* Inner farm ground (lighter) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshLambertMaterial color="#5a8f4a" />
      </mesh>

      {/* Soil under crop zones */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-12, 0.02, -8]} receiveShadow>
        <planeGeometry args={[18, 14]} />
        <meshLambertMaterial color="#7a5c3a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, 0.02, -8]} receiveShadow>
        <planeGeometry args={[16, 14]} />
        <meshLambertMaterial color="#7a5c3a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-12, 0.02, 8]} receiveShadow>
        <planeGeometry args={[18, 12]} />
        <meshLambertMaterial color="#6b4f30" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, 0.02, 10]} receiveShadow>
        <planeGeometry args={[16, 12]} />
        <meshLambertMaterial color="#6b4f30" />
      </mesh>

      {/* Main central path (N-S) */}
      <PathSegment args={[2.5, 0.08, 56]} position={[0, 0.03, 2]} />
      {/* Main central path (E-W) */}
      <PathSegment args={[56, 0.08, 2.5]} position={[0, 0.03, 0]} />

      {/* Secondary paths */}
      <PathSegment args={[1.5, 0.07, 14]} position={[-12, 0.025, -8]} rotation={[0, 0, 0]} />
      <PathSegment args={[1.5, 0.07, 14]} position={[10, 0.025, -8]} />
      <PathSegment args={[1.5, 0.07, 12]} position={[-12, 0.025, 8]} />
      <PathSegment args={[1.5, 0.07, 12]} position={[10, 0.025, 10]} />

      {/* Zone labels placeholders (colored markers) */}
      <mesh position={[-20, 0.1, -14]} receiveShadow>
        <boxGeometry args={[1.5, 0.15, 0.3]} />
        <meshLambertMaterial color="#22c55e" />
      </mesh>
      <mesh position={[2, 0.1, -14]} receiveShadow>
        <boxGeometry args={[1.5, 0.15, 0.3]} />
        <meshLambertMaterial color="#f59e0b" />
      </mesh>
      <mesh position={[-20, 0.1, 2]} receiveShadow>
        <boxGeometry args={[1.5, 0.15, 0.3]} />
        <meshLambertMaterial color="#38bdf8" />
      </mesh>
      <mesh position={[2, 0.1, 4]} receiveShadow>
        <boxGeometry args={[1.5, 0.15, 0.3]} />
        <meshLambertMaterial color="#a78bfa" />
      </mesh>

      {/* Outer border fence posts */}
      {[-26, -18, -10, -2, 6, 14, 22].map((x, i) => (
        <mesh key={`fp-n-${i}`} position={[x, 0.4, -27]} castShadow>
          <boxGeometry args={[0.2, 0.8, 0.2]} />
          <meshLambertMaterial color="#8b6914" />
        </mesh>
      ))}
      {[-26, -18, -10, -2, 6, 14, 22].map((x, i) => (
        <mesh key={`fp-s-${i}`} position={[x, 0.4, 27]} castShadow>
          <boxGeometry args={[0.2, 0.8, 0.2]} />
          <meshLambertMaterial color="#8b6914" />
        </mesh>
      ))}
      {/* Fence rails N */}
      <mesh position={[0, 0.65, -27]}>
        <boxGeometry args={[52, 0.08, 0.1]} />
        <meshLambertMaterial color="#a07820" />
      </mesh>
      {/* Fence rails S */}
      <mesh position={[0, 0.65, 27]}>
        <boxGeometry args={[52, 0.08, 0.1]} />
        <meshLambertMaterial color="#a07820" />
      </mesh>
    </group>
  )
}
