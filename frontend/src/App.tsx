import { NormalRound } from './NormalRound'
import type { Game } from './types'

const testGame: Game = {
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
}

function App() {
  return <NormalRound initial={testGame} />
}

export default App
