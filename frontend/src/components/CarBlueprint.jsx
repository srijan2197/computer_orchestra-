import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Line, Billboard, useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'

const DOMAIN_COLOR = {
  ADAS:         '#f43f5e',
  Cockpit:      '#a78bfa',
  Infotainment: '#38bdf8',
  Connectivity: '#34d399',
}

// Domain hotspot positions — relative to normalized car (car spans ~4.5 units long, ~1 unit tall)
// Front bumper = -2.2 on X, Rear = +2.2, roof center Y ~0.4, hood Y ~0.2
const HOTSPOTS = [
  { id: 'adas',         label: 'ADAS',          domain: 'ADAS',         pos: [-2.0,  0.25,  0.0],  workloads: ['aeb','acc','lka','fusion','surround'] },
  { id: 'cockpit',      label: 'COCKPIT',        domain: 'Cockpit',      pos: [-0.2,  0.55,  0.0],  workloads: ['dms','cluster'] },
  { id: 'infotainment', label: 'INFOTAINMENT',   domain: 'Infotainment', pos: [ 0.5,  0.45,  0.0],  workloads: ['nav','media','voice'] },
  { id: 'connectivity', label: 'CONNECTIVITY',   domain: 'Connectivity', pos: [ 2.0,  0.25,  0.0],  workloads: ['ota'] },
]

const SOC_POS = [0, 1.4, 0]

// ── Animated flow particle ─────────────────────────────────────────────────
function FlowParticle({ from, to, color, speed, offset }) {
  const ref = useRef()
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...from),
    new THREE.Vector3((from[0]+to[0])/2, to[1] + 0.3, (from[2]+to[2])/2),
    new THREE.Vector3(...to)
  ), [from, to])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = (clock.getElapsedTime() * speed + offset) % 1
    const pt = curve.getPoint(t)
    ref.current.position.copy(pt)
    ref.current.material.opacity = t < 0.1 ? t * 10 : t > 0.9 ? (1 - t) * 10 : 1
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} transparent />
    </mesh>
  )
}

// ── Connection line hotspot → SoC ─────────────────────────────────────────
function FlowLine({ from, to, color }) {
  const points = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3((from[0]+to[0])/2, to[1] + 0.3, (from[2]+to[2])/2),
      new THREE.Vector3(...to)
    )
    return curve.getPoints(30)
  }, [from, to])
  return <Line points={points} color={color} lineWidth={1} transparent opacity={0.4} />
}

// ── Domain hotspot sphere + billboard label ────────────────────────────────
function DomainHotspot({ hotspot, active }) {
  const ref = useRef()
  const color = DOMAIN_COLOR[hotspot.domain]

  useFrame(({ clock }) => {
    if (ref.current) {
      // Subtle pulse — stay close to car surface, don't float away
      ref.current.position.y = hotspot.pos[1] + Math.sin(clock.getElapsedTime() * 1.5 + hotspot.pos[0]) * 0.03
    }
  })

  return (
    <group ref={ref} position={hotspot.pos}>
      {/* Pulsing sphere */}
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      {/* Outer ring */}
      <mesh>
        <torusGeometry args={[0.14, 0.012, 8, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} transparent opacity={0.6} />
      </mesh>
      {/* Billboard label — always faces camera */}
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, 0.28, 0]}
          fontSize={0.13}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.008}
          outlineColor="#000000"
        >
          {hotspot.label}
        </Text>
      </Billboard>
    </group>
  )
}

// ── SoC central node ──────────────────────────────────────────────────────
function SoCNode({ cpu, gpu, npu }) {
  const ref = useRef()
  const ringRef = useRef()

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.5
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.6
      ringRef.current.rotation.x = clock.getElapsedTime() * 0.3
    }
  })

  const utilColor = (v) => v >= 90 ? '#f43f5e' : v >= 70 ? '#fbbf24' : '#34d399'

  return (
    <group position={SOC_POS}>
      {/* Core cube */}
      <mesh ref={ref}>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial color="#0d1f3c" emissive="#38bdf8" emissiveIntensity={0.6}
          metalness={0.9} roughness={0.1} wireframe={false} />
      </mesh>
      {/* Wireframe overlay */}
      <mesh>
        <boxGeometry args={[0.37, 0.37, 0.37]} />
        <meshStandardMaterial color="#38bdf8" wireframe transparent opacity={0.4} />
      </mesh>
      {/* Orbit ring */}
      <group ref={ringRef}>
        <mesh rotation={[Math.PI/2, 0, 0]}>
          <torusGeometry args={[0.55, 0.008, 8, 64]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1} transparent opacity={0.5} />
        </mesh>
      </group>
      {/* Billboard label */}
      <Billboard>
        <Text position={[0, 0.7, 0]} fontSize={0.13} color="#38bdf8"
          anchorX="center" outlineWidth={0.008} outlineColor="#000">SoC</Text>
        <Text position={[0, 0.52, 0]} fontSize={0.08} color="#4a6fa5"
          anchorX="center" outlineWidth={0.005} outlineColor="#000">
          {`CPU ${cpu}%  GPU ${gpu}%  NPU ${npu}%`}
        </Text>
      </Billboard>
    </group>
  )
}

