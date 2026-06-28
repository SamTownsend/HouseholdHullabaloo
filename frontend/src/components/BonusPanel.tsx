import type { BonusSlot } from '../types'
import styles from './BonusPanel.module.css'

interface Props {
  slots: BonusSlot[]
  scoredUpTo: number
}

export function BonusPanel({ slots, scoredUpTo }: Props) {
  return (
    <div className={styles.panel}>
      {slots.map((slot, index) => {
        const revealed = index < scoredUpTo
        return (
          <div key={index} className={styles.row}>
            <div className={styles.answerText}>{slot.answerText}</div>
            <div className={`${styles.scoreCell}${revealed ? ` ${styles.scoreCellRevealed}` : ''}`}>
              {revealed ? (slot.pointValue ?? '') : ''}
            </div>
          </div>
        )
      })}
    </div>
  )
}
