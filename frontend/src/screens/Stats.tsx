import { SubMenu } from '../components/SubMenu'
import { HighScoresBoard } from '../components/HighScoresBoard'
import type { AppStorage } from '../lib/storage'
import styles from './Stats.module.css'

interface Props {
  appStorage: AppStorage
  onDone: () => void
}

export function Stats({ appStorage, onDone }: Props) {
  return (
    <SubMenu onDone={onDone}>
      <div className={styles.stats}>
        <HighScoresBoard highScores={appStorage.highScores} newEntryIndex={null} />
        <div className={styles.accountStats}>
          <span>Games Played - {appStorage.gamesPlayed}</span>
          <span>Lifetime Score - {appStorage.lifetimeScore.toLocaleString()}</span>
        </div>
      </div>
    </SubMenu>
  )
}
