# Liberation Notes — Coding Conventions

> Single source of truth for architectural structure, code patterns, and implementation rules across Liberation Notes.  
> Every developer and AI agent must adhere to these conventions to maintain code stability, performance, and emotional identity.

---

## Quick-Reference Cheat Sheet

| Category | Rule | Example / Pattern | ❌ Forbidden |
|---|---|---|---|
| **Rendering World Split** | 3D R3F `<Canvas>` for world; 2D overlay for UI | `<SceneCanvas />` vs `<UIOverlay />` | Rendering HTML DOM nodes inside 3D scene |
| **3D Motion** | `useFrame` with `sin(time + seed)` (< 0.05 units) | `meshRef.current.position.y += Math.sin(...)` | Framer Motion or React state in 3D frame loop |
| **2D UI Transitions** | Framer Motion (≤ 400ms tween) | `<motion.div animate={{ opacity: 1, y: 0 }} />` | Spring physics, bounce, or 3D animations in UI |
| **Component Props** | `interface` + `Props` suffix | `interface NoteDetailPanelProps {}` | `type ComponentProps = {}` |
| **Component Exports** | Named exports for components and stores | `export function NoteCard()` / `export const useNoteStore` | Anonymous default exports for UI primitives |
| **Zustand State Access** | Granular selectors in UI; `getState()` in 3D loops | `const notes = useNoteStore((s) => s.notes)` | Full store subscription `const state = useStore()` in 3D |
| **Spatial Positions** | Server-assigned, persisted 3D coordinates | Generated in `server/src/lib/position.ts` | Client-calculated grid layouts (`index * spacing`) |
| **Note Typography** | **Cormorant Garamond** serif for note text | `font-heading` / `font-note` or canvas `"Cormorant Garamond"` | Rendering note content in sans-serif |
| **UI Typography** | **Inter** sans-serif for UI controls | `font-body` / `font-ui` (weight ≤ 500) | Heavy bold weights > 500 |
| **Color Tokens** | Design system token aliases only | `bg-ui-surface`, `text-ui-text-primary` | Raw neon glows or competitive badges |
| **UI Placement** | Top-left watermark + bottom-center pill dock | `fixed bottom-7 inset-x-0 flex justify-center` | Heavy sidebars or cluttered navbars |
| **Backend Responses** | `respond(res, data)` / `respondError(res, ...)` | `respond(res, note, 201)` | Direct `res.json()` or leaking raw Mongoose errors |
| **Shared Contracts** | `shared/types.ts` is the single source of truth | `import type { Note, EmotionKey } from 'shared/types'` | Duplicate interface definitions across client/server |

---

## § 1 — Project Overview & Core Philosophy

**Liberation Notes** is an anonymous emotional space where visitors discover and leave fragments of human thought. It is an artful *place*, not a dashboard, feed, or gamified product.

### Core Architectural Separation
The application is strictly divided into **Two Rendering Worlds**:

```
App
├── <SceneCanvas>          ← Full-viewport Three.js / R3F Canvas
│   ├── <SceneLighting>    ← Ambient and warm directional lighting
│   ├── <Fog>              ← THREE.FogExp2 for seamless depth fade
│   ├── <NoteField>        ← Renders Three.js Mesh / InstancedMesh objects
│   │   └── <NoteCard>[]   ← Texture-mapped plane meshes (NOT HTML DOM)
│   └── <CameraRig>        ← Smooth frame-by-frame camera interpolation
└── <UIOverlay>            ← Fixed 2D HTML/React overlay (pointer-events: auto)
    ├── <CreateButton>     ← Screen-edge trigger button
    ├── <RandomButton>     ← Smooth camera focus trigger
    ├── <CreateNoteModal>  ← Framer Motion animated modal
    └── <NoteDetailPanel>  ← Framer Motion animated inspection panel
```

### Guiding Architectural Rules:
1. **The 3D Canvas owns the viewport**: The center of the screen belongs solely to the emotional 3D world.
2. **The 2D UI recedes**: UI elements are translucent, anchored to screen edges (28px safe zone), and disappear or minimize during contemplation.
3. **No Cross-Pollution**: 3D logic (Three.js objects, mesh matrices, frame loops) never leaks into 2D UI components; DOM elements are never projected inside the 3D canvas.

---

## § 2 — Directory Architecture

