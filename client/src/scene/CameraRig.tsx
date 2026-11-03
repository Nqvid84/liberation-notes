import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useNoteStore } from '@/store/noteStore'
import { useSceneStore } from '@/store/sceneStore'
import { useUiStore } from '@/store/uiStore'

// Extra space beyond the outermost note on each axis so the scene
// never feels like it hits an invisible wall immediately after the last note.
const BREATH_PAD = { xy: 4.5, z: 5 }

// Absolute floor so an empty board still lets the camera breathe.
const EMPTY_BOUNDS = {
  minX: -6, maxX: 6,
  minY: -4, maxY: 4,
  minZ: -6, maxZ: 6,
}

// Quadratic Bezier interpolation in 3D
function quadraticBezier(
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  t: number,
  out: THREE.Vector3
) {
  const invT = 1 - t
  out.x = invT * invT * p0.x + 2 * invT * t * p1.x + t * t * p2.x
  out.y = invT * invT * p0.y + 2 * invT * t * p1.y + t * t * p2.y
  out.z = invT * invT * p0.z + 2 * invT * t * p1.z + t * t * p2.z
  return out
}

// Smooth quintic ease-in-out (zero velocity and zero acceleration at both ends -> zero snap)
function smoothEaseInOut(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

interface ActiveFlightPath {
  flightStartTime: number
  startPos: THREE.Vector3
  controlPos: THREE.Vector3
  endPos: THREE.Vector3
  startLookAt: THREE.Vector3
  endLookAt: THREE.Vector3
  duration: number
}

export function CameraRig() {
  const { camera, gl, pointer } = useThree()

  // Roam anchor (base position when not focused on a note) and lookAt trackers
  const roamPos = useRef(new THREE.Vector3(0, 0, 8))
  const targetPos = useRef(new THREE.Vector3(0, 0, 8))
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0))
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0))
  const curvePos = useRef(new THREE.Vector3())
  const activeFlightRef = useRef<ActiveFlightPath | null>(null)
  const prevFocusTargetRef = useRef<string | null>(null)

  // Interaction tracking refs
  const isPointerDown = useRef(false)
  const dragStart = useRef({ x: 0, y: 0, camX: 0, camY: 0 })
  const dragDistance = useRef(0)

  const notes = useNoteStore((s) => s.notes)
  const focusTarget = useSceneStore((s) => s.focusTarget)
  const wanderFlight = useSceneStore((s) => s.wanderFlight)
  const setFocusTarget = useSceneStore((s) => s.setFocusTarget)
  const cancelWanderFlight = useSceneStore((s) => s.cancelWanderFlight)
  const completeWanderFlight = useSceneStore((s) => s.completeWanderFlight)
  const setIsDragging = useSceneStore((s) => s.setIsDragging)
  const selectNote = useUiStore((s) => s.selectNote)
  const clearSelection = useUiStore((s) => s.clearSelection)

  // Detect touch capability once
  const isTouchDevice = 'ontouchstart' in window
  const focusZOffset = isTouchDevice ? 4.4 : 3.4
  const focusYOffset = isTouchDevice ? -0.45 : -0.32

  // Camera bounds — derived from note positions + breathing space.
  const bounds = useMemo(() => {
    if (notes.length === 0) return EMPTY_BOUNDS
    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity
    let minZ = Infinity, maxZ = -Infinity
    for (const n of notes) {
      const [x, y, z] = n.position
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
      if (z < minZ) minZ = z
      if (z > maxZ) maxZ = z
    }
    return {
      minX: minX - BREATH_PAD.xy,
      maxX: maxX + BREATH_PAD.xy,
      minY: minY - BREATH_PAD.xy,
      maxY: maxY + BREATH_PAD.xy,
      minZ: minZ - BREATH_PAD.z,
      maxZ: maxZ + BREATH_PAD.z + 6,
    }
  }, [notes])

  const boundsRef = useRef(bounds)
  useEffect(() => { boundsRef.current = bounds }, [bounds])

  useEffect(() => {
    roamPos.current.copy(camera.position)
    targetPos.current.copy(camera.position)
    currentLookAt.current.set(0, 0, 0)
    targetLookAt.current.set(0, 0, 0)
  }, [camera])

  // When unfocusing a note (e.g. closing NoteDetailPanel), smoothly pull back from
  // the current position rather than snapping back to an old roam coordinate.
  useEffect(() => {
    if (prevFocusTargetRef.current && !focusTarget && !wanderFlight) {
      const b = boundsRef.current
      roamPos.current.set(
        THREE.MathUtils.clamp(camera.position.x, b.minX, b.maxX),
        THREE.MathUtils.clamp(camera.position.y - focusYOffset, b.minY, b.maxY),
        THREE.MathUtils.clamp(camera.position.z + 2.6, b.minZ, b.maxZ)
      )
    }
    prevFocusTargetRef.current = focusTarget
  }, [focusTarget, wanderFlight, camera, focusYOffset])

  // Mouse / Pointer & Touch & Scroll event listeners
  useEffect(() => {
    const dom = gl.domElement

    // Breaks out of focus / wander seamlessly from the exact current camera position
    const breakOutToManualControl = () => {
      let brokeOut = false
      if (useSceneStore.getState().wanderFlight) {
        cancelWanderFlight()
        activeFlightRef.current = null
        brokeOut = true
      }
      if (useSceneStore.getState().focusTarget) {
        setFocusTarget(null)
        clearSelection()
        brokeOut = true
      }
      if (brokeOut) {
        const parallaxX = isTouchDevice ? 0 : pointer.x * 0.7
        const parallaxY = isTouchDevice ? 0 : pointer.y * 0.4
        roamPos.current.set(
          camera.position.x - parallaxX,
          camera.position.y - parallaxY,
          camera.position.z
        )
        dragStart.current.camX = roamPos.current.x
        dragStart.current.camY = roamPos.current.y
      }
    }

    const applyDrag = (clientX: number, clientY: number) => {
      const dx = clientX - dragStart.current.x
      const dy = clientY - dragStart.current.y
      const dist = Math.hypot(dx, dy)
      dragDistance.current = dist

      if (dist > 4) {
        if (!useSceneStore.getState().isDragging) {
          setIsDragging(true)
          breakOutToManualControl()
          dragStart.current.x = clientX
          dragStart.current.y = clientY
          return
        }

        const panFactor = 0.014
        const b = boundsRef.current
        roamPos.current.x = THREE.MathUtils.clamp(
          dragStart.current.camX - dx * panFactor,
          b.minX,
          b.maxX
        )
        roamPos.current.y = THREE.MathUtils.clamp(
          dragStart.current.camY + dy * panFactor,
          b.minY,
          b.maxY
        )
      }
    }

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      if (e.button !== 0) return
      isPointerDown.current = true
      dragDistance.current = 0
      const parallaxX = isTouchDevice ? 0 : pointer.x * 0.7
      const parallaxY = isTouchDevice ? 0 : pointer.y * 0.4
      roamPos.current.set(
        camera.position.x - parallaxX,
        camera.position.y - parallaxY,
        camera.position.z
      )
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        camX: roamPos.current.x,
        camY: roamPos.current.y,
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      if (!isPointerDown.current) return
      applyDrag(e.clientX, e.clientY)
    }

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      isPointerDown.current = false
      setTimeout(() => {
        setIsDragging(false)
      }, 50)
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()

      breakOutToManualControl()

      const zoomFactor = 0.015
      const b = boundsRef.current
      roamPos.current.z = THREE.MathUtils.clamp(
        roamPos.current.z - e.deltaY * zoomFactor,
        b.minZ,
        b.maxZ
      )

      if (Math.abs(e.deltaX) > 0.5) {
        roamPos.current.x = THREE.MathUtils.clamp(
          roamPos.current.x + e.deltaX * zoomFactor,
          b.minX,
          b.maxX
        )
      }
    }

    let lastPinchDist = 0

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isPointerDown.current = true
        dragDistance.current = 0
        roamPos.current.copy(camera.position)
        dragStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          camX: roamPos.current.x,
          camY: roamPos.current.y,
        }
      } else if (e.touches.length === 2) {
        isPointerDown.current = false
        setIsDragging(false)
        const dx = e.touches[1].clientX - e.touches[0].clientX
        const dy = e.touches[1].clientY - e.touches[0].clientY
        lastPinchDist = Math.hypot(dx, dy)
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()

      if (e.touches.length === 1 && isPointerDown.current) {
        applyDrag(e.touches[0].clientX, e.touches[0].clientY)
      } else if (e.touches.length === 2) {
        const dx = e.touches[1].clientX - e.touches[0].clientX
        const dy = e.touches[1].clientY - e.touches[0].clientY
        const dist = Math.hypot(dx, dy)
        const delta = lastPinchDist - dist
        lastPinchDist = dist

        breakOutToManualControl()

        const b = boundsRef.current
        roamPos.current.z = THREE.MathUtils.clamp(
          roamPos.current.z + delta * 0.04,
          b.minZ,
          b.maxZ
        )
      }
    }

    const onTouchEnd = () => {
      isPointerDown.current = false
      setTimeout(() => {
        setIsDragging(false)
      }, 50)
    }

    dom.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    dom.addEventListener('wheel', onWheel, { passive: false })

    if (isTouchDevice) {
      dom.addEventListener('touchstart', onTouchStart, { passive: true })
      dom.addEventListener('touchmove', onTouchMove, { passive: false })
      dom.addEventListener('touchend', onTouchEnd, { passive: true })
    }

    return () => {
      dom.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      dom.removeEventListener('wheel', onWheel)

      if (isTouchDevice) {
        dom.removeEventListener('touchstart', onTouchStart)
        dom.removeEventListener('touchmove', onTouchMove)
        dom.removeEventListener('touchend', onTouchEnd)
      }
    }
  }, [
    gl,
    camera,
    pointer,
    cancelWanderFlight,
    setFocusTarget,
    setIsDragging,
    clearSelection,
    isTouchDevice,
  ])

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.08)

    // ── Mode 1: Wander Flight (Cinematic curved path from ACTUAL live camera pose) ──
    if (wanderFlight) {
      // Lazily initialize the flight geometry from the exact live camera pose on frame 1
      if (
        !activeFlightRef.current ||
        activeFlightRef.current.flightStartTime !== wanderFlight.startTime
      ) {
        const [nx, ny, nz] = wanderFlight.notePosition
        const startPos = camera.position.clone()
        const endPos = new THREE.Vector3(nx, ny + focusYOffset, nz + focusZOffset)
        const startLookAt = currentLookAt.current.clone()
        const endLookAt = new THREE.Vector3(nx, ny + focusYOffset, nz)

        const dist = startPos.distanceTo(endPos)
        // Graceful arch that pulls back slightly in Z and arcs gently in X/Y
        const midPos = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5)
        const archSide = startPos.x <= endPos.x ? 1 : -1
        midPos.x += archSide * Math.min(Math.max(dist * 0.18, 1.2), 3.2)
        midPos.y += Math.min(Math.max(dist * 0.12, 0.8), 2.2)
        midPos.z = Math.max(startPos.z, endPos.z) + Math.min(Math.max(dist * 0.25, 1.8), 4.5)

        const duration = Math.min(Math.max(dist * 0.11 + 1.5, 1.8), 2.8)

        activeFlightRef.current = {
          flightStartTime: wanderFlight.startTime,
          startPos,
          controlPos: midPos,
          endPos,
          startLookAt,
          endLookAt,
          duration,
        }
      }

      const flight = activeFlightRef.current
      const elapsed = (performance.now() - flight.flightStartTime) / 1000
      const progress = THREE.MathUtils.clamp(elapsed / flight.duration, 0, 1)
      const ease = smoothEaseInOut(progress)

      // Exact curve evaluation — starts at camera.position (t=0) and ends at exact focus pose (t=1)
      quadraticBezier(flight.startPos, flight.controlPos, flight.endPos, ease, curvePos.current)
      camera.position.copy(curvePos.current)

      currentLookAt.current.lerpVectors(flight.startLookAt, flight.endLookAt, ease)
      camera.lookAt(currentLookAt.current)

      // Keep roamPos synced so there's never a jump after flight completes
      roamPos.current.copy(camera.position)
      targetPos.current.copy(camera.position)
      targetLookAt.current.copy(currentLookAt.current)

      if (progress >= 1) {
        activeFlightRef.current = null
        completeWanderFlight()
        selectNote(wanderFlight.targetNoteId)
      }
      return
    } else {
      activeFlightRef.current = null
    }

    // ── Mode 2: Focused Note ──────────────────────────────────────────────────
    const focusedNote = focusTarget ? notes.find((n) => n.id === focusTarget) : null

    if (focusedNote) {
      const [nx, ny, nz] = focusedNote.position

      targetPos.current.set(nx, ny + focusYOffset, nz + focusZOffset)
      targetLookAt.current.set(nx, ny + focusYOffset, nz)

      // Smooth exponential damping towards the focused note
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetPos.current.x, 3.8, dt)
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetPos.current.y, 3.8, dt)
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPos.current.z, 3.8, dt)

      currentLookAt.current.x = THREE.MathUtils.damp(currentLookAt.current.x, targetLookAt.current.x, 4.2, dt)
      currentLookAt.current.y = THREE.MathUtils.damp(currentLookAt.current.y, targetLookAt.current.y, 4.2, dt)
      currentLookAt.current.z = THREE.MathUtils.damp(currentLookAt.current.z, targetLookAt.current.z, 4.2, dt)
      camera.lookAt(currentLookAt.current)

      // Keep roamPos synced near the focused note so breaking out never snaps
      roamPos.current.copy(camera.position)
      return
    }

    // ── Mode 3: Free Roam & Parallax Exploration ──────────────────────────────
    const parallaxX = isTouchDevice ? 0 : pointer.x * 0.7
    const parallaxY = isTouchDevice ? 0 : pointer.y * 0.4

    targetPos.current.set(
      roamPos.current.x + parallaxX,
      roamPos.current.y + parallaxY,
      roamPos.current.z
    )

    targetLookAt.current.set(
      roamPos.current.x + parallaxX * 0.4,
      roamPos.current.y + parallaxY * 0.4,
      roamPos.current.z - 8
    )

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetPos.current.x, 3.5, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetPos.current.y, 3.5, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPos.current.z, 3.5, dt)

    currentLookAt.current.x = THREE.MathUtils.damp(currentLookAt.current.x, targetLookAt.current.x, 3.5, dt)
    currentLookAt.current.y = THREE.MathUtils.damp(currentLookAt.current.y, targetLookAt.current.y, 3.5, dt)
    currentLookAt.current.z = THREE.MathUtils.damp(currentLookAt.current.z, targetLookAt.current.z, 3.5, dt)
    camera.lookAt(currentLookAt.current)
  })

  return null
}
