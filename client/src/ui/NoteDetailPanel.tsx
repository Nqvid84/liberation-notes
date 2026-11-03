import { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { EMOTIONS } from '@/design/tokens'
import { useUiStore } from '@/store/uiStore'
import { useSceneStore } from '@/store/sceneStore'
import { useNoteStore } from '@/store/noteStore'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function NoteDetailPanel() {
  const selectedNoteId = useUiStore((s) => s.selectedNoteId)
  const clearSelection = useUiStore((s) => s.clearSelection)
  const setFocusTarget = useSceneStore((s) => s.setFocusTarget)
  const notes = useNoteStore((s) => s.notes)

  const note = selectedNoteId ? notes.find((n) => n.id === selectedNoteId) : null
  const tone = note
    ? note.isMemorial || note.emotion === 'memorial'
      ? EMOTIONS.memorial
      : EMOTIONS[note.emotion] ?? EMOTIONS.hope
    : null

  const handleClose = useCallback(() => {
    clearSelection()
    setFocusTarget(null)
  }, [clearSelection, setFocusTarget])

  return (
    <AnimatePresence>
      {note && tone && (
        <motion.div
          key={note.id}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-6 pb-24"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 26 }}
          transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div
            className="pointer-events-auto w-full max-w-[30rem] rounded-[1.6rem] border border-white/60 p-8 shadow-[0_40px_90px_-40px_rgba(40,46,74,0.55)] backdrop-blur-2xl"
            style={{ background: 'rgba(255,255,255,0.55)' }}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-body text-[9px] uppercase tracking-[0.28em] text-slate-500">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: tone.dot }}
                />
                {tone.label}
              </span>
              <button
                type="button"
                onClick={handleClose}
                aria-label="let it drift away"
                className="rounded-full p-1.5 text-slate-400 transition-colors duration-500 hover:bg-slate-900/5 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" strokeWidth={1.4} />
              </button>
            </div>

            <p
              className="mt-5 font-heading leading-[1.45] text-slate-700"
              style={{ fontSize: '1.7rem' }}
            >
              {note.content}
            </p>

            <div className="mt-6 flex items-end justify-between border-t border-slate-300/40 pt-4">
              <div className="font-body text-[10px] uppercase tracking-[0.22em] text-slate-400">
                {note.authorLabel ? (
                  <span className="font-heading text-sm italic normal-case tracking-normal text-slate-500">
                    — {note.authorLabel}
                  </span>
                ) : (
                  <span>anonymous</span>
                )}
              </div>
              <span className="font-body text-[10px] uppercase tracking-[0.22em] text-slate-400">
                {note.createdAt ? formatDate(note.createdAt) : ''}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
