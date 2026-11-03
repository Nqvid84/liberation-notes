import { create } from 'zustand'

interface UiState {
  isCreateOpen: boolean
  selectedNoteId: string | null
  openCreate: () => void
  closeCreate: () => void
  selectNote: (id: string) => void
  clearSelection: () => void
}

export const useUiStore = create<UiState>((set) => ({
  isCreateOpen: false,
  selectedNoteId: null,

  openCreate: () => set({ isCreateOpen: true }),
  closeCreate: () => set({ isCreateOpen: false }),
  selectNote: (id: string) => set({ selectedNoteId: id }),
  clearSelection: () => set({ selectedNoteId: null }),
}))
