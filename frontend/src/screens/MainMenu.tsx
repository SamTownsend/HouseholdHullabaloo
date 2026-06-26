import { GameTitle } from '../components/GameTitle'
import styles from './MainMenu.module.css'

interface Props {
  onPlay: () => void
  onOptions: () => void
  onStats: () => void
  onAbout: () => void
}

export function MainMenu({ onPlay, onOptions, onStats, onAbout }: Props) {
  return (
    <div className={styles.container}>
      <GameTitle />
      <button className={styles.playButton} onClick={onPlay}>
        PLAY
      </button>
      <div className={styles.subMenuButtons}>
        <button className={styles.subMenuButton} onClick={onOptions}>
          OPTIONS
        </button>
        <button className={styles.subMenuButton} onClick={onStats}>
          STATS
        </button>
        <button className={styles.subMenuButton} onClick={onAbout}>
          ABOUT
        </button>
      </div>
    </div>
  )
}
