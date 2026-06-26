import { useState } from 'react'
import type { Household } from '../types'
import { useLocalStorage } from '../hooks/useLocalStorage'
import {
  APP_STORAGE_KEY,
  DEFAULT_APP_STORAGE,
  MAX_HOUSEHOLDS,
  type AppStorage,
} from '../lib/storage'
import { GameTitle } from '../components/GameTitle'
import styles from './HouseholdSelect.module.css'

interface Props {
  onStartGame: (household: Household) => void
}

export function HouseholdSelect({ onStartGame }: Props) {
  const [newHousehold, setNewHousehold] = useState('')
  const [selectedHousehold, setSelectedHousehold] = useState('')
  const [appStorage, setAppStorage] = useLocalStorage<AppStorage>(
    APP_STORAGE_KEY,
    DEFAULT_APP_STORAGE
  )

  const chosenName = newHousehold.trim() || selectedHousehold

  // Determines which household to start the game with and updates the household list in local storage accordingly
  function handleStartGame() {
    if (!chosenName) {
      return
    }

    // User typed in a name
    if (newHousehold.trim()) {
      const newName = newHousehold.trim()

      // If the typed name is already in the list, use the existing entry
      const existing = appStorage.households.find((h) => h.name === newName)
      if (existing) {
        const updatedHouseholds = [
          existing,
          ...appStorage.households.filter((h) => h.name !== newName),
        ]
        setAppStorage({ ...appStorage, households: updatedHouseholds })
        onStartGame(existing)
      }
      // Otherwise, create and save a new household object
      else {
        const household: Household = { name: newName, gamesPlayed: 0, lifetimeScore: 0 }
        const updatedHouseholds = [household, ...appStorage.households].slice(0, MAX_HOUSEHOLDS)
        setAppStorage({ ...appStorage, households: updatedHouseholds })
        onStartGame(household)
      }
    }
    // User selected a household from the dropdown
    else {
      const existing = appStorage.households.find((h) => h.name === selectedHousehold)
      if (existing) {
        const updatedHouseholds = [
          existing,
          ...appStorage.households.filter((h) => h.name !== selectedHousehold),
        ]
        setAppStorage({ ...appStorage, households: updatedHouseholds })
        onStartGame(existing)
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && chosenName) {
      handleStartGame()
    }
  }

  return (
    <div className={styles.container}>
      <GameTitle />
      <div className={styles.form}>
        <label className={styles.label} htmlFor="new-household">
          Create new household
        </label>
        <input
          id="new-household"
          className={styles.input}
          type="text"
          maxLength={18}
          value={newHousehold}
          onChange={(e) => setNewHousehold(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="ENTER HOUSEHOLD NAME..."
        />
        <div className={styles.separator}>
          <span>OR</span>
        </div>
        <label className={styles.label} htmlFor="select-household">
          Select existing household
        </label>
        <select
          id="select-household"
          className={`${styles.select} ${selectedHousehold === '' ? styles.selectUnchosen : ''}`}
          value={selectedHousehold}
          onChange={(e) => setSelectedHousehold(e.target.value)}
        >
          <option value="">CHOOSE A HOUSEHOLD...</option>
          {appStorage.households.map((household) => (
            <option key={household.name} value={household.name}>
              {household.name}
            </option>
          ))}
        </select>
        <button className={styles.startButton} disabled={!chosenName} onClick={handleStartGame}>
          START GAME
        </button>
      </div>
    </div>
  )
}
