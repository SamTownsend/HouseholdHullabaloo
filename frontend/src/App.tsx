import { useState } from 'react'
import { MainMenu } from './screens/MainMenu'
import { Options } from './screens/Options'
import { Stats } from './screens/Stats'
import { About } from './screens/About'
import { HouseholdSelect } from './screens/HouseholdSelect'
import { NormalRound } from './screens/NormalRound'
import { ScoreCompare } from './screens/ScoreCompare'
import {
  Screens,
  type Session,
  type Household,
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
    household: { name: '', gamesPlayed: 0, lifetimeScore: 0 },
    score: 0,
    averageScore: 0,
  })

  async function startGame(household: Household) {
    try {
      const res = await fetch(`/api/questions?count=${ROUNDS_PER_GAME}`)
      const fetched: QuestionDocument[] = await res.json()
      console.log(fetched)

      setSession({
        household,
        score: 0,
        averageScore: 0,
      })
      setQuestions(addQuestionGameplayProps(fetched))
      setCurrentRound(0)
      setCurrentScreen(Screens.NormalRound)
    } catch (err) {
      console.error('Failed to start game:', err)
    }
  }

  function handleNormalRoundEnd(summary: RoundSummary) {
    console.log(summary)

    setSession((prev) => ({
      ...prev,
      score: prev.score + summary.roundScore,
      averageScore: prev.averageScore + summary.averageScore,
    }))

    setCurrentScreen(Screens.ScoreCompare)
  }

  function handleNextRound() {
    const nextRound = currentRound + 1
    if (nextRound >= ROUNDS_PER_GAME) {
      setCurrentScreen(Screens.MainMenu)
    } else {
      setCurrentRound(nextRound)
      setCurrentScreen(Screens.NormalRound)
    }
  }

  if (currentScreen === Screens.MainMenu) {
    return (
      <MainMenu
        onPlay={() => setCurrentScreen(Screens.HouseholdSelect)}
        onOptions={() => setCurrentScreen(Screens.Options)}
        onStats={() => setCurrentScreen(Screens.Stats)}
        onAbout={() => setCurrentScreen(Screens.About)}
      />
    )
  }

  if (currentScreen === Screens.Options) {
    return <Options onDone={() => setCurrentScreen(Screens.MainMenu)} />
  }

  if (currentScreen === Screens.Stats) {
    return <Stats onDone={() => setCurrentScreen(Screens.MainMenu)} />
  }

  if (currentScreen === Screens.About) {
    return <About onDone={() => setCurrentScreen(Screens.MainMenu)} />
  }

  if (currentScreen === Screens.HouseholdSelect) {
    return <HouseholdSelect onStartGame={startGame} />
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
      <ScoreCompare
        householdName={session.household.name}
        score={session.score}
        averageScore={session.averageScore}
        onContinue={handleNextRound}
      />
    )
  }
}

export default App
