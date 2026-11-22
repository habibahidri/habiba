import React from 'react'

function TreeInstance({ position, scale = 1, variant = 0 }) {
  const trunkColor = '#6b4226'
  const foliageColors = ['#2d6a4f', '#3a8c5c', '#1f5c3a', '#4aad6e']
  const color = foliageColors[variant % foliageColors.length]
  const h = 1.4 + variant * 0.3

  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, h * 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.22, h, 7]} />
        <meshLambertMaterial color={trunkColor} />
      </mesh>
      {/* Lower foliage cone */}
      <mesh position={[0, h + 0.5, 0]} castShadow>
        <coneGeometry args={[0.9, 1.4, 8]} />
        <meshLambertMaterial color={color} />
      </mesh>
      {/* Middle cone */}
      <mesh position={[0, h + 1.3, 0]} castShadow>
        <coneGeometry args={[0.65, 1.1, 8]} />
        <meshLambertMaterial color={foliageColors[(variant + 1) % foliageColors.length]} />
      </mesh>
      {/* Top cone */}
      <mesh position={[0, h + 1.9, 0]} castShadow>
        <coneGeometry args={[0.38, 0.75, 8]} />
        <meshLambertMaterial color={foliageColors[(variant + 2) % foliageColors.length]} />
      </mesh>
    </group>
  )
}

export default function Trees() {
  const treePositions = [
    // Perimeter trees
    [-24, 0, -22], [-18, 0, -24], [-10, 0, -25], [2, 0, -25], [12, 0, -24], [20, 0, -22],
    [-24, 0, 22], [-16, 0, 24], [-6, 0, 25], [4, 0, 25], [14, 0, 24], [22, 0, 22],
    [-26, 0, -10], [-26, 0, 2], [-26, 0, 14],
    [26, 0, -10], [26, 0, 2], [26, 0, 14],
    // Accent trees near building
    [18, 0, 14], [22, 0, 10],
    // Near greenhouse
    [-22, 0, 14], [-18, 0, 16],
    // Along paths
    [5, 0, 4], [-5, 0, 4], [5, 0, -4],
  ]

  return (
    <group>
      {treePositions.map(([x, y, z], i) => (
        <TreeInstance
          key={i}
          position={[x, y, z]}
          scale={0.8 + (i % 3) * 0.15}
          variant={i % 4}
        />
      ))}
    </group>
  )
}
