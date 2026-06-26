import { ScoreDisplay } from './ScoreDisplay'
import styles from './GameBanner.module.css'

interface Props {
  householdName: string
  score: number
}

export function GameBanner({ householdName, score }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.username}>{householdName}</div>
      <ScoreDisplay score={score} />
    </div>
  )
}
