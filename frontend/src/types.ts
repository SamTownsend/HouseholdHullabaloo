// Answer validation pipeline types
export const MatchType = {
  Exact: 1,
  Fuzzy: 2,
} as const
export type MatchType = (typeof MatchType)[keyof typeof MatchType]

export const MatchOutcome = {
  Correct: 'correct',
  Incorrect: 'incorrect',
  Duplicate: 'duplicate',
} as const
export type MatchOutcome = (typeof MatchOutcome)[keyof typeof MatchOutcome]

export interface Answer {
  matchType: MatchType
  answerText: string
  forbiddenWords: string[]
}

export interface AnswerGroup {
  rank: number
  points: number
  revealed: boolean
  displayText: string
  answers: Answer[]
}

export interface Question {
  _id: number
  round: number
  questionPack: number
  questionText: string
  averageScore: number
  answerGroups: AnswerGroup[]
}

// Game session types
export interface Player {
  username: string
}

export interface Game {
  player: Player
  question: Question
  score: number
}

export const Screen = {
  MainMenu: 'MainMenu',
  NormalRound: 'NormalRound',
} as const
export type Screen = (typeof Screen)[keyof typeof Screen]
