import { useState } from 'react'
import type { EmotionKey } from 'shared/types'
import { EMOTIONS, UI } from '@/design/tokens'
import { useIsMobile } from '@/hooks/useIsMobile'

const EMOTION_ORDER: EmotionKey[] = [
  'hope',
  'grief',
  'gratitude',
  'loneliness',
  'love',
  'reflection',
  'confusion',
  'memorial',
]

interface EmotionSelectorProps {
  value: EmotionKey | null
  onChange: (emotion: EmotionKey) => void
}

export function EmotionSelector({ value, onChange }: EmotionSelectorProps) {
  const [hoveredEmotion, setHoveredEmotion] = useState<EmotionKey | null>(null)
  const isMobile = useIsMobile()

  const pastels = EMOTION_ORDER.filter((e) => e !== 'memorial')
  const memorial: EmotionKey = 'memorial'

  return (
    // flex-wrap ensures swatches reflow gracefully on very narrow screens
    <div className="flex flex-wrap items-center gap-2">
      {pastels.map((key) => (
        <Swatch
          key={key}
          emotionKey={key}
          isSelected={value === key}
          isHovered={hoveredEmotion === key}
          isMobile={isMobile}
          onSelect={onChange}
          onHover={setHoveredEmotion}
        />
      ))}

      {/* Divider between pastels and memorial */}
      <div
        className="h-6 w-px self-center"
        style={{ backgroundColor: UI.surfaceBorder }}
      />

      <Swatch
        emotionKey={memorial}
        isSelected={value === memorial}
        isHovered={hoveredEmotion === memorial}
        isMobile={isMobile}
        onSelect={onChange}
        onHover={setHoveredEmotion}
      />
    </div>
  )
}

interface SwatchProps {
  emotionKey: EmotionKey
  isSelected: boolean
  isHovered: boolean
  isMobile: boolean
  onSelect: (key: EmotionKey) => void
  onHover: (key: EmotionKey | null) => void
}

function Swatch({ emotionKey, isSelected, isHovered, isMobile, onSelect, onHover }: SwatchProps) {
  const emotion = EMOTIONS[emotionKey]

  return (
    <div className="relative flex flex-col items-center">
      {/* Desktop: hover tooltip above swatch */}
      {!isMobile && isHovered && (
        <span
          className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-2xs font-ui text-ui-text-secondary pointer-events-none select-none"
          style={{ textTransform: 'capitalize' }}
        >
          {emotionKey}
        </span>
      )}

      <button
        type="button"
        aria-label={emotionKey}
        onClick={() => onSelect(emotionKey)}
        onMouseEnter={() => !isMobile && onHover(emotionKey)}
        onMouseLeave={() => !isMobile && onHover(null)}
        style={{
          // Visible circle
          width: 28,
          height: 28,
          borderRadius: 9999,
          backgroundColor: emotion.face,
          border: '2px solid transparent',
          outline: isSelected ? '2px solid rgba(100,110,140,0.4)' : 'none',
          outlineOffset: 1,
          transform: isSelected ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 120ms ease, outline 120ms ease',
          cursor: 'pointer',
          // Invisible tap-target extension for mobile (keeps visual size unchanged)
          padding: isMobile ? 6 : 0,
          margin: isMobile ? -6 : 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'content-box',
        }}
      />

      {/* Mobile: persistent label beneath the selected swatch */}
      {isMobile && isSelected && (
        <span
          className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-2xs font-ui text-ui-text-secondary pointer-events-none select-none"
          style={{ textTransform: 'capitalize' }}
        >
          {emotionKey}
        </span>
      )}
    </div>
  )
}