```
liberation-notes/
├── client/                     # Frontend SPA
│   ├── public/
│   │   └── fonts/              # Caveat & DM Sans web fonts
│   ├── src/
│   │   ├── api/                # API client layer & mock fallback
│   │   │   ├── notesApi.ts     # HTTP methods for notes
│   │   │   └── mockData.ts     # Offline / initial seed data
│   │   ├── design/             # Visual design tokens & emotion palettes
│   │   │   ├── tokens.ts       # Design tokens & color constants
│   │   │   └── index.ts        # Design export entry
│   │   ├── scene/              # 3D Scene Layer (R3F + Three.js)
│   │   │   ├── SceneCanvas.tsx # Canvas wrapper with Fog and Light
│   │   │   ├── SceneLighting.tsx# Scene lights configuration
│   │   │   ├── CameraRig.tsx   # Camera position & lerping controller
│   │   │   ├── NoteField.tsx   # Note cluster manager
│   │   │   └── NoteCard.tsx    # Individual 3D note mesh & texture generator
│   │   ├── store/              # Zustand Global State
│   │   │   ├── noteStore.ts    # Notes collection & mutation state
│   │   │   ├── sceneStore.ts   # Camera focus target & 3D state
│   │   │   └── uiStore.ts      # Active modals & panels state
│   │   ├── ui/                 # 2D UI Overlay Layer (React + Tailwind + Framer)
│   │   │   ├── UIOverlay.tsx   # Root overlay container
│   │   │   ├── Button.tsx      # Base button primitive (Primary / Ghost)
│   │   │   ├── TextArea.tsx    # Form text area primitive
│   │   │   ├── EmotionSelector.tsx # 8-swatch emotion picker
│   │   │   ├── CreateButton.tsx# Bottom-left create trigger
│   │   │   ├── RandomButton.tsx# Bottom-left roam trigger
│   │   │   ├── CreateNoteModal.tsx # Submission dialog
│   │   │   └── NoteDetailPanel.tsx # Note inspection view
│   │   ├── App.tsx             # Root layout composing Canvas + UIOverlay
│   │   ├── main.tsx            # React root entry point
│   │   └── index.css           # Global Tailwind directives & font imports
│   ├── tailwind.config.ts      # Design token mappings to Tailwind utilities
│   ├── tsconfig.json           # Client TypeScript configuration
│   └── vite.config.ts          # Vite build config
│
├── server/                     # Backend API
│   ├── src/
│   │   ├── lib/                # Pure utilities & response helpers
│   │   │   ├── respond.ts      # Standardized respond() and respondError()
│   │   │   ├── position.ts     # 3D volume spatial coordinate generator
│   │   │   └── seed.ts         # Deterministic / random motion seeds
│   │   ├── middleware/         # Express middleware
│   │   │   ├── validate.ts     # Zod schema validation middleware
│   │   │   ├── rateLimiter.ts  # Route-level write rate limiting
│   │   │   └── errorHandler.ts # Global 500 error boundary
│   │   ├── models/             # Mongoose schemas & documents
│   │   │   └── Note.ts         # Note schema with toJSON transforms
│   │   ├── routes/             # Route handlers with co-located Zod schemas
│   │   │   ├── notes.ts        # GET /api/notes, POST /api/notes, GET /api/notes/:id
│   │   │   └── health.ts       # GET /api/health
│   │   ├── app.ts              # Configured Express application (no listen)
│   │   └── index.ts            # Entry point running app.listen()
│   ├── tsconfig.json           # Server TypeScript configuration
│   └── package.json
│
├── shared/                     # Shared TypeScript contracts (Client & Server)
│   └── types.ts                # Note, EmotionKey, CreateNoteInput, ApiResponse
│
└── docs/                       # Authoritative Documentation
    ├── conventions.md          # THIS FILE: Code patterns & conventions
    ├── design-system.md        # Visual tokens, typography, motion & colors
    └── backend-design.md       # API surface, database rules & error model
```

---

## § 3 — Naming Conventions

### Files & Directories

| Artifact | Convention | ✅ Correct | ❌ Wrong |
|---|---|---|---|
| Directories | `kebab-case` or lowercase | `src/scene/`, `src/store/` | `src/SceneComponents/` |
| React UI Components | `PascalCase.tsx` | `NoteDetailPanel.tsx`, `Button.tsx` | `noteDetailPanel.tsx`, `button.tsx` |
| 3D Scene Components | `PascalCase.tsx` | `NoteCard.tsx`, `CameraRig.tsx` | `note-card.tsx`, `camera_rig.tsx` |
| Zustand Stores | `camelCase.ts` (`use` prefix optional in file name) | `noteStore.ts`, `sceneStore.ts` | `NoteStore.tsx`, `notes-store.ts` |
| Pure Utilities & Helpers | `camelCase.ts` | `position.ts`, `respond.ts` | `Position.ts`, `RespondHelpers.ts` |
| Shared Contract Files | `types.ts` / `camelCase.ts` | `shared/types.ts` | `shared/SharedModels.ts` |

