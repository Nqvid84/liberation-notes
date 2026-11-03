import type { Response } from 'express'

export type ErrorCode =
  | 'VALIDATION_ERROR' // Zod schema failure on request body
  | 'NOT_FOUND'        // Resource does not exist
  | 'RATE_LIMITED'     // IP exceeded write limit
  | 'INTERNAL_ERROR'   // Unexpected server error — message is always generic

export const respond = <T>(res: Response, data: T, status = 200): void => {
  res.status(status).json({ ok: true, data })
}

export const respondError = (
  res: Response,
  status: number,
  code: ErrorCode,
  message: string
): void => {
  res.status(status).json({ ok: false, error: { code, message } })
}
