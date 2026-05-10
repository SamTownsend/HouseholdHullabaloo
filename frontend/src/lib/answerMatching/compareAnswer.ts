import type { MatchType, AnswerGroup } from '../../types'
import { normalize, tokenize } from './preprocess'
import { scorePair } from './wordScore'

// Compares answerText against the user's already-tokenized
// input. For each word in the stored answer, finds the best-scoring match
// among the user's tokens and accumulates the results. Returns 0–100.
export function coreCompare(
  answerText: string,
  userTokens: string[],
  matchType: MatchType
): number {
  const answerTokens = tokenize(normalize(answerText))

  if (answerTokens.length === 0 || userTokens.length === 0) return 0

  // Start at full confidence and reduce it for each stored word based on
  // how well it matched the best available user token
  let score = 100
  for (const answerWord of answerTokens) {
    const bestWordScore = userTokens.reduce((best, userWord) => {
      return Math.max(best, scorePair(answerWord, userWord, matchType))
    }, 0)

    score = Math.floor((score * bestWordScore) / 100)
  }

  return score
}

// Compares a user's raw input string against a structured AnswerGroup.
// Normalizes and tokenizes the input once, then evaluates each Answer
// in the group, respecting its matchType and forbiddenWords.
// Returns the best score across all answers in the group (0–100).
export function matchAnswer(answerGroup: AnswerGroup, userInput: string): number {
  const userTokens = tokenize(normalize(userInput))
  if (userTokens.length === 0) return 0

  let best = 0

  for (const answer of answerGroup.answers) {
    if (answer.forbiddenWords.length > 0) {
      const hasForbidden = answer.forbiddenWords.some((fw) => {
        const forbiddenTokens = tokenize(normalize(fw))
        return forbiddenTokens.every((ft) => userTokens.includes(ft))
      })

      if (hasForbidden) {
        continue
      }
    }

    const score = coreCompare(answer.answerText, userTokens, answer.matchType)
    if (score > best) best = score
  }

  return best
}
