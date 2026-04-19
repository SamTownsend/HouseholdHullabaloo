import { useEffect, useState } from 'react'
import { AnswerBoard } from './components/AnswerBoard'
import type { Answer } from './types'

function App() {
  const [message, setMessage] = useState<string>('')
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error('Failed to fetch:', err))
  }, [])

  const testAnswers: Answer[] = [
    { rank: 1, text: 'DOG', points: 37, revealed: revealed },
    { rank: 2, text: 'CAT', points: 16, revealed: revealed },
    { rank: 3, text: 'SOMETHING REALLY LONG JUST TO SEE', points: 12, revealed: revealed },
    { rank: 4, text: 'FISH', points: 9, revealed: false },
    { rank: 5, text: 'HAMSTER', points: 6, revealed: false },
    { rank: 0, text: '', points: 0, revealed: false },
    { rank: 0, text: '', points: 0, revealed: false },
    { rank: 0, text: '', points: 0, revealed: false },
  ]

  return (
    <div>
      <div>
        <h1>{message}</h1>
      </div>
      <div style={{ padding: '40px' }}>
        <AnswerBoard answers={testAnswers} />
        <br />
        <button onClick={() => setRevealed(!revealed)}>Reveal Answers</button>
      </div>
    </div>
  )
}

export default App
