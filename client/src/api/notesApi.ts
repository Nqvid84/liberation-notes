// API client — calls the Express backend at /api/notes, or serves static mock data
// without any network requests when built for GitHub Pages / static demo mode.
//
// In development:   Vite proxies /api/* → http://localhost:3001 (see vite.config.ts).
// In production:    set VITE_API_BASE_URL to the backend origin if it's on a different domain.
// In GitHub Pages:  VITE_GITHUB_PAGES=true (or --mode gh-pages) disables all API calls
//                   and uses MOCK_NOTES in-memory.

import type { Note, CreateNoteInput, ApiResponse } from 'shared/types'
import { EMOTIONS } from '@/design'
import { MOCK_NOTES } from './mockData'

const BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const IS_STATIC_MOCK =
  import.meta.env.VITE_GITHUB_PAGES === 'true' ||
  import.meta.env.VITE_USE_MOCK === 'true' ||
  import.meta.env.MODE === 'gh-pages'

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function generateMockPosition(): [number, number, number] {
  return [
    randomInRange(-12, 12),
    randomInRange(-6, 6),
    randomInRange(-10, 2),
  ]
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })

  const json = (await res.json()) as ApiResponse<T>

  if (!json.ok) {
    throw new Error(json.error.code)
  }

  return json.data
}

export async function fetchAllNotes(): Promise<Note[]> {
  if (IS_STATIC_MOCK) {
    return [...MOCK_NOTES]
  }
  return apiFetch<Note[]>('/api/notes')
}

export async function fetchNote(id: string): Promise<Note> {
  if (IS_STATIC_MOCK) {
    const found = MOCK_NOTES.find((n) => n.id === id)
    if (!found) {
      throw new Error('NOT_FOUND')
    }
    return found
  }
  return apiFetch<Note>(`/api/notes/${id}`)
}

export async function postNote(input: CreateNoteInput): Promise<Note> {
  if (IS_STATIC_MOCK) {
    const created: Note = {
      id: `mock-${Date.now()}`,
      content: input.content,
      emotion: input.emotion,
      color: EMOTIONS[input.emotion].face,
      position: generateMockPosition(),
      isMemorial: input.emotion === 'memorial',
      authorLabel: input.authorLabel,
      createdAt: new Date().toISOString(),
    }
    MOCK_NOTES.unshift(created)
    return created
  }
  return apiFetch<Note>('/api/notes', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
