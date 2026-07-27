import { useEffect, useState } from 'react'
import { useInterval } from '../hooks/useInterval'
import styles from './QuestionText.module.css'

interface Props {
  text: string
  revealIntervalMs: number
  initialDelayMs?: number
  onRevealComplete?: () => void
}

export function QuestionText({
  text,
  revealIntervalMs,
  initialDelayMs = 0,
  onRevealComplete,
}: Props) {
  const totalChars = Math.max(text.length, 1)
  const [visibleCharCount, setVisibleCharCount] = useState(0)
  const [delayElapsed, setDelayElapsed] = useState(initialDelayMs === 0)

  useEffect(() => {
    if (initialDelayMs === 0) {
      return
    }

    const id = setTimeout(() => setDelayElapsed(true), initialDelayMs)
    return () => clearTimeout(id)
  }, [initialDelayMs])

  const revealing = delayElapsed && visibleCharCount < totalChars

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
