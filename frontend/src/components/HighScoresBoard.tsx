import type { HighScore } from '../types'
import { MAX_HIGH_SCORES } from '../lib/storage'
import styles from './HighScoresBoard.module.css'

interface Props {
  highScores: HighScore[]
  newEntryIndex: number | null
}

export function HighScoresBoard({ highScores, newEntryIndex }: Props) {
  const paddedScores: (HighScore | null)[] = [...highScores]
  while (paddedScores.length < MAX_HIGH_SCORES) {
    paddedScores.push(null)
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>High Scores</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.nameHeader}>NAME</th>
            <th className={styles.scoreHeader}>SCORE</th>
          </tr>
        </thead>
        <tbody>
          {paddedScores.map((entry, index) => (
            <tr
              key={index}
              className={`${styles.row} ${index === newEntryIndex ? styles.newEntry : ''}`}
            >
              <td className={styles.nameCell}>{entry?.name ?? '\u00A0'}</td>
              <td className={styles.scoreCell}>
                {entry != null ? entry.score.toLocaleString() : '\u00A0'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
