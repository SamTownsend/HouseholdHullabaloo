import { useState, useEffect, useRef } from 'react'
import { GameBanner } from '../components/GameBanner'
import { QuestionText } from '../components/QuestionText'
import { AnswerBoard } from '../components/AnswerBoard'
import { InputBanner } from '../components/InputBanner'
import { surveySays } from '../lib/answerMatching/surveySays'
import { type Game, HarvOutcomes } from '../types'
import styles from './NormalRound.module.css'

export function NormalRound() {
  const [game, setGame] = useState<Game | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(30)
  const [timerRunning, setTimerRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetch('/api/test-game')
      .then((res) => res.json())
      .then((data: Game) => {
        setGame(data)
        setTimerRunning(true)
      })
      .catch((err) => console.error('Failed to fetch test game:', err))
  }, [])

  useEffect(() => {
    if (timerRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => prev - 1)
      }, 1000)
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerRunning, timeRemaining])

  function handleSubmit(userInput: string) {
    if (game === null) {
      return
    }

    const result = surveySays(game.question, userInput)

    if (result.outcome === HarvOutcomes.Correct) {
      setGame((prev) => {
        if (prev === null) {
          return null
        }

        const updatedGroups = prev.question.answerGroups.map((group, i) =>
          i === result.matchedIndex ? { ...group, revealed: true } : group
        )

        return {
          ...prev,
          score: prev.score + prev.question.answerGroups[result.matchedIndex!].points,
          question: { ...prev.question, answerGroups: updatedGroups },
        }
      })

      setTimeRemaining(30)
    }
  }

  if (game === null) {
    return <p>Loading...</p>
  }

  return (
    <div className={styles.screen}>
      <GameBanner username={game.player.username} score={game.score} />
      <QuestionText text={game.question.questionText} />
      <AnswerBoard answerGroups={game.question.answerGroups} />
      <InputBanner
        timeRemaining={timeRemaining}
        onSubmit={handleSubmit}
        disabled={!timerRunning || timeRemaining === 0}
      />
    </div>
  )
}
