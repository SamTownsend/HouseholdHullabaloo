import { useState } from 'react'
import {
  APP_STORAGE_KEY,
  migrateStorage,
  type AppStorage,
  type AppStorageUpdate,
} from '../lib/storage'

export function useLocalStorage(): [AppStorage, (update: AppStorageUpdate) => void] {
  const [storedValue, setStoredValue] = useState<AppStorage>(() => {
    try {
      const item = localStorage.getItem(APP_STORAGE_KEY)
      const migrated = migrateStorage(item === null ? null : JSON.parse(item))
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(migrated))
      return migrated
    } catch {
      return migrateStorage(null)
    }
  })

  function setValue(update: AppStorageUpdate) {
    setStoredValue((prev) => {
      const next = typeof update === 'function' ? update(prev) : update
      try {
        localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(next))
      } catch (error) {
        console.error(`useLocalStorage: failed to write app storage`, error)
      }
      return next
    })
  }

  return [storedValue, setValue]
}
