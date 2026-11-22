import React, { useMemo } from 'react'

// A single natural-looking crop plant
function Plant({ position, scale = 1, color, variant = 0 }) {
  const jitter = variant * 0.08
  return (
    <group position={position} scale={scale}>
      {/* Main rounded bush body */}
      <mesh position={[0, 0.28 + jitter, 0]} castShadow>
        <sphereGeometry args={[0.26 + variant * 0.06, 8, 7]} />
        <meshLambertMaterial color={color} />
      </mesh>
      {/* Side lobes for natural bush shape */}
      <mesh position={[0.18, 0.22, 0.1]} castShadow>
        <sphereGeometry args={[0.16, 7, 6]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh position={[-0.18, 0.2, -0.08]} castShadow>
        <sphereGeometry args={[0.14, 7, 6]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh position={[0.05, 0.14, 0.18]} castShadow>
        <sphereGeometry args={[0.13, 6, 5]} />
        <meshLambertMaterial color={color} />
      </mesh>
      {/* Short stem */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.04, 0.055, 0.12, 5]} />
        <meshLambertMaterial color="#5a3a1a" />
      </mesh>
    </group>
  )
}

// Row crop (like lettuce / cabbage)
function RowCrop({ position, color }) {
  return (
    <group position={position}>
      {/* Flat rosette shape */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const r = 0.18
        const rad = (angle * Math.PI) / 180
        return (
          <mesh key={i} position={[Math.sin(rad) * r, 0.1, Math.cos(rad) * r]} castShadow>
            <sphereGeometry args={[0.12, 6, 5]} />
            <meshLambertMaterial color={i % 2 === 0 ? color : '#2d8c50'} />
          </mesh>
        )
      })}
      <mesh position={[0, 0.08, 0]} castShadow>
        <sphereGeometry args={[0.14, 7, 6]} />
        <meshLambertMaterial color={color} />
      </mesh>
    </group>
  )
}

const COLOR_PALETTES = {
  default: ['#2d7a4a', '#3a9d5c', '#1f6b3f', '#4aad6e', '#338c52'],
  leafy:   ['#4CAF50', '#388E3C', '#66BB6A', '#2E7D32', '#81C784'],
  dark:    ['#1b5e20', '#2e7d32', '#276537', '#1a4c28', '#245c30'],
  light:   ['#52b788', '#74c69d', '#40916c', '#95d5b2', '#52b788'],
}

export default function CropField({
  position = [0, 0, 0],
  cols = 7,
  rows = 6,
  spacing = 1.3,
  palette = 'default',
  irrigating = false,
  type = 'bush', // 'bush' | 'row'
}) {
  const colors = COLOR_PALETTES[palette] || COLOR_PALETTES.default

  const plants = useMemo(() => {
    const list = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - (cols - 1) / 2) * spacing
        const z = (r - (rows - 1) / 2) * spacing
        // Natural jitter
        const jx = (Math.sin(r * 13.7 + c * 7.3) * 0.22)
        const jz = (Math.cos(r * 9.1 + c * 11.5) * 0.22)
        const colorIdx = Math.abs((r * cols + c + Math.floor(r / 2)) % colors.length)
        const variant = (Math.abs(Math.sin(r * c * 0.7 + r + c)) * 3) | 0
        const scale = 0.78 + ((r + c) % 3) * 0.09
        list.push({ x: x + jx, z: z + jz, color: colors[colorIdx], variant, scale })
      }
    }
    return list
  }, [cols, rows, spacing, palette])

  return (
    <group position={position}>
      {plants.map((p, i) =>
        type === 'row'
          ? <RowCrop key={i} position={[p.x, 0, p.z]} color={p.color} />
          : <Plant key={i} position={[p.x, 0, p.z]} color={p.color} variant={p.variant} scale={p.scale} />
      )}
      {/* Blue irrigation shimmer when active */}
      {irrigating && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[cols * spacing + 0.5, rows * spacing + 0.5]} />
          <meshBasicMaterial color="#4fc3f7" transparent opacity={0.08} />
        </mesh>
      )}
    </group>
  )
}
