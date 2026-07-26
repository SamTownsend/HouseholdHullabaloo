import { useState } from 'react'
import { useInterval } from '../hooks/useInterval'
import styles from './QuestionText.module.css'

interface Props {
  text: string
  revealIntervalMs: number
  onRevealComplete?: () => void
}

export function QuestionText({ text, revealIntervalMs, onRevealComplete }: Props) {
  const totalChars = Math.max(text.length, 1)
  const [visibleCharCount, setVisibleCharCount] = useState(0)
  const revealing = visibleCharCount < totalChars

  useInterval(
    () => {
      const next = visibleCharCount + 1
      setVisibleCharCount(next)
      if (next >= totalChars) {
        onRevealComplete?.()
      }
    },
    revealing ? revealIntervalMs : null
  )

  return (
    <p className={styles.question}>
      <span className={styles.visible}>{text.slice(0, visibleCharCount)}</span>
      <span className={styles.hidden}>{text.slice(visibleCharCount)}</span>
    </p>
  )
}
