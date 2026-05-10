// Answer validation pipeline types
export const MatchTypes = {
  Exact: 1,
  Fuzzy: 2,
} as const
export type MatchTypes = (typeof MatchTypes)[keyof typeof MatchTypes]

export const HarvOutcomes = {
  Correct: 'correct',
  Incorrect: 'incorrect',
  Duplicate: 'duplicate',
} as const
export type HarvOutcomes = (typeof HarvOutcomes)[keyof typeof HarvOutcomes]

export interface HarvJudgement {
  outcome: HarvOutcomes
  matchedIndex: number
}

export interface Answer {
  matchType: MatchTypes
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

export const Screens = {
  MainMenu: 'MainMenu',
  NormalRound: 'NormalRound',
} as const
export type Screens = (typeof Screens)[keyof typeof Screens]
