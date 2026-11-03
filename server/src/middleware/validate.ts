import type { Request, Response, NextFunction } from 'express'
import type { ZodSchema } from 'zod'
import { respondError } from '../lib/respond'

/**
 * Middleware factory that validates req.body against a Zod schema.
 * On failure: responds 400 immediately — the route handler never runs.
 * On success: replaces req.body with the parsed, typed value and calls next().
 */
export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      respondError(res, 400, 'VALIDATION_ERROR', 'Request body is invalid')
      return
    }
    req.body = result.data
    next()
  }
