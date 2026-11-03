import type { Config } from 'tailwindcss'
import { UI, SCENE, TYPE, SHADOW } from './src/design/tokens'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],

  theme: {
    extend: {
      fontSize: TYPE,

      colors: {
        ui: {
          surface:          UI.surface,
          'surface-border': UI.surfaceBorder,
          backdrop:         UI.backdrop,
          'text-primary':   UI.textPrimary,
          'text-secondary': UI.textSecondary,
          'text-ghost':     UI.textGhost,
          'button-surface': UI.buttonSurface,
          'button-hover':   UI.buttonHover,
          'input-surface':  UI.inputSurface,
          'input-focus':    UI.inputFocus,
        },
        scene: {
          'sky-near': SCENE.skyNear,
          'sky-far':  SCENE.skyFar,
          fog:        SCENE.fog,
        },
      },

      fontFamily: {
        ui:      ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        note:    ['"Cormorant Garamond"', 'Georgia', 'serif'],
        heading: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },

      boxShadow: {
        soft:   SHADOW.soft,
        raised: SHADOW.raised,
        button: SHADOW.button,
      },
    },
  },

  plugins: [],
} satisfies Config
