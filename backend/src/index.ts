import express, { type Request, type Response } from 'express'
import cors from 'cors'
import { connectToDatabase } from './db.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors({ origin: 'http://localhost:5173' }))

app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'Hello from the backend!' })
})

app.get('/api/test-game', (req: Request, res: Response) => {
  console.log('received test game request')

  res.json({
    player: {
      username: 'NEW ERA',
    },
    question: {
      text: 'Name an animal you would probably never see at a zoo.',
      answers: [
        { rank: 1, text: 'DOG', points: 37, revealed: true },
        { rank: 2, text: 'CAT', points: 16, revealed: true },
        { rank: 3, text: 'SOMETHING REALLY LONG JUST TO SEE', points: 12, revealed: true },
        { rank: 4, text: 'FISH', points: 9, revealed: false },
        { rank: 5, text: 'HAMSTER', points: 6, revealed: false },
        { rank: 0, text: '', points: 0, revealed: false },
        { rank: 0, text: '', points: 0, revealed: false },
        { rank: 0, text: '', points: 0, revealed: false },
      ],
    },
    timeRemaining: 30,
    score: 65,
  })
})

async function start() {
  await connectToDatabase()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()
