import type { Question } from '../types'
import styles from './TopAnswersPanel.module.css'

interface Props {
  questions: Question[]
  revealedUpTo: number
}

export function TopAnswersPanel({ questions, revealedUpTo }: Props) {
  return (
    <div className={styles.container}>
      <p className={styles.label}>Top Answers</p>
      <div className={styles.panel}>
        {questions.map((q, index) => {
          const revealed = index < revealedUpTo
          const topAnswer = q.answerGroups[0]?.displayText ?? ''
          return (
            <div key={index} className={styles.row}>
              {revealed ? topAnswer : ''}
            </div>
          )
        })}
      </div>
    </div>
  )
}
