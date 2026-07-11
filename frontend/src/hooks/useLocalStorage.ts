import { useState } from 'react'
import {
  APP_STORAGE_KEY,
  DEFAULT_APP_STORAGE,
  migrateStorage,
  type AppStorage,
} from '../lib/storage'

export function useLocalStorage(): [AppStorage, (value: AppStorage) => void] {
  const [storedValue, setStoredValue] = useState<AppStorage>(() => {
    try {
      const item = localStorage.getItem(APP_STORAGE_KEY)
      if (item === null) {
        return DEFAULT_APP_STORAGE
      }

      const migrated = migrateStorage(JSON.parse(item))
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(migrated))

      return migrated
    } catch {
      return DEFAULT_APP_STORAGE
    }
  })

  function setValue(value: AppStorage) {
    try {
      setStoredValue(value)
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(value))
    } catch (error) {
      console.error(`useLocalStorage: failed to write app storage`, error)
    }
  }

  return [storedValue, setValue]
}
