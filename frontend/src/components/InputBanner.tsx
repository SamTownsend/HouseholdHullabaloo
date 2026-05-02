import { AnswerInput } from './AnswerInput'
import { Timer } from './Timer'
import styles from './InputBanner.module.css'

interface Props {
  timeRemaining: number
  onSubmit: (answer: string) => void
  disabled: boolean
}

export function InputBanner({ timeRemaining, onSubmit, disabled }: Props) {
  return (
    <div className={styles.container}>
      <Timer timeRemaining={timeRemaining} />
      <AnswerInput onSubmit={onSubmit} disabled={disabled} />
    </div>
  )
}
