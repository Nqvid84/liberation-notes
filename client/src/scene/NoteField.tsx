import { useEffect } from 'react'
import { useNoteStore } from '@/store/noteStore'
import { NoteCard } from './NoteCard'

// NoteField owns the data fetch and delegates rendering to NoteCard.
// At 300+ notes, lift useFrame drift here and upgrade to InstancedMesh.
export function NoteField() {
  const notes = useNoteStore((s) => s.notes)
  const fetchNotes = useNoteStore((s) => s.fetchNotes)

  useEffect(() => {
    void fetchNotes()
  }, [fetchNotes])

  return (
    <>
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </>
  )
}
