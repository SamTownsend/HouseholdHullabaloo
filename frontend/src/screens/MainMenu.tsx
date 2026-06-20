import styles from './MainMenu.module.css'

interface Props {
  onPlay: () => void
}

export function MainMenu({ onPlay }: Props) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Household Hullabaloo</h1>
      <button className={styles.playButton} onClick={onPlay}>
        PLAY
      </button>
    </div>
  )
}
