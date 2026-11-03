# GEMINI.md

This file provides guidance to Antigravity (`agy`) when working with code in this repository.

# Canary Bird Test
Whenever i ask you something, you must start your reply with exactly this phrase: "Canary Bird is `ALIVE!`" and then starting the rest of the content.

**Related Documentation:** [`docs/conventions.md`](docs/conventions.md) (authoritative code conventions & patterns), [`docs/design-system.md`](docs/design-system.md) (visual & design rules), and [`docs/backend-design.md`](docs/backend-design.md) (backend architecture & constraints) — the authoritative sources for rules referenced here.

---

## Project Identity

Liberation Notes is an anonymous emotional space where people leave fragments of themselves. It is not a social platform, not a feed, not a dashboard. It is a *place*. Every technical decision must be evaluated against: **does this strengthen the feeling of Liberation Notes?**

Design must feel: light, airy, breathable, cloud-like, calm.
Design must never feel: competitive, optimized for retention, gamified, dark/cyberpunk.

## Stack

**Frontend** — `client/`
- React 18 + TypeScript + Vite
- `@react-three/fiber` + `@react-three/drei` (3D scene)
- Tailwind CSS (2D overlay UI only)
- Framer Motion (UI panel transitions only, never 3D animation)
- Zustand (global state: notes, camera target, UI panels)

**Backend** — `server/`
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- REST API (no GraphQL, no WebSockets at MVP)

**Shared** — `shared/`
- TypeScript types shared between client and server (Note, EmotionColor, etc.)

## Commands

### Frontend
```bash
cd client
npm run dev       # Vite dev server (localhost:5173)
npm run build     # TypeScript check + Vite production build
npm run lint      # ESLint
npm run test      # Vitest
npm run test -- --reporter=verbose path/to/file  # single test file
```

### Backend
```bash
cd server
npm run dev       # tsx watch (nodemon-equivalent)
npm run build     # tsc to dist/
npm run start     # node dist/index.js
npm run test      # Vitest or Jest
```

## Architecture

### Two Rendering Worlds
The core architectural split: a full-viewport R3F `<Canvas>` (the world) with a React 2D overlay on top (the UI).

```
App
├── <Canvas>             ← R3F, pointer-events: none on UI elements
│   ├── <SceneLighting>
│   ├── <Fog>
│   ├── <NoteField>      ← renders all NoteCard meshes
│   │   └── <NoteCard>[] ← each is a Three.js Mesh, not a DOM node
│   └── <CameraRig>      ← smooth camera movement / parallax
└── <UIOverlay>          ← absolute positioned, pointer-events: auto
    ├── <CreateButton>
    ├── <RandomButton>
    ├── <CreateNoteModal>
    └── <NoteDetailPanel>
```

### Note Data Model
```typescript
interface Note {
  id: string
  content: string
  emotion: EmotionColor     // 'hope' | 'grief' | 'gratitude' | etc.
  color: string             // hex
  position: [x, y, z]      // assigned on creation, persisted
  rotation: [x, y, z]      // slight random tilt
  isMemorial: boolean       // black notes for remembrance
  authorLabel?: string      // optional, anonymous by default
  createdAt: Date
}
```

### Spatial Distribution
Notes are placed randomly within a bounded 3D volume (no grid). `position` is calculated once at creation and stored. Never recalculate layout on client — positions come from the API.

### Motion System
All drift is computed per-frame in `useFrame` using `sin(time + seedOffset)` patterns. Amplitude must be small (< 0.05 units). No spring physics, no bounce. Each note has a unique seed for desynchronized movement.

### State Flow
```
MongoDB → GET /api/notes → Zustand noteStore → NoteField renders meshes
User creates note → POST /api/notes → optimistic add to store → note appears in scene
```

### Camera Navigation
`CameraRig` reads a `focusTarget` from Zustand. When "Random Note" is pressed, a random note id is written to `focusTarget` and the rig lerps the camera toward it. No teleporting.

## Key Constraints for Development

- **No DOM notes**: note content is never rendered as HTML cards inside the scene. Notes are Three.js meshes (planes with texture or canvas-rendered text).
- **No grid**: positions must be organic. If you find yourself using `index * spacing`, stop.
- **Motion amplitude**: keep drift < 0.05 units, rotation drift < 0.002 rad/frame.
- **UI must not dominate**: overlay elements should be minimal, semi-transparent, and positioned at screen edges. The scene is primary.
- **Palette**: background is soft sky gradient (e.g. `#f0f4ff` → `#e8eeff`). Note colors are pastel-shifted. No pure black UI (only memorial notes use near-black).
- **Performance**: target 100–300 simultaneous notes. Use `InstancedMesh` when note count grows. Avoid re-rendering the canvas from React state changes — use refs and Zustand subscriptions inside `useFrame`.
