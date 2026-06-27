import type { Household, QuestionPackConfig } from '../types'
export const APP_STORAGE_KEY = 'householdhullabaloo'
export const MAX_HOUSEHOLDS = 100

export interface AppStorage {
  version: 1
  households: Household[]
  packConfigs: QuestionPackConfig[]
}

export const DEFAULT_APP_STORAGE: AppStorage = {
  version: 1,
  households: [],
  packConfigs: [
    { questionPack: 1, enabled: true, offset: 0 },
    { questionPack: 2, enabled: true, offset: 0 },
    { questionPack: 3, enabled: true, offset: 0 },
    { questionPack: 4, enabled: true, offset: 0 },
    { questionPack: 5, enabled: true, offset: 0 },
    { questionPack: 6, enabled: true, offset: 0 },
  ],
}
