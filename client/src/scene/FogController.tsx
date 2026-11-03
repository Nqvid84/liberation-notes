import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneStore } from '@/store/sceneStore'

// ─── Linear Fog Controller (Base44 Atmospheric Model) ────────────────────────
//
// Uses THREE.Fog(color, near, far) so that notes within `near` units of the
// camera have 0% fog attenuation — keeping paper colors and ink 100% crisp
// and readable, while distant notes softly dissolve into the sky.

const FREE_NEAR = 4.5
const FREE_FAR  = 36.0

// When a note is focused (camera is ~3.4 units away), near sits just behind the
// focused note so the focused card has 0% fog while background notes fade softly.
const FOCUS_NEAR = 3.8
const FOCUS_FAR  = 22.0

const WANDER_NEAR = 4.2
const WANDER_FAR  = 30.0

export function FogController() {
  const { scene } = useThree()
  const isWandering = useSceneStore((s) => s.isWandering)
  const focusTarget = useSceneStore((s) => s.focusTarget)

  useFrame((_, rawDelta) => {
    const fog = scene.fog as THREE.Fog | null
    if (!fog || !('near' in fog) || !('far' in fog)) return

    const dt = Math.min(rawDelta, 0.08)

    let targetNear = FREE_NEAR
    let targetFar  = FREE_FAR

    if (focusTarget) {
      targetNear = FOCUS_NEAR
      targetFar  = FOCUS_FAR
    } else if (isWandering) {
      targetNear = WANDER_NEAR
      targetFar  = WANDER_FAR
    }

    fog.near = THREE.MathUtils.damp(fog.near, targetNear, 4.0, dt)
    fog.far  = THREE.MathUtils.damp(fog.far, targetFar, 4.0, dt)
  })

  return null
}
