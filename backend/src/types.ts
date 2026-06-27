export interface AnswerDocument {
  matchType: number
  answerText: string
  forbiddenWords: string[]
}

export interface AnswerGroupDocument {
  pointValue: number
  displayText: string
  answers: AnswerDocument[]
}

export interface QuestionDocument {
  _id: number
  questionPack: number
  questionText: string
  bonusEligible: boolean
  averageScore: number
  answerGroups: AnswerGroupDocument[]
}
