import { Router } from 'express'
import { z } from 'zod'
import { NoteModel } from '../models/Note'
import { EMOTION_COLORS } from '../lib/emotionColors'
import { generatePosition } from '../lib/position'
import { respond, respondError } from '../lib/respond'
import { asyncHandler } from '../lib/asyncHandler'
import { validate } from '../middleware/validate'
import { rateLimiter } from '../middleware/rateLimiter'

const router = Router()

// ---------------------------------------------------------------------------
// Shared field projection — never return _id raw; toJSON handles the transform
// ---------------------------------------------------------------------------
const NOTE_PROJECTION =
  'content emotion color position isMemorial authorLabel createdAt'

// ---------------------------------------------------------------------------
// GET /api/notes
// Returns all notes sorted newest-first. No auth, no rate limit.
// ---------------------------------------------------------------------------
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const notes = await NoteModel.find({})
      .sort({ createdAt: -1 })
      .select(NOTE_PROJECTION)

    respond(res, notes.map((n) => n.toJSON()))
  })
)

// ---------------------------------------------------------------------------
// POST /api/notes
// Creates a new note. Rate limited. Body validated by Zod before handler runs.
// position, color, and isMemorial are always server-assigned.
// ---------------------------------------------------------------------------
const createNoteSchema = z.object({
  content:     z.string().min(1).max(500),
  emotion:     z.enum([
    'hope',
    'grief',
    'gratitude',
    'loneliness',
    'love',
    'reflection',
    'confusion',
    'memorial',
  ]),
  authorLabel: z.string().min(1).max(60).optional(),
})

router.post(
  '/',
  rateLimiter,
  validate(createNoteSchema),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof createNoteSchema>

    const note = new NoteModel({
      content:     body.content,
      emotion:     body.emotion,
      authorLabel: body.authorLabel,
      color:       EMOTION_COLORS[body.emotion],
      position:    generatePosition(),
      isMemorial:  body.emotion === 'memorial',
    })

    const saved = await note.save()
    respond(res, saved.toJSON(), 201)
  })
)

// ---------------------------------------------------------------------------
// GET /api/notes/:id
// Returns a single note for the detail panel. No auth, no rate limit.
// ---------------------------------------------------------------------------
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const note = await NoteModel.findById(req.params['id']).select(NOTE_PROJECTION)

    if (!note) {
      respondError(res, 404, 'NOT_FOUND', 'Note not found')
      return
    }

    respond(res, note.toJSON())
  })
)

export { router as notesRouter }
