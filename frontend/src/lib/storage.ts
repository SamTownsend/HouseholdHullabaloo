import type { Household } from '../types'
export const APP_STORAGE_KEY = 'householdhullabaloo'
export const MAX_HOUSEHOLDS = 100

export interface AppStorage {
  version: 1
  households: Household[]
}

export const DEFAULT_APP_STORAGE: AppStorage = {
  version: 1,
  households: [],
}
