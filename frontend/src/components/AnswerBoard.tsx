import { AnswerBox } from './AnswerBox'
import type { AnswerGroup } from '../types'
import styles from './AnswerBoard.module.css'

interface Props {
  answerGroups: AnswerGroup[]
}

export function AnswerBoard({ answerGroups }: Props) {
  return (
    <div className={styles.board}>
      {answerGroups.map((answerGroup, index) => (
        <AnswerBox key={index} {...answerGroup} />
      ))}
    </div>
  )
}
