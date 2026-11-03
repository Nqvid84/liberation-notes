import { Router } from 'express'
import { respond } from '../lib/respond'

const router = Router()

/**
 * GET /api/health
 * Liveness check — no auth, no rate limit, no validation.
 * Returns { ok: true, data: null } if the Express process is alive.
 */
router.get('/', (_req, res) => {
  respond(res, null)
})

export { router as healthRouter }
