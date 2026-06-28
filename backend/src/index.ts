import express, { type Request, type Response } from 'express'
import cors from 'cors'
import { connectToDatabase, getDb } from './db.js'
import type { Document } from 'mongodb'
import type { QuestionDocument, GameResponse } from './types.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors({ origin: 'http://localhost:5173' }))

app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello from the backend!' })
})

app.get('/api/questions/normal-game', async (req: Request, res: Response) => {
  const countParam = parseInt(req.query.count as string)
  const count = isNaN(countParam) || countParam < 1 ? 5 : Math.min(countParam, 20)

  const bonusParam = parseInt(req.query.bonus as string)
  const bonusCount = isNaN(bonusParam) ? 0 : Math.min(bonusParam, 20)

  const packsParam = req.query.packs as string
  const validPackIds: number[] = []
  for (const pack of packsParam.split(',')) {
    const packId = parseInt(pack.split(':')[0] ?? '')
    // offset is parsed here but reserved for future use
    //const offset = parseInt(pack.split(':')[1] ?? '')

    if (!isNaN(packId)) {
      validPackIds.push(packId)
    }
  }

  const db = getDb()
  const pipeline: Document[] = []
  const matchFilter: Record<string, unknown> = {}

  if (validPackIds.length > 0) {
    matchFilter.questionPack = { $in: validPackIds }
    pipeline.push({ $match: matchFilter })
  }
  pipeline.push({ $sample: { size: count } })

  const questions = await db
    .collection<QuestionDocument>('questions')
    .aggregate<QuestionDocument>(pipeline)
    .toArray()

  /*
  // TODO make a more proper endpoint / debug tool for testing specific questions
  const debugQuestion = await db.collection<QuestionDocument>('questions').findOne({ _id: 7085 })
  if (debugQuestion) questions[0] = debugQuestion
  */

  const game: GameResponse = {
    questions,
    bonusQuestions: [],
  }

  // Retrieve a separate batch of bonus round eligible questions, while avoiding duplicates
  if (bonusCount > 0) {
    const questionIds = questions.map((q) => q._id)
    matchFilter._id = { $nin: questionIds }
    matchFilter.bonusEligible = true

    game.bonusQuestions = await db
      .collection<QuestionDocument>('questions')
      .aggregate<QuestionDocument>([{ $match: matchFilter }, { $sample: { size: bonusCount } }])
      .toArray()
  }

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

async function start() {
  await connectToDatabase()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()
