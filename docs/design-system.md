# Liberation Notes — Design System

## Philosophy

The design system exists to protect the emotional identity of Liberation Notes.
Every token, rule, and constraint below exists to make the space feel like
a *place* rather than an application.

The guiding question for every visual decision:
**Does this feel like something you discover, or something you use?**

---

## Anti-Patterns (Read First)

These are explicitly forbidden regardless of how common they are elsewhere:

- Glassmorphism with heavy blur (`backdrop-filter > 6px`) and vibrant colored borders
- Gradient text fills or gradient button backgrounds
- Colored drop-shadows or glowing borders
- Scaling/bouncing hover effects on buttons or cards
- Bento grid layouts in the UI overlay
- Dark mode with purple-to-indigo gradients
- Emoji decorations in UI components
- Animated gradient backgrounds in 2D overlay elements
- Neumorphic shadows (dual inset/outset)
- Any element with `border: 1px solid rgba(255,255,255,0.3)` against a blurred neon background — this is the canonical AI slop pattern

---

## Color System

### Naming Convention

All tokens follow the pattern: `--color-{role}-{variant}`  
Tailwind class aliases defined in `tailwind.config.ts` will mirror these names.

### Scene Palette (3D canvas background + environment)

| Token | Value | Use |
|---|---|---|
| `scene-sky-near` | `#eef2f9` | Sky gradient, camera-near end |
| `scene-sky-far` | `#e2e9f5` | Sky gradient, camera-far end |
| `scene-fog` | `#eef2f9` | Three.js fog color |
| `scene-ambient` | `#fffcf6` | Ambient light color (warm white) |
| `scene-cloud-colors` | `['#dde7f6', '#e7dff3', '#f3eaf0', '#eaf3e8', '#eef2f9']` | Drifting background cloud sprites |

The sky is a soft indigo-white — not blue, not pure white. It should feel
like early afternoon sky seen through translucent paper, with subtle drifting cloud blooms.

### UI Overlay Palette (2D layer)

| Token | Value | Use |
|---|---|---|
| `ui-surface` | `rgba(255, 255, 255, 0.55)` | Panel / floating detail card background |
| `ui-surface-border` | `rgba(255, 255, 255, 0.60)` | Panel / dock border |
| `ui-backdrop` | `rgba(238, 242, 249, 0.82)` | Scene dimming during Compose Ritual |
| `ui-text-primary` | `#334155` | Body text, labels — slate ink |
| `ui-text-secondary` | `#64748b` | Supporting text, placeholders |
| `ui-text-ghost` | `#94a3b8` | Very muted, tertiary labels |
| `ui-button-surface` | `rgba(255, 255, 255, 0.45)` | Pill dock resting state |
| `ui-button-hover` | `rgba(255, 255, 255, 0.75)` | Button hover state |
| `ui-input-surface` | `rgba(255, 255, 255, 0.50)` | Text input background |
| `ui-input-focus` | `rgba(255, 255, 255, 0.80)` | Text input focused |

**Rules:**
- Never use `#000000` or `#ffffff` (flat) as fill colors.
- Panels use soft frosted translucency (`backdrop-blur-2xl`).
- No vibrant colored UI borders.

### Emotion / Tone Palette (note colors, fixed per emotion)

Each emotion tone has four values:
- **paper**: the note's surface color (`rgba`)
- **ink**: readable serif text color used *on* this note surface
- **dot**: top-left accent bar & swatch indicator color
- **halo**: soft focus ring / shadow tint in the Compose Ritual

| EmotionKey | Display Label | Paper | Ink | Dot | Halo |
|---|---|---|---|---|---|
| `hope` | `hope` | `rgba(255,249,236,0.92)` | `#7b6029` | `#e3c489` | `rgba(226,196,134,0.5)` |
| `gratitude` | `gratitude` | `rgba(253,246,238,0.92)` | `#825f3c` | `#d9b491` | `rgba(216,181,142,0.46)` |
| `love` | `love` | `rgba(253,242,243,0.92)` | `#8a5560` | `#e3aab4` | `rgba(226,164,175,0.46)` |
| `loneliness` | `longing` | `rgba(246,242,252,0.92)` | `#655780` | `#b7a4dc` | `rgba(178,160,214,0.44)` |
| `reflection` | `peace` | `rgba(242,249,245,0.92)` | `#4c7060` | `#a2ceb5` | `rgba(148,196,170,0.44)` |
| `grief` | `grief` | `rgba(245,245,248,0.92)` | `#5c5f6d` | `#b2b6c6` | `rgba(166,170,186,0.44)` |
| `confusion` | `anxiety` | `rgba(242,246,250,0.92)` | `#4f6275` | `#a7c0d5` | `rgba(152,175,199,0.44)` |
| `memorial` | `in remembrance` | `rgba(42,42,46,0.95)` | `#ece8e1` | `#5a5b66` | `rgba(90,92,104,0.4)` |

**Rules:**
- Emotion tones are the *only* colors used on note surfaces. No custom user hex outside this set.
- All 7 pastel emotion tones use the `ink` color from their row — never `ui-text-primary` on a note.
- Memorial notes are the only dark surface (`rgba(42,42,46,0.95)`). Their text is light (`#ece8e1`).

