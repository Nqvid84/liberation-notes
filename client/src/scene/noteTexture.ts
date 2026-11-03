import * as THREE from 'three'
import type { Note } from 'shared/types'
import { EMOTIONS, type EmotionTone } from '@/design/tokens'

const SIZE = 512

let shadowTexture: THREE.CanvasTexture | null = null
export function getShadowTexture(): THREE.CanvasTexture {
  if (shadowTexture) return shadowTexture
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 6, 64, 64, 62)
  g.addColorStop(0, 'rgba(40,46,74,0.42)')
  g.addColorStop(0.7, 'rgba(40,46,74,0.12)')
  g.addColorStop(1, 'rgba(40,46,74,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  shadowTexture = new THREE.CanvasTexture(c)
  return shadowTexture
}

let cloudTexture: THREE.CanvasTexture | null = null
export function getCloudTexture(): THREE.CanvasTexture {
  if (cloudTexture) return cloudTexture
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(128, 128, 8, 128, 128, 128)
  g.addColorStop(0, 'rgba(255,255,255,0.9)')
  g.addColorStop(0.55, 'rgba(255,255,255,0.35)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  cloudTexture = new THREE.CanvasTexture(c)
  return cloudTexture
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function toneForNote(note: Pick<Note, 'emotion' | 'isMemorial'>): EmotionTone {
  if (note.isMemorial || note.emotion === 'memorial') {
    return EMOTIONS.memorial
  }
  return EMOTIONS[note.emotion] ?? EMOTIONS.hope
}

export function makeNoteTexture(note: Note, tone: EmotionTone = toneForNote(note)): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = SIZE
  const scale = SIZE / 384
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, SIZE, SIZE)
  ctx.save()
  ctx.scale(scale, scale)

  const baseSize = 384
  const pad = 16
  const w = baseSize - pad * 2
  const h = baseSize - pad * 2

  // paper
  roundRect(ctx, pad, pad, w, h, 30)
  ctx.fillStyle = tone.paper
  ctx.fill()

  // soft inner edge
  ctx.save()
  ctx.clip()
  ctx.strokeStyle = 'rgba(0,0,0,0.05)'
  ctx.lineWidth = 2
  roundRect(ctx, pad + 2, pad + 2, w - 4, h - 4, 28)
  ctx.stroke()

  // paper grain
  let seed = 0
  for (let i = 0; i < note.id.length; i++) {
    seed = (seed * 31 + note.id.charCodeAt(i)) >>> 0
  }
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 0xffffffff
  }
  for (let i = 0; i < 520; i++) {
    ctx.fillStyle = `rgba(0,0,0,${rand() * 0.018})`
    ctx.fillRect(pad + rand() * w, pad + rand() * h, 1.4, 1.4)
  }

  // tone accent bar
  ctx.fillStyle = tone.dot
  roundRect(ctx, pad + 22, pad + 20, 46, 5, 2.5)
  ctx.fill()
  ctx.restore()

  // text
  const text = (note.content || '').slice(0, 420)
  const len = text.length
  const px = len < 50 ? 33 : len < 130 ? 27 : len < 220 ? 23 : 20
  ctx.fillStyle = tone.ink
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.font = `400 ${px}px "Cormorant Garamond", Georgia, serif`

  const maxW = w - 64
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? line + ' ' + word : word
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  const maxLines = Math.floor((h - 120) / (px * 1.34))
  const shown = lines.slice(0, maxLines)
  if (lines.length > maxLines && shown.length) {
    shown[shown.length - 1] = shown[shown.length - 1].slice(0, -1) + '…'
  }
  const lineH = px * 1.34
  let y = pad + 54
  for (const l of shown) {
    ctx.fillText(l, pad + 32, y)
    y += lineH
  }

  // signature
  const sig = (note.authorLabel || '').trim()
  if (sig) {
    ctx.font = `italic 22px "Cormorant Garamond", Georgia, serif`
    ctx.fillStyle = tone.ink
    ctx.globalAlpha = 0.7
    ctx.fillText('— ' + sig.slice(0, 32), pad + 32, baseSize - pad - 44)
    ctx.globalAlpha = 1
  }

  ctx.restore()

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}
