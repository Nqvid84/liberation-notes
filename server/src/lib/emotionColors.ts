import type { EmotionKey } from 'shared/types'

/**
 * Server-side emotion → note surface color map.
 * These are the `face` hex values from the design system.
 * The server assigns color on note creation — the client never sends it.
 */
export const EMOTION_COLORS: Record<EmotionKey, string> = {
  hope:        '#F2E8C8', // hsl(45, 58%, 87%)  — warm morning gold
  grief:       '#C8D2DF', // hsl(215, 26%, 83%) — cool overcast steel
  gratitude:   '#DEE6C4', // hsl(70, 36%, 86%)  — soft olive-green
  loneliness:  '#D8D4E8', // hsl(265, 24%, 87%) — pale violet dusk
  love:        '#F5D6DE', // hsl(345, 52%, 90%) — blush rose petal
  reflection:  '#C8DDD5', // hsl(155, 24%, 84%) — still sage-water
  confusion:   '#E2D9E4', // hsl(300, 16%, 88%) — dusty mauve-fog
  memorial:    '#3D3533', // hsl(10, 8%, 22%)   — warm charcoal
}
