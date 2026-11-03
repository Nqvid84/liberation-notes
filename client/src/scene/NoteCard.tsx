import { useRef, useMemo, useCallback, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Note } from 'shared/types'
import { useUiStore } from '@/store/uiStore'
import { useSceneStore } from '@/store/sceneStore'
import { useNoteStore } from '@/store/noteStore'
import { makeNoteTexture, getShadowTexture, toneForNote } from './noteTexture'

// Stable seed from note id — no allocations at call time
function deriveSeed(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffff
  }
  return (hash % 100) * 0.1
}

interface NoteCardProps {
  note: Note
}

export function NoteCard({ note }: NoteCardProps) {
  const groupRef = useRef<THREE.Group>(null)
  const matRef = useRef<THREE.MeshBasicMaterial>(null)
  const shadowMatRef = useRef<THREE.SpriteMaterial>(null)
  const isHovered = useRef(false)
  const [fontsLoaded, setFontsLoaded] = useState(false)

  useEffect(() => {
    let active = true
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (active) setFontsLoaded(true)
      })
    } else {
      setFontsLoaded(true)
    }
    return () => {
      active = false
    }
  }, [])

  const tone = useMemo(() => toneForNote(note), [note.emotion, note.isMemorial])
  const seed = useMemo(() => deriveSeed(note.id), [note.id])
  const shadowTexture = useMemo(() => getShadowTexture(), [])

  const noteTexture = useMemo(() => {
    return makeNoteTexture(note, tone)
  }, [note, tone, fontsLoaded])

  useEffect(() => {
    return () => {
      noteTexture.dispose()
    }
  }, [noteTexture])

  const baseX = note.position[0]
  const baseY = note.position[1]

  const selectNote = useUiStore((s) => s.selectNote)
  const setFocusTarget = useSceneStore((s) => s.setFocusTarget)
  const focusTarget = useSceneStore((s) => s.focusTarget)

  const focusedNoteZRef = useRef<number | null>(null)
  useEffect(() => {
    if (!focusTarget) {
      focusedNoteZRef.current = null
      return
    }
    const focused = useNoteStore.getState().notes.find((n) => n.id === focusTarget)
    focusedNoteZRef.current = focused ? focused.position[2] : null
  }, [focusTarget])

  useFrame(({ clock, camera }, rawDelta) => {
    if (!groupRef.current || !matRef.current) return
    const dt = Math.min(rawDelta, 0.08)
    const t = clock.getElapsedTime()

    // Pure translational float (zero rotation)
    groupRef.current.position.y = baseY + Math.sin(t * 0.4 + seed) * 0.045
    groupRef.current.position.x = baseX + Math.cos(t * 0.25 + seed * 1.3) * 0.02

    // ── Opacity ───────────────────────────────────────────────────────────────
    let targetOpacity = 1

    const fz = focusedNoteZRef.current
    const isFocusedNote = focusTarget === note.id

    if (fz !== null && !isFocusedNote) {
      if (note.position[2] > fz) {
        targetOpacity = 0.04
      }
    } else {
      const distInFront = camera.position.z - note.position[2]
      if (distInFront < 0.5) {
        targetOpacity = 0
      } else if (distInFront < 1.8) {
        targetOpacity = (distInFront - 0.5) / 1.3
      }
    }

    const dampSpeed = fz !== null && !isFocusedNote ? 5 : 8
    const nextOpacity = THREE.MathUtils.damp(matRef.current.opacity, targetOpacity, dampSpeed, dt)
    matRef.current.opacity = nextOpacity
    if (shadowMatRef.current) {
      shadowMatRef.current.opacity = nextOpacity * 0.45
    }

    groupRef.current.visible = nextOpacity > 0.01
  })

  const handlePointerOver = useCallback((e: any) => {
    e.stopPropagation()
    if (useSceneStore.getState().isDragging) return
    isHovered.current = true
    document.body.style.cursor = 'pointer'
  }, [])

  const handlePointerOut = useCallback(() => {
    isHovered.current = false
    document.body.style.cursor = 'default'
  }, [])

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation()
      if (useSceneStore.getState().isDragging) return

      selectNote(note.id)
      setFocusTarget(note.id)
    },
    [note.id, selectNote, setFocusTarget]
  )

  return (
    <group ref={groupRef} position={note.position}>
      {/* Soft radial shadow sprite behind the card */}
      <sprite position={[0, -0.07, -0.12]} scale={[1.85, 1.85, 1]}>
        <spriteMaterial
          ref={shadowMatRef}
          map={shadowTexture}
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </sprite>

      {/* Crisp canvas-textured square note mesh */}
      <mesh
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry args={[1.45, 1.45]} />
        <meshBasicMaterial
          ref={matRef}
          map={noteTexture}
          transparent
          opacity={1}
          toneMapped={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
