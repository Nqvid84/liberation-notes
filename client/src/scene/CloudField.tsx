import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SCENE } from '@/design/tokens'
import { getCloudTexture } from './noteTexture'

interface CloudData {
  position: [number, number, number]
  scale: [number, number, number]
  color: string
  driftPhase: number
  baseY: number
}

// Deterministic pseudo-random so clouds don't jump on hot-reload
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

export function CloudField() {
  const spritesRef = useRef<(THREE.Sprite | null)[]>([])
  const cloudTexture = useMemo(() => getCloudTexture(), [])

  const clouds = useMemo<CloudData[]>(() => {
    const items: CloudData[] = []
    const colors = SCENE.cloudColors
    for (let i = 0; i < 11; i++) {
      const r1 = seededRandom(i * 3 + 1)
      const r2 = seededRandom(i * 3 + 2)
      const r3 = seededRandom(i * 3 + 3)
      const r4 = seededRandom(i * 3 + 4)

      const dist = 16 + r1 * 24
      const angle = r2 * Math.PI * 2
      const x = Math.cos(angle) * dist
      const y = (r3 - 0.5) * 18
      const z = -12 - Math.abs(Math.sin(angle)) * 18
      const sc = 16 + r4 * 20

      items.push({
        position: [x, y, z],
        scale: [sc, sc * 0.7, 1],
        color: colors[i % colors.length],
        driftPhase: r1 * Math.PI * 2,
        baseY: y,
      })
    }
    return items
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    for (let i = 0; i < clouds.length; i++) {
      const sprite = spritesRef.current[i]
      if (!sprite) continue
      const c = clouds[i]
      sprite.position.y = c.baseY + Math.sin(t * 0.08 + c.driftPhase) * 0.9
    }
  })

  return (
    <group>
      {clouds.map((c, i) => (
        <sprite
          key={i}
          ref={(el) => {
            spritesRef.current[i] = el
          }}
          position={c.position}
          scale={c.scale}
        >
          <spriteMaterial
            map={cloudTexture}
            color={c.color}
            transparent
            opacity={0.55}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  )
}
