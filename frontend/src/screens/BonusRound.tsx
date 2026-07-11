import { useState } from 'react'
import { useInterval } from '../hooks/useInterval'
import { QuestionText } from '../components/QuestionText'
import { BonusPanel } from '../components/BonusPanel'
import { TopAnswersPanel } from '../components/TopAnswersPanel'
import { InputBanner } from '../components/InputBanner'
import { surveySays } from '../lib/answerMatching/surveySays'
import { type Question, type BonusSlot, type BonusPhase, HarvOutcomes } from '../types'
import styles from './BonusRound.module.css'

const TIMER_SECONDS_BATCH1 = 60
const TIMER_SECONDS_BATCH2 = 65
const REVEAL_INTERVAL_MS = 4000
const POST_BATCH_DELAY_MS = 2000
const POST_TOP_ANSWERS_DELAY_MS = 3000

interface Props {
  bonusQuestions: Question[]
  onBonusRoundEnd: (bonusScore: number) => void
}

function initBatch(questionCount: number): BonusSlot[] {
  return Array.from({ length: questionCount }, () => ({
    answerText: '',
    pointValue: null,
  }))
}

export function BonusRound({ bonusQuestions, onBonusRoundEnd }: Props) {
  const questionCount = bonusQuestions.length
  const [questions, setQuestions] = useState<Question[]>(bonusQuestions)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [phase, setPhase] = useState<BonusPhase>('batch1_answering')

  const [batch1, setBatch1] = useState<BonusSlot[]>(() => initBatch(questionCount))
  const [batch1ScoredUpTo, setBatch1ScoredUpTo] = useState(0)
  const [batch2, setBatch2] = useState<BonusSlot[]>(() => initBatch(questionCount))
  const [batch2ScoredUpTo, setBatch2ScoredUpTo] = useState(0)

  const isFirstBatch = phase === 'batch1_answering' || phase === 'batch1_scoring'
  const currentBatch = isFirstBatch ? batch1 : batch2
  const setCurrentBatch = isFirstBatch ? setBatch1 : setBatch2

  const [total, setTotal] = useState(0)
  const [revealedTopAnswers, setRevealedTopAnswers] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(TIMER_SECONDS_BATCH1)
  const [timerRunning, setTimerRunning] = useState(true)

  // Derived values
  const showBatch2 = phase === 'batch2_answering' || phase === 'batch2_scoring'
  const totalUnderBatch1 = phase === 'batch1_scoring' || phase === 'batch2_answering'
  const totalUnderBatch2 = phase === 'batch2_scoring'
  const showTopAnswers = phase === 'batch2_scoring'
  const showInputBanner = phase === 'batch1_answering' || phase === 'batch2_answering'

  let displayedQuestion: Question | undefined
  if (phase === 'batch1_scoring') {
    displayedQuestion = questions[batch1ScoredUpTo]
  } else if (phase === 'batch2_scoring') {
    displayedQuestion = questions[revealedTopAnswers]
  } else {
    displayedQuestion = questions[currentQuestionIndex]
  }

  function endBatch(batch: BonusSlot[]) {
    setTimerRunning(false)

    const updatedBatch: BonusSlot[] = []
    const updatedQuestions: Question[] = []
    batch.forEach((slot, index) => {
      const question = questions[index]
      const result = surveySays(question.answerGroups, slot.answerText)

      if (result.outcome === HarvOutcomes.Correct) {
        // Assign point value to slot
        const updatedSlot = {
          ...slot,
          pointValue: question.answerGroups[result.matchedIndex].pointValue,
        }

        // Flag the matched answer as revealed
        const updatedQuestion = {
          ...question,
          answerGroups: question.answerGroups.map((group, groupIndex) =>
            groupIndex === result.matchedIndex ? { ...group, revealed: true } : group
          ),
        }

        updatedBatch.push(updatedSlot)
        updatedQuestions.push(updatedQuestion)
      } else {
        // Incorrect answer gets zero points
        const updatedSlot = {
          ...slot,
          pointValue: 0,
        }

        updatedBatch.push(updatedSlot)
        updatedQuestions.push(question)
      }
    })
    setCurrentBatch(updatedBatch)
    setQuestions(updatedQuestions)

    const nextPhase: BonusPhase = phase === 'batch1_answering' ? 'batch1_scoring' : 'batch2_scoring'
    setPhase(nextPhase)
  }

  function handleSubmit(userInput: string) {
    // Prevent the player from submitting a duplicate answer in the second batch
    const result = surveySays(questions[currentQuestionIndex].answerGroups, userInput)
    if (result.outcome === HarvOutcomes.Duplicate) {
      return
    }

    const updated = currentBatch.map((s, i) =>
      i === currentQuestionIndex ? { ...s, answerText: userInput } : s
    )

    const isLastQuestion = currentQuestionIndex === questionCount - 1
    if (isLastQuestion) {
      endBatch(updated)
    } else {
      setCurrentBatch(updated)
      setCurrentQuestionIndex((i) => i + 1)
    }
  }

  // Interval for managing the countdown timer
  useInterval(
    () => {
      if (timeRemaining > 0) {
        setTimeRemaining((t) => t - 1)
      } else {
        endBatch(currentBatch)
      }
    },
    timerRunning ? 1000 : null
  )

  // Interval for scoring each answer and revealing top answers
  useInterval(
    () => {
      if (phase === 'batch1_scoring') {
        if (batch1ScoredUpTo >= questionCount) {
          return
        }

        const updatedTotal = total + (batch1[batch1ScoredUpTo].pointValue ?? 0)
        const next = batch1ScoredUpTo + 1
        setTotal(updatedTotal)
        setBatch1ScoredUpTo(next)

        // Continue to the next batch
        if (next >= questionCount) {
          setTimeout(() => {
            setCurrentQuestionIndex(0)
            setTimeRemaining(TIMER_SECONDS_BATCH2)
            setTimerRunning(true)
            setPhase('batch2_answering')
          }, POST_BATCH_DELAY_MS)
        }
      } else if (phase === 'batch2_scoring') {
        // Reveal next score
        if (batch2ScoredUpTo === revealedTopAnswers) {
          if (batch2ScoredUpTo >= questionCount) {
            return
          }

          const updatedTotal = total + (batch2[batch2ScoredUpTo].pointValue ?? 0)
          const next = batch2ScoredUpTo + 1
          setTotal(updatedTotal)
          setBatch2ScoredUpTo(next)
        }
        // Reveal next top answer
        else {
          const next = revealedTopAnswers + 1
          setRevealedTopAnswers(next)
          if (next >= questionCount) {
            setTimeout(() => onBonusRoundEnd(total), POST_TOP_ANSWERS_DELAY_MS)
          }
        }
      }
    },
    phase === 'batch1_scoring' || phase === 'batch2_scoring' ? REVEAL_INTERVAL_MS : null
  )

  return (
    <div className={styles.screen}>
      <div className={styles.questionWrapper}>
        <QuestionText text={displayedQuestion?.questionText ?? ''} />
      </div>

      <div className={styles.panels}>
        <div className={styles.panelGroup}>
          <BonusPanel slots={batch1} scoredUpTo={batch1ScoredUpTo} />
          <div style={{ visibility: totalUnderBatch1 ? 'visible' : 'hidden', display: 'contents' }}>
            <div className={styles.totalBox}>
              <div className={styles.totalLabel}>TOTAL</div>
              <div className={`${styles.scoreCell} ${styles.scoreCellRevealed}`}>{total}</div>
            </div>
          </div>
        </div>

        {showBatch2 && (
          <div className={styles.panelGroup}>
            <BonusPanel slots={batch2} scoredUpTo={batch2ScoredUpTo} />
            <div
              style={{ visibility: totalUnderBatch2 ? 'visible' : 'hidden', display: 'contents' }}
            >
              <div className={styles.totalBox}>
                <div className={styles.totalLabel}>TOTAL</div>
                <div className={`${styles.scoreCell} ${styles.scoreCellRevealed}`}>{total}</div>
              </div>
            </div>
          </div>
        )}

        {showTopAnswers && (
          <div className={styles.panelGroup}>
            <TopAnswersPanel questions={questions} revealedUpTo={revealedTopAnswers} />
          </div>
        )}
      </div>

      <div style={{ visibility: showInputBanner ? 'visible' : 'hidden', display: 'contents' }}>
        <InputBanner
          timeRemaining={timeRemaining}
          onSubmit={handleSubmit}
          disabled={!showInputBanner}
        />
      </div>
    </div>
  )
}
