import { ScoreDisplay } from './ScoreDisplay'
import styles from './GameBanner.module.css'

interface Props {
  username: string
  score: number
}

export function GameBanner({ username, score }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.username}>{username}</div>
      <ScoreDisplay score={score} />
    </div>
  )
}
