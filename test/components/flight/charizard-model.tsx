'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Charizard-inspired sprite built from primitives
export function CharizardSprite() {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle bobbing animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.003
    }
  })

  return (
    <group ref={groupRef} scale={0.025}>
      {/* Body - orange */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#FF6B00" emissive="#FF4500" emissiveIntensity={0.3} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.8, -0.3]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial color="#FF7B1C" emissive="#FF5500" emissiveIntensity={0.3} />
      </mesh>

      {/* Left Wing */}
      <mesh position={[-1.0, 0.3, 0.3]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[1.2, 0.06, 0.8]} />
        <meshStandardMaterial color="#0EA5E9" emissive="#0284C7" emissiveIntensity={0.3} />
      </mesh>

      {/* Right Wing */}
      <mesh position={[1.0, 0.3, 0.3]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[1.2, 0.06, 0.8]} />
        <meshStandardMaterial color="#0EA5E9" emissive="#0284C7" emissiveIntensity={0.3} />
      </mesh>

      {/* Tail */}
      <mesh position={[0, 0.2, 0.8]}>
        <coneGeometry args={[0.2, 0.8, 6]} />
        <meshStandardMaterial color="#FF6B00" emissive="#FF4500" emissiveIntensity={0.3} />
      </mesh>

      {/* Tail Flame */}
      <mesh position={[0, 0.2, 1.3]}>
        <coneGeometry args={[0.15, 0.4, 6]} />
        <meshStandardMaterial
          color="#FBBF24"
          emissive="#F59E0B"
          emissiveIntensity={1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Eyes - left */}
      <mesh position={[-0.18, 0.9, -0.7]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
      </mesh>

      {/* Eyes - right */}
      <mesh position={[0.18, 0.9, -0.7]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

// Fire particle trail
export function FireTrail() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const particleCount = 20

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const speeds = useMemo(
    () => Array.from({ length: particleCount }, () => 0.5 + Math.random() * 1.5),
    []
  )
  const offsets = useMemo(
    () => Array.from({ length: particleCount }, () => Math.random() * Math.PI * 2),
    []
  )

  useFrame((state) => {
    if (!meshRef.current) return

    for (let i = 0; i < particleCount; i++) {
      const t = ((state.clock.elapsedTime * speeds[i] + offsets[i]) % 1)

      dummy.position.set(
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        t * 0.08
      )

      const scale = (1 - t) * 0.004
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#FBBF24"
        emissive="#F97316"
        emissiveIntensity={2}
        transparent
        opacity={0.8}
      />
    </instancedMesh>
  )
}
