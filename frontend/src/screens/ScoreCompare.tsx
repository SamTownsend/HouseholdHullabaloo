import { useEffect } from 'react'
import { ScoreDisplay } from '../components/ScoreDisplay'
import styles from './ScoreCompare.module.css'

interface Props {
  username: string
  score: number
  averageScore: number
  onContinue: () => void
}

export function ScoreCompare({ username, score, averageScore, onContinue }: Props) {
  useEffect(() => {
    const id = setTimeout(onContinue, 3000)
    return () => clearTimeout(id)
  }, [onContinue])

  return (
    <div className={styles.screen}>
      <div className={styles.column}>
        <p className={styles.label}>{username}'s Score</p>
        <ScoreDisplay score={score} />
      </div>
      <div className={styles.column}>
        <p className={styles.label}>Average Score</p>
        <ScoreDisplay score={averageScore} />
      </div>
    </div>
  )
}
