import type { Request, Response, NextFunction, RequestHandler } from 'express'

/**
 * Wraps an async route handler so thrown errors are forwarded to next(err)
 * and caught by the global error handler — no manual try/catch needed in routes.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler =>
  (req, res, next) =>
    fn(req, res, next).catch(next)
