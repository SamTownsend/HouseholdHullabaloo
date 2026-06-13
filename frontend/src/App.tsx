import { useState } from 'react'
import { MainMenu } from './screens/MainMenu'
import { NormalRound } from './screens/NormalRound'
import {
  Screens,
  type Session,
  type QuestionDocument,
  type RoundSummary,
  type Question,
} from './types'

const ROUNDS_PER_GAME = 4

function addQuestionGameplayProps(qdocs: QuestionDocument[]): Question[] {
  return qdocs.map((qdoc) => ({
    ...qdoc,
    answerGroups: qdoc.answerGroups.map((group, i) => ({
      ...group,
      displayText: group.displayText.toUpperCase(),
      rank: i + 1,
      revealed: false,
    })),
  }))
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screens>(Screens.MainMenu)
  const [currentRound, setCurrentRound] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [session, setSession] = useState<Session>({
    player: { username: '' },
    score: 0,
    averageScore: 0,
  })

  async function startGame() {
    try {
      const res = await fetch(`/api/questions?count=${ROUNDS_PER_GAME}`)
      const fetched: QuestionDocument[] = await res.json()

      setSession((prev) => ({ ...prev, player: { ...prev.player, username: 'NEW ERA' } }))
      setQuestions(addQuestionGameplayProps(fetched))
      setCurrentRound(0)

      setCurrentScreen(Screens.NormalRound)
    } catch (err) {
      console.error('Failed to start game:', err)
    }
  }

  function handleNormalRoundEnd(summary: RoundSummary) {
    setSession((prev) => ({
      ...prev,
      score: prev.score + summary.roundScore,
      averageScore: prev.averageScore + summary.averageScore,
    }))

    setCurrentScreen(Screens.ScoreCompare)
    setTimeout(handleNextRound, 3000)
  }

  function handleNextRound() {
    const nextRound = currentRound + 1
    if (nextRound >= ROUNDS_PER_GAME) {
      return
    } else {
      setCurrentRound(nextRound)
      setCurrentScreen(Screens.NormalRound)
    }
  }

  if (currentScreen === Screens.MainMenu) {
    return <MainMenu onStartGame={startGame} />
  }

  if (currentScreen === Screens.NormalRound && questions) {
    return (
      <NormalRound
        key={currentRound}
        session={session}
        question={questions[currentRound]}
        onRoundEnd={handleNormalRoundEnd}
      />
    )
  }

  if (currentScreen === Screens.ScoreCompare) {
    return (
      <div>
        <p>ScoreCompare placeholder</p>
        <p>Your score: {session.score}</p>
        <p>Average score: {session.averageScore}</p>
      </div>
    )
  }
}

export default App
