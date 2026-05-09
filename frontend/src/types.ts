export interface Player {
  username: string
}

export interface Answer {
  rank: number
  text: string
  points: number
  revealed: boolean
}

export interface Question {
  text: string
  answers: Answer[]
}

export interface Game {
  player: Player
  question: Question
  score: number
}
