import { AnswerBox } from './AnswerBox'
import type { Answer } from '../types'
import styles from './AnswerBoard.module.css'

interface Props {
  answers: Answer[]
}

export function AnswerBoard({ answers }: Props) {
  return (
    <div className={styles.board}>
      {answers.map((answer, index) => (
        <AnswerBox key={index} {...answer} />
      ))}
    </div>
  )
}
