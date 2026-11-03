import 'dotenv/config'
import { app } from './app'
import { connectDB } from './lib/db'
import { NoteModel } from './models/Note'
import { EMOTION_COLORS } from './lib/emotionColors'
import { generatePosition } from './lib/position'
import type { EmotionKey } from 'shared/types'

const PORT = process.env.PORT ?? '3001'

const INITIAL_SEED_NOTES: Array<{
  content: string
  emotion: EmotionKey
  authorLabel?: string
}> = [
  {
    content: 'You taught me how to fold a fitted sheet. I think of you every laundry day.',
    emotion: 'memorial',
    authorLabel: 'for my mother',
  },
  {
    content: 'For my brother, who never got to see the sea this year.',
    emotion: 'memorial',
    authorLabel: 'his sister',
  },
  {
    content: 'I love you in the small ways I don’t say out loud.',
    emotion: 'love',
  },
  {
    content: 'The light this evening was so ordinary it made me cry.',
    emotion: 'hope',
  },
  {
    content: 'I hope tomorrow is kinder than today.',
    emotion: 'hope',
  },
  {
    content: 'She would have turned 34 today. I still reach for my phone to call her.',
    emotion: 'grief',
    authorLabel: 'her little sister',
  },
  {
    content: 'The stranger who held the elevator open for me this morning — thank you. You have no idea.',
    emotion: 'gratitude',
  },
  {
    content: 'A room full of people and I have never felt more invisible.',
    emotion: 'loneliness',
  },
  {
    content: 'Sitting by the water watching the light change. This is enough. This is everything.',
    emotion: 'reflection',
  },
  {
    content: 'I don’t know what I want anymore. Is that okay?',
    emotion: 'confusion',
  },
  {
    content: 'Dad. I never got to say goodbye. I hope you knew.',
    emotion: 'memorial',
  },
  {
    content: 'Some mornings I wake up and the light is so beautiful I forget to be sad.',
    emotion: 'hope',
    authorLabel: 'anonymous',
  },
  {
    content: 'Two years of therapy and I finally cried today. Progress.',
    emotion: 'reflection',
  },
  {
    content: 'To my grandmother. To every recipe she never wrote down.',
    emotion: 'memorial',
    authorLabel: 'her granddaughter',
  },
  {
    content: 'Still here. Still trying.',
    emotion: 'hope',
  },
]

async function seedIfEmpty() {
  const count = await NoteModel.countDocuments()
  if (count > 0) return

  const docs = INITIAL_SEED_NOTES.map((item) => ({
    content: item.content,
    emotion: item.emotion,
    color: EMOTION_COLORS[item.emotion],
    position: generatePosition(),
    isMemorial: item.emotion === 'memorial',
    authorLabel: item.authorLabel,
  }))

  await NoteModel.insertMany(docs)
  console.log(`Seeded ${docs.length} initial notes into Liberation Notes`)
}

connectDB()
  .then(async () => {
    await seedIfEmpty()
    app.listen(Number(PORT), () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err)
    process.exit(1)
  })