---

## Typography

### Typefaces

| Role | Family | Source | Weights |
|---|---|---|---|
| Note content, watermark title, signatures | **Cormorant Garamond** | `@fontsource/cormorant-garamond` | 300, 400, 500 + italic |
| UI overlay controls, metadata, uppercase labels | **Inter** | `@fontsource/inter` | 300, 400, 500 |

**Why Cormorant Garamond for notes:** Editorial, literary serif that gives every fragment the weight of poetry on textured paper. Scales dynamically on canvas textures (`20px–33px`) based on note length.

**Why Inter for UI:** Quiet, neutral sans-serif used at small uppercase tracked sizes (`9px–10px`, `tracking-[0.26em]`) so controls recede into the atmosphere.

### Type Scale (UI Layer)

Root `font-size: 16px`.

| Token | Size | Line Height | Use |
|---|---|---|---|
| `text-2xs` | 0.6875rem / 11px | 1.55 | Ghost labels, timestamps |
| `text-xs` | 0.75rem / 12px | 1.55 | Supporting metadata |
| `text-sm` | 0.8125rem / 13px | 1.6 | Button text, input labels |
| `text-base` | 0.9375rem / 15px | 1.65 | Body text in panels |
| `text-lg` | 1.125rem / 18px | 1.5 | Panel headings |
| `text-xl` | 1.375rem / 22px | 1.4 | Section titles |

Font weight ceiling: **500**. No bold or heavy weights in the UI layer.

### Type Scale (Note Content — canvas-rendered)

Note text is drawn onto a `<canvas>` element, converted to a texture, and applied to a Three.js plane mesh.

| Context | Canvas font size | Weight |
|---|---|---|
| Note resting (3D, at distance) | 18px Caveat | 400 |
| Note on hover (moved closer) | same — brightness change only | — |
| Note in detail panel (DOM) | 1.25rem / 20px | 400 |
| Author label (if present) | 0.875rem / 14px | 400 |

---

## Spacing

Tailwind's default scale is used throughout. Key landmarks:

| Context | Value |
|---|---|
| Panel internal padding | `p-7` / 1.75rem |
| Modal internal padding | `p-8` / 2rem |
| Between sibling buttons | `gap-3` / 0.75rem |
| Button pill padding | `px-5 py-2.5` |
| Input field padding | `px-4 py-3` |
| Safe zone inset from viewport edge | 28px |

All UI elements must live within 28px of the viewport edge.  
The center of the screen belongs exclusively to the 3D scene.

---

## Shape (Border Radius)

| Element | Tailwind class | Value |
|---|---|---|
| Buttons (all variants) | `rounded-full` | pill |
| Panels / modals | `rounded-3xl` | 1.5rem |
| Input fields | `rounded-2xl` | 1rem |
| Note detail overlay | `rounded-3xl` | 1.5rem |
| Emotion swatches | `rounded-full` | pill |

No sharp corners (`rounded-none` or `rounded-sm`) anywhere in the UI layer.

---

## Elevation & Shadow

Shadows are nearly invisible. They convey depth, not presence.

| Token | Value | Use |
|---|---|---|
| `shadow-soft` | `0 2px 18px rgba(90, 100, 140, 0.07)` | Resting panel |
| `shadow-raised` | `0 4px 28px rgba(90, 100, 140, 0.11)` | Active modal |
| `shadow-button` | `0 1px 6px rgba(90, 100, 140, 0.09)` | Button hover only |

**Rules:**
- Shadow RGB values are always in the cool blue-gray range — never colored tints.
- No `drop-shadow` filter on icons or SVGs — flat only.
- 3D note highlight on hover is handled entirely by Three.js material; CSS shadow is not used.

---

## Motion System (2D UI Only)

Framer Motion handles all 2D transitions. Three.js `useFrame` handles all 3D motion. These two systems never cross.

### Duration Tokens

| Token | Value | Use |
|---|---|---|
| `fast` | 150ms | Micro-interactions (button color) |
| `normal` | 250ms | Simple fade transitions |
| `enter` | 320ms | Panel / modal appearing |
| `exit` | 200ms | Panel / modal leaving |

### Easing Curves

| Name | Bezier | Use |
|---|---|---|
| `ease-enter` | `[0.22, 1, 0.36, 1]` | Elements entering — gentle deceleration |
| `ease-exit` | `[0.55, 0, 1, 0.45]` | Elements leaving — acceleration out |
| `ease-hover` | `[0.4, 0, 0.2, 1]` | Hover state transitions |

### Component Motion Patterns

**Modal (Create Note, Note Detail):**
```
enter: opacity 0→1 + y +20px→0,  320ms ease-enter
exit:  opacity 1→0 + y 0→+12px,  200ms ease-exit
```

**Overlay backdrop (scene dim):**
```
enter: opacity 0→1,  250ms ease-enter
exit:  opacity 1→0,  200ms ease-exit
```

**Button hover:**
```
background-color transition only, 150ms ease-hover
No scale. No translateY. No box-shadow pop.
```

**3D camera navigation (not Framer Motion — handled in useFrame):**
```
lerp factor: 0.025 per frame at 60fps
effective duration: ~1.5–2.0s to reach target
```

**Rules:**
- Total animation time for any user-triggered flow: ≤ 400ms.
- No `type: "spring"` on panels or modals — tween only.
- No stagger effects — elements do not enter sequentially.

---

## UI Component Patterns

### Buttons

Two variants only: **primary** and **ghost**.

**Primary** (Create Note, Submit):
```
background:   ui-button-surface
border:       1px solid rgba(195, 207, 228, 0.4)
text:         ui-text-primary, text-sm, DM Sans 500
shape:        rounded-full, px-5 py-2.5
shadow:       none at rest → shadow-button on hover
hover:        background → ui-button-hover, 150ms
```

**Ghost** (Random Note, Cancel, Close):
```
background:   transparent
border:       1px solid rgba(195, 207, 228, 0.3)
text:         ui-text-secondary, text-sm, DM Sans 400
shape:        rounded-full, px-5 py-2.5
hover:        background → rgba(240, 243, 255, 0.5), 150ms
```

No filled-color buttons (no solid blue, green, red). The UI must not compete with the scene's emotional palette.

### Panels / Modals

```
background:   ui-surface
border:       1px solid ui-surface-border
blur:         backdrop-filter: blur(5px)
shadow:       shadow-raised
padding:      p-8
radius:       rounded-3xl
max-width:    480px, horizontally centered
```

### Text Inputs

```
background:   ui-input-surface
border:       1px solid rgba(195, 207, 228, 0.4)
focus-border: 1px solid rgba(155, 170, 215, 0.6)
radius:       rounded-2xl
padding:      px-4 py-3
font:         DM Sans 400, text-base
placeholder:  ui-text-ghost
focus:        border color change only — no glow, no colored ring
```

### Emotion Color Selector

```
layout:       row of 7 pastel swatches + 1 memorial swatch (separated by gap-4)
swatch size:  28×28px, rounded-full
resting:      face color, border: 2px solid transparent
selected:     border: 2px solid rgba(100, 110, 140, 0.4), scale 1.1× (120ms)
labels:       hidden at rest — appear on hover as small tooltip below swatch
```

---

## Scene Aesthetic Reference (3D Layer)

These are Three.js configuration values, documented here so the 2D and 3D layers
stay visually coherent.

| Property | Value | Note |
|---|---|---|
| Canvas background | `#EEF2FF` | Soft indigo-white sky |
| Fog type | `THREE.FogExp2` | Exponential falloff — natural depth |
| Fog color | `#F0F4FF` | Matches sky, creates seamless fade |
| Fog density | `0.018` | Notes begin fading around 8 units depth |
| Ambient light color | `#FFFCF6` | Warm white fill |
| Ambient light intensity | `0.75` | Soft overall, no harsh contrast |
| Directional light color | `#FFF5E4` | Warm sunlight from above-right |
| Directional light intensity | `0.4` | Gentle — enough to feel light direction |
| Note material | `MeshStandardMaterial` | Reacts to light, avoids flat look |
| Note roughness | `0.88` | Matte paper — very low specularity |
| Note metalness | `0.0` | Paper has no metallic quality |

---

## Self-Check Checklist

Run this after implementing any UI component, scene change, or new feature.

### Color
- [ ] Every color used is defined in this document — no ad-hoc hex values
- [ ] No flat `#000000` or `#ffffff` fills anywhere in the UI layer
- [ ] No colored borders in the UI (outlines are always near-neutral blue-gray)
- [ ] No colored shadows or glows on any element
- [ ] No gradient fills on text, borders, or button/panel surfaces

### Typography
- [ ] Note content always uses Caveat, UI elements always use DM Sans
- [ ] No UI text below 11px
- [ ] No UI font weight above 500

### Motion
- [ ] No UI animation exceeds 400ms
- [ ] No `type: "spring"` on any panel or modal
- [ ] Button hover changes background color only — no scale, translate, or shadow pop
- [ ] 3D camera navigation uses `useFrame` lerp, not Framer Motion

### Layout
- [ ] No UI element is positioned in the center of the viewport
- [ ] All UI elements sit within the 28px safe-zone inset
- [ ] No grid-based note layout exists anywhere in the scene

### Emotion Colors
- [ ] All 7 emotion colors are visually distinct when shown in a row
- [ ] Memorial note is clearly darker than all 7 emotion colors
- [ ] On-note text is legible at typical 3D viewing distance
- [ ] Users cannot submit a note with a color outside the defined 8 options

### Scene Feel
- [ ] Scene background reads as sky, not as empty void
- [ ] Fog is active and creates visible depth
- [ ] Note drift motion is slow enough to be easily missed if you're not watching
- [ ] Nothing in the scene bounces, springs, pulses, or flashes

### Identity Gate (final check before merging anything)
- [ ] Does this feel like part of a *place*, not a product?
- [ ] Would this element feel appropriate in a quiet art installation?
- [ ] Does anything in this change create urgency, competition, or performance pressure?
