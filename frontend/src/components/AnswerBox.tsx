import styles from './AnswerBox.module.css'

interface Props {
  rank: number
  text: string
  points: number
  revealed: boolean
}

export function AnswerBox({ rank, text, points, revealed }: Props) {
  return (
    <div className={styles.box}>
      <div className={styles.hidden} style={{ opacity: revealed ? 0 : 1 }}>
        <div className={styles.rank} style={{ visibility: rank > 0 ? 'visible' : 'hidden' }}>
          {rank}
        </div>
      </div>
      <div className={styles.revealed} style={{ opacity: revealed ? 1 : 0 }}>
        <span className={styles.text}>{text}</span>
        <span className={styles.points}>{points}</span>
      </div>
    </div>
  )
}
