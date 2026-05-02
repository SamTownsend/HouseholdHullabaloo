import styles from './Timer.module.css'

interface Props {
  timeRemaining: number
}

export function Timer({ timeRemaining }: Props) {
  return (
    <div className={styles.container}>
      <span className={styles.time}>{`:${timeRemaining}`}</span>
    </div>
  )
}
