import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function Cow({ position, rotation = 0, phase = 0 }) {
  const ref = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase
    ref.current.rotation.y = rotation + Math.sin(t * 0.4) * 0.18
    ref.current.position.y = position[1] + Math.sin(t * 1.4) * 0.015
  })

  return (
    <group ref={ref} position={position}>
      {[[-0.42, 0.26, 0.26], [-0.42, 0.26, -0.26], [0.42, 0.26, 0.26], [0.42, 0.26, -0.26]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <cylinderGeometry args={[0.09, 0.1, 0.52, 8]} />
          <meshLambertMaterial color="#f4f1ea" />
        </mesh>
      ))}
      {[[-0.42, 0.04, 0.26], [-0.42, 0.04, -0.26], [0.42, 0.04, 0.26], [0.42, 0.04, -0.26]].map(([x, y, z], i) => (
        <mesh key={`hoof-${i}`} position={[x, y, z]} castShadow>
          <boxGeometry args={[0.16, 0.08, 0.16]} />
          <meshLambertMaterial color="#2b241c" />
        </mesh>
      ))}

      <mesh position={[0, 0.78, 0]} castShadow>
        <boxGeometry args={[1.45, 0.68, 0.78]} />
        <meshLambertMaterial color="#f7f4ee" />
      </mesh>
      <mesh position={[0.15, 1.08, 0.18]} castShadow>
        <boxGeometry args={[0.42, 0.14, 0.32]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-0.28, 0.86, -0.34]} castShadow>
        <boxGeometry args={[0.36, 0.28, 0.14]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.32, 0.7, -0.32]} castShadow>
        <boxGeometry args={[0.34, 0.22, 0.14]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>

      <mesh position={[0.78, 0.95, 0]} castShadow>
        <boxGeometry args={[0.28, 0.42, 0.36]} />
        <meshLambertMaterial color="#f7f4ee" />
      </mesh>
      <mesh position={[0.98, 0.86, 0]} castShadow>
        <boxGeometry args={[0.32, 0.36, 0.4]} />
        <meshLambertMaterial color="#f3efe6" />
      </mesh>
      <mesh position={[1.16, 0.74, 0]} castShadow>
        <boxGeometry args={[0.22, 0.22, 0.32]} />
        <meshLambertMaterial color="#f0c9b0" />
      </mesh>
      {[-0.1, 0.1].map((z, i) => (
        <mesh key={`eye-${i}`} position={[1.12, 0.96, z]} castShadow>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshLambertMaterial color="#1a1a1a" />
        </mesh>
      ))}
      {[-0.16, 0.16].map((z, i) => (
        <mesh key={`ear-${i}`} position={[0.9, 1.12, z]} rotation={[0, 0, z > 0 ? -0.5 : 0.5]} castShadow>
          <boxGeometry args={[0.08, 0.18, 0.12]} />
          <meshLambertMaterial color="#f0c9b0" />
        </mesh>
      ))}
      {[-0.12, 0.12].map((z, i) => (
        <mesh key={`horn-${i}`} position={[0.92, 1.2, z]} rotation={[z > 0 ? -0.4 : 0.4, 0, 0.2]} castShadow>
          <coneGeometry args={[0.04, 0.18, 6]} />
          <meshLambertMaterial color="#d7d0c4" />
        </mesh>
      ))}

      <mesh position={[-0.78, 0.78, 0]} rotation={[0.6, 0, 0.4]} castShadow>
        <cylinderGeometry args={[0.03, 0.045, 0.45, 6]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
    </group>
  )
}

function Chicken({ position, rotation = 0, phase = 0 }) {
  const ref = useRef()
  const head = useRef()

  useFrame(({ clock }) => {
    const t = clock.elapsedTime + phase
    const peck = Math.max(0, Math.sin(t * 3.2))
    ref.current.position.y = position[1] + Math.abs(Math.sin(t * 6)) * 0.03
    ref.current.rotation.y = rotation + Math.sin(t * 0.7) * 0.35
    head.current.rotation.x = peck * 0.7
  })

  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.28, 0]} scale={[1, 0.85, 1.15]} castShadow>
        <sphereGeometry args={[0.2, 12, 10]} />
        <meshLambertMaterial color="#f4f4f4" />
      </mesh>
      <mesh position={[-0.05, 0.34, 0.16]} rotation={[0.4, 0.3, 0.2]} scale={[1, 0.35, 0.7]} castShadow>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshLambertMaterial color="#ececec" />
      </mesh>
      <mesh position={[-0.05, 0.34, -0.16]} rotation={[0.4, -0.3, -0.2]} scale={[1, 0.35, 0.7]} castShadow>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshLambertMaterial color="#ececec" />
      </mesh>
      {[-0.16, -0.08, 0].map((x, i) => (
        <mesh key={`tail-${i}`} position={[x - 0.12, 0.38, 0]} rotation={[0, 0, -0.8 - i * 0.15]} castShadow>
          <coneGeometry args={[0.04, 0.16, 5]} />
          <meshLambertMaterial color="#e8e8e8" />
        </mesh>
      ))}

      <group ref={head} position={[0.16, 0.42, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.11, 10, 10]} />
          <meshLambertMaterial color="#f7f7f7" />
        </mesh>
        <mesh position={[0.1, -0.01, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <coneGeometry args={[0.03, 0.1, 6]} />
          <meshLambertMaterial color="#f5a623" />
        </mesh>
        <mesh position={[0.01, 0.1, 0]} castShadow>
          <boxGeometry args={[0.04, 0.08, 0.06]} />
          <meshLambertMaterial color="#e23b2f" />
        </mesh>
        <mesh position={[0.06, 0.03, 0.06]} castShadow>
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshLambertMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.06, 0.03, -0.06]} castShadow>
          <sphereGeometry args={[0.018, 6, 6]} />
          <meshLambertMaterial color="#1a1a1a" />
        </mesh>
      </group>

      {[-0.05, 0.05].map((z, i) => (
        <mesh key={`leg-${i}`} position={[0.02, 0.1, z]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.16, 5]} />
          <meshLambertMaterial color="#f5a623" />
        </mesh>
      ))}
    </group>
  )
}

const COWS = [
  { position: [-21.2, 0, -18.6], rotation: 0.6, phase: 0.2 },
  { position: [-18.4, 0, -19.3], rotation: -0.8, phase: 1.4 },
]

const CHICKENS = [
  { position: [-20.4, 0, -17.1], rotation: 0.4, phase: 0 },
  { position: [-19.5, 0, -16.7], rotation: 1.2, phase: 0.8 },
  { position: [-18.6, 0, -17.3], rotation: -0.5, phase: 1.6 },
  { position: [-19.8, 0, -16.2], rotation: 2.2, phase: 2.3 },
]

export default function Livestock() {
  return (
    <group>
      {COWS.map((cow, i) => (
        <Cow key={`cow-${i}`} {...cow} />
      ))}
      {CHICKENS.map((chicken, i) => (
        <Chicken key={`chicken-${i}`} {...chicken} />
      ))}
    </group>
  )
}
