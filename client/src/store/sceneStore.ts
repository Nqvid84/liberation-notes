import { create } from 'zustand'

export interface WanderFlight {
  targetNoteId: string
  notePosition: [number, number, number]
  startTime: number
  duration: number
}

interface SceneState {
  focusTarget: string | null
  wanderFlight: WanderFlight | null
  isWandering: boolean
  isDragging: boolean
  setFocusTarget: (id: string | null) => void
  startWanderFlight: (flight: WanderFlight) => void
  completeWanderFlight: () => void
  cancelWanderFlight: () => void
  setIsDragging: (isDragging: boolean) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  focusTarget: null,
  wanderFlight: null,
  isWandering: false,
  isDragging: false,

  setFocusTarget: (id: string | null) =>
    set({
      focusTarget: id,
      wanderFlight: null,
      isWandering: false,
    }),

  startWanderFlight: (flight: WanderFlight) =>
    set({
      wanderFlight: flight,
      isWandering: true,
      focusTarget: null,
    }),

  completeWanderFlight: () =>
    set((s) => ({
      focusTarget: s.wanderFlight ? s.wanderFlight.targetNoteId : s.focusTarget,
      wanderFlight: null,
      isWandering: false,
    })),

  cancelWanderFlight: () =>
    set({
      wanderFlight: null,
      isWandering: false,
    }),

  setIsDragging: (isDragging: boolean) => set({ isDragging }),
}))
