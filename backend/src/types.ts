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
  round: number
  questionPack: number
  questionText: string
  averageScore: number
  answerGroups: AnswerGroupDocument[]
}
