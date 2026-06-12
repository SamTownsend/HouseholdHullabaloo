import { useState, useEffect, useRef } from 'react'
import { GameBanner } from '../components/GameBanner'
import { QuestionText } from '../components/QuestionText'
import { AnswerBoard } from '../components/AnswerBoard'
import { InputBanner } from '../components/InputBanner'
import { surveySays } from '../lib/answerMatching/surveySays'
import { type Game, type QuestionDocument, type AnswerGroup, HarvOutcomes } from '../types'
import styles from './NormalRound.module.css'

export function NormalRound() {
  const [game, setGame] = useState<Game | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(30)
  const [timerRunning, setTimerRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function fetchQuestion() {
      try {
        const res = await fetch('/api/questions/random')
        const doc: QuestionDocument = await res.json()
        console.log(doc)

        // Add gameplay properties
        const roundAnswerGroups: AnswerGroup[] = doc.answerGroups.map((group, i) => ({
          ...group,
          rank: i + 1,
          revealed: false,
        }))

        // Fill remaining answer board spaces
        while (roundAnswerGroups.length < 8) {
          roundAnswerGroups.push({
            rank: 0,
            pointValue: 0,
            revealed: false,
            displayText: '',
            answers: [],
          })
        }

        setGame({
          player: { username: 'NEW ERA' },
          score: 0,
          question: { ...doc, answerGroups: roundAnswerGroups },
        })
        setTimerRunning(true)
      } catch (err) {
        console.error('Failed to fetch question:', err)
      }
    }

    fetchQuestion()
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
          score: prev.score + prev.question.answerGroups[result.matchedIndex!].pointValue,
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
