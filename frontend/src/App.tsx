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
import { getFinalScore } from './lib/scoring'
import { MAX_HIGH_SCORES } from './lib/storage'

const ROUNDS_PER_GAME = 4
const BONUS_ROUND_QUESTIONS = 5
// TODO make this configurable from Options menu, ex. difficulty = easy / medium / hard
const AVERAGE_SCORE_DIFFICULTY_MOD = 0.9

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

  async function startGame(household: Household) {
    try {
      const enabledPacks = appStorage.packConfigs.filter((p) => p.enabled)
      const packConfig = enabledPacks.map((p) => `${p.questionPack}:${p.offset}`).join(',')

      const res = await fetch(
        `/api/questions/normal-game?count=${ROUNDS_PER_GAME}&bonus=${BONUS_ROUND_QUESTIONS}&packs=${packConfig}`
      )
      const fetched: GameResponse = await res.json()
      devLog(fetched)

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
        setCurrentScreen(Screens.NormalRound)
      }
    } catch (err) {
      console.error('Failed to start game:', err)
    }
  }

  function handleGameEnd(score: number, bonusScore: number) {
    const finalScore = getFinalScore(score, bonusScore)
    const newEntry = { name: session.household.name, score: finalScore }
    const updatedHighScores = [...appStorage.highScores, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_HIGH_SCORES)

    const updatedHouseholds = appStorage.households.map((h) =>
      h.name === session.household.name
        ? { ...h, gamesPlayed: h.gamesPlayed + 1, lifetimeScore: h.lifetimeScore + finalScore }
        : h
    )

    setAppStorage({
      ...appStorage,
      highScores: updatedHighScores,
      gamesPlayed: appStorage.gamesPlayed + 1,
      lifetimeScore: appStorage.lifetimeScore + finalScore,
      households: updatedHouseholds,
    })

    setCurrentScreen(Screens.EndGame)
  }

  function handleNormalRoundEnd(summary: RoundSummary) {
    devLog(summary)

    // Double points in the penultimate round and triple in the final round
    const roundMultiplier = Math.max(currentRound, 1)

    // Player earns 10 bonus points for each unused strike
    let modifiedRoundScore = summary.roundScore * roundMultiplier
    modifiedRoundScore += 10 * (3 - summary.strikes)

    // The default "average score" formula is way too brutal and needs to be toned down.
    // Only if it's greater, average the average score with the player's score
    let modifiedAverageScore = summary.averageScore * roundMultiplier
    if (modifiedAverageScore > modifiedRoundScore) {
      modifiedAverageScore = (modifiedAverageScore + modifiedRoundScore) / 2
    }
    modifiedAverageScore = Math.floor(modifiedAverageScore * AVERAGE_SCORE_DIFFICULTY_MOD)

    setSession((prev) => ({
      ...prev,
      score: prev.score + modifiedRoundScore,
      averageScore: prev.averageScore + modifiedAverageScore,
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
        setCurrentScreen(Screens.BonusRound)
      } else {
        handleGameEnd(session.score, 0)
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
