'use client'

import { Suspense, useRef, useMemo, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Stars, Html, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import type { FlightData } from '@/lib/types'
import { latLngToVector3, getFlightProgress, interpolateGreatCircle } from '@/lib/flight-data'
import { CharizardSprite, FireTrail } from '@/components/flight/charizard-model'
import { Flame, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FlightGlobeProps {
  flight: FlightData
  charizardMode: boolean
  onToggleCharizard: () => void
}

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const texture = useLoader(TextureLoader, '/assets/3d/texture_earth.jpg')

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.02
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  )
}

function FlightArc({ flight }: { flight: FlightData }) {
  const curve = useMemo(() => {
    const start = latLngToVector3(flight.departure.lat, flight.departure.lng, 1.01)
    const end = latLngToVector3(flight.arrival.lat, flight.arrival.lng, 1.01)

    const startVec = new THREE.Vector3(...start)
    const endVec = new THREE.Vector3(...end)

    // Calculate midpoint elevated above the earth surface
    const mid = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5)
    const midLength = mid.length()
    mid.normalize().multiplyScalar(midLength + 0.3)

    return new THREE.QuadraticBezierCurve3(startVec, mid, endVec)
  }, [flight])

  const tubeGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 100, 0.003, 8, false)
  }, [curve])

  return (
    <mesh geometry={tubeGeometry}>
      <meshStandardMaterial color="#6ee7b7" emissive="#6ee7b7" emissiveIntensity={0.5} transparent opacity={0.8} />
    </mesh>
  )
}

function AirportMarker({
  lat,
  lng,
  label,
  code,
}: {
  lat: number
  lng: number
  label: string
  code: string
}) {
  const position = useMemo(() => {
    const [x, y, z] = latLngToVector3(lat, lng, 1.02)
    return new THREE.Vector3(x, y, z)
  }, [lat, lng])

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshStandardMaterial color="#6ee7b7" emissive="#6ee7b7" emissiveIntensity={0.5} />
      </mesh>
      <Billboard>
        <Html distanceFactor={3} className="pointer-events-none">
          <div className="flex flex-col items-center whitespace-nowrap rounded-md bg-card/90 px-2 py-1 text-center backdrop-blur-sm">
            <span className="text-[10px] font-bold text-primary">{code}</span>
            <span className="text-[8px] text-muted-foreground">{label}</span>
          </div>
        </Html>
      </Billboard>
    </group>
  )
}

function AirplaneMarker({ flight, charizardMode }: { flight: FlightData; charizardMode: boolean }) {
  const groupRef = useRef<THREE.Group>(null!)
  const [progress, setProgress] = useState(getFlightProgress(flight))

  useFrame(() => {
    const p = getFlightProgress(flight)
    setProgress(p)

    if (!groupRef.current) return

    const [lat, lng] = interpolateGreatCircle(
      flight.departure.lat,
      flight.departure.lng,
      flight.arrival.lat,
      flight.arrival.lng,
      p
    )
    const [x, y, z] = latLngToVector3(lat, lng, 1.05)
    groupRef.current.position.set(x, y, z)

    // Orient towards the direction of travel
    const nextT = Math.min(p + 0.01, 1)
    const [nextLat, nextLng] = interpolateGreatCircle(
      flight.departure.lat,
      flight.departure.lng,
      flight.arrival.lat,
      flight.arrival.lng,
      nextT
    )
    const [nx, ny, nz] = latLngToVector3(nextLat, nextLng, 1.05)
    const lookTarget = new THREE.Vector3(nx, ny, nz)
    groupRef.current.lookAt(lookTarget)
  })

  return (
    <group ref={groupRef}>
      {charizardMode ? (
        <>
          <CharizardSprite />
          <FireTrail />
        </>
      ) : (
        <mesh rotation={[0, Math.PI, 0]}>
          <coneGeometry args={[0.012, 0.04, 4]} />
          <meshStandardMaterial color="#6ee7b7" emissive="#6ee7b7" emissiveIntensity={0.8} />
        </mesh>
      )}
    </group>
  )
}

function Scene({ flight, charizardMode }: { flight: FlightData; charizardMode: boolean }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
      <pointLight position={[-5, -3, -5]} intensity={0.3} color="#6ee7b7" />
      <Stars radius={100} depth={50} count={3000} factor={4} fade speed={1} />
      <Earth />
      <FlightArc flight={flight} />
      <AirportMarker
        lat={flight.departure.lat}
        lng={flight.departure.lng}
        label={flight.departure.city}
        code={flight.departure.code}
      />
      <AirportMarker
        lat={flight.arrival.lat}
        lng={flight.arrival.lng}
        label={flight.arrival.city}
        code={flight.arrival.code}
      />
      <AirplaneMarker flight={flight} charizardMode={charizardMode} />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={1.5}
        maxDistance={4}
        autoRotate={false}
      />
    </>
  )
}

export function FlightGlobe({ flight, charizardMode, onToggleCharizard }: FlightGlobeProps) {
  return (
    <div className="relative h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 45 }}
        className="h-full w-full"
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <Scene flight={flight} charizardMode={charizardMode} />
        </Suspense>
      </Canvas>

      {/* Loading overlay */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" id="globe-loader">
        <noscript>
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Loading 3D Globe...</span>
          </div>
        </noscript>
      </div>

      {/* Charizard Mode Toggle */}
      <div className="absolute bottom-4 right-4 z-10">
        <Button
          variant={charizardMode ? 'default' : 'secondary'}
          size="sm"
          onClick={onToggleCharizard}
          className="gap-1.5 text-xs"
        >
          <Flame className="h-3.5 w-3.5" />
          {charizardMode ? 'Glurak Mode ON' : 'Glurak Mode'}
        </Button>
      </div>

      {/* Flight altitude indicator */}
      <div className="absolute left-4 top-4 z-10 rounded-lg bg-card/80 px-3 py-2 text-xs backdrop-blur-sm">
        <div className="text-muted-foreground">Altitude</div>
        <div className="font-mono text-sm font-semibold text-foreground">35,000 ft</div>
      </div>
    </div>
  )
}
