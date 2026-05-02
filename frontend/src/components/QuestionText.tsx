import styles from './QuestionText.module.css'

interface Props {
  text: string
}

export function QuestionText({ text }: Props) {
  return <p className={styles.question}>{text}</p>
}
