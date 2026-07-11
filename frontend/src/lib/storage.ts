import type { Household, QuestionPackConfig, HighScore } from '../types'

export const APP_STORAGE_KEY = 'householdhullabaloo'
export const MAX_HOUSEHOLDS = 100
export const MAX_HIGH_SCORES = 10

interface AppStorageV1 {
  version: 1
  households: Household[]
  packConfigs: QuestionPackConfig[]
}

export interface AppStorage {
  version: 2
  households: Household[]
  packConfigs: QuestionPackConfig[]
  highScores: HighScore[]
  gamesPlayed: number
  lifetimeScore: number
}

export const DEFAULT_APP_STORAGE: AppStorage = {
  version: 2,
  households: [],
  packConfigs: [
    { questionPack: 1, enabled: true, offset: 0 },
    { questionPack: 2, enabled: true, offset: 0 },
    { questionPack: 3, enabled: true, offset: 0 },
    { questionPack: 4, enabled: true, offset: 0 },
    { questionPack: 5, enabled: true, offset: 0 },
    { questionPack: 6, enabled: true, offset: 0 },
  ],
  highScores: [],
  gamesPlayed: 0,
  lifetimeScore: 0,
}

function isAppStorageV1(obj: object): obj is AppStorageV1 {
  const fields = obj as Record<string, unknown>
  return (
    fields.version === 1 && Array.isArray(fields.households) && Array.isArray(fields.packConfigs)
  )
}

function isAppStorage(obj: object): obj is AppStorage {
  const fields = obj as Record<string, unknown>
  return (
    fields.version === 2 &&
    Array.isArray(fields.households) &&
    Array.isArray(fields.packConfigs) &&
    Array.isArray(fields.highScores) &&
    typeof fields.gamesPlayed === 'number' &&
    typeof fields.lifetimeScore === 'number'
  )
}

export function migrateStorage(raw: unknown): AppStorage {
  if (typeof raw !== 'object' || raw === null) {
    return DEFAULT_APP_STORAGE
  }

  if (isAppStorage(raw)) {
    return raw
  }

  if (isAppStorageV1(raw)) {
    return migrateStorage({
      version: 2,
      households: raw.households,
      packConfigs: raw.packConfigs,
      highScores: [],
      gamesPlayed: 0,
      lifetimeScore: 0,
    })
  }

  return DEFAULT_APP_STORAGE
}
