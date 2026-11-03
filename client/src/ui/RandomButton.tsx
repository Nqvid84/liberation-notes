import { useCallback } from 'react'
import { Button } from './Button'
import { useNoteStore } from '@/store/noteStore'
import { useSceneStore } from '@/store/sceneStore'
import { useUiStore } from '@/store/uiStore'

export function RandomButton() {
  const notes = useNoteStore((s) => s.notes)
  const isWandering = useSceneStore((s) => s.isWandering)
  const focusTarget = useSceneStore((s) => s.focusTarget)
  const startWanderFlight = useSceneStore((s) => s.startWanderFlight)
  const clearSelection = useUiStore((s) => s.clearSelection)

  const handleRandom = useCallback(() => {
    if (notes.length === 0 || isWandering) return

    clearSelection()

    const candidates = notes.length > 1 ? notes.filter((n) => n.id !== focusTarget) : notes
    const targetNote = candidates[Math.floor(Math.random() * candidates.length)]

    startWanderFlight({
      targetNoteId: targetNote.id,
      notePosition: targetNote.position,
      startTime: performance.now(),
      duration: 2.2,
    })
  }, [notes, isWandering, focusTarget, clearSelection, startWanderFlight])

  return (
    <Button
      variant="ghost"
      onClick={handleRandom}
      disabled={isWandering || notes.length === 0}
      className={isWandering ? 'opacity-70 animate-pulse' : ''}
    >
      {isWandering ? 'Drifting…' : 'Wander'}
    </Button>
  )
}