### TypeScript Types & Interfaces

| Artifact | Convention | ✅ Correct | ❌ Wrong |
|---|---|---|---|
| Domain Entities | `PascalCase` | `Note`, `CreateNoteInput` | `note`, `note_interface` |
| Component Props | `interface` + `PascalCase` + `Props` | `interface ButtonProps {}` | `type buttonProps = {}` |
| Store State Interfaces | `PascalCase` + `State` | `interface NoteState {}` | `type notesState = {}` |
| Union Enums / Keys | `PascalCase` | `EmotionKey`, `ErrorCode` | `emotion_key`, `emotions` |
| Generic API Envelopes | `PascalCase<T>` | `ApiResponse<T>` | `apiResponse<T>` |

```typescript
// ✅ CORRECT
export interface NoteDetailPanelProps {
  note: Note | null
  onClose: () => void
}

export type EmotionKey = 'hope' | 'grief' | 'gratitude' | 'loneliness' | 'love' | 'reflection' | 'confusion' | 'memorial'

// ❌ WRONG
export type note_props = { note: any; close: Function }
export interface emotionTypes { type: string }
```

---

## § 4 — 3D Scene & R3F Component Patterns

### Rule 1: Zero DOM Notes in 3D
Every note in the field is a Three.js mesh (`<mesh>` with plane geometry and a canvas/shader texture). Never use `@react-three/drei` `<Html>` overlays inside `<NoteField>` to render dozens of notes, as this degrades 60fps frame rates and destroys spatial fog blending.

### Rule 2: Frame-by-Frame Motion via `useFrame`
All spatial drift and camera tracking must run inside `useFrame` using sine waves and lerp interpolation.

```tsx
// ✅ Canonical 3D note drift pattern
useFrame((state, delta) => {
  if (!meshRef.current) return
  
  // Subtle desynchronized organic drift
  const time = state.clock.getElapsedTime()
  const driftY = Math.sin(time * 0.5 + seed.y) * 0.03
  const driftX = Math.cos(time * 0.3 + seed.x) * 0.02

  meshRef.current.position.y = initialPosition[1] + driftY
  meshRef.current.position.x = initialPosition[0] + driftX
  
  // Subtle rotation oscillation (< 0.002 rad per frame)
  meshRef.current.rotation.z = initialRotation[2] + Math.sin(time * 0.2 + seed.z) * 0.015
})
```

### Rule 3: High-Performance Canvas Loop Subscriptions
Never trigger React component re-renders inside `useFrame`.
- Read dynamic targets directly from `useSceneStore.getState()` or subscribe to refs.
- Keep mesh geometry and material instances cached or declared once.

```tsx
// ✅ CORRECT: Reading target without re-rendering component
useFrame((state) => {
  const target = useSceneStore.getState().focusTarget
  if (target) {
    state.camera.position.lerp(target.position, 0.025)
  }
})

// ❌ WRONG: Subscribing reactive hook inside frame callback
const target = useSceneStore((s) => s.focusTarget) // Causes re-render on every tiny coordinate tick if not careful
```

### Rule 4: Material & Texture Disposal
When generating canvas textures dynamically (e.g. handwritten Caveat note text on HTML5 canvas), always call `.dispose()` on textures and materials when the component unmounts to prevent GPU memory leaks:

```tsx
useEffect(() => {
  return () => {
    texture?.dispose()
  }
}, [texture])
```

---

## § 5 — 2D UI Component Patterns

### Screen Safe Zones & Insets
All 2D controls must reside within the **28px viewport safe zone** or in cleanly isolated floating modals.

```tsx
// ✅ Canonical edge-anchored control container
<div
  style={{
    position: 'fixed',
    bottom: 28,
    left: 28,
    zIndex: 5,
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  }}
>
  <CreateButton />
  <RandomButton />
</div>
```

### UI Component Structure
UI components must be clean, typed with `interface`, and wrapped in named exports:

