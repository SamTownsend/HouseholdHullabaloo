import type { HighScore } from '../types'
import styles from './HighScoresBoard.module.css'

interface Props {
  highScores: HighScore[]
  newEntryIndex: number | null
}

export function HighScoresBoard({ highScores, newEntryIndex }: Props) {
  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.nameHeader}>NAME</th>
            <th className={styles.scoreHeader}>SCORE</th>
          </tr>
        </thead>
        <tbody>
          {highScores.map((entry, index) => (
            <tr
              key={index}
              className={`${styles.row} ${index === newEntryIndex ? styles.newEntry : ''}`}
            >
              <td className={styles.nameCell}>{entry.name}</td>
              <td className={styles.scoreCell}>{entry.score.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
