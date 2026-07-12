import { useEffect } from 'react'
import { ScoreDisplay } from '../components/ScoreDisplay'
import { type Session } from '../types'
import styles from './ScoreCompare.module.css'

interface Props {
  session: Session
  onContinue: () => void
}

export function ScoreCompare({ session, onContinue }: Props) {
  useEffect(() => {
    const id = setTimeout(onContinue, 3000)
    return () => clearTimeout(id)
  }, [onContinue])

  return (
    <div className={styles.screen}>
      <div className={styles.column}>
        <p className={styles.label}>{session.household.name}'s Score</p>
        <ScoreDisplay score={session.score} />
      </div>
      <div className={styles.column}>
        <p className={styles.label}>Average Score</p>
        <ScoreDisplay score={session.averageScore} />
      </div>
    </div>
  )
}
