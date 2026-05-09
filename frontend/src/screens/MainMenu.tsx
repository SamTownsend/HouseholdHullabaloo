import styles from './MainMenu.module.css'

interface Props {
  onStartGame: () => void
}

export function MainMenu({ onStartGame }: Props) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Household Hullabaloo</h1>
      <button className={styles.startButton} onClick={onStartGame}>
        Start Game
      </button>
    </div>
  )
}
