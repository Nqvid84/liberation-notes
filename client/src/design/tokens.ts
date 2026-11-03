// Single source of truth for all design values.
// Three.js, Framer Motion, and Tailwind all consume from here — never the other way around.

// ─── Emotions / Tones ─────────────────────────────────────────────────────────
// Maps our 8 shared EmotionKeys to Base44's exact poetic palette (paper, ink, dot, halo, label)
// while preserving `face`, `hover`, and `text` for compatibility.

export interface EmotionTone {
  id: string
  label: string
  paper: string
  ink: string
  dot: string
  halo: string
  face: string
  hover: string
  text: string
}

export const EMOTIONS = {
  hope: {
    id: 'hope',
    label: 'hope',
    paper: 'rgba(255,249,236,0.82)',
    ink: '#7b6029',
    dot: '#e3c489',
    halo: 'rgba(226,196,134,0.5)',
    face: '#fff9ec',
    hover: '#fdf3dc',
    text: '#7b6029',
  },
  gratitude: {
    id: 'gratitude',
    label: 'gratitude',
    paper: 'rgba(253,246,238,0.82)',
    ink: '#825f3c',
    dot: '#d9b491',
    halo: 'rgba(216,181,142,0.46)',
    face: '#fdf6ee',
    hover: '#faede0',
    text: '#825f3c',
  },
  love: {
    id: 'love',
    label: 'love',
    paper: 'rgba(253,242,243,0.84)',
    ink: '#8a5560',
    dot: '#e3aab4',
    halo: 'rgba(226,164,175,0.46)',
    face: '#fdf2f3',
    hover: '#fae5e8',
    text: '#8a5560',
  },
  loneliness: {
    id: 'loneliness',
    label: 'longing',
    paper: 'rgba(246,242,252,0.84)',
    ink: '#655780',
    dot: '#b7a4dc',
    halo: 'rgba(178,160,214,0.44)',
    face: '#f6f2fc',
    hover: '#eee7f9',
    text: '#655780',
  },
  reflection: {
    id: 'reflection',
    label: 'peace',
    paper: 'rgba(242,249,245,0.84)',
    ink: '#4c7060',
    dot: '#a2ceb5',
    halo: 'rgba(148,196,170,0.44)',
    face: '#f2f9f5',
    hover: '#e5f3eb',
    text: '#4c7060',
  },
  grief: {
    id: 'grief',
    label: 'grief',
    paper: 'rgba(245,245,248,0.84)',
    ink: '#5c5f6d',
    dot: '#b2b6c6',
    halo: 'rgba(166,170,186,0.44)',
    face: '#f5f5f8',
    hover: '#ebebf1',
    text: '#5c5f6d',
  },
  confusion: {
    id: 'confusion',
    label: 'anxiety',
    paper: 'rgba(242,246,250,0.84)',
    ink: '#4f6275',
    dot: '#a7c0d5',
    halo: 'rgba(152,175,199,0.44)',
    face: '#f2f6fa',
    hover: '#e5edf5',
    text: '#4f6275',
  },
  memorial: {
    id: 'memorial',
    label: 'in remembrance',
    paper: 'rgba(42,42,46,0.94)',
    ink: '#ece8e1',
    dot: '#5a5b66',
    halo: 'rgba(90,92,104,0.4)',
    face: '#2a2a2e',
    hover: '#343439',
    text: '#ece8e1',
  },
} as const

export type EmotionKey = keyof typeof EMOTIONS

export const PASTEL_TONE_KEYS: Exclude<EmotionKey, 'memorial'>[] = [
  'hope',
  'gratitude',
  'love',
  'loneliness',
  'reflection',
  'grief',
  'confusion',
]

// ─── Scene ────────────────────────────────────────────────────────────────────
// Used by: Three.js canvas setup (background, fog, clouds, lights).

export const SCENE = {
  skyNear:      '#eef2f9',
  skyFar:       '#e2e9f5',
  fog:          '#eef2f9',
  ambientLight: '#fffcf6',
  dirLight:     '#fff5e4',
  cloudColors:  ['#dde7f6', '#e7dff3', '#f3eaf0', '#eaf3e8', '#eef2f9'] as const,
} as const

// ─── UI Overlay ───────────────────────────────────────────────────────────────
// Used by: Tailwind config & 2D overlay elements.

export const UI = {
  surface:       'rgba(255, 255, 255, 0.55)',
  surfaceBorder: 'rgba(255, 255, 255, 0.60)',
  backdrop:      'rgba(238, 242, 249, 0.82)',
  textPrimary:   '#334155',
  textSecondary: '#64748b',
  textGhost:     '#94a3b8',
  buttonSurface: 'rgba(255, 255, 255, 0.45)',
  buttonHover:   'rgba(255, 255, 255, 0.75)',
  inputSurface:  'rgba(255, 255, 255, 0.50)',
  inputFocus:    'rgba(255, 255, 255, 0.80)',
} as const

// ─── Type Scale ───────────────────────────────────────────────────────────────

export const TYPE: Record<string, [string, { lineHeight: string }]> = {
  '2xs': ['0.625rem',  { lineHeight: '1.5'  }],  // 10px — tracked uppercase metadata
  'xs':  ['0.75rem',   { lineHeight: '1.55' }],  // 12px — supporting metadata
  'sm':  ['0.875rem',  { lineHeight: '1.6'  }],  // 14px — signatures, body
  'base':['1rem',      { lineHeight: '1.6'  }],  // 16px — inputs
  'lg':  ['1.25rem',   { lineHeight: '1.45' }],  // 20px — watermark title
  'xl':  ['1.5rem',    { lineHeight: '1.45' }],  // 24px — empty sky prompt
  '2xl': ['1.7rem',    { lineHeight: '1.45' }],  // 27px — note detail body
}

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const SHADOW = {
  soft:   '0 18px 50px -22px rgba(60, 72, 120, 0.4)',
  raised: '0 40px 90px -40px rgba(40, 46, 74, 0.55)',
  button: '0 10px 30px -12px rgba(60, 72, 120, 0.25)',
} as const

// ─── Motion ───────────────────────────────────────────────────────────────────

export const MOTION = {
  duration: {
    fast:   0.15,
    normal: 0.30,
    enter:  0.50,
    exit:   0.35,
  },
  ease: {
    enter: [0.22, 0.61, 0.36, 1] as const,
    exit:  [0.55, 0, 1, 0.45]    as const,
    hover: [0.4,  0, 0.2, 1]     as const,
  },
} as const
