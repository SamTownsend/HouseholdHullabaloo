import { useEffect, useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { MainMenu } from './screens/MainMenu'
import { Options } from './screens/Options'
import { Stats } from './screens/Stats'
import { About } from './screens/About'
import { HouseholdSelect } from './screens/HouseholdSelect'
import { RoundIntro } from './screens/RoundIntro'
import { NormalRound } from './screens/NormalRound'
import { BonusRound } from './screens/BonusRound'
import { ScoreCompare } from './screens/ScoreCompare'
import { EndGame } from './screens/EndGame'
import {
  Screens,
  type Session,
  type Household,
  type QuestionDocument,
  type GameResponse,
  type RoundSummary,
  type Question,
} from './types'
import { devLog } from './lib/logging'
import {
  getRoundMultiplier,
  getMultiplierLabel,
  getModifiedRoundResult,
  getFinalScore,
} from './lib/scoring'
import { preloadSounds } from './lib/sound'
import { MAX_HIGH_SCORES } from './lib/storage'

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
  const [appStorage, setAppStorage] = useLocalStorage()
  const [introTarget, setIntroTarget] = useState<Screens>(Screens.NormalRound)
  const [currentScreen, setCurrentScreen] = useState<Screens>(Screens.MainMenu)
  const [currentRound, setCurrentRound] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([])
  const [bonusQuestions, setBonusQuestions] = useState<Question[]>([])
  const [session, setSession] = useState<Session>({
    household: { name: '', gamesPlayed: 0, lifetimeScore: 0 },
    score: 0,
    bonusScore: 0,
    averageScore: 0,
  })

  useEffect(() => {
    preloadSounds()
  }, [])

  async function startGame(household: Household) {
    try {
      const enabledPacks = appStorage.packConfigs.filter((p) => p.enabled)
      const packConfig = enabledPacks.map((p) => `${p.id}:${p.offset}`).join(',')
      const playerId = encodeURIComponent(appStorage.playerId)

      const res = await fetch(
        `/api/questions/normal-game?count=${ROUNDS_PER_GAME}&bonus=${BONUS_ROUND_QUESTIONS}&packs=${packConfig}&playerId=${playerId}`
      )
      const fetched: GameResponse = await res.json()
      devLog(fetched)

      // Merge the updated question pack offsets back into local storage
      setAppStorage((prev) => ({
        ...prev,
        packConfigs: prev.packConfigs.map((p) => {
          const updated = fetched.updatedPackConfigs.find((u) => u.id === p.id)
          return updated ? { ...p, offset: updated.offset } : p
        }),
      }))

      setSession({
        household,
        score: 0,
        bonusScore: 0,
        averageScore: 0,
      })
      setQuestions(addQuestionGameplayProps(fetched.questions))
      setBonusQuestions(addQuestionGameplayProps(fetched.bonusQuestions))
      setCurrentRound(0)

      // DEBUG SHORTCUT
      if (import.meta.env.DEV && household.name === 'SUMMON BONUS ROUND') {
        setCurrentScreen(Screens.BonusRound)
      } else {
        setIntroTarget(Screens.NormalRound)
        setCurrentScreen(Screens.RoundIntro)
      }
    } catch (err) {
      console.error('Failed to start game:', err)
    }
  }

  function handleGameEnd(score: number, bonusScore: number) {
    const finalScore = getFinalScore(score, bonusScore)
    const newEntry = { name: session.household.name, score: finalScore }

    setAppStorage((prev) => {
      const updatedHighScores = [...prev.highScores, newEntry]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_HIGH_SCORES)

      const updatedHouseholds = prev.households.map((h) =>
        h.name === session.household.name
          ? { ...h, gamesPlayed: h.gamesPlayed + 1, lifetimeScore: h.lifetimeScore + finalScore }
          : h
      )

      return {
        ...prev,
        highScores: updatedHighScores,
        gamesPlayed: prev.gamesPlayed + 1,
        lifetimeScore: prev.lifetimeScore + finalScore,
        households: updatedHouseholds,
      }
    })

    setCurrentScreen(Screens.EndGame)
  }

  function handleNormalRoundEnd(summary: RoundSummary) {
    devLog(summary)

    const { roundScore, averageScore } = getModifiedRoundResult(summary, currentRound)
    setSession((prev) => ({
      ...prev,
      score: prev.score + roundScore,
      averageScore: prev.averageScore + averageScore,
    }))

    setCurrentScreen(Screens.ScoreCompare)
  }

  function handleBonusRoundEnd(bonusScore: number) {
    setSession((prev) => ({ ...prev, bonusScore }))
    handleGameEnd(session.score, bonusScore)
  }

  function handleNextRound() {
    const nextRound = currentRound + 1
    if (nextRound >= ROUNDS_PER_GAME) {
      if (session.score >= session.averageScore) {
        setIntroTarget(Screens.BonusRound)
        setCurrentScreen(Screens.RoundIntro)
      } else {
        handleGameEnd(session.score, 0)
      }
    } else {
      setCurrentRound(nextRound)
      setIntroTarget(Screens.NormalRound)
      setCurrentScreen(Screens.RoundIntro)
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
    return <Stats appStorage={appStorage} onDone={() => setCurrentScreen(Screens.MainMenu)} />
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

  if (currentScreen === Screens.RoundIntro) {
    const isBonus = introTarget === Screens.BonusRound
    const multiplier = getRoundMultiplier(currentRound)

    return (
      <RoundIntro
        label={isBonus ? 'BONUS ROUND' : `ROUND ${currentRound + 1}`}
        multiplierLabel={isBonus ? '' : getMultiplierLabel(multiplier)}
        onContinue={() => setCurrentScreen(introTarget)}
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
    return <BonusRound bonusQuestions={bonusQuestions} onBonusRoundEnd={handleBonusRoundEnd} />
  }

  if (currentScreen === Screens.ScoreCompare) {
    return <ScoreCompare session={session} onContinue={handleNextRound} />
  }

  if (currentScreen === Screens.EndGame) {
    return (
      <EndGame
        session={session}
        highScores={appStorage.highScores}
        onDone={() => setCurrentScreen(Screens.MainMenu)}
      />
    )
  }
}

export default App
