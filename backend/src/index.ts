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
    score: 65,
    question: {
      _id: 1,
      round: 2,
      questionPack: 2,
      questionText:
        'If Superman got old like the rest of us, name a sign that it might be time for him to retire.',
      averageScore: 74,
      answerGroups: [
        {
          rank: 1,
          revealed: true,
          points: 32,
          displayText: "CAN'T FLY",
          answers: [
            { matchType: 1, answerText: "CAN'T FLY", forbiddenWords: [] },
            { matchType: 1, answerText: 'CANT FLY ANYMORE', forbiddenWords: [] },
            { matchType: 1, answerText: 'FLIES BADLY', forbiddenWords: [] },
            { matchType: 1, answerText: 'FLY', forbiddenWords: [] },
            { matchType: 1, answerText: 'FLIES', forbiddenWords: [] },
            { matchType: 1, answerText: 'FLIGHT', forbiddenWords: [] },
            { matchType: 1, answerText: 'SOAR', forbiddenWords: [] },
            { matchType: 1, answerText: 'flite', forbiddenWords: [] },
          ],
        },
        {
          rank: 2,
          revealed: false,
          points: 25,
          displayText: 'WEAK',
          answers: [
            { matchType: 1, answerText: 'WEAK', forbiddenWords: [] },
            { matchType: 1, answerText: 'STRENGTH', forbiddenWords: [] },
            { matchType: 1, answerText: 'STRONG', forbiddenWords: [] },
            { matchType: 1, answerText: 'MUSCLES', forbiddenWords: [] },
            { matchType: 1, answerText: 'WIMPY', forbiddenWords: [] },
            { matchType: 1, answerText: 'SHRIMPY', forbiddenWords: [] },
            { matchType: 1, answerText: 'POWER', forbiddenWords: [] },
            { matchType: 1, answerText: 'muscular', forbiddenWords: [] },
          ],
        },
        {
          rank: 3,
          revealed: true,
          points: 17,
          displayText: "HE'S SLOW",
          answers: [
            { matchType: 1, answerText: "HE'S SLOW", forbiddenWords: [] },
            { matchType: 1, answerText: 'SLOW', forbiddenWords: [] },
            { matchType: 1, answerText: 'SPEED', forbiddenWords: [] },
            { matchType: 1, answerText: 'FAST', forbiddenWords: [] },
            { matchType: 1, answerText: 'TIME', forbiddenWords: [] },
            { matchType: 1, answerText: 'quick', forbiddenWords: [] },
          ],
        },
        {
          rank: 4,
          revealed: true,
          points: 7,
          displayText: 'NO X-RAY VISION',
          answers: [
            { matchType: 1, answerText: 'NO X-RAY VISION', forbiddenWords: [] },
            { matchType: 1, answerText: 'X-RAY', forbiddenWords: [] },
            { matchType: 1, answerText: 'VISION', forbiddenWords: [] },
            { matchType: 1, answerText: "CAN'T SEE", forbiddenWords: [] },
            { matchType: 1, answerText: 'VISION', forbiddenWords: [] },
            { matchType: 1, answerText: 'EYES', forbiddenWords: [] },
            { matchType: 1, answerText: 'EYESIGHT', forbiddenWords: [] },
            { matchType: 1, answerText: 'BLURRY', forbiddenWords: [] },
            { matchType: 1, answerText: 'GLASSES', forbiddenWords: [] },
            { matchType: 1, answerText: 'NEARSIGHTED', forbiddenWords: [] },
            { matchType: 1, answerText: 'FARSIGHTED', forbiddenWords: [] },
            { matchType: 1, answerText: 'SPECTACLES', forbiddenWords: [] },
            { matchType: 1, answerText: 'cataract', forbiddenWords: [] },
            { matchType: 1, answerText: 'vishen', forbiddenWords: [] },
          ],
        },
        {
          rank: 5,
          revealed: false,
          points: 5,
          displayText: 'GRAY HAIR',
          answers: [
            { matchType: 1, answerText: 'GRAY HAIR', forbiddenWords: [] },
            { matchType: 1, answerText: 'WHITE HAIR', forbiddenWords: [] },
            { matchType: 1, answerText: 'GRAYING', forbiddenWords: [] },
            { matchType: 1, answerText: 'HAIR', forbiddenWords: [] },
            { matchType: 1, answerText: 'GRAY', forbiddenWords: [] },
            { matchType: 1, answerText: 'grey', forbiddenWords: [] },
            { matchType: 1, answerText: 'SALT AND PEPPER', forbiddenWords: [] },
          ],
        },
        {
          rank: 6,
          revealed: false,
          points: 4,
          displayText: 'MEMORY LOSS',
          answers: [
            { matchType: 1, answerText: 'MEMORY LOSS', forbiddenWords: [] },
            { matchType: 1, answerText: 'MEMORY', forbiddenWords: [] },
            { matchType: 1, answerText: 'REMEMBER', forbiddenWords: [] },
            { matchType: 1, answerText: "ALZHEIMER'S", forbiddenWords: [] },
            { matchType: 1, answerText: 'FORGETFUL', forbiddenWords: [] },
            { matchType: 1, answerText: 'FORGET', forbiddenWords: [] },
            { matchType: 1, answerText: 'LOSES', forbiddenWords: [] },
            { matchType: 1, answerText: 'MISPLACES', forbiddenWords: [] },
            { matchType: 1, answerText: 'absentminded', forbiddenWords: [] },
          ],
        },
        {
          rank: 0,
          revealed: false,
          points: 0,
          displayText: '',
          answers: [],
        },
        {
          rank: 0,
          revealed: false,
          points: 0,
          displayText: '',
          answers: [],
        },
      ],
    },
  })
})

async function start() {
  await connectToDatabase()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()
