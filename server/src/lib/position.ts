/**
 * Generates a random 3D position within the scene's bounded volume.
 * Position is assigned server-side on note creation and stored permanently.
 * The client never sends or recalculates positions.
 *
 * Volume bounds (from backend-design.md):
 *   x ∈ [-12, 12]
 *   y ∈ [-6,  6]
 *   z ∈ [-10, 2]
 */
export function generatePosition(): [number, number, number] {
  const x = randomInRange(-12, 12)
  const y = randomInRange(-6, 6)
  const z = randomInRange(-10, 2)
  return [x, y, z]
}

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}
