import { useState, useEffect } from 'react'
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

interface Props {
  session: Session
  question: Question
  onRoundEnd: (summary: RoundSummary) => void
}

export function NormalRound({ session, question, onRoundEnd }: Props) {
  // For debug purposes
  useEffect(() => {
    console.log(question)
  }, [])

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
  const [timerRunning, setTimerRunning] = useState(true)

  function resetTimer() {
    setTimeRemaining(30)
    setTimerRunning(true)
  }

  function handleSubmit(userInput: string) {
    const result = surveySays(answerGroups, userInput)

    if (result.outcome !== HarvOutcomes.Duplicate) {
      setTimerRunning(false)
    }

    if (result.outcome === HarvOutcomes.Correct) {
      const updatedGroups = answerGroups.map((group, i) =>
        i === result.matchedIndex ? { ...group, revealed: true } : group
      )
      setAnswerGroups(updatedGroups)
      setRoundScore((prev) => prev + updatedGroups[result.matchedIndex].pointValue)

      const allRevealed = updatedGroups.filter((g) => g.rank > 0).every((g) => g.revealed)
      if (allRevealed) {
        handleRoundEnd()
      } else {
        resetTimer()
      }
    } else if (result.outcome === HarvOutcomes.Incorrect) {
      handleStrike()
    }
  }

  function handleStrike() {
    const updatedStrikes = strikes + 1
    setStrikes(updatedStrikes)

    if (updatedStrikes === 3) {
      handleRoundEnd()
    } else {
      resetTimer()
    }
  }

  function handleRoundEnd() {
    setTimerRunning(false)

    const revealGroups = answerGroups.map((g) => (g.rank > 0 ? { ...g, revealed: true } : g))
    setAnswerGroups(revealGroups)

    setTimeout(
      () =>
        onRoundEnd({
          questionId: question._id,
          roundScore: roundScore,
          averageScore: question.averageScore,
          strikes: strikes,
        }),
      3000
    )
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
      <GameBanner username={session.player.username} score={roundScore} />
      <QuestionText text={question.questionText} />
      <AnswerBoard answerGroups={answerGroups} />
      <StrikeDisplay strikes={strikes} />
      <InputBanner
        timeRemaining={timeRemaining}
        onSubmit={handleSubmit}
        disabled={!timerRunning || timeRemaining === 0}
      />
    </div>
  )
}
