import { SCENE } from '@/design/tokens'

export function SceneLighting() {
  return (
    <>
      <ambientLight color={SCENE.ambientLight} intensity={1} />
      <directionalLight
        color={SCENE.dirLight}
        intensity={0.4}
        position={[5, 8, 3]}
      />
    </>
  )
}
