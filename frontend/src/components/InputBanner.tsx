import { useState } from 'react'
import styles from './InputBanner.module.css'

interface Props {
  timeRemaining: number
  onSubmit: (answer: string) => void
  disabled: boolean
}

export function InputBanner({ timeRemaining, onSubmit, disabled }: Props) {
  const [inputText, setInputText] = useState('')

  function handleSubmit() {
    const trimmed = inputText.trim()
    if (trimmed === '') return
    onSubmit(trimmed)
    setInputText('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className={styles.container} style={{ opacity: disabled ? 0.5 : 1 }}>
      <div className={styles.timer}>:{String(timeRemaining).padStart(2, '0')}</div>
      <input
        className={styles.input}
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={disabled ? '' : 'Type your answer...'}
      />
      <button className={styles.submit} onClick={handleSubmit} disabled={disabled}>
        Submit
      </button>
    </div>
  )
}
