import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MOTION } from '@/design/tokens'

/**
 * A one-shot hint for mobile users explaining touch navigation.
 * Appears only on touch-capable devices, auto-fades after 4 seconds.
 * Positioned in the TOP safe zone so it never collides with the
 * action buttons at the bottom of the screen.
 * Never shown on desktop.
 */
export function MobileHint() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show on genuine touch devices
    if (!('ontouchstart' in window)) return

    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="mobile-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: MOTION.duration.normal } }}
          exit={{ opacity: 0, transition: { duration: 1000 } }}
          style={{
            position: 'fixed',
            // Top of screen — safely away from bottom buttons
            top: 'calc(28px + env(safe-area-inset-top, 0px))',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5,
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
          className="text-2xs font-ui text-ui-text-ghost tracking-wide sm:hidden"
        >
          Drag to wander · Pinch to drift deeper
        </motion.div>
      )}
    </AnimatePresence>
  )
}
