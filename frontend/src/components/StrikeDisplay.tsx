import styles from './StrikeDisplay.module.css'

interface Props {
  strikes: number
}

export function StrikeDisplay({ strikes }: Props) {
  return (
    <div className={styles.container}>
      <span className={styles.strike}>{'X '.repeat(strikes)}</span>
    </div>
  )
}
