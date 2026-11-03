import type { Request, Response, NextFunction } from 'express'
import { respondError } from '../lib/respond'

/**
 * Global Express error boundary.
 * Catches anything forwarded via next(err) or thrown inside asyncHandler.
 * The real error is logged server-side — the client only ever sees a generic message.
 * Must be registered last in app.ts.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(err)
  respondError(res, 500, 'INTERNAL_ERROR', 'Something went wrong')
}