```tsx
// ✅ Canonical UI component
import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  children: React.ReactNode
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const baseClasses = 'px-5 py-2.5 rounded-full text-sm font-ui transition-colors duration-150 cursor-pointer select-none'
  const variantClasses =
    variant === 'primary'
      ? 'bg-ui-button-surface hover:bg-ui-button-hover text-ui-text-primary border border-ui-surface-border shadow-soft hover:shadow-button'
      : 'bg-transparent hover:bg-ui-button-hover/50 text-ui-text-secondary border border-ui-surface-border/70'

  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  )
}
```

### 2D Motion Guidelines (Framer Motion)
1. **Tween transitions only**: Use `ease-enter` `[0.22, 1, 0.36, 1]` or `ease-exit` `[0.55, 0, 1, 0.45]`.
2. **Never use `type: "spring"`**: Spring physics create energetic bounces that destroy the calm atmosphere.
3. **Keep total duration ≤ 400ms**:
   - Modal Enter: 320ms (`opacity: 0 → 1, y: 20px → 0`)
   - Modal Exit: 200ms (`opacity: 1 → 0, y: 0 → 12px`)
   - Button Hover: 150ms background-color transition only (no scale, no translateY)

---

## § 6 — State Management (Zustand)

State is organized into three distinct, single-responsibility stores:

### 1. `noteStore.ts` (Notes & CRUD)
Handles the list of active notes, loading/error states, and optimistic creation with rollback.

```typescript
// ✅ Canonical store pattern with optimistic update
export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  loading: false,
  error: null,

  fetchNotes: async () => {
    set({ loading: true, error: null })
    try {
      const notes = await fetchAllNotes()
      set({ notes, loading: false })
    } catch {
      set({ error: 'Could not load notes.', loading: false })
    }
  },

  createNote: async (input: CreateNoteInput) => {
    const tempId = `optimistic-${Date.now()}`
    const optimistic: Note = {
      id: tempId,
      content: input.content,
      emotion: input.emotion,
      color: EMOTION_PALETTES[input.emotion].face,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      isMemorial: input.emotion === 'memorial',
      authorLabel: input.authorLabel,
      createdAt: new Date().toISOString(),
    }

    // Optimistic append
    set((s) => ({ notes: [...s.notes, optimistic] }))

    try {
      const created = await postNote(input)
      // Swap temporary note with persisted record
      set((s) => ({
        notes: s.notes.map((n) => (n.id === tempId ? created : n)),
      }))
    } catch (err) {
      // Rollback on failure
      set((s) => ({ notes: s.notes.filter((n) => n.id !== tempId) }))
      throw err
    }
  },
}))
```

### 2. `sceneStore.ts` (Camera & 3D Focus)
Manages `focusTarget` (`[x, y, z]` coordinate or Note ID), camera roam mode, and user orbit state.

### 3. `uiStore.ts` (Modal & Panel Visibility)
Manages `isCreateModalOpen`, `selectedNoteId` (for detail panel inspection), and active tooltips.

### Store Best Practices:
- **Always use fine-grained selectors** in React components:
  ```tsx
  // ✅ Only re-renders when isCreateModalOpen changes
  const isOpen = useUiStore((s) => s.isCreateModalOpen)
  
  // ❌ Re-renders on any UI store change
  const { isCreateModalOpen, selectedNoteId } = useUiStore()
  ```

---

## § 7 — API & Contract Patterns

### The Shared Contract (`shared/types.ts`)
The `shared/` folder contains pure TypeScript contracts shared by both client and server:

```typescript
export type EmotionKey =
  | 'hope'
  | 'grief'
  | 'gratitude'
  | 'loneliness'
  | 'love'
  | 'reflection'
  | 'confusion'
  | 'memorial'

export interface Note {
  id: string
  content: string
  emotion: EmotionKey
  color: string
  position: [number, number, number]
  rotation: [number, number, number]
  isMemorial: boolean
  authorLabel?: string
  createdAt: string
}

export interface CreateNoteInput {
  content: string
  emotion: EmotionKey
  authorLabel?: string
}

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } }
```

### Client API Layer (`client/src/api/notesApi.ts`)
- Use explicit helper methods (`fetchAllNotes()`, `postNote(input)`, `fetchNoteById(id)`).
- Provide clean fallbacks to `mockData.ts` in local development when the backend server is not connected.
- Parse responses verifying the `{ ok: true, data }` envelope.

---

## § 8 — Backend Architectural Conventions

### Layering Model
Every backend request follows this sequential pipeline:

