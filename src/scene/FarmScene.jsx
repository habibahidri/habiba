import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Stars } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import useFarmStore from '../store/farmStore'

import Terrain from './terrain/Terrain'
import CropField from './terrain/CropField'
import FarmBuilding from './buildings/FarmBuilding'
import Greenhouse from './buildings/Greenhouse'
import Trees from './vegetation/Tree'
import WaterTank from './water/WaterTank'
import WaterPump from './water/WaterPump'
import IrrigationPipes from './water/IrrigationPipes'
import SolarArray from './energy/SolarArray'
import WindTurbine from './energy/WindTurbine'
import HydroStation from './energy/HydroStation'
import FarmEquipment from './energy/FarmEquipment'
import Livestock from './animals/Livestock'

function FarmContent() {
  const energySource = useFarmStore(s => s.energySource)
  const irrigationActive = useFarmStore(s => s.irrigationActive)
  const tick = useFarmStore(s => s.tick)
  const setSelectedObject = useFarmStore(s => s.setSelectedObject)

  useFrame(() => { tick() })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} color="#fff5e0" />
      <directionalLight
        position={[25, 35, 20]}
        intensity={1.5}
        color="#fff8f0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={120}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
      />
      <directionalLight position={[-15, 20, -10]} intensity={0.3} color="#c8d8ff" />
      <hemisphereLight skyColor="#87ceeb" groundColor="#4a7c3f" intensity={0.4} />
      <fog attach="fog" args={['#0d1b2e', 65, 140]} />

      {/* Invisible click-away plane */}
      <mesh
        position={[0, -0.1, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={() => setSelectedObject(null)}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <Terrain />

      {/* Zone A — NW — leafy vegetables */}
      <CropField position={[-12, 0.1, -9]} cols={7} rows={5} spacing={1.25} palette="leafy" irrigating={irrigationActive} />
      {/* Zone B — NE — dark brassicas */}
      <CropField position={[10, 0.1, -9]} cols={6} rows={5} spacing={1.25} palette="dark" irrigating={irrigationActive} />
      {/* Zone C — SW — mixed greens */}
      <CropField position={[-12, 0.1, 7]} cols={7} rows={4} spacing={1.25} palette="default" irrigating={irrigationActive} type="row" />
      {/* Zone D — SE — light herbs */}
      <CropField position={[10, 0.1, 9]} cols={5} rows={3} spacing={1.2} palette="light" irrigating={irrigationActive} />

      <FarmBuilding position={[18, 0, 16]} />
      <Greenhouse position={[-16, 0, 18]} />
      <Trees />

      {/* Water infrastructure */}
      <WaterTank position={[6, 0, 18]} />
      <WaterPump position={[3, 0, 18]} />
      <IrrigationPipes />

      {/* Energy — only one shown at a time */}
      {energySource === 'solar' && <SolarArray position={[10, 0, 23]} />}
      {energySource === 'wind'  && <WindTurbine position={[-5, 0, 26]} />}
      {/* Hydro placed along east edge away from all buildings */}
      {energySource === 'hydro' && <HydroStation position={[22, 0, 0]} />}

      <FarmEquipment />
      <Livestock />


      {/* Tractor */}
      <group position={[1, 0.2, 2]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[2.4, 0.9, 1.2]} />
          <meshLambertMaterial color="#e65100" />
        </mesh>
        <mesh position={[0.6, 0.9, 0]} castShadow>
          <boxGeometry args={[1.1, 0.75, 1.0]} />
          <meshLambertMaterial color="#bf360c" />
        </mesh>
        {[[-0.8, 0, 0.65], [-0.8, 0, -0.65], [0.8, 0, 0.65], [0.8, 0, -0.65]].map(([x, y, z], i) => (
          <mesh key={i} position={[x, 0.0, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.38, 0.38, 0.22, 10]} />
            <meshLambertMaterial color="#212121" />
          </mesh>
        ))}
      </group>

      {/* Weather station */}
      <group position={[0, 0, 23]}>
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 3, 6]} />
          <meshStandardMaterial color="#90a4ae" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 3.1, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Supply crates */}
      {[[-2, 0.3, 21], [0, 0.3, 21], [2, 0.3, 21]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <boxGeometry args={[1.1, 0.6, 0.8]} />
          <meshLambertMaterial color={['#5d4037', '#4e342e', '#3e2723'][i]} />
        </mesh>
      ))}
    </>
  )
}

export default function FarmScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [35, 28, 35], fov: 45, near: 0.1, far: 300 }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#0d1b2e']} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={8}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2.1}
        makeDefault
      />
      <Sky
        distance={450000}
        sunPosition={[1, 0.3, 0]}
        inclination={0.49}
        azimuth={0.25}
        turbidity={8}
        rayleigh={2}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />
      <Stars radius={80} depth={50} count={3000} factor={3} fade />
      <FarmContent />
    </Canvas>
  )
}
