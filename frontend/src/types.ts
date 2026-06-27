// Answer validation pipeline types
export const MatchTypes = {
  Fuzzy: 1,
  Exact: 2,
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
  revealed: boolean
  pointValue: number
  displayText: string
  answers: Answer[]
}

export interface Question {
  _id: number
  questionPack: number
  questionText: string
  bonusEligible: boolean
  averageScore: number
  answerGroups: AnswerGroup[]
}

// Game session types
export interface Household {
  name: string
  gamesPlayed: number
  lifetimeScore: number
}

export interface QuestionPackConfig {
  questionPack: number
  enabled: boolean
  offset: number
}

export interface Session {
  household: Household
  score: number
  averageScore: number
}

export interface RoundSummary {
  questionId: number
  roundScore: number
  averageScore: number
  strikes: number
}

export const Screens = {
  MainMenu: 'MainMenu',
  Options: 'Options',
  Stats: 'Stats',
  About: 'About',
  HouseholdSelect: 'HouseholdSelect',
  NormalRound: 'NormalRound',
  ScoreCompare: 'ScoreCompare',
} as const
export type Screens = (typeof Screens)[keyof typeof Screens]

// API types
export type AnswerGroupDocument = Omit<AnswerGroup, 'rank' | 'revealed'>
export type QuestionDocument = Omit<Question, 'answerGroups'> & {
  answerGroups: AnswerGroupDocument[]
}
