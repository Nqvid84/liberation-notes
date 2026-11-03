import rateLimit from 'express-rate-limit'
import type { RequestHandler } from 'express'
import { respondError } from '../lib/respond'

/**
 * Rate limiter for write routes (POST only).
 * 5 note creations per IP per 15-minute window.
 * GET routes are never rate-limited.
 *
 * Disabled in test environments — the limiter's correctness is a
 * configuration guarantee, not something integration tests should exercise
 * (doing so would drain the window mid-suite and block unrelated assertions).
 */
export const rateLimiter: RequestHandler =
  process.env.NODE_ENV === 'test'
    ? (_req, _res, next) => next()
    : rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (_req, res) => {
          respondError(res, 429, 'RATE_LIMITED', 'Too many notes. Try again later.')
        },
      })
