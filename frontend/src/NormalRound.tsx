import { useState, useEffect, useRef } from 'react'
import { GameBanner } from './components/GameBanner'
import { QuestionText } from './components/QuestionText'
import { AnswerBoard } from './components/AnswerBoard'
import { InputBanner } from './components/InputBanner'
import type { Game } from './types'
import styles from './NormalRound.module.css'

interface Props {
  initial: Game
}

export function NormalRound({ initial }: Props) {
  const [game, setGame] = useState<Game>(initial)
  const [timerRunning, setTimerRunning] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (timerRunning && game.timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setGame((prev) => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }))
      }, 1000)
    }
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerRunning, game.timeRemaining])

  function handleSubmit(answer: string) {
    console.log('Answer submitted:', answer)
    setTimerRunning(false)
  }

  return (
    <div className={styles.screen}>
      <GameBanner username={game.player.username} score={game.score} />
      <QuestionText text={game.question.text} />
      <AnswerBoard answers={game.question.answers} />
      <InputBanner
        timeRemaining={game.timeRemaining}
        onSubmit={handleSubmit}
        disabled={!timerRunning || game.timeRemaining === 0}
      />
    </div>
  )
}
