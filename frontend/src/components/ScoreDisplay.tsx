import styles from './ScoreDisplay.module.css'

interface Props {
  score: number
}

export function ScoreDisplay({ score }: Props) {
  return (
    <div className={styles.container}>
      <span className={styles.score}>{score}</span>
    </div>
  )
}
