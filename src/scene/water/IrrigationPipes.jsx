import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import useFarmStore from '../../store/farmStore'

function PipeSegment({ start, end, radius = 0.07, color = '#455a64', flowing = false }) {
  const dx = end[0] - start[0]
  const dy = (end[1] || 0) - (start[1] || 0)
  const dz = end[2] - start[2]
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz)
  const cx = (start[0] + end[0]) / 2
  const cy = ((start[1] || 0) + (end[1] || 0)) / 2
  const cz = (start[2] + end[2]) / 2
  const angle = Math.atan2(dx, dz)

  return (
    <mesh position={[cx, cy, cz]} rotation={[0, angle, 0]}>
      <cylinderGeometry args={[radius, radius, length, 7, 1, false]} />
      <meshStandardMaterial
        color={flowing ? '#29b6f6' : color}
        metalness={flowing ? 0.0 : 0.6}
        roughness={0.5}
        emissive={flowing ? '#0288d1' : '#000000'}
        emissiveIntensity={flowing ? 0.4 : 0}
      />
    </mesh>
  )
}

export default function IrrigationPipes() {
  const irrigating = useFarmStore(s => s.irrigationActive)
  const power = useFarmStore(s => s.power)
  const irrigationPowered = power?.loads?.find(l => l.id === 'irrigation')?.served !== false
  const flowing = irrigating && irrigationPowered

  // Pump position: [3, 0.65, 18]  Tank: [3, 0, 14]
  // The pipe network connects pump -> main line -> 4 zone headers
  const pipeColor = '#546e7a'

  return (
    <group position={[0, 0.15, 0]}>
      {/* Main line from pump to crossroads */}
      <PipeSegment start={[3, 0.5, 17]} end={[3, 0.5, 5]} flowing={flowing} color={pipeColor} radius={0.09} />
      <PipeSegment start={[3, 0.5, 5]} end={[-3, 0.5, 5]} flowing={flowing} color={pipeColor} radius={0.09} />
      <PipeSegment start={[-3, 0.5, 5]} end={[-3, 0.5, -2]} flowing={flowing} color={pipeColor} radius={0.09} />
      <PipeSegment start={[3, 0.5, 5]} end={[3, 0.5, -2]} flowing={flowing} color={pipeColor} radius={0.09} />

      {/* Zone A header (NW) */}
      <PipeSegment start={[-3, 0.5, -2]} end={[-18, 0.5, -2]} flowing={flowing} color={pipeColor} />
      {[-15, -13, -11, -9, -7, -5].map((x, i) => (
        <PipeSegment key={`a${i}`} start={[x, 0.5, -2]} end={[x, 0.3, -15]} flowing={flowing} color={pipeColor} radius={0.05} />
      ))}

      {/* Zone B header (NE) */}
      <PipeSegment start={[3, 0.5, -2]} end={[18, 0.5, -2]} flowing={flowing} color={pipeColor} />
      {[5, 7, 9, 11, 13, 15].map((x, i) => (
        <PipeSegment key={`b${i}`} start={[x, 0.5, -2]} end={[x, 0.3, -15]} flowing={flowing} color={pipeColor} radius={0.05} />
      ))}

      {/* Zone C header (SW) */}
      <PipeSegment start={[-3, 0.5, 5]} end={[-18, 0.5, 5]} flowing={flowing} color={pipeColor} />
      {[-15, -13, -11, -9, -7, -5].map((x, i) => (
        <PipeSegment key={`c${i}`} start={[x, 0.5, 5]} end={[x, 0.3, 14]} flowing={flowing} color={pipeColor} radius={0.05} />
      ))}

      {/* Zone D header (SE) */}
      <PipeSegment start={[3, 0.5, 5]} end={[18, 0.5, 5]} flowing={flowing} color={pipeColor} />
      {[5, 7, 9, 11, 13, 15].map((x, i) => (
        <PipeSegment key={`d${i}`} start={[x, 0.5, 5]} end={[x, 0.3, 16]} flowing={flowing} color={pipeColor} radius={0.05} />
      ))}

      {/* Flow particle dots when flowing */}
      {flowing && [
        [3, 0.6, 12], [3, 0.6, 8], [0, 0.6, 5], [-8, 0.6, -2], [8, 0.6, -2],
      ].map(([x, y, z], i) => (
        <mesh key={`flow-${i}`} position={[x, y, z]}>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshStandardMaterial color="#4fc3f7" emissive="#0288d1" emissiveIntensity={1.2} />
        </mesh>
      ))}
    </group>
  )
}
