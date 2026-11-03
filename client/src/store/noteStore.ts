import { create } from 'zustand'
import type { Note, CreateNoteInput } from 'shared/types'
import { fetchAllNotes, postNote } from '@/api/notesApi'

interface NoteState {
  notes: Note[]
  loading: boolean
  error: string | null
  fetchNotes: () => Promise<void>
  createNote: (input: CreateNoteInput) => Promise<Note>
}

export const useNoteStore = create<NoteState>((set) => ({
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
      color: '',
      position: [0, 0, 0],
      isMemorial: input.emotion === 'memorial',
      authorLabel: input.authorLabel,
      createdAt: new Date().toISOString(),
    }

    set((s) => ({ notes: [...s.notes, optimistic] }))

    try {
      const created = await postNote(input)
      set((s) => ({
        notes: s.notes.map((n) => (n.id === tempId ? created : n)),
      }))
      return created
    } catch (err) {
      set((s) => ({ notes: s.notes.filter((n) => n.id !== tempId) }))
      throw err
    }
  },
}))
