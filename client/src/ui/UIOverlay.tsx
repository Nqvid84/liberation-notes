import { useCallback } from 'react'
import { Plus, Compass } from 'lucide-react'
import { useNoteStore } from '@/store/noteStore'
import { useSceneStore } from '@/store/sceneStore'
import { useUiStore } from '@/store/uiStore'
import { CreateNoteModal } from './CreateNoteModal'
import { NoteDetailPanel } from './NoteDetailPanel'
import { MobileHint } from './MobileHint'

export function UIOverlay() {
  const notes = useNoteStore((s) => s.notes)
  const loading = useNoteStore((s) => s.loading)
  const isWandering = useSceneStore((s) => s.isWandering)
  const focusTarget = useSceneStore((s) => s.focusTarget)
  const startWanderFlight = useSceneStore((s) => s.startWanderFlight)
  const openCreate = useUiStore((s) => s.openCreate)
  const clearSelection = useUiStore((s) => s.clearSelection)

  const handleWander = useCallback(() => {
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
    <>
      {/* Top-left poetic watermark */}
      <div className="pointer-events-none fixed left-6 top-6 z-30 select-none">
        <p className="font-heading text-xl italic tracking-wide text-slate-500/80 drop-shadow-sm">
          liberation notes
        </p>
        <p className="mt-0.5 font-body text-[9px] uppercase tracking-[0.3em] text-slate-400/80">
          {notes.length} fragments adrift
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center">
          <p className="animate-pulse font-heading text-lg italic text-slate-400">
            drifting into the sky…
          </p>
        </div>
      )}

      {/* Empty sky state */}
      {!loading && notes.length === 0 && (
        <div className="pointer-events-none fixed inset-0 z-20 flex flex-col items-center justify-center px-8 text-center">
          <p className="max-w-sm font-heading text-2xl leading-relaxed text-slate-500">
            the sky is empty tonight.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="pointer-events-auto mt-6 rounded-full border border-white/70 bg-white/50 px-6 py-2.5 font-body text-[10px] uppercase tracking-[0.28em] text-slate-500 backdrop-blur-xl transition-colors duration-500 hover:text-slate-700 cursor-pointer"
          >
            release the first note
          </button>
        </div>
      )}

      {/* Bottom-center unified glass pill dock */}
      <div
        className="pointer-events-none fixed inset-x-0 z-30 flex justify-center px-6"
        style={{ bottom: 'calc(28px + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/60 bg-white/45 p-1.5 shadow-[0_18px_50px_-22px_rgba(60,72,120,0.4)] backdrop-blur-2xl">
          <button
            type="button"
            onClick={openCreate}
            className="group flex items-center gap-2 rounded-full px-5 py-2.5 font-body text-[10px] uppercase tracking-[0.26em] text-slate-600 transition-colors duration-500 hover:text-slate-900 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[1.4] transition-transform duration-500 group-hover:rotate-90" />
            leave a note
          </button>
          <span className="h-6 w-px bg-slate-300/50" />
          <button
            type="button"
            onClick={handleWander}
            disabled={isWandering || notes.length === 0}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-body text-[10px] uppercase tracking-[0.26em] text-slate-600 transition-colors duration-500 hover:text-slate-900 cursor-pointer disabled:opacity-50 ${
              isWandering ? 'animate-pulse' : ''
            }`}
          >
            <Compass className="h-3.5 w-3.5 stroke-[1.4]" />
            {isWandering ? 'drifting…' : 'wander'}
          </button>
        </div>
      </div>

      {/* Mobile exploration hint */}
      <MobileHint />

      {/* Modals and panels */}
      <CreateNoteModal />
      <NoteDetailPanel />
    </>
  )
}
