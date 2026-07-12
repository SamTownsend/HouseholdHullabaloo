import { HighScoresBoard } from '../components/HighScoresBoard'
import type { Session, HighScore } from '../types'
import { getFinalScore } from '../lib/scoring'
import styles from './EndGame.module.css'

interface Props {
  session: Session
  highScores: HighScore[]
  onDone: () => void
}

export function EndGame({ session, highScores, onDone }: Props) {
  const finalScore = getFinalScore(session.score, session.bonusScore)
  const entryIndex = highScores.findIndex(
    (e) => e.name === session.household.name && e.score === finalScore
  )

  let scoreBreakdown: string
  if (session.bonusScore === 0) {
    scoreBreakdown = finalScore.toLocaleString()
  } else if (session.bonusScore < 200) {
    scoreBreakdown = `${session.score.toLocaleString()} + ${session.bonusScore.toLocaleString()} x 5 = ${finalScore.toLocaleString()}`
  } else {
    scoreBreakdown = `${session.score.toLocaleString()} + ${session.bonusScore.toLocaleString()} + ${(20000).toLocaleString()} = ${finalScore.toLocaleString()}`
  }

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <h1 className={styles.title}>{session.household.name}'S FINAL SCORE</h1>
        <p className={styles.scoreBreakdown}>{scoreBreakdown}</p>
      </div>
      <HighScoresBoard
        highScores={highScores}
        newEntryIndex={entryIndex !== -1 ? entryIndex : null}
      />
      <button className={styles.doneButton} onClick={onDone}>
        DONE
      </button>
    </div>
  )
}
