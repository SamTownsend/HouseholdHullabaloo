import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import { connectToDatabase, getDb } from './db.js'
import { getGameResponse } from './questionSelection.js'
import type { QuestionDocument, QuestionPackConfig } from './types.js'

const app = express()
const PORT = process.env.PORT || 3000
const DEFAULT_PLAYER_ID = 'anonymous-player'

app.use(express.json())

const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173'
app.use(cors({ origin: corsOrigin }))

app.get('/api/questions/normal-game', async (req: Request, res: Response) => {
  const countParam = parseInt(req.query.count as string)
  const count = isNaN(countParam) || countParam < 1 ? 4 : Math.min(countParam, 20)

  const bonusParam = parseInt(req.query.bonus as string)
  const bonusCount = isNaN(bonusParam) || bonusParam < 1 ? 5 : Math.min(bonusParam, 20)

  const playerId = (req.query.playerId as string | undefined) ?? DEFAULT_PLAYER_ID

  const packConfigs: QuestionPackConfig[] = []
  const packsParam = req.query.packs as string | undefined
  if (packsParam) {
    for (const pack of packsParam.split(',')) {
      const [packIdStr, offsetStr] = pack.split(':')
      const packId = parseInt(packIdStr ?? '')
      const offset = parseInt(offsetStr ?? '')
      if (!isNaN(packId)) {
        packConfigs.push({ id: packId, offset: isNaN(offset) ? 0 : offset })
      }
    }
  }

  const game = await getGameResponse(playerId, packConfigs, count, bonusCount)
  res.json(game)
})

app.get('/api/questions/random', async (req: Request, res: Response) => {
  const id = Math.floor(Math.random() * 10095) + 1
  const db = getDb()
  const question = await db.collection<QuestionDocument>('questions').findOne({ _id: id })

  if (!question) {
    res.status(404).json({ error: `No question found with id ${id}` })
    return
  }

  res.json(question)
})

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

async function start() {
  await connectToDatabase()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()
