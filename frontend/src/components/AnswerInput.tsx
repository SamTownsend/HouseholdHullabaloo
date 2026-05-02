import { useState } from 'react'
import styles from './AnswerInput.module.css'

interface Props {
  onSubmit: (answer: string) => void
  disabled: boolean
}

export function AnswerInput({ onSubmit, disabled }: Props) {
  const [input, setInput] = useState('')

  function handleSubmit() {
    const trimmed = input.trim()
    if (trimmed === '') return
    onSubmit(trimmed)
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className={styles.container}>
      <input
        className={styles.input}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Type your answer..."
      />
      <button className={styles.submit} onClick={handleSubmit} disabled={disabled}>
        Submit
      </button>
    </div>
  )
}
