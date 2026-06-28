import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { MainMenu } from './screens/MainMenu'
import { Options } from './screens/Options'
import { Stats } from './screens/Stats'
import { About } from './screens/About'
import { HouseholdSelect } from './screens/HouseholdSelect'
import { NormalRound } from './screens/NormalRound'
import { BonusRound } from './screens/BonusRound'
import { ScoreCompare } from './screens/ScoreCompare'
import {
  Screens,
  type Session,
  type Household,
  type QuestionDocument,
  type RoundSummary,
  type Question,
} from './types'
import { APP_STORAGE_KEY, DEFAULT_APP_STORAGE, type AppStorage } from './lib/storage'

const ROUNDS_PER_GAME = 4
const BONUS_ROUND_QUESTIONS = 5

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
  const [appStorage, setAppStorage] = useLocalStorage<AppStorage>(
    APP_STORAGE_KEY,
    DEFAULT_APP_STORAGE
  )
  const [currentScreen, setCurrentScreen] = useState<Screens>(Screens.MainMenu)
  const [currentRound, setCurrentRound] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [bonusQuestions, setBonusQuestions] = useState<Question[]>([])
  const [session, setSession] = useState<Session>({
    household: { name: '', gamesPlayed: 0, lifetimeScore: 0 },
    score: 0,
    averageScore: 0,
  })

  async function startGame(household: Household) {
    try {
      const enabledPacks = appStorage.packConfigs.filter((p) => p.enabled)
      const packQuery =
        enabledPacks.length > 0
          ? '&packs=' + enabledPacks.map((p) => `${p.questionPack}:${p.offset}`).join(',')
          : ''

      const res = await fetch(`/api/questions?count=${ROUNDS_PER_GAME}${packQuery}`)
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

  async function startBonusRound() {
    try {
      const enabledPacks = appStorage.packConfigs.filter((p) => p.enabled)
      const packQuery =
        enabledPacks.length > 0
          ? '&packs=' + enabledPacks.map((p) => `${p.questionPack}:${p.offset}`).join(',')
          : ''

      const res = await fetch(
        `/api/questions?count=${BONUS_ROUND_QUESTIONS}${packQuery}&bonusEligible=true`
      )
      const fetched: QuestionDocument[] = await res.json()
      console.log(fetched)

      setBonusQuestions(addQuestionGameplayProps(fetched))
      setCurrentScreen(Screens.BonusRound)
    } catch (err) {
      console.error('Failed to start bonus round:', err)
      setCurrentScreen(Screens.MainMenu)
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
      if (session.score >= session.averageScore) {
        void startBonusRound()
      } else {
        setCurrentScreen(Screens.MainMenu)
      }
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
    return (
      <Options
        appStorage={appStorage}
        setAppStorage={setAppStorage}
        onDone={() => setCurrentScreen(Screens.MainMenu)}
      />
    )
  }

  if (currentScreen === Screens.Stats) {
    return <Stats onDone={() => setCurrentScreen(Screens.MainMenu)} />
  }

  if (currentScreen === Screens.About) {
    return <About onDone={() => setCurrentScreen(Screens.MainMenu)} />
  }

  if (currentScreen === Screens.HouseholdSelect) {
    return (
      <HouseholdSelect
        appStorage={appStorage}
        setAppStorage={setAppStorage}
        onStartGame={startGame}
      />
    )
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

  if (currentScreen === Screens.BonusRound && bonusQuestions) {
    return (
      <BonusRound
        bonusQuestions={bonusQuestions}
        onDone={() => setCurrentScreen(Screens.MainMenu)}
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
