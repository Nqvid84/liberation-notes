import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { EmotionKey } from 'shared/types'
import { EMOTIONS, PASTEL_TONE_KEYS } from '@/design/tokens'
import { useUiStore } from '@/store/uiStore'
import { useNoteStore } from '@/store/noteStore'
import { useSceneStore } from '@/store/sceneStore'

const LIMIT = 420

export function CreateNoteModal() {
  const isOpen = useUiStore((s) => s.isCreateOpen)
  const closeCreate = useUiStore((s) => s.closeCreate)
  const selectNote = useUiStore((s) => s.selectNote)
  const createNote = useNoteStore((s) => s.createNote)
  const setFocusTarget = useSceneStore((s) => s.setFocusTarget)

  const [text, setText] = useState('')
  const [toneKey, setToneKey] = useState<Exclude<EmotionKey, 'memorial'>>('hope')
  const [memorial, setMemorial] = useState(false)
  const [signature, setSignature] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const activeEmotion: EmotionKey = memorial ? 'memorial' : toneKey
  const active = EMOTIONS[activeEmotion]

  const handleClose = useCallback(() => {
    closeCreate()
    setText('')
    setToneKey('hope')
    setMemorial(false)
    setSignature('')
    setError('')
    setBusy(false)
  }, [closeCreate])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, handleClose])

  const submit = useCallback(async () => {
    if (!text.trim()) {
      setError('even one quiet line is enough.')
      return
    }
    setError('')
    setBusy(true)
    try {
      const created = await createNote({
        content: text.trim(),
        emotion: activeEmotion,
        authorLabel: signature.trim() || undefined,
      })
      handleClose()
      window.setTimeout(() => {
        selectNote(created.id)
        setFocusTarget(created.id)
      }, 120)
    } catch {
      setError('the fragment did not settle. try once more.')
      setBusy(false)
    }
  }, [text, activeEmotion, signature, createNote, handleClose, selectNote, setFocusTarget])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="compose-ritual"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-5 py-12"
          style={{ background: 'rgba(238,242,249,0.82)', backdropFilter: 'blur(30px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button
            type="button"
            onClick={handleClose}
            aria-label="close"
            className="absolute right-6 top-6 rounded-full p-2 text-slate-400 transition-colors duration-500 hover:bg-slate-900/5 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-4 w-4" strokeWidth={1.4} />
          </button>

          <motion.div
            className="flex w-full max-w-[34rem] flex-col items-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <p className="font-body text-[9px] uppercase tracking-[0.34em] text-slate-400">
              write onto the note
            </p>

            {/* Live sticky-note preview */}
            <div className="relative mt-6 w-full max-w-[17rem]">
              <div
                className="relative rounded-[1.1rem] p-7 shadow-[0_40px_80px_-40px_rgba(40,46,74,0.55)] transition-colors duration-300"
                style={{
                  background: active.paper,
                  minHeight: '15rem',
                }}
              >
                <span
                  className="mb-3 inline-block h-1 w-10 rounded-full transition-colors duration-300"
                  style={{ background: active.dot }}
                />
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, LIMIT))}
                  rows={5}
                  autoFocus
                  placeholder="what are you holding right now…"
                  className="w-full resize-none border-0 bg-transparent font-heading outline-none placeholder:italic placeholder:opacity-50"
                  style={{
                    color: active.ink,
                    fontSize: '1.45rem',
                    lineHeight: 1.5,
                  }}
                />
                {signature.trim() && (
                  <p
                    className="mt-3 font-heading text-sm italic"
                    style={{ color: active.ink, opacity: 0.7 }}
                  >
                    — {signature.trim().slice(0, 32)}
                  </p>
                )}
              </div>
            </div>

            {/* Tone swatches */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {PASTEL_TONE_KEYS.map((key) => {
                const t = EMOTIONS[key]
                const on = !memorial && key === toneKey
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setToneKey(key)
                      setMemorial(false)
                    }}
                    aria-label={t.label}
                    title={t.label}
                    className="group relative h-9 w-9 rounded-full transition-transform duration-300 cursor-pointer"
                    style={{
                      background: t.paper,
                      border: on
                        ? `2px solid ${t.dot}`
                        : '1px solid rgba(0,0,0,0.08)',
                      transform: on ? 'scale(1.12)' : 'scale(1)',
                      boxShadow: on ? `0 0 0 4px ${t.halo}` : 'none',
                    }}
                  >
                    <span
                      className="absolute inset-0 m-auto h-2 w-2 rounded-full"
                      style={{ background: t.dot }}
                    />
                  </button>
                )
              })}
            </div>

            {/* Memorial toggle */}
            <button
              type="button"
              onClick={() => setMemorial((v) => !v)}
              className="mt-5 flex items-center gap-2.5 font-body text-[9px] uppercase tracking-[0.24em] transition-colors duration-500 cursor-pointer"
              style={{ color: memorial ? EMOTIONS.memorial.face : '#8a8f9c' }}
            >
              <span
                className="flex h-4 w-7 items-center rounded-full p-0.5 transition-colors duration-300"
                style={{ background: memorial ? EMOTIONS.memorial.dot : 'rgba(0,0,0,0.12)' }}
              >
                <span
                  className="h-3 w-3 rounded-full bg-white transition-transform duration-300"
                  style={{ transform: memorial ? 'translateX(12px)' : 'translateX(0)' }}
                />
              </span>
              in remembrance
            </button>

            {/* Signature */}
            <div className="mt-8 flex w-full max-w-[22rem] items-baseline gap-3 border-b border-slate-300/50 pb-2">
              <span className="font-body text-[9px] uppercase tracking-[0.26em] text-slate-400">
                signed
              </span>
              <input
                value={signature}
                onChange={(e) => setSignature(e.target.value.slice(0, 32))}
                placeholder="optional — a soft name, a letter"
                className="flex-1 border-0 bg-transparent font-heading text-base text-slate-600 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="mt-3 h-4 w-full max-w-[22rem] text-center font-body text-[9px] uppercase tracking-[0.22em] text-rose-400/90">
              {error}
            </div>

            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className="mt-5 rounded-full px-9 py-3.5 font-body text-[10px] uppercase tracking-[0.28em] transition-all duration-500 disabled:opacity-50 cursor-pointer"
              style={{
                background: active.paper,
                color: active.ink,
                border: `1px solid ${memorial ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.85)'}`,
                boxShadow: `0 26px 60px -36px ${active.halo}`,
              }}
            >
              {busy ? 'releasing…' : 'release it into the sky'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
