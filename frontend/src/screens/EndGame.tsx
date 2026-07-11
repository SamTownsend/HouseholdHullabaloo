import { HighScoresBoard } from '../components/HighScoresBoard'
import type { HighScore } from '../types'
import styles from './EndGame.module.css'

interface Props {
  householdName: string
  finalScore: number
  highScores: HighScore[]
  onDone: () => void
}

export function EndGame({ householdName, finalScore, highScores, onDone }: Props) {
  const entryIndex = highScores.findIndex((e) => e.name === householdName && e.score === finalScore)

  return (
    <div className={styles.screen}>
      <h1 className={styles.title}>High Scores</h1>
      <HighScoresBoard
        highScores={highScores}
        newEntryIndex={entryIndex !== -1 ? entryIndex : null}
      />
      <div className={styles.finalScore}>
        <span className={styles.finalScoreLabel}>{householdName}</span>
        <span className={styles.finalScoreValue}>{finalScore.toLocaleString()}</span>
      </div>
      <button className={styles.doneButton} onClick={onDone}>
        DONE
      </button>
    </div>
  )
}
