import { useState } from 'react'
import styles from './HouseholdSelect.module.css'

const PLACEHOLDER_HOUSEHOLDS = ['The Smiths', 'The Johnsons', 'The Williams']

interface props {
  onPlay: (username: string) => void
}

export function HouseholdSelect({ onPlay }: props) {
  const [newHousehold, setNewHousehold] = useState('')
  const [selectedHousehold, setSelectedHousehold] = useState('')

  const chosenUsername = newHousehold.trim() || selectedHousehold

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
          value={newHousehold}
          onChange={(e) => setNewHousehold(e.target.value.toUpperCase())}
          placeholder="Enter household name..."
        />
        <div className={styles.separator}>
          <span>OR</span>
        </div>
        <label className={styles.label} htmlFor="select-household">
          Select existing household
        </label>
        <select
          id="select-household"
          className={styles.select}
          value={selectedHousehold}
          onChange={(e) => setSelectedHousehold(e.target.value)}
        >
          <option value="">-- choose --</option>
          {PLACEHOLDER_HOUSEHOLDS.map((household) => (
            <option key={household} value={household}>
              {household}
            </option>
          ))}
        </select>
        <button
          className={styles.playButton}
          disabled={!chosenUsername}
          onClick={() => onPlay(chosenUsername)}
        >
          PLAY
        </button>
      </div>
    </div>
  )
}
