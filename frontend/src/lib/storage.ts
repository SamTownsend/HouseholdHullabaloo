import type { Household, QuestionPackConfig, HighScore } from '../types'

export const APP_STORAGE_KEY = 'householdhullabaloo'
export const MAX_HOUSEHOLDS = 100
export const MAX_HIGH_SCORES = 10

interface QuestionPackConfigV1 {
  questionPack: number
  enabled: boolean
  offset: number
}

interface AppStorageV1 {
  version: 1
  households: Household[]
  packConfigs: QuestionPackConfigV1[]
}

export interface AppStorageV2 {
  version: 2
  households: Household[]
  packConfigs: QuestionPackConfigV1[]
  highScores: HighScore[]
  gamesPlayed: number
  lifetimeScore: number
}

export interface AppStorage {
  version: 3
  playerId: string
  households: Household[]
  packConfigs: QuestionPackConfig[]
  highScores: HighScore[]
  gamesPlayed: number
  lifetimeScore: number
}

export type AppStorageUpdate = AppStorage | ((prev: AppStorage) => AppStorage)

export const DEFAULT_APP_STORAGE: AppStorage = {
  version: 3,
  playerId: '', // placeholder only; freshAppStorage() always overwrites this with a real id
  households: [],
  packConfigs: [
    { id: 1, enabled: true, offset: 0 },
    { id: 2, enabled: true, offset: 0 },
    { id: 3, enabled: true, offset: 0 },
    { id: 4, enabled: true, offset: 0 },
    { id: 5, enabled: true, offset: 0 },
    { id: 6, enabled: true, offset: 0 },
  ],
  highScores: [],
  gamesPlayed: 0,
  lifetimeScore: 0,
}

function newAppStorage(): AppStorage {
  return { ...DEFAULT_APP_STORAGE, playerId: crypto.randomUUID() }
}

function isAppStorageV1(obj: object): obj is AppStorageV1 {
  const fields = obj as Record<string, unknown>
  return (
    fields.version === 1 && Array.isArray(fields.households) && Array.isArray(fields.packConfigs)
  )
}

function isAppStorageV2(obj: object): obj is AppStorageV2 {
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

function isAppStorage(obj: object): obj is AppStorage {
  const fields = obj as Record<string, unknown>
  return (
    fields.version === 3 &&
    typeof fields.playerId === 'string' &&
    Array.isArray(fields.households) &&
    Array.isArray(fields.packConfigs) &&
    Array.isArray(fields.highScores) &&
    typeof fields.gamesPlayed === 'number' &&
    typeof fields.lifetimeScore === 'number'
  )
}

export function migrateStorage(raw: unknown): AppStorage {
  if (typeof raw !== 'object' || raw === null) {
    return newAppStorage()
  }

  if (isAppStorage(raw)) {
    return raw
  }

  if (isAppStorageV2(raw)) {
    return {
      version: 3,
      households: raw.households,
      packConfigs: raw.packConfigs.map((p) => ({
        id: p.questionPack,
        enabled: p.enabled,
        offset: p.offset,
      })),
      highScores: raw.highScores,
      gamesPlayed: raw.gamesPlayed,
      lifetimeScore: raw.lifetimeScore,
      playerId: crypto.randomUUID(),
    }
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

  return newAppStorage()
}
