export type EmotionKey =
  | 'hope'
  | 'grief'
  | 'gratitude'
  | 'loneliness'
  | 'love'
  | 'reflection'
  | 'confusion'
  | 'memorial'

export interface Note {
  id: string
  content: string
  emotion: EmotionKey
  color: string
  position: [number, number, number]
  isMemorial: boolean
  authorLabel?: string
  createdAt: string
}

export interface CreateNoteInput {
  content: string
  emotion: EmotionKey
  authorLabel?: string
}

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } }
