/*import { useEffect, useState } from 'react'
import { NormalRound } from './screens/NormalRound'
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
*/
import { useState } from 'react'
import { MainMenu } from './screens/MainMenu'
import { NormalRound } from './screens/NormalRound'

type Screen = 'MainMenu' | 'NormalRound'

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('MainMenu')

  if (currentScreen === 'MainMenu') {
    return <MainMenu onStartGame={() => setCurrentScreen('NormalRound')} />
  }

  if (currentScreen === 'NormalRound') {
    return <NormalRound />
  }
}

export default App