// ── BMW car model with wireframe blueprint style ───────────────────────────
function BMWModel() {
  const { scene } = useGLTF('/bmw.glb')

  const cloned = useMemo(() => {
    const c = scene.clone(true)
    c.traverse(child => {
      if (child.isMesh) {
        // Solid dark base
        child.material = new THREE.MeshStandardMaterial({
          color: '#0a1628',
          emissive: '#0d2a4a',
          emissiveIntensity: 0.3,
          metalness: 0.7,
          roughness: 0.3,
          transparent: true,
          opacity: 0.85,
        })
      }
    })
    return c
  }, [scene])

  const wireframe = useMemo(() => {
    const c = scene.clone(true)
    c.traverse(child => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: '#38bdf8',
          emissive: '#38bdf8',
          emissiveIntensity: 0.4,
          wireframe: true,
          transparent: true,
          opacity: 0.25,
        })
      }
    })
    return c
  }, [scene])

  // Auto-fit: compute bounding box and normalize
  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    box.getSize(size)
    const center = new THREE.Vector3()
    box.getCenter(center)
    const maxDim = Math.max(size.x, size.y, size.z)
    const s = 4.5 / maxDim
    return { scale: s, offset: center.multiplyScalar(-s) }
  }, [scene])

  return (
    <group rotation={[0, Math.PI / 2, 0]} scale={[scale, scale, scale]}
      position={[offset.x, offset.y - 0.3, offset.z]}>
      <primitive object={cloned} />
      <primitive object={wireframe} />
    </group>
  )
}

// ── Ground grid ────────────────────────────────────────────────────────────
function GroundGrid() {
  return (
    <>
      <gridHelper args={[14, 28, '#0a2040', '#0a2040']} position={[0, -0.9, 0]} />
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.91, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#050d1a" transparent opacity={0.6} />
      </mesh>
    </>
  )
}

// ── Full scene ─────────────────────────────────────────────────────────────
function Scene({ workloads, resources, scenario }) {
  const wMap = Object.fromEntries((workloads || []).map(w => [w.id, w]))
  const cpu = Math.round((resources.CPU?.util ?? 0) * 100)
  const gpu = Math.round((resources.GPU?.util ?? 0) * 100)
  const npu = Math.round((resources.NPU?.util ?? 0) * 100)

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 4, 4]} intensity={2} color="#38bdf8" />
      <pointLight position={[-4, 2, 0]} intensity={1} color="#f43f5e" />
      <pointLight position={[4, 2, 0]} intensity={1} color="#a78bfa" />
      <pointLight position={[0, -1, 0]} intensity={0.5} color="#34d399" />

      <GroundGrid />

      {/* BMW car */}
      <Suspense fallback={null}>
        <BMWModel />
      </Suspense>

      {/* SoC node */}
      <SoCNode cpu={cpu} gpu={gpu} npu={npu} />

      {/* Domain hotspots + flow lines + particles */}
      {HOTSPOTS.map(hotspot => {
        const color = DOMAIN_COLOR[hotspot.domain]
        const active = hotspot.workloads.some(id => wMap[id]?.enabled !== false)
        return (
          <group key={hotspot.id}>
            <DomainHotspot hotspot={hotspot} active={active} />
            <FlowLine from={hotspot.pos} to={SOC_POS} color={color} />
            {active && [0, 0.5].map((offset, i) => (
              <FlowParticle key={i} from={hotspot.pos} to={SOC_POS}
                color={color} speed={0.35} offset={offset} />
            ))}
          </group>
        )
      })}

      {/* Scenario label */}
      <Billboard position={[0, 3.0, 0]}>
        <Text fontSize={0.14} color="#475569" anchorX="center"
          outlineWidth={0.006} outlineColor="#000">
          {`scenario: ${scenario}`}
        </Text>
      </Billboard>
    </>
  )
}

// ── Exported component ─────────────────────────────────────────────────────
export default function CarBlueprint({ workloads = [], resources = {}, scenario = 'city' }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-sky-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="10" rx="2"/>
            <path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/>
            <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
          </svg>
          <h2 className="font-semibold text-sm">Vehicle Compute Orchestration — 3D Blueprint</h2>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span>drag to rotate · scroll to zoom</span>
          <span>scenario: <span className="text-sky-300">{scenario}</span></span>
        </div>
      </div>

      <div style={{ height: 500, borderRadius: 10, overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 40%, #0d1f3c 0%, #050a12 70%)' }}>
        <Canvas camera={{ position: [0, 2, 7], fov: 45 }} gl={{ antialias: true }}>
          <Scene workloads={workloads} resources={resources} scenario={scenario} />
          <OrbitControls enablePan={false} minDistance={3} maxDistance={12}
            autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-3 text-[11px] font-mono text-slate-400">
        {Object.entries(DOMAIN_COLOR).map(([d, c]) => (
          <span key={d} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
            {d}
          </span>
        ))}
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-sky-400" /> SoC Orchestrator
        </span>
      </div>
    </div>
  )
}
