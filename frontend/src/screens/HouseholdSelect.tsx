import { useState } from 'react'
import styles from './HouseholdSelect.module.css'

const PLACEHOLDER_HOUSEHOLDS = [
  'SMITH SYNDICATE',
  'THE JOHNSONS',
  "WILLIAM'S WARRIORS",
  'AAAAAAAAAAAAAAAAAA',
  'WWWWWWWWWWWWWWWWWW',
]

interface props {
  onStartGame: (username: string) => void
}

export function HouseholdSelect({ onStartGame }: props) {
  const [newHousehold, setNewHousehold] = useState('')
  const [selectedHousehold, setSelectedHousehold] = useState('')

  const chosenUsername = newHousehold.trim() || selectedHousehold

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && chosenUsername) {
      onStartGame(chosenUsername)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Household Hullabaloo</h1>
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
          {PLACEHOLDER_HOUSEHOLDS.map((household) => (
            <option key={household} value={household}>
              {household}
            </option>
          ))}
        </select>
        <button
          className={styles.startButton}
          disabled={!chosenUsername}
          onClick={() => onStartGame(chosenUsername)}
        >
          START GAME
        </button>
      </div>
    </div>
  )
}
