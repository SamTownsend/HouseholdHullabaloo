import { useEffect, useState } from 'react'
import { NormalRound } from './NormalRound'
import type { Game } from './types'

function App() {
  const [game, setGame] = useState<Game | null>(null)

  useEffect(() => {
    fetch('/api/test-game')
      .then((res) => res.json())
      .then((data: Game) => setGame(data))
      .catch((err) => console.error('Failed to fetch test game:', err))
  }, [])

  if (game === null) {
    return <p>Loading...</p>
  }

  return <NormalRound initial={game} />
}

export default App
