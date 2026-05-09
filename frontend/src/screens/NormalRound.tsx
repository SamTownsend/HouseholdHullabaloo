import { useState, useEffect, useRef } from 'react'
import { GameBanner } from '../components/GameBanner'
import { QuestionText } from '../components/QuestionText'
import { AnswerBoard } from '../components/AnswerBoard'
import { InputBanner } from '../components/InputBanner'
import type { Game } from '../types'
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

  function handleSubmit(answer: string) {
    console.log('Answer submitted:', answer)
    setTimerRunning(false)
  }

  if (game === null) {
    return <p>Loading...</p>
  }

  return (
    <div className={styles.screen}>
      <GameBanner username={game.player.username} score={game.score} />
      <QuestionText text={game.question.text} />
      <AnswerBoard answers={game.question.answers} />
      <InputBanner
        timeRemaining={timeRemaining}
        onSubmit={handleSubmit}
        disabled={!timerRunning || timeRemaining === 0}
      />
    </div>
  )
}
