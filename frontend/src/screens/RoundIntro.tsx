import { useEffect, useState } from 'react'
import styles from './RoundIntro.module.css'

const MULTIPLIER_DELAY_MS = 1250
const CONTINUE_DELAY_MS = 3000

interface Props {
  label: string
  multiplierLabel: string
  onContinue: () => void
}

export function RoundIntro({ label, multiplierLabel, onContinue }: Props) {
  const [showMultiplier, setShowMultiplier] = useState(false)

  useEffect(() => {
    const totalDelay = multiplierLabel ? MULTIPLIER_DELAY_MS + CONTINUE_DELAY_MS : CONTINUE_DELAY_MS
    const showMultiplierId = setTimeout(() => setShowMultiplier(true), MULTIPLIER_DELAY_MS)
    const continueId = setTimeout(onContinue, totalDelay)

    return () => {
      clearTimeout(showMultiplierId)
      clearTimeout(continueId)
    }
  }, [multiplierLabel, onContinue])

  return (
    <div className={styles.screen}>
      <h1 className={styles.heading}>{label}</h1>
      <h2
        className={styles.subheading}
        style={{ visibility: showMultiplier ? 'visible' : 'hidden' }}
      >
        {multiplierLabel}
      </h2>
    </div>
  )
}
