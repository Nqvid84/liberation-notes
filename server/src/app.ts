import express from 'express'
import cors from 'cors'
import { healthRouter } from './routes/health'
import { notesRouter } from './routes/notes'
import { errorHandler } from './middleware/errorHandler'

const app = express()

// --- Global middleware ---
app.use(express.json())
app.use(cors())

// --- Routes ---
app.use('/api/health', healthRouter)
app.use('/api/notes', notesRouter)

// --- Global error handler (must be last) ---
app.use(errorHandler)

export { app }