```
Request
  → express.json()
  → cors()
  → route rateLimiter (POST only)
  → validate(zodSchema)
  → async route handler
  → Mongoose model query (.select(...) projection)
  → respond(res, data) or respondError(res, status, code, msg)
→ Response
```

### Controllerless Handlers
Because handlers are concise (10–25 lines), route handlers live directly in `server/src/routes/{resource}.ts`. Do not introduce an unnecessary controller or repository class hierarchy.

### Response Helpers (`server/src/lib/respond.ts`)
Route handlers **never** invoke `res.json()` or `res.status()` directly:

```typescript
export const respond = <T>(res: Response, data: T, status = 200): void => {
  res.status(status).json({ ok: true, data })
}

export const respondError = (
  res: Response,
  status: number,
  code: ErrorCode,
  message: string
): void => {
  res.status(status).json({ ok: false, error: { code, message } })
}
```

### Mongoose Schema Conventions
1. **Always use `timestamps: true`**: Never compute `createdAt` manually.
2. **Strict mode**: Never disable strict mode (`{ strict: true }` default).
3. **No `_id` leaks**: Use `toJSON` transform to cast `_id` to string `id` and remove `__v`:
   ```typescript
   NoteSchema.set('toJSON', {
     transform: (_doc, ret) => {
       ret.id = ret._id.toString()
       delete ret._id
       delete ret.__v
       return ret
     },
   })
   ```
4. **Server-generated positions**: The server calculates 3D coordinates on creation in bounded volume (`x ∈ [-12, 12]`, `y ∈ [-6, 6]`, `z ∈ [-10, 2]`). The client is never allowed to provide coordinates.

---

## § 9 — Styling & Design System Rules

### Design Tokens
All styling must use the design system tokens documented in [`docs/design-system.md`](docs/design-system.md):

| Category | Allowed Token Classes |
|---|---|
| **Scene Background** | `scene-sky-near` (`#EEF2FF`), `scene-sky-far` (`#E2EAFF`), `scene-fog` (`#F0F4FF`) |
| **UI Surfaces** | `bg-ui-surface`, `bg-ui-button-surface`, `bg-ui-input-surface` |
| **UI Text** | `text-ui-text-primary`, `text-ui-text-secondary`, `text-ui-text-ghost` |
| **UI Borders** | `border-ui-surface-border` |
| **Elevation** | `shadow-soft`, `shadow-raised`, `shadow-button` |

### Hard Visual Constraints:
- **No pure `#000000` or `#ffffff`** flat background fills.
- **No gradient text, neon drop shadows, or glow borders**.
- **No scaling on button hover** (use subtle background color transition only).
- **Max backdrop blur**: `backdrop-blur-[5px]` (never heavy glassmorphism).

---

## § 10 — Anti-Patterns & Verification Checklist

### Forbidden Anti-Patterns Table

| ❌ Forbidden Pattern | ✅ Approved Replacement | Context |
|---|---|---|
| `<Html>` cards inside R3F scene | Plane meshes with dynamic canvas texture | Scene rendering |
| Spring animations (`type: "spring"`) | Smooth cubic bezier tween (`≤ 400ms`) | UI overlays |
| Hardcoded hex values in component JSX | Tokens from `design/tokens.ts` or Tailwind aliases | Styling |
| DOM nodes placed in center screen | Screen-edge safe zones (28px) or centered modals | Layout |
| `index * spacing` for note positions | Organic random 3D volume generated on server | Spatial layout |
| `res.json(...)` directly in route | `respond(res, data)` helper | Backend API |
| Direct client mutation of note positions | Server-assigned coordinates on creation | Architecture |
| DM Sans on note cards / Caveat on UI | Caveat for notes only; DM Sans for UI only | Typography |

### Pre-Merge Verification Checklist

- [ ] **Two Worlds Intact**: 3D scene renders via R3F; UI overlay renders via React DOM with screen-edge pinning.
- [ ] **Typography Compliance**: Handwritten notes use Caveat; all buttons, inputs, and modals use DM Sans (weight ≤ 500).
- [ ] **Atmosphere & Calm**: No spring bounces, no vibrant neon gradients, no gamified badges or counters.
- [ ] **Performance**: No React re-renders triggered per-frame inside `useFrame`.
- [ ] **Contracts & Types**: All cross-boundary models imported from `shared/types.ts`.
- [ ] **Clean Errors**: API errors return standardized `{ ok: false, error: { code, message } }`.
