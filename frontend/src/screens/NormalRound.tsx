import { useState } from 'react'
import { useInterval } from '../hooks/useInterval'
import { GameBanner } from '../components/GameBanner'
import { QuestionText } from '../components/QuestionText'
import { StrikeDisplay } from '../components/StrikeDisplay'
import { AnswerBoard } from '../components/AnswerBoard'
import { InputBanner } from '../components/InputBanner'
import { surveySays } from '../lib/answerMatching/surveySays'
import {
  type Session,
  type RoundSummary,
  type Question,
  type AnswerGroup,
  HarvOutcomes,
} from '../types'
import styles from './NormalRound.module.css'

const QUESTION_REVEAL_INTERVAL_MS = 50
const SURVEY_SAYS_DELAY_MS = 1500
const POST_ANSWER_DELAY_MS = 2000
const REVEAL_INTERVAL_MS = 3500
const FINAL_DELAY_MS = 6000

interface Props {
  session: Session
  question: Question
  onRoundEnd: (summary: RoundSummary) => void
}

export function NormalRound({ session, question, onRoundEnd }: Props) {
  const [answerGroups, setAnswerGroups] = useState<AnswerGroup[]>(() => {
    const groups = question.answerGroups
    while (groups.length < 8) {
      groups.push({ rank: 0, pointValue: 0, revealed: false, displayText: '', answers: [] })
    }
    return groups
  })
  const [roundScore, setRoundScore] = useState(0)
  const [strikes, setStrikes] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(30)
  const [timerRunning, setTimerRunning] = useState(false)
  const [input, setInput] = useState('')

  function resetTimer() {
    setTimeRemaining(30)
    setTimerRunning(true)
    setInput('')
  }

  function handleSubmit(userInput: string) {
    const result = surveySays(answerGroups, userInput)

    // Duplicates are rejected instantly with no pause; timer keeps running
    if (result.outcome === HarvOutcomes.Duplicate) {
      setInput('')
      return
    }

    // Stop the timer immediately, then pause suspensefully before revealing the outcome
    setTimerRunning(false)
    setTimeout(() => {
      if (result.outcome === HarvOutcomes.Correct) {
        handleCorrectAnswer(result.matchedIndex)
      } else {
        handleStrike()
      }
    }, SURVEY_SAYS_DELAY_MS)
  }

  function handleCorrectAnswer(matchedIndex: number) {
    const updatedGroups = answerGroups.map((group, i) =>
      i === matchedIndex ? { ...group, revealed: true } : group
    )
    setAnswerGroups(updatedGroups)

    const updatedScore = roundScore + updatedGroups[matchedIndex].pointValue
    setRoundScore(updatedScore)

    const allRevealed = updatedGroups.filter((g) => g.rank > 0).every((g) => g.revealed)
    if (allRevealed) {
      handleRoundEnd(updatedScore, strikes)
    } else {
      setTimeout(resetTimer, POST_ANSWER_DELAY_MS)
    }
  }

  function handleStrike() {
    const updatedStrikes = strikes + 1
    setStrikes(updatedStrikes)

    if (updatedStrikes === 3) {
      handleRoundEnd(roundScore, updatedStrikes)
    } else {
      setTimeout(resetTimer, POST_ANSWER_DELAY_MS)
    }
  }

  function handleRoundEnd(finalRoundScore: number, finalStrikes: number) {
    setTimerRunning(false)
    const unrevealedRanks = answerGroups.filter((g) => g.rank > 0 && !g.revealed).map((g) => g.rank)
    roundEndReveal(unrevealedRanks, finalRoundScore, finalStrikes)
  }

  function roundEndReveal(
    unrevealedRanks: number[],
    finalRoundScore: number,
    finalStrikes: number
  ) {
    // All answers have been revealed. End the round after one final delay
    if (unrevealedRanks.length === 0) {
      setTimeout(
        () =>
          onRoundEnd({
            questionId: question._id,
            roundScore: finalRoundScore,
            averageScore: question.averageScore,
            strikes: finalStrikes,
          }),
        FINAL_DELAY_MS
      )
      return
    }

    // Reveal the topmost, unrevealed answer and then recurse
    const [r, ...next] = unrevealedRanks
    setTimeout(() => {
      setAnswerGroups((prev) => prev.map((g) => (g.rank === r ? { ...g, revealed: true } : g)))
      roundEndReveal(next, finalRoundScore, finalStrikes)
    }, REVEAL_INTERVAL_MS)
  }

  useInterval(
    () => {
      if (timeRemaining > 0) {
        setTimeRemaining((prev) => prev - 1)
      } else {
        handleStrike()
      }
    },
    timerRunning ? 1000 : null
  )

  return (
    <div className={styles.screen}>
      <GameBanner householdName={session.household.name} score={roundScore} />
      <QuestionText
        key={question._id}
        text={question.questionText}
        revealIntervalMs={QUESTION_REVEAL_INTERVAL_MS}
        onRevealComplete={() => setTimerRunning(true)}
      />
      <AnswerBoard answerGroups={answerGroups} />
      <StrikeDisplay strikes={strikes} />
      <InputBanner
        timeRemaining={timeRemaining}
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        disabled={!timerRunning || timeRemaining === 0}
      />
    </div>
  )
}
