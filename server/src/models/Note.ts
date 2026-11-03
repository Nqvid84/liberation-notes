import mongoose, { Schema } from 'mongoose'
import type { Note, EmotionKey } from 'shared/types'

/**
 * INoteDocument mirrors the shared Note type at the Mongoose document level.
 * `createdAt` is a Date here (Mongoose native); it is serialised to ISO string
 * in the toJSON transform before reaching the API response.
 */
export interface INoteDocument extends Omit<Note, 'id' | 'createdAt'> {
  createdAt: Date
}

const EMOTION_VALUES: EmotionKey[] = [
  'hope',
  'grief',
  'gratitude',
  'loneliness',
  'love',
  'reflection',
  'confusion',
  'memorial',
]

const NoteSchema = new Schema<INoteDocument>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    emotion: {
      type: String,
      required: true,
      enum: EMOTION_VALUES,
    },
    color: {
      type: String,
      required: true,
    },
    position: {
      type: [Number],
      required: true,
    },
    isMemorial: {
      type: Boolean,
      required: true,
      default: false,
    },
    authorLabel: {
      type: String,
      trim: true,
      maxlength: 60,
    },
  },
  {
    timestamps: true, // auto-manages createdAt and updatedAt — never set manually
  }
)

/**
 * toJSON transform:
 * - Converts _id (ObjectId) to id (string)
 * - Removes _id and __v from all API responses
 * - Never leaks Mongoose internals to callers
 */
NoteSchema.set('toJSON', {
  virtuals: false,
  transform: (_doc, ret) => {
    const obj = ret as unknown as Record<string, unknown>
    obj['id'] = String(obj['_id'])
    delete obj['_id']
    delete obj['__v']
    delete obj['updatedAt'] // updatedAt is internal — not part of the shared Note type
    return obj
  },
})

export const NoteModel = mongoose.model<INoteDocument>('Note', NoteSchema)
