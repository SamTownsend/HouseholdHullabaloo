import { DEFAULT_APP_STORAGE, type AppStorage } from '../lib/storage'
import { getPackDisplayName } from '../lib/questionPacks'
import { SubMenu } from '../components/SubMenu'
import styles from './Options.module.css'

interface Props {
  appStorage: AppStorage
  setAppStorage: (value: AppStorage) => void
  onDone: () => void
}

export function Options({ appStorage, setAppStorage, onDone }: Props) {
  const packConfigs = appStorage.packConfigs ?? DEFAULT_APP_STORAGE.packConfigs
  const enabledCount = packConfigs.filter((p) => p.enabled).length

  function handleToggle(questionPack: number) {
    setAppStorage({
      ...appStorage,
      packConfigs: packConfigs.map((p) =>
        p.questionPack === questionPack ? { ...p, enabled: !p.enabled } : p
      ),
    })
  }

  return (
    <SubMenu onDone={onDone}>
      <div className={styles.section}>
        <h2 className={styles.sectionHeading}>QUESTION PACKS</h2>
        <div className={styles.packList}>
          {packConfigs.map((pack) => (
            <label key={pack.questionPack} className={styles.packItem}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={pack.enabled}
                disabled={pack.enabled && enabledCount === 1}
                onChange={() => handleToggle(pack.questionPack)}
              />
              <span className={styles.packName}>{getPackDisplayName(pack.questionPack)}</span>
            </label>
          ))}
        </div>
      </div>
    </SubMenu>
  )
}
