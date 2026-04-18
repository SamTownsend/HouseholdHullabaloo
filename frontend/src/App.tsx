import { useEffect, useState } from 'react'
import { AnswerBox } from './components/AnswerBox'

function App() {
  const [message, setMessage] = useState<string>('')
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error('Failed to fetch:', err))
  }, [])

  return (
    <div>
      <div>
        <h1>{message}</h1>
      </div>
      <div
        style={{
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          alignItems: 'flex-start',
        }}
      >
        <AnswerBox rank={1} text="DOG" points={37} revealed={revealed} />
        <AnswerBox rank={2} text="CAT" points={16} revealed={revealed} />
        <AnswerBox rank={3} text="" points={10} revealed={false} />
        <button onClick={() => setRevealed(!revealed)}>Reveal Answers</button>
      </div>
    </div>
  )
}

export default App
