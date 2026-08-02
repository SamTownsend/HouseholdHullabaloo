import { DEFAULT_APP_STORAGE, type AppStorage, type AppStorageUpdate } from '../lib/storage'
import { getPackDisplayName } from '../lib/questionPacks'
import { SubMenu } from '../components/SubMenu'
import styles from './Options.module.css'

interface Props {
  appStorage: AppStorage
  setAppStorage: (update: AppStorageUpdate) => void
  onDone: () => void
}

export function Options({ appStorage, setAppStorage, onDone }: Props) {
  const packConfigs = appStorage.packConfigs ?? DEFAULT_APP_STORAGE.packConfigs
  const enabledCount = packConfigs.filter((p) => p.enabled).length

  function handleToggle(questionPack: number) {
    setAppStorage((prev) => ({
      ...prev,
      packConfigs: prev.packConfigs.map((p) =>
        p.id === questionPack ? { ...p, enabled: !p.enabled } : p
      ),
    }))
  }

  return (
    <SubMenu onDone={onDone}>
      <div className={styles.section}>
        <h2 className={styles.sectionHeading}>QUESTION PACKS</h2>
        <div className={styles.packList}>
          {packConfigs.map((pack) => (
            <label key={pack.id} className={styles.packItem}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={pack.enabled}
                disabled={pack.enabled && enabledCount === 1}
                onChange={() => handleToggle(pack.id)}
              />
              <span className={styles.packName}>{getPackDisplayName(pack.id)}</span>
            </label>
          ))}
        </div>
      </div>
    </SubMenu>
  )
}
