import styles from './AnswerBox.module.css'

interface Props {
  text: string
  points: number
  revealed: boolean
}

export function AnswerBox({ text, points, revealed }: Props) {
  return (
    <div className={styles.box}>
      <span className={`${styles.text} ${revealed ? styles.revealed : ''}`}>{text}</span>
      <span className={`${styles.points} ${revealed ? styles.revealed : ''}`}>{points}</span>
    </div>
  )
}
