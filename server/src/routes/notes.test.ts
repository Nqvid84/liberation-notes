import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { app } from '../app'

let mongoServer: MongoMemoryServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

afterEach(async () => {
  await mongoose.connection.dropDatabase()
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const validNote = {
  content: 'something i needed to say',
  emotion: 'hope',
}

const createNote = (body: object) =>
  request(app).post('/api/notes').send(body)

// ---------------------------------------------------------------------------
// GET /api/notes
// ---------------------------------------------------------------------------
describe('GET /api/notes', () => {
  it('returns an empty array when there are no notes', async () => {
    const res = await request(app).get('/api/notes')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true, data: [] })
  })

  it('returns all notes as an array', async () => {
    await createNote(validNote)
    await createNote({ content: 'another thought', emotion: 'grief' })

    const res = await request(app).get('/api/notes')

    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(res.body.data).toHaveLength(2)
  })

  it('returns notes sorted newest-first', async () => {
    await createNote({ content: 'first note', emotion: 'hope' })
    await createNote({ content: 'second note', emotion: 'grief' })

    const res = await request(app).get('/api/notes')
    const notes = res.body.data

    expect(notes[0].content).toBe('second note')
    expect(notes[1].content).toBe('first note')
  })

  it('returns notes with the correct shape', async () => {
    await createNote(validNote)
    const res = await request(app).get('/api/notes')
    const note = res.body.data[0]

    expect(note).toHaveProperty('id')
    expect(note).toHaveProperty('content')
    expect(note).toHaveProperty('emotion')
    expect(note).toHaveProperty('color')
    expect(note).toHaveProperty('position')
    expect(note).toHaveProperty('isMemorial')
    expect(note).toHaveProperty('createdAt')
    // internal fields must not be exposed
    expect(note).not.toHaveProperty('rotation')
    expect(note).not.toHaveProperty('_id')
    expect(note).not.toHaveProperty('__v')
    expect(note).not.toHaveProperty('updatedAt')
  })
})

// ---------------------------------------------------------------------------
// POST /api/notes
// ---------------------------------------------------------------------------
describe('POST /api/notes', () => {
  it('creates a note and returns 201 with the full note object', async () => {
    const res = await createNote(validNote)

    expect(res.status).toBe(201)
    expect(res.body.ok).toBe(true)

    const note = res.body.data
    expect(note.content).toBe(validNote.content)
    expect(note.emotion).toBe(validNote.emotion)
    expect(note.id).toBeDefined()
    expect(note.color).toBeDefined()
    expect(note.createdAt).toBeDefined()
  })

  it('server assigns position — client cannot override it', async () => {
    const res = await createNote({
      ...validNote,
      position: [999, 999, 999], // should be stripped by Zod
    })

    expect(res.status).toBe(201)
    // position must be server-generated, not [999, 999, 999]
    expect(res.body.data.position).not.toEqual([999, 999, 999])
    expect(res.body.data.position).toHaveLength(3)
  })

  it('server assigns color from emotion — not from client', async () => {
    const res = await createNote(validNote)

    expect(res.status).toBe(201)
    expect(res.body.data.color).toBe('#F2E8C8') // hope color from design system
  })

  it('sets isMemorial true when emotion is memorial', async () => {
    const res = await createNote({ content: 'in memory', emotion: 'memorial' })

    expect(res.status).toBe(201)
    expect(res.body.data.isMemorial).toBe(true)
  })

  it('sets isMemorial false for non-memorial emotions', async () => {
    const res = await createNote(validNote)

    expect(res.status).toBe(201)
    expect(res.body.data.isMemorial).toBe(false)
  })

  it('accepts an optional authorLabel', async () => {
    const res = await createNote({ ...validNote, authorLabel: 'a stranger' })

    expect(res.status).toBe(201)
    expect(res.body.data.authorLabel).toBe('a stranger')
  })

  it('returns 400 when content is missing', async () => {
    const res = await createNote({ emotion: 'hope' })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      ok: false,
      error: { code: 'VALIDATION_ERROR', message: 'Request body is invalid' },
    })
  })

  it('returns 400 when content is an empty string', async () => {
    const res = await createNote({ content: '', emotion: 'hope' })

    expect(res.status).toBe(400)
    expect(res.body.ok).toBe(false)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 when emotion is missing', async () => {
    const res = await createNote({ content: 'something' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 when emotion is an invalid value', async () => {
    const res = await createNote({ content: 'something', emotion: 'rage' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 when content exceeds 500 characters', async () => {
    const res = await createNote({ content: 'x'.repeat(501), emotion: 'hope' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 when authorLabel exceeds 60 characters', async () => {
    const res = await createNote({
      ...validNote,
      authorLabel: 'a'.repeat(61),
    })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})

// ---------------------------------------------------------------------------
// GET /api/notes/:id
// ---------------------------------------------------------------------------
describe('GET /api/notes/:id', () => {
  it('returns the note when it exists', async () => {
    const created = await createNote(validNote)
    const id = created.body.data.id

    const res = await request(app).get(`/api/notes/${id}`)

    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(res.body.data.id).toBe(id)
    expect(res.body.data.content).toBe(validNote.content)
  })

  it('returns 404 when the note does not exist', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString()
    const res = await request(app).get(`/api/notes/${fakeId}`)

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'Note not found' },
    })
  })

  it('returns a note without internal fields', async () => {
    const created = await createNote(validNote)
    const id = created.body.data.id

    const res = await request(app).get(`/api/notes/${id}`)
    const note = res.body.data

    expect(note).not.toHaveProperty('_id')
    expect(note).not.toHaveProperty('__v')
    expect(note).not.toHaveProperty('updatedAt')
  })
})
