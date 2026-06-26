import type { ReactNode } from 'react'
import { GameTitle } from './GameTitle'
import styles from './SubMenu.module.css'

interface Props {
  children: ReactNode
  onDone: () => void
}

export function SubMenu({ children, onDone }: Props) {
  return (
    <div className={styles.container}>
      <GameTitle />
      <div className={styles.content}>{children}</div>
      <button className={styles.doneButton} onClick={onDone}>
        DONE
      </button>
    </div>
  )
}
