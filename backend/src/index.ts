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

async function start() {
  await connectToDatabase()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()
