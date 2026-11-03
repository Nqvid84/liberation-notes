import { Canvas } from '@react-three/fiber'
import { SCENE } from '@/design/tokens'
import { SceneLighting } from './SceneLighting'
import { NoteField } from './NoteField'
import { CameraRig } from './CameraRig'
import { FogController } from './FogController'
import { CloudField } from './CloudField'

export function SceneCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 55 }}
      gl={{ antialias: true }}
      flat
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
      }}
    >
      <color attach="background" args={[SCENE.skyNear]} />
      {/* Linear fog matching Base44: nearby notes (dist <= 4.5) have 0% fog for 100% crisp legibility */}
      <fog attach="fog" args={[SCENE.fog, 4.5, 36]} />
      <SceneLighting />
      <CloudField />
      <NoteField />
      <CameraRig />
      <FogController />
    </Canvas>
  )
}
